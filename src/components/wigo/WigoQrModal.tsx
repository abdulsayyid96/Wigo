import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Download, Printer, X, Check } from 'lucide-react-native';
import { EquipmentItem, WIGO_COLORS, WIGO_METRICS } from '@/constants/wigo-theme';

interface WigoQrModalProps {
  visible: boolean;
  item: EquipmentItem | null;
  onClose: () => void;
  onPrint?: () => void;
}

export function WigoQrModal({ visible, item, onClose, onPrint }: WigoQrModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const qrRef = useRef<any>(null);

  if (!item) return null;

  // Standard encoded identifier: wigo:item:{id}
  const qrValue = `wigo:item:${item.id}`;

  const handleSaveOrShare = async () => {
    if (!qrRef.current) return;

    try {
      setIsProcessing(true);

      qrRef.current.toDataURL(async (data: string) => {
        try {
          if (Platform.OS === 'web') {
            // Web download support
            const a = document.createElement('a');
            a.href = `data:image/png;base64,${data}`;
            a.download = `WIGO-${item.sku || item.id}-QR.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setSuccess(true);
            setTimeout(() => {
              setSuccess(false);
              onClose();
            }, 1200);
            return;
          }

          // Native mobile: Save image to file system and trigger share/save sheet
          const filename = `${FileSystem.cacheDirectory ?? ''}QR_${item.sku || item.id}.png`;
          await FileSystem.writeAsStringAsync(filename, data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(filename, {
              mimeType: 'image/png',
              dialogTitle: `QR Code for ${item.name}`,
              UTI: 'public.png',
            });
          }

          setSuccess(true);
          onPrint?.();
          setTimeout(() => {
            setSuccess(false);
            onClose();
          }, 1200);
        } catch (err: any) {
          console.error('Error exporting QR:', err);
          Alert.alert('Save Failed', 'Unable to export QR code image. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      });
    } catch (err: any) {
      console.error('Error capturing QR:', err);
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to generate QR image.');
    }
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
              <Text style={styles.printerBadgeText}>{WIGO_METRICS.printerModel} Ready</Text>
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

            {/* Generated QR Code SVG */}
            <View style={styles.qrContainer}>
              <QRCode
                value={qrValue}
                size={140}
                color={WIGO_COLORS.textDark}
                backgroundColor="#FFFFFF"
                getRef={(c) => (qrRef.current = c)}
              />
            </View>

            <Text style={styles.labelTitle} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.labelCost}>Value: {item.cost}</Text>
            <Text style={styles.taglineText}>ID: {item.id.slice(0, 8)}... (50×30mm)</Text>
          </View>

          {/* Actions: Save / Share QR Tag */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSaveOrShare}
            disabled={isProcessing}
            style={[styles.printButton, success && styles.printedButton]}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={WIGO_COLORS.textWhite} />
            ) : success ? (
              <>
                <Check size={16} color={WIGO_COLORS.textWhite} strokeWidth={2.5} />
                <Text style={styles.printButtonText}>Saved Successfully!</Text>
              </>
            ) : (
              <>
                <Download size={16} color={WIGO_COLORS.textWhite} strokeWidth={2} />
                <Text style={styles.printButtonText}>Save / Share QR Code</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
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
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#0A0A0A',
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    gap: 8,
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
    padding: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
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
  taglineText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 10,
    color: '#8A8F98',
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
