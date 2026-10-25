import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ScanLine, X, ArrowDownUp, CheckCircle2, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WIGO_COLORS } from '@/constants/wigo-theme';
import { getWigoItems, updateWigoItemStock } from '@/constants/wigo-store';

interface WigoScanModalProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess?: (action: 'in' | 'out', itemName: string) => void;
}

export function WigoScanModal({ visible, onClose, onScanSuccess }: WigoScanModalProps) {
  const [mode, setMode] = useState<'in' | 'out'>('out');
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedItemName, setScannedItemName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (visible && !permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [visible, permission]);

  // Reset state on open/close
  useEffect(() => {
    if (visible) {
      setScannedItemName(null);
      setIsProcessing(false);
    }
  }, [visible]);

  const processScannedCode = (rawCode: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const items = getWigoItems();
    let targetItem = null;

    // Supported formats:
    // 1. "wigo:item:{id}"
    // 2. Exact item id match
    // 3. Exact item sku match
    if (rawCode.startsWith('wigo:item:')) {
      const id = rawCode.replace('wigo:item:', '').trim();
      targetItem = items.find((i) => i.id === id);
    } else {
      targetItem = items.find((i) => i.id === rawCode || i.sku.toLowerCase() === rawCode.toLowerCase());
    }

    if (!targetItem) {
      setIsProcessing(false);
      Alert.alert(
        'Item Not Found',
        `No equipment matching code "${rawCode}" in inventory.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const isCheckOut = mode === 'out';
    const success = updateWigoItemStock(targetItem.id, isCheckOut);

    if (!success) {
      setIsProcessing(false);
      Alert.alert(
        'Stock Unavailable',
        isCheckOut
          ? `All units of "${targetItem.name}" are already rented out.`
          : `No units of "${targetItem.name}" are currently rented out.`
      );
      return;
    }

    setScannedItemName(targetItem.name);
    onScanSuccess?.(mode, targetItem.name);

    setTimeout(() => {
      setIsProcessing(false);
      onClose();
    }, 1200);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (data) {
      processScannedCode(data);
    }
  };

  // Fallback simulator for web / simulator
  const handleSimulateScan = () => {
    const items = getWigoItems();
    if (items.length === 0) {
      Alert.alert('Empty Catalog', 'Please add equipment items first to test scanning.');
      return;
    }
    const target = items[0];
    processScannedCode(`wigo:item:${target.id}`);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Equipment Scanner</Text>
              <Text style={styles.subtitle}>
                Scan label QR to immediately {mode === 'out' ? 'Rent Out' : 'Rent In'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={16} color={WIGO_COLORS.textDark} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Mode Selector: Rent Out vs Rent In */}
          <View style={styles.modeRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMode('out')}
              style={[styles.modeTab, mode === 'out' && styles.modeTabActive]}
            >
              <Text style={[styles.modeText, mode === 'out' && styles.modeTextActive]}>
                Rent Out (Check Out)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMode('in')}
              style={[styles.modeTab, mode === 'in' && styles.modeTabActive]}
            >
              <Text style={[styles.modeText, mode === 'in' && styles.modeTextActive]}>
                Rent In (Return)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Camera Viewfinder or Simulator */}
          <View style={styles.viewfinder}>
            {permission?.granted && Platform.OS !== 'web' ? (
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ['qr', 'code128', 'ean13'],
                }}
                onBarcodeScanned={isProcessing ? undefined : handleBarcodeScanned}
              />
            ) : null}

            {/* Reticle / Permissions / Status Overlay */}
            <View style={styles.viewfinderFrame}>
              {permission?.granted && Platform.OS !== 'web' ? (
                <>
                  <ScanLine size={48} color={WIGO_COLORS.orangeGradientStart} strokeWidth={1.75} />
                  <Text style={styles.viewfinderHint}>Align QR tag in center to auto-log</Text>
                </>
              ) : Platform.OS === 'web' ? (
                <>
                  <ScanLine size={44} color="rgba(255, 255, 255, 0.45)" strokeWidth={1.5} />
                  <Text style={styles.viewfinderHint}>Camera preview is mobile-only</Text>
                  <Text style={styles.viewfinderSubHint}>Use the button below to simulate scanning</Text>
                </>
              ) : (
                <>
                  <ScanLine size={44} color={WIGO_COLORS.orangeGradientStart} strokeWidth={1.5} />
                  <Text style={styles.viewfinderHint}>Camera permission needed</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => requestPermission()}
                    style={styles.permissionBtn}
                  >
                    <RefreshCw size={14} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.permissionBtnText}>Enable Camera</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {isProcessing && (
              <View style={styles.processingBadge}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.processingText}>Processing Asset...</Text>
              </View>
            )}

            {scannedItemName && (
              <View style={styles.scannedBadge}>
                <CheckCircle2 size={16} color={WIGO_COLORS.statusGreen} strokeWidth={2} />
                <Text style={styles.scannedText}>
                  {mode === 'out' ? 'Rented' : 'Returned'}: {scannedItemName}
                </Text>
              </View>
            )}
          </View>

          {/* Action Button: Simulation Fallback */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSimulateScan}
            disabled={isProcessing}
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
                {mode === 'out' ? 'Test Scan Out (Item #1)' : 'Test Scan In (Item #1)'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
  subtitle: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    color: WIGO_COLORS.textSubdued,
    marginTop: 2,
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
    paddingVertical: 10,
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
    height: 220,
    backgroundColor: '#0F1012',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  viewfinderFrame: {
    alignItems: 'center',
    gap: 8,
    zIndex: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  viewfinderHint: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
  },
  viewfinderSubHint: {
    fontFamily: 'Onest_400Regular',
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
  },
  permissionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: WIGO_COLORS.orangeGradientStart,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 4,
  },
  permissionBtnText: {
    fontFamily: 'Geist_500Medium',
    fontSize: 11,
    color: '#FFFFFF',
  },
  processingBadge: {
    position: 'absolute',
    top: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    zIndex: 5,
  },
  processingText: {
    fontFamily: 'Geist_500Medium',
    fontSize: 11,
    color: '#FFFFFF',
  },
  scannedBadge: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    zIndex: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  scannedText: {
    fontFamily: 'Geist_600SemiBold',
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
