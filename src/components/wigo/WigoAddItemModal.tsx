import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Plus, X, Camera, Receipt } from 'lucide-react-native';
import { router } from 'expo-router';
import { EquipmentItem, WIGO_COLORS } from '@/constants/wigo-theme';

interface WigoAddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (item: EquipmentItem) => void;
}

export function WigoAddItemModal({ visible, onClose, onAddItem }: WigoAddItemModalProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [cost, setCost] = useState('');
  const [qty, setQty] = useState('1');

  const handleSave = () => {
    if (!name.trim()) return;
    const newItem: EquipmentItem = {
      id: Date.now().toString(),
      name: name.trim(),
      sku: sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      cost: cost.startsWith('$') ? cost.trim() : `$${cost.trim() || '0.00'}`,
      availableCount: parseInt(qty, 10) || 1,
      outCount: 0,
      serviceCount: 0,
      category: 'available',
    };
    onAddItem(newItem);
    setName('');
    setSku('');
    setCost('');
    setQty('1');
    onClose();
  };

  const handleReceiptOcrDemo = () => {
    onClose();
    router.push('/scanner?mode=receipt');
  };

  const handleTakeItemPhoto = () => {
    onClose();
    router.push('/scanner?mode=item_photo');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Equipment Item</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={16} color={WIGO_COLORS.textDark} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
            {/* Quick Capture Options */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={handleReceiptOcrDemo}
              >
                <Receipt size={16} color={WIGO_COLORS.orangeGradientStart} strokeWidth={2} />
                <Text style={styles.quickActionText}>Autofill from Receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={handleTakeItemPhoto}
              >
                <Camera size={16} color={WIGO_COLORS.textDark} strokeWidth={2} />
                <Text style={styles.quickActionText}>Take Item Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EQUIPMENT NAME</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Milwaukee M18 Fuel Saw"
                placeholderTextColor={WIGO_COLORS.textPlaceholder}
                style={styles.input}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>SKU / CODE</Text>
                <TextInput
                  value={sku}
                  onChangeText={setSku}
                  placeholder="e.g. MW-2730"
                  placeholderTextColor={WIGO_COLORS.textPlaceholder}
                  style={styles.input}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>COST / VALUE</Text>
                <TextInput
                  value={cost}
                  onChangeText={setCost}
                  placeholder="$249.00"
                  placeholderTextColor={WIGO_COLORS.textPlaceholder}
                  style={styles.input}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>INITIAL QUANTITY AVAILABLE</Text>
              <TextInput
                value={qty}
                onChangeText={setQty}
                placeholder="1"
                placeholderTextColor={WIGO_COLORS.textPlaceholder}
                style={styles.input}
                keyboardType="number-pad"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSave}
              style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
              disabled={!name.trim()}
            >
              <Plus size={16} color={WIGO_COLORS.textWhite} strokeWidth={2.2} />
              <Text style={styles.saveBtnText}>Save to Catalog &amp; Create Label</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: WIGO_COLORS.cardBackground,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.borderSubtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Geist_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: WIGO_COLORS.textDark,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: WIGO_COLORS.thumbnailBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: 14,
    paddingBottom: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: WIGO_COLORS.thumbnailBackground,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.borderSubtle,
  },
  quickActionText: {
    fontFamily: 'Geist_500Medium',
    fontSize: 11,
    color: WIGO_COLORS.textDark,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 10,
    fontWeight: '600',
    color: WIGO_COLORS.textSubdued,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: WIGO_COLORS.thumbnailBackground,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontFamily: 'Geist_400Regular',
    fontSize: 13,
    color: WIGO_COLORS.textDark,
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.borderSubtle,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: WIGO_COLORS.primaryDark,
    borderRadius: 9999,
    paddingVertical: 14,
    marginTop: 8,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontFamily: 'Geist_500Medium',
    fontSize: 14,
    fontWeight: '500',
    color: WIGO_COLORS.textWhite,
  },
});
