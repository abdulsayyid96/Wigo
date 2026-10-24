import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { QrCode, Printer, X, Check } from 'lucide-react-native';
import { EquipmentItem, WIGO_COLORS, WIGO_METRICS } from '@/constants/wigo-theme';

interface WigoQrModalProps {
  visible: boolean;
  item: EquipmentItem | null;
  onClose: () => void;
  onPrint?: () => void;
}

export function WigoQrModal({ visible, item, onClose, onPrint }: WigoQrModalProps) {
  const [printed, setPrinted] = React.useState(false);

  if (!item) return null;

  const handlePrint = () => {
    setPrinted(true);
    onPrint?.();
    setTimeout(() => {
      setPrinted(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.printerBadge}>
              <View style={styles.statusDot} />
              <Printer size={13} color={WIGO_COLORS.statusGreen} strokeWidth={2} />
              <Text style={styles.printerBadgeText}>{WIGO_METRICS.printerModel} Online</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={16} color={WIGO_COLORS.textDark} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Label Card Preview */}
          <View style={styles.labelPreview}>
            <View style={styles.labelHeader}>
              <Text style={styles.brandTag}>WIGO ASSET</Text>
              <Text style={styles.skuTag}>{item.sku}</Text>
            </View>

            <View style={styles.qrContainer}>
              <QrCode size={110} color={WIGO_COLORS.textDark} strokeWidth={1.5} />
            </View>

            <Text style={styles.labelTitle} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.labelCost}>Value: {item.cost}</Text>
          </View>

          {/* Actions */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePrint}
            style={[styles.printButton, printed && styles.printedButton]}
          >
            {printed ? (
              <>
                <Check size={16} color={WIGO_COLORS.textWhite} strokeWidth={2.5} />
                <Text style={styles.printButtonText}>Sent to {WIGO_METRICS.printerModel}!</Text>
              </>
            ) : (
              <>
                <Printer size={16} color={WIGO_COLORS.textWhite} strokeWidth={2} />
                <Text style={styles.printButtonText}>Print Label Tag</Text>
              </>
            )}
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: WIGO_COLORS.cardBackground,
    borderRadius: 24,
    padding: 20,
    gap: 16,
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.borderSubtle,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  printerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EAF8EC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: WIGO_COLORS.statusGreen,
  },
  printerBadgeText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 11,
    fontWeight: '500',
    color: '#1C7C2C',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: WIGO_COLORS.thumbnailBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0A0A0A',
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  labelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  brandTag: {
    fontFamily: 'Onest_700Bold',
    fontSize: 10,
    fontWeight: '700',
    color: WIGO_COLORS.textDark,
    letterSpacing: 1,
  },
  skuTag: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 10,
    fontWeight: '600',
    color: WIGO_COLORS.textSubdued,
  },
  qrContainer: {
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  labelTitle: {
    fontFamily: 'Geist_500Medium',
    fontSize: 13,
    fontWeight: '500',
    color: WIGO_COLORS.textDark,
    textAlign: 'center',
  },
  labelCost: {
    fontFamily: 'Onest_500Medium',
    fontSize: 11,
    fontWeight: '500',
    color: WIGO_COLORS.textSubdued,
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: WIGO_COLORS.primaryDark,
    borderRadius: 9999,
    paddingVertical: 12,
  },
  printedButton: {
    backgroundColor: WIGO_COLORS.statusGreen,
  },
  printButtonText: {
    fontFamily: 'Geist_500Medium',
    fontSize: 14,
    fontWeight: '500',
    color: WIGO_COLORS.textWhite,
  },
});
