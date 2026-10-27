import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Check, CirclePlusIcon } from 'lucide-react-native';
import { WIGO_COLORS } from '@/constants/wigo-theme';

// ============================================================================
// 1. CONSTANTS & TYPES
// ============================================================================

export const DEFAULT_WIGO_CATEGORIES = [
  'Power Tools',
  'Heavy Machinery',
  'Audio / Visual',
  'Hand Tools',
  'Generators & Power',
  'Survey & Measurement',
  'Safety & PPE',
  'Ladders & Scaffolding',
  'Pumps & Plumbing',
];

// Animation timing & curves matching WigoDatePickerSheet
const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1);
const EASE_SHEET_OUT = Easing.bezier(0.72, 0.32, 0, 1);
const ENTER_DURATION = 500;
const EXIT_DURATION = 550;
const ESTIMATED_SHEET_HEIGHT = 500;

export interface WigoCategoryPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  customCategories?: string[];
  onAddCustomCategory?: (category: string) => void;
}

// ============================================================================
// 2. ANIMATION HOOK
// ============================================================================

function useSheetSlideAnimation(visible: boolean, onClose: () => void) {
  const [isRendered, setIsRendered] = useState(visible);
  const reducedMotion = useReducedMotion();
  const translateY = useSharedValue(visible ? 0 : ESTIMATED_SHEET_HEIGHT);
  const isClosingRef = useRef(false);
  const isClosedRef = useRef(false);
  const prevVisibleRef = useRef(visible);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const finishClose = useCallback(() => {
    if (isClosedRef.current) return;
    isClosedRef.current = true;
    setIsRendered(false);
    isClosingRef.current = false;
    onCloseRef.current();
  }, []);

  const animateClose = useCallback(() => {
    Keyboard.dismiss();
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    isClosedRef.current = false;

    if (reducedMotion) {
      finishClose();
      return;
    }

    translateY.set(
      withTiming(
        ESTIMATED_SHEET_HEIGHT,
        { duration: EXIT_DURATION, easing: EASE_SHEET_OUT },
        (finished) => {
          'worklet';
          if (finished) {
            scheduleOnRN(finishClose);
          }
        }
      )
    );

    // Safety fallback timer for web / interrupted animation frame
    setTimeout(() => {
      finishClose();
    }, EXIT_DURATION + 60);
  }, [finishClose, reducedMotion, translateY]);

  useEffect(() => {
    const wasVisible = prevVisibleRef.current;
    prevVisibleRef.current = visible;

    if (visible && !wasVisible) {
      isClosingRef.current = false;
      isClosedRef.current = false;
      setIsRendered(true);
      if (reducedMotion) {
        translateY.set(0);
      } else {
        translateY.set(ESTIMATED_SHEET_HEIGHT);
        translateY.set(
          withTiming(0, { duration: ENTER_DURATION, easing: EASE_SHEET })
        );
      }
    } else if (!visible && wasVisible) {
      if (isRendered && !isClosingRef.current) {
        animateClose();
      }
    }
  }, [visible, animateClose, isRendered, reducedMotion, translateY]);

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.get() }],
  }));

  return {
    isRendered,
    sheetAnimatedStyle,
    animateClose,
  };
}

// ============================================================================
// 3. SUB-COMPONENTS
// ============================================================================

interface CategoryHeaderProps {
  onAdd: () => void;
  canAdd: boolean;
}

function CategoryHeader({ onAdd, canAdd }: CategoryHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Select Category</Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onAdd}
        disabled={!canAdd}
        style={[styles.addBtn, !canAdd && styles.addBtnDisabled]}
      >
        <CirclePlusIcon
          size={14}
          color={canAdd ? WIGO_COLORS.orangeGradientStart : WIGO_COLORS.textSubdued}
          strokeWidth={2.4}
        />
        <Text style={[styles.addBtnText, !canAdd && styles.addBtnTextDisabled]}>
          New Category
        </Text>
      </TouchableOpacity>
    </View>
  );
}

interface CategoryListProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  newCatInput: string;
  onChangeInput: (text: string) => void;
  onAdd: () => void;
}

