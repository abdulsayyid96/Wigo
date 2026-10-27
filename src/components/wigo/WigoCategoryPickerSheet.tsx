import React, { useState } from 'react';
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
} from 'react-native';
import { X, Check, Plus, Tag } from 'lucide-react-native';

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

interface WigoCategoryPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  customCategories?: string[];
  onAddCustomCategory?: (category: string) => void;
}

export function WigoCategoryPickerSheet({
  visible,
  onClose,
  selectedCategory,
  onSelectCategory,
  customCategories = [],
  onAddCustomCategory,
}: WigoCategoryPickerSheetProps) {
  const [newCatInput, setNewCatInput] = useState('');

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
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheetContainer}
            >
              {/* Drag Indicator */}
              <View style={styles.dragPill} />

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.iconCircle}>
                    <Tag size={16} color="#ff5e00" strokeWidth={2.4} />
                  </View>
                  <View>
                    <Text style={styles.title}>Select Category</Text>
                    <Text style={styles.subtitle}>Choose equipment classification</Text>
                  </View>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={styles.closeBtn}
                  accessibilityLabel="Close category picker"
                >
                  <X size={16} color="#9DA1A8" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              {/* Category List */}
              <ScrollView
                style={styles.list}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {allCategories.map((cat) => {
                  const isSelected =
                    cat.toLowerCase() === selectedCategory.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={cat}
                      activeOpacity={0.7}
                      onPress={() => {
                        onSelectCategory(cat);
                        onClose();
                      }}
                      style={[
                        styles.catRow,
                        isSelected && styles.catRowSelected,
                      ]}
                    >
                      <View style={styles.catLeft}>
                        <View
                          style={[
                            styles.dot,
                            isSelected && { backgroundColor: '#ff5e00' },
                          ]}
                        />
                        <Text
                          style={[
                            styles.catName,
                            isSelected && styles.catNameSelected,
                          ]}
                        >
                          {cat}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.checkBadge}>
                          <Check size={14} color="#FFFFFF" strokeWidth={2.6} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Add Custom Category Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerLabel}>Or create new category:</Text>
                <View style={styles.addInputRow}>
                  <TextInput
                    value={newCatInput}
                    onChangeText={setNewCatInput}
                    placeholder="e.g. Drones & Aerial"
                    placeholderTextColor="#686D76"
                    style={styles.addInput}
                    onSubmitEditing={handleAdd}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleAdd}
                    disabled={!newCatInput.trim()}
                    style={[
                      styles.addBtn,
                      !newCatInput.trim() && styles.addBtnDisabled,
                    ]}
                  >
                    <Plus size={16} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#141518',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: '#26282E',
    borderBottomWidth: 0,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  dragPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#353840',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#202227',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 94, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 0, 0.25)',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'Onest, sans-serif' : undefined,
  },
  subtitle: {
    fontSize: 12,
    color: '#8A8F98',
    marginTop: 1,
    fontFamily: Platform.OS === 'web' ? 'Onest, sans-serif' : undefined,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E2025',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    maxHeight: 280,
    paddingHorizontal: 16,
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
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 0, 0.3)',
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3E424B',
  },
  catName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D0D4DC',
    fontFamily: Platform.OS === 'web' ? 'Onest, sans-serif' : undefined,
  },
  catNameSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ff5e00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#202227',
  },
  footerLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8A8F98',
    marginBottom: 8,
  },
  addInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addInput: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#1B1C21',
    borderWidth: 1,
    borderColor: '#2C2E36',
    paddingHorizontal: 14,
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Platform.OS === 'web' ? 'Onest, sans-serif' : undefined,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#ff5e00',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: '#353840',
    opacity: 0.6,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
