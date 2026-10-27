import React, { useCallback, useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { capImageResolution } from '@/utils/image-manipulator';
import { WIGO_COLORS } from '@/constants/wigo-theme';

// ============================================================================
// 1. CONSTANTS & TYPES
// ============================================================================

const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1);
const EASE_SHEET_OUT = Easing.bezier(0.72, 0.32, 0, 1);
const ENTER_DURATION = 500;
const EXIT_DURATION = 550;
const ESTIMATED_SHEET_HEIGHT = 450;

export interface WigoImageSourceModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  onImageSelected: (result: { uri: string; base64?: string }) => void;
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

  const closeImmediately = useCallback(() => {
    isClosedRef.current = true;
    setIsRendered(false);
    isClosingRef.current = false;
    onCloseRef.current();
  }, []);

  const animateClose = useCallback(() => {
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
    closeImmediately,
  };
}

// ============================================================================
// 3. SUB-COMPONENTS
// ============================================================================

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
}

function ModalHeader({ title, subtitle }: ModalHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTitleCol}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

interface ActionButtonsProps {
  onCamera: () => void;
  onGallery: () => void;
}

function ActionButtons({ onCamera, onGallery }: ActionButtonsProps) {
  return (
    <View style={styles.actionCol}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onCamera}
        style={styles.actionBtn}
      >
        <View style={styles.actionIconBox}>
          <Camera size={24} color={WIGO_COLORS.textPlaceholder} strokeWidth={2} />
          <Text style={styles.actionTitle}>Take a picture</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onGallery}
        style={styles.actionBtn}
      >
        <View style={styles.actionIconBox}>
          <ImageIcon size={24} color={WIGO_COLORS.textPlaceholder} strokeWidth={2} />
          <Text style={styles.actionTitle}>Choose from gallery</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

interface CancelButtonProps {
  onCancel: () => void;
}

function CancelButton({ onCancel }: CancelButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onCancel}
      style={styles.cancelWrapper}
    >
      <LinearGradient
        colors={[WIGO_COLORS.orangeGradientStart, WIGO_COLORS.orangeGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cancelGradient}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ============================================================================
// 4. MAIN COMPONENT
// ============================================================================

export function WigoImageSourceModal({
  visible,
  onClose,
  title,
  subtitle,
  onImageSelected,
}: WigoImageSourceModalProps) {
  const { isRendered, sheetAnimatedStyle, animateClose, closeImmediately } = useSheetSlideAnimation(
    visible,
    onClose
  );

  const handleLaunchCamera = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera access in your device settings to photograph equipment and receipts.'
          );
          return;
        }
      }

      closeImmediately();

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const processed = await capImageResolution(asset.uri, {
          maxWidth: 1200,
          compress: 0.85,
          includeBase64: true,
        });

        onImageSelected({
          uri: processed.uri,
          base64: processed.base64 || asset.base64 || undefined,
        });
      }
    } catch (err: any) {
      console.error('Camera capture error:', err);
      Alert.alert('Camera Error', err.message || 'Could not launch camera.');
    }
  };

  const handleLaunchGallery = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Photo Library Permission Required',
            'Please enable photo library access in your device settings to select photos.'
          );
          return;
        }
      }

      closeImmediately();

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const processed = await capImageResolution(asset.uri, {
          maxWidth: 1200,
          compress: 0.85,
          includeBase64: true,
        });

        onImageSelected({
          uri: processed.uri,
          base64: processed.base64 || asset.base64 || undefined,
        });
      }
    } catch (err: any) {
      console.error('Gallery picker error:', err);
      Alert.alert('Gallery Error', err.message || 'Could not open photo library.');
    }
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
              {/* Drag indicator */}
              <View style={styles.dragPill} />

              {/* Title & subtitle */}
              <ModalHeader title={title} subtitle={subtitle} />

              {/* Camera & Gallery Action Cards */}
              <ActionButtons
                onCamera={handleLaunchCamera}
                onGallery={handleLaunchGallery}
              />

              {/* Cancel Button */}
              <CancelButton onCancel={animateClose} />
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
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    gap: 16,
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
    paddingVertical: 4,
  },
  headerTitleCol: {
    flexDirection: 'column',
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: WIGO_COLORS.textDark,
    fontFamily: Platform.OS === 'web' ? 'Onest, sans-serif' : 'Onest_700Bold',
  },
  subtitle: {
    fontSize: 12,
    color: WIGO_COLORS.textSubdued,
    fontFamily: Platform.OS === 'web' ? 'Onest, sans-serif' : 'Onest_400Regular',
  },

  // Actions
  actionCol: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 14,
  },
  actionIconBox: {
    width: '100%',
    height: 96,
    borderRadius: 10,
    gap: 10,
    backgroundColor: WIGO_COLORS.background,
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '400',
    color: WIGO_COLORS.textDark,
    fontFamily: Platform.OS === 'web' ? 'Onest, sans-serif' : 'Onest_400Regular',
  },

  // Cancel Button
  cancelWrapper: {
    width: '100%',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  cancelGradient: {
    height: 48,
    width: '100%',
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 0.5,
    borderColor: '#FFA066',
    ...Platform.select({
      web: {
        boxShadow: 'inset 0 1.5px 0 rgba(255, 255, 255, 0.5), inset 0 -2.5px 3px rgba(0, 0, 0, 0.2)',
      },
      ios: {
        shadowColor: '#ED5000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cancelText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 18,
  },
});