function CategoryList({
  categories,
  selectedCategory,
  onSelectCategory,
  newCatInput,
  onChangeInput,
  onAdd,
}: CategoryListProps) {
  return (
    <ScrollView
      style={styles.list}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        value={newCatInput}
        onChangeText={onChangeInput}
        placeholder="e.g. Drones & Aerial"
        placeholderTextColor={WIGO_COLORS.textPlaceholder}
        style={styles.addInput}
        onSubmitEditing={onAdd}
        returnKeyType="done"
      />

      {categories.map((cat) => {
        const isSelected = cat.toLowerCase() === selectedCategory.toLowerCase();
        return (
          <TouchableOpacity
            key={cat}
            activeOpacity={0.7}
            onPress={() => onSelectCategory(cat)}
            style={[styles.catRow, isSelected && styles.catRowSelected]}
          >
            <Text style={[styles.catName, isSelected && styles.catNameSelected]}>
              {cat}
            </Text>
            {isSelected && (
              <View style={styles.checkBadge}>
                <Check size={14} color="#FFFFFF" strokeWidth={2.6} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ============================================================================
// 4. MAIN COMPONENT
// ============================================================================

export function WigoCategoryPickerSheet({
  visible,
  onClose,
  selectedCategory,
  onSelectCategory,
  customCategories = [],
  onAddCustomCategory,
}: WigoCategoryPickerSheetProps) {
  const [newCatInput, setNewCatInput] = useState('');

  const { isRendered, sheetAnimatedStyle, animateClose } = useSheetSlideAnimation(
    visible,
    onClose
  );

  // Combine default with custom, avoiding duplicates
  const allCategories = Array.from(
    new Set([...DEFAULT_WIGO_CATEGORIES, ...customCategories])
  );

  const handleAdd = () => {
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (onAddCustomCategory) {
      onAddCustomCategory(trimmed);
    }
    onSelectCategory(trimmed);
    setNewCatInput('');
    // Stays open per user preference; backdrop tap dismisses
  };

  const handleSelect = (category: string) => {
    onSelectCategory(category);
    // Stays open per user preference; backdrop tap dismisses
  };

  if (!isRendered) return null;

  return (
    <Modal
      visible={isRendered}
      transparent
      animationType="none"
      onRequestClose={animateClose}
    >
      <TouchableWithoutFeedback onPress={animateClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View style={[styles.sheetContainer, sheetAnimatedStyle]}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              >
                {/* Drag Indicator Pill */}
                <View style={styles.dragPill} />

                {/* Header with Title and New Category Action */}
                <CategoryHeader
                  onAdd={handleAdd}
                  canAdd={Boolean(newCatInput.trim())}
                />

                {/* Category Input & List */}
                <CategoryList
                  categories={allCategories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleSelect}
                  newCatInput={newCatInput}
                  onChangeInput={setNewCatInput}
                  onAdd={handleAdd}
                />
              </KeyboardAvoidingView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ============================================================================
// 5. STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Modal & Sheet Container
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: WIGO_COLORS.cardBackground,
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.borderSubtle,
    borderBottomWidth: 0,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  dragPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: WIGO_COLORS.dividerSubtle,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  title: {
    fontFamily: Platform.OS === 'web' ? 'Onest, sans-serif' : 'Onest_700Bold',
    fontSize: 15,
    fontWeight: '600',
    color: WIGO_COLORS.textDark,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: WIGO_COLORS.orangeGradientStart,
    fontFamily: Platform.OS === 'web' ? 'Onest, sans-serif' : 'Onest_500Medium',
  },
  addBtnTextDisabled: {
    color: WIGO_COLORS.textSubdued,
  },

  // Search/Create Input
  addInput: {
    borderRadius: 12,
    backgroundColor: WIGO_COLORS.background,
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.borderSubtle,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    color: WIGO_COLORS.textDark,
    fontSize: 14,
    fontFamily: Platform.OS === 'web' ? 'Onest, sans-serif' : 'Onest_500Medium',
  },

  // Category List & Rows
  list: {
    maxHeight: 280,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  catRowSelected: {
    backgroundColor: 'rgba(255, 94, 0, 0.1)',
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.orangeOutline,
  },
  catName: {
    fontSize: 13,
    fontWeight: '500',
    color: WIGO_COLORS.textDark,
    fontFamily: Platform.OS === 'web' ? 'Onest, sans-serif' : 'Onest_500Medium',
  },
  catNameSelected: {
    fontSize: 14,
    color: WIGO_COLORS.textDark,
    fontWeight: '900',
    fontFamily: Platform.OS === 'web' ? 'Onest, sans-serif' : 'Onest_500Medium',
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ff5e00',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
