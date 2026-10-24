import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { ScanLine, X, ArrowDownUp, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WIGO_COLORS } from '@/constants/wigo-theme';

interface WigoScanModalProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess?: (action: 'in' | 'out', itemName: string) => void;
}

export function WigoScanModal({ visible, onClose, onScanSuccess }: WigoScanModalProps) {
  const [mode, setMode] = useState<'in' | 'out'>('out');
  const [scannedItem, setScannedItem] = useState<string | null>(null);

  const handleSimulateScan = () => {
    const item = 'DeWalt 20V Max Hammer Drill (DW-887X)';
    setScannedItem(item);
    setTimeout(() => {
      onScanSuccess?.(mode, item);
      setScannedItem(null);
      onClose();
    }, 1200);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Asset Scanner</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={16} color={WIGO_COLORS.textDark} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Mode Selector: Check In vs Check Out */}
          <View style={styles.modeRow}>
            <TouchableOpacity
              onPress={() => setMode('out')}
              style={[styles.modeTab, mode === 'out' && styles.modeTabActive]}
            >
              <Text style={[styles.modeText, mode === 'out' && styles.modeTextActive]}>
                Scan Out (Rent)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode('in')}
              style={[styles.modeTab, mode === 'in' && styles.modeTabActive]}
            >
              <Text style={[styles.modeText, mode === 'in' && styles.modeTextActive]}>
                Scan In (Return)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Viewfinder simulation */}
          <View style={styles.viewfinder}>
            <View style={styles.viewfinderFrame}>
              <ScanLine size={48} color={WIGO_COLORS.orangeGradientStart} strokeWidth={1.5} />
              <Text style={styles.viewfinderHint}>
                Align label barcode or QR in frame
              </Text>
            </View>

            {scannedItem && (
              <View style={styles.scannedBadge}>
                <CheckCircle2 size={16} color={WIGO_COLORS.statusGreen} strokeWidth={2} />
                <Text style={styles.scannedText}>Logged: {scannedItem}</Text>
              </View>
            )}
          </View>

          {/* Trigger Scan Simulation Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSimulateScan}
            style={styles.triggerBtnWrapper}
          >
            <LinearGradient
              colors={[WIGO_COLORS.orangeGradientStart, WIGO_COLORS.orangeGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.triggerBtn}
            >
              <ArrowDownUp size={16} color={WIGO_COLORS.textWhite} strokeWidth={2.2} />
              <Text style={styles.triggerBtnText}>
                {mode === 'out' ? 'Log Item Checkout' : 'Log Item Return'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
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
    gap: 16,
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.borderSubtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  modeRow: {
    flexDirection: 'row',
    backgroundColor: WIGO_COLORS.thumbnailBackground,
    borderRadius: 12,
    padding: 3,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: WIGO_COLORS.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeText: {
    fontFamily: 'Geist_500Medium',
    fontSize: 12,
    color: WIGO_COLORS.textSubdued,
  },
  modeTextActive: {
    color: WIGO_COLORS.textDark,
    fontWeight: '600',
  },
  viewfinder: {
    height: 180,
    backgroundColor: '#0F1012',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  viewfinderFrame: {
    alignItems: 'center',
    gap: 8,
  },
  viewfinderHint: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  scannedBadge: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  scannedText: {
    fontFamily: 'Geist_500Medium',
    fontSize: 11,
    color: WIGO_COLORS.textDark,
  },
  triggerBtnWrapper: {
    borderRadius: 9999,
  },
  triggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 9999,
  },
  triggerBtnText: {
    fontFamily: 'Geist_500Medium',
    fontSize: 14,
    fontWeight: '500',
    color: WIGO_COLORS.textWhite,
  },
});
