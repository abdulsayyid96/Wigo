import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
  Alert,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Zap,
  Receipt,
  Image as ImageIcon,
  Sparkles,
  Scan,
  Barcode,
  QrCode,
  Camera,
  CheckCircle2,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
} from 'lucide-react-native';
import { WigoStatusBar } from '@/components/wigo/WigoStatusBar';
import { getWigoItems, updateWigoItemStock } from '@/constants/wigo-store';
import { EquipmentItem } from '@/constants/wigo-theme';

export type ScannerMode = 'barcode' | 'receipt' | 'item_photo';

export default function WigoUnifiedScannerScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string }>();

  // Determine active primary mode
  const initialMode: ScannerMode =
    params.mode === 'receipt'
      ? 'receipt'
      : params.mode === 'item_photo'
      ? 'item_photo'
      : 'barcode';

  const [activeMode, setActiveMode] = useState<ScannerMode>(initialMode);
  const [subMode, setSubMode] = useState<string>(
    initialMode === 'barcode' ? 'barcode' : initialMode === 'receipt' ? 'paper' : 'front'
  );
  const [flashActive, setFlashActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Barcode matched item confirmation modal state
  const [scannedItem, setScannedItem] = useState<EquipmentItem | null>(null);
  const [isCheckOutAction, setIsCheckOutAction] = useState(true);

  // Animated laser scan sweep
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: activeMode === 'barcode' ? 1800 : 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: activeMode === 'barcode' ? 1800 : 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scanLineAnim, activeMode]);

  // Handle Shutter Trigger based on current mode
  const handleShutterPress = async () => {
    if (isScanning || scanSuccess) return;

    if (activeMode === 'barcode') {
      setIsScanning(true);
      // Barcode / QR Tag scan simulation
      setTimeout(() => {
        setIsScanning(false);
        const allItems = getWigoItems();
        // Match DeWalt drill or first available item
        const matched =
          allItems.find((i) => i.sku === 'DW-887X') ||
          allItems[0] || {
            id: '1',
            name: 'DeWalt 20V Max Hammer Drill',
            sku: 'DW-887X',
            cost: 'Rp 280.000',
            availableCount: 8,
            outCount: 2,
            category: 'available',
          };
        setScannedItem(matched);
      }, 1000);
    } else {
      // Launch native camera
      try {
        if (Platform.OS !== 'web') {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Camera Permission Required', 'Please enable camera access in device settings.');
            return;
          }
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 0.8,
          base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          setScanSuccess(true);
          setTimeout(() => {
            router.push({
              pathname: '/add-item',
              params: {
                photoCaptured: activeMode === 'item_photo' ? 'true' : undefined,
                capturedUri: asset.uri,
                mode: activeMode,
              },
            });
          }, 400);
        }
      } catch (err: any) {
        console.error('Camera capture error:', err);
      }
    }
  };

  const handleConfirmStockAction = () => {
    if (!scannedItem) return;
    const success = updateWigoItemStock(scannedItem.id, isCheckOutAction);
    if (!success) {
      Alert.alert(
        'Stock Action Error',
        isCheckOutAction
          ? 'No available units left to check out.'
          : 'No rented units are currently checked out.'
      );
      return;
    }

    const actionText = isCheckOutAction ? 'Checked Out (Rented)' : 'Checked In (Returned)';
    Alert.alert(
      'Stock Updated',
      `${scannedItem.name} (${scannedItem.sku}) successfully ${actionText}.`,
      [
        {
          text: 'Done',
          onPress: () => {
            setScannedItem(null);
            router.push('/');
          },
        },
      ]
    );
  };

  const handleManualSkip = () => {
    if (activeMode === 'barcode') {
      router.push('/');
    } else {
      router.push('/add-item');
    }
  };

  const handleGalleryPicker = async () => {
    if (activeMode === 'barcode') {
      Alert.alert('Scan Tag', 'Align physical barcode or QR sticker within the reticle to scan.');
      return;
    }

    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Gallery Permission', 'Please enable photo library access in device settings.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setScanSuccess(true);
        setTimeout(() => {
          router.push({
            pathname: '/add-item',
            params: {
              photoCaptured: activeMode === 'item_photo' ? 'true' : undefined,
              capturedUri: asset.uri,
              mode: activeMode,
            },
          });
        }, 400);
      }
    } catch (err: any) {
      console.error('Gallery picker error:', err);
    }
  };

  // Nav title & subtitle by mode
  const navContent = useMemo(() => {
    switch (activeMode) {
      case 'receipt':
        return {
          title: 'Scan Bill or Receipt',
          subtitle: 'Gemini Vision Auto-OCR',
        };
      case 'item_photo':
        return {
          title: 'Capture Item Photo',
          subtitle: 'Catalog Product Image',
        };
      case 'barcode':
      default:
        return {
          title: 'Scan Equipment Tag',
          subtitle: 'Barcode & QR Code Scanner',
        };
    }
  }, [activeMode]);

  // Reticle vertical beam interpolation
  const laserTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      16,
      activeMode === 'receipt' ? 390 : activeMode === 'barcode' ? 180 : 250,
    ],
  });

  return (
    <View style={styles.outerCanvas}>
      <StatusBar style="light" />

      {/* 393px Phone Mockup Container */}
      <View
        style={[
          styles.phoneFrame,
          {
            paddingTop: Platform.OS === 'web' ? 0 : insets.top,
            paddingBottom: Platform.OS === 'web' ? 20 : Math.max(20, insets.bottom),
          },
        ]}
      >
        {/* Status Bar */}
        {Platform.OS === 'web' ? <WigoStatusBar variant="light" /> : null}

        {/* Top Nav Bar */}
        <View style={styles.topNavBar}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityLabel="Close scanner"
          >
            <X size={18} color="#FFFFFF" strokeWidth={2.2} />
          </TouchableOpacity>

          {/* Title Box */}
          <View style={styles.titleBox}>
            <Text style={styles.navTitle}>{navContent.title}</Text>
            <Text style={styles.navSubtitle}>{navContent.subtitle}</Text>
          </View>

          {/* Flash Button */}
          <TouchableOpacity
            style={[styles.navButton, flashActive && styles.navButtonActive]}
            onPress={() => setFlashActive(!flashActive)}
            activeOpacity={0.7}
            accessibilityLabel="Toggle camera flash"
          >
            <Zap
              size={16}
              color={flashActive ? '#FF5E00' : '#FFFFFF'}
              strokeWidth={2.2}
              fill={flashActive ? '#FF5E00' : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        {/* Mode Switcher Row */}
        <View style={styles.modeSwitcherRow}>
          <View style={styles.modeCapsule}>
            {activeMode === 'receipt' && (
              <>
                <TouchableOpacity
                  style={[
                    styles.modeTab,
                    subMode === 'paper' ? styles.modeTabActive : styles.modeTabInactive,
                  ]}
                  onPress={() => setSubMode('paper')}
                  activeOpacity={0.8}
                >
                  <Receipt
                    size={13}
                    color={subMode === 'paper' ? '#0A0A0A' : 'rgba(255, 255, 255, 0.60)'}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.modeTabText,
                      subMode === 'paper'
                        ? styles.modeTabTextActive
                        : styles.modeTabTextInactive,
                    ]}
                  >
                    Paper Receipt
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeTab,
                    subMode === 'screenshot' ? styles.modeTabActive : styles.modeTabInactive,
                  ]}
                  onPress={() => setSubMode('screenshot')}
                  activeOpacity={0.8}
                >
                  <ImageIcon
                    size={13}
                    color={subMode === 'screenshot' ? '#0A0A0A' : 'rgba(255, 255, 255, 0.60)'}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.modeTabText,
                      subMode === 'screenshot'
                        ? styles.modeTabTextActive
                        : styles.modeTabTextInactive,
                    ]}
                  >
                    Screenshot
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {activeMode === 'barcode' && (
              <>
                <TouchableOpacity
                  style={[
                    styles.modeTab,
                    subMode === 'barcode' ? styles.modeTabActive : styles.modeTabInactive,
                  ]}
                  onPress={() => setSubMode('barcode')}
                  activeOpacity={0.8}
                >
                  <Barcode
                    size={13}
                    color={subMode === 'barcode' ? '#0A0A0A' : 'rgba(255, 255, 255, 0.60)'}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.modeTabText,
                      subMode === 'barcode'
                        ? styles.modeTabTextActive
                        : styles.modeTabTextInactive,
                    ]}
                  >
                    Barcode
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeTab,
                    subMode === 'qrcode' ? styles.modeTabActive : styles.modeTabInactive,
                  ]}
                  onPress={() => setSubMode('qrcode')}
                  activeOpacity={0.8}
                >
                  <QrCode
                    size={13}
                    color={subMode === 'qrcode' ? '#0A0A0A' : 'rgba(255, 255, 255, 0.60)'}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.modeTabText,
                      subMode === 'qrcode'
                        ? styles.modeTabTextActive
                        : styles.modeTabTextInactive,
                    ]}
                  >
                    QR Code
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {activeMode === 'item_photo' && (
              <>
                <TouchableOpacity
                  style={[
                    styles.modeTab,
                    subMode === 'front' ? styles.modeTabActive : styles.modeTabInactive,
                  ]}
                  onPress={() => setSubMode('front')}
                  activeOpacity={0.8}
                >
                  <Camera
                    size={13}
                    color={subMode === 'front' ? '#0A0A0A' : 'rgba(255, 255, 255, 0.60)'}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.modeTabText,
                      subMode === 'front'
                        ? styles.modeTabTextActive
                        : styles.modeTabTextInactive,
                    ]}
                  >
                    Front View
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeTab,
                    subMode === 'detail' ? styles.modeTabActive : styles.modeTabInactive,
                  ]}
                  onPress={() => setSubMode('detail')}
                  activeOpacity={0.8}
                >
                  <Package
                    size={13}
                    color={subMode === 'detail' ? '#0A0A0A' : 'rgba(255, 255, 255, 0.60)'}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.modeTabText,
                      subMode === 'detail'
                        ? styles.modeTabTextActive
                        : styles.modeTabTextInactive,
                    ]}
                  >
                    Detail / Serial
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Viewfinder Area */}
        <View style={styles.viewfinderArea}>
          {/* Document / Tag / Product Reticle */}
          <View
            style={[
              styles.documentReticle,
              activeMode === 'barcode'
                ? subMode === 'qrcode'
                  ? styles.reticleQr
                  : styles.reticleBarcode
                : activeMode === 'item_photo'
                ? styles.reticlePhoto
                : styles.reticleReceipt,
            ]}
          >
            {/* Corner Reticle Brackets */}
            <View style={[styles.cornerBracket, styles.bracketTopLeft]} />
            <View style={[styles.cornerBracket, styles.bracketTopRight]} />
            <View style={[styles.cornerBracket, styles.bracketBottomLeft]} />
            <View style={[styles.cornerBracket, styles.bracketBottomRight]} />

            {/* Mode-Specific Content inside Reticle */}
            {activeMode === 'receipt' && (
              <View style={styles.receiptPreviewContainer}>
                <View style={styles.receiptPaper}>
                  <View style={styles.receiptHeader}>
                    <Text style={styles.receiptStoreName}>MITRA10 HARDWARE</Text>
                    <Text style={styles.receiptDate}>18 OCT 2026 · 11:42 WIB</Text>
                    <View style={styles.receiptDivider} />
                  </View>

                  <View style={styles.receiptBody}>
                    <View style={[styles.receiptItemRow, isScanning && styles.receiptRowHighlight]}>
                      <Text style={styles.receiptItemTitle}>MAKITA 18V ANGLE GRINDER</Text>
                      <Text style={styles.receiptItemPrice}>Rp 2.450.000</Text>
                    </View>
                    <Text style={styles.receiptItemSku}>SKU: MKT-18V-GRD · QTY: 5</Text>
                    <View style={styles.receiptDividerSubtle} />
                    <View style={styles.receiptItemRow}>
                      <Text style={styles.receiptTotalLabel}>TOTAL PAID</Text>
                      <Text style={styles.receiptTotalAmount}>Rp 2.450.000</Text>
                    </View>
                  </View>

                  <View style={styles.ocrTagRow}>
                    <View style={styles.ocrTag}>
                      <Text style={styles.ocrTagText}>✓ Item Name Detected</Text>
                    </View>
                    <View style={styles.ocrTag}>
                      <Text style={styles.ocrTagText}>✓ Total Parsed</Text>
                    </View>
                  </View>

                  <View style={styles.receiptBarcode}>
                    <View style={styles.barcodeBars} />
                    <Text style={styles.barcodeText}>*881920268819*</Text>
                  </View>
                </View>
              </View>
            )}

            {activeMode === 'barcode' && (
              <View style={styles.barcodePreviewContainer}>
                {subMode === 'qrcode' ? (
                  <View style={styles.qrCodeBox}>
                    <QrCode size={120} color="#FFFFFF" strokeWidth={1.5} />
                    <Text style={styles.barcodeCodeText}>QR: EQ-DW887X-2026</Text>
                  </View>
                ) : (
                  <View style={styles.barcodeBox}>
                    <Barcode size={130} color="#FFFFFF" strokeWidth={1.8} />
                    <Text style={styles.barcodeCodeText}>TAG: DW-887X-SERIAL</Text>
                  </View>
                )}
                <View style={styles.barcodeAimGuide}>
                  <Text style={styles.barcodeAimText}>Align equipment tag within brackets</Text>
                </View>
              </View>
            )}

            {activeMode === 'item_photo' && (
              <View style={styles.photoPreviewContainer}>
                <View style={styles.crosshairH} />
                <View style={styles.crosshairV} />
                <View style={styles.productSilhouette}>
                  <Package size={64} color="rgba(255, 255, 255, 0.3)" strokeWidth={1.2} />
                  <Text style={styles.productSilhouetteText}>
                    Position equipment centered in frame
                  </Text>
                </View>
              </View>
            )}

            {/* Animated Laser Scanning Line */}
            <Animated.View
              style={[
                styles.scanLaserBeam,
                {
                  transform: [{ translateY: laserTranslateY }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255, 94, 0, 0)', 'rgba(255, 94, 0, 0.90)', 'rgba(255, 94, 0, 0)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.scanLaserGradient}
              />
            </Animated.View>

            {/* Flash Light Overlay Effect */}
            {flashActive && <View style={styles.flashOverlay} pointerEvents="none" />}

            {/* Success Overlay when captured */}
            {scanSuccess && (
              <View style={styles.successOverlay}>
                <CheckCircle2 size={42} color="#28C840" strokeWidth={2.5} />
                <Text style={styles.successTitle}>
                  {activeMode === 'receipt'
                    ? 'Receipt Parsed!'
                    : activeMode === 'item_photo'
                    ? 'Photo Captured!'
                    : 'Tag Recognized!'}
                </Text>
                <Text style={styles.successSub}>
                  {activeMode === 'receipt'
                    ? 'Forwarding to Equipment Form...'
                    : activeMode === 'item_photo'
                    ? 'Saving image to equipment...'
                    : 'Updating stock ledger...'}
                </Text>
              </View>
            )}
          </View>

          {/* OCR / Barcode Feedback Pill */}
          <View style={styles.ocrFeedbackPill}>
            <Sparkles size={14} color="#FF5E00" strokeWidth={2} />
            <Text style={styles.ocrFeedbackText}>
              {scanSuccess
                ? activeMode === 'receipt'
                  ? 'Receipt auto-parsed with Gemini Vision'
                  : 'Capture successful'
                : isScanning
                ? activeMode === 'receipt'
                  ? 'Analyzing document layout & fields...'
                  : 'Scanning barcode tag...'
                : activeMode === 'receipt'
                ? 'Receipt focused · Ready to capture'
                : activeMode === 'barcode'
                ? 'Tag in focus · Tap shutter to scan'
                : 'Frame equipment · Tap shutter to capture'}
            </Text>
          </View>
        </View>

        {/* Shutter Bar */}
        <View style={styles.shutterBar}>
          {/* Gallery Picker */}
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handleGalleryPicker}
            activeOpacity={0.7}
            accessibilityLabel="Pick from gallery"
          >
            <ImageIcon size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          {/* Shutter Trigger */}
          <TouchableOpacity
            style={styles.shutterOuterRing}
            onPress={handleShutterPress}
            activeOpacity={0.8}
            accessibilityLabel="Trigger capture"
          >
            <LinearGradient
              colors={['#FF6E1A', '#ED5000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.shutterInner}
            >
              {activeMode === 'item_photo' ? (
                <Camera size={24} color="#FFFFFF" strokeWidth={2.2} />
              ) : activeMode === 'barcode' ? (
                <Barcode size={24} color="#FFFFFF" strokeWidth={2.2} />
              ) : (
                <Scan size={24} color="#FFFFFF" strokeWidth={2.2} />
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Manual Skip Button */}
          <TouchableOpacity
            style={styles.manualButton}
            onPress={handleManualSkip}
            activeOpacity={0.7}
            accessibilityLabel="Manual input without scan"
          >
            <Text style={styles.manualLabel}>Manual</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Barcode Match Bottom Sheet Modal */}
      {scannedItem && (
        <Modal transparent animationType="slide" visible={!!scannedItem}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <View style={styles.modalDragHandle} />

              <View style={styles.modalHeaderRow}>
                <View style={styles.modalTitleCol}>
                  <Text style={styles.modalTitle}>{scannedItem.name}</Text>
                  <Text style={styles.modalSku}>SKU: {scannedItem.sku}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setScannedItem(null)}
                  style={styles.modalCloseBtn}
                >
                  <X size={18} color="#0A0A0A" />
                </TouchableOpacity>
              </View>

              {/* Stock Ledger Numbers */}
              <View style={styles.stockNumbersRow}>
                <View style={styles.stockNumberBox}>
                  <Text style={styles.stockLabel}>AVAILABLE IN WAREHOUSE</Text>
                  <Text style={[styles.stockValue, { color: '#28C840' }]}>
                    {scannedItem.availableCount}
                  </Text>
                </View>
                <View style={styles.stockNumberBox}>
                  <Text style={styles.stockLabel}>OUT / RENTED</Text>
                  <Text style={[styles.stockValue, { color: '#FF5E00' }]}>
                    {scannedItem.outCount}
                  </Text>
                </View>
              </View>

              {/* Action Segmented Switcher */}
              <View style={styles.segmentedActionRow}>
                <TouchableOpacity
                  style={[
                    styles.segmentedBtn,
                    isCheckOutAction && styles.segmentedBtnActiveOut,
                  ]}
                  onPress={() => setIsCheckOutAction(true)}
                >
                  <ArrowUpRight
                    size={16}
                    color={isCheckOutAction ? '#FFFFFF' : '#0A0A0A'}
                    strokeWidth={2.2}
                  />
                  <Text
                    style={[
                      styles.segmentedBtnText,
                      isCheckOutAction && styles.segmentedBtnTextActive,
                    ]}
                  >
                    Check Out (Rent)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segmentedBtn,
                    !isCheckOutAction && styles.segmentedBtnActiveIn,
                  ]}
                  onPress={() => setIsCheckOutAction(false)}
                >
                  <ArrowDownLeft
                    size={16}
                    color={!isCheckOutAction ? '#FFFFFF' : '#0A0A0A'}
                    strokeWidth={2.2}
                  />
                  <Text
                    style={[
                      styles.segmentedBtnText,
                      !isCheckOutAction && styles.segmentedBtnTextActive,
                    ]}
                  >
                    Check In (Return)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Confirm Action Button */}
              <TouchableOpacity
                style={styles.confirmActionButton}
                onPress={handleConfirmStockAction}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={
                    isCheckOutAction
                      ? ['#FF6E1A', '#ED5000']
                      : ['#28C840', '#1FA634']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.confirmGradient}
                >
                  <Text style={styles.confirmButtonText}>
                    Confirm {isCheckOutAction ? 'Check Out' : 'Check In'}
                  </Text>
                  <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.2} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerCanvas: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#000000' : '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneFrame: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 393 : undefined,
    height: Platform.OS === 'web' ? '96vh' : '100%',
    maxHeight: Platform.OS === 'web' ? 880 : undefined,
    backgroundColor: '#0A0A0A',
    borderRadius: Platform.OS === 'web' ? 44 : 0,
    borderWidth: Platform.OS === 'web' ? 0.5 : 0,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    ...Platform.select({
      web: {
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.2)',
      },
    }),
  },

  /* Top Nav Bar */
  topNavBar: {
    height: 48,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    flexShrink: 0,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonActive: {
    backgroundColor: 'rgba(255, 94, 0, 0.25)',
    borderColor: '#FF5E00',
  },
  titleBox: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  navTitle: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    lineHeight: 20,
    textAlign: 'center',
  },
  navSubtitle: {
    fontFamily: 'Onest_400Regular',
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.60)',
    textAlign: 'center',
  },

  /* Mode Switcher Row */
  modeSwitcherRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 16,
    flexShrink: 0,
  },
  modeCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A19',
    borderRadius: 9999,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingVertical: 3,
    paddingHorizontal: 4,
    gap: 4,
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    paddingVertical: 5,
    paddingHorizontal: 12,
    gap: 5,
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
  },
  modeTabInactive: {
    backgroundColor: 'transparent',
  },
  modeTabText: {
    fontSize: 11,
  },
  modeTabTextActive: {
    fontFamily: 'Onest_500Medium',
    fontWeight: '500',
    color: '#0A0A0A',
  },
  modeTabTextInactive: {
    fontFamily: 'Onest_400Regular',
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.60)',
  },

  /* Viewfinder Area */
  viewfinderArea: {
    width: '100%',
    flex: 1,
    minHeight: 460,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 16,
    flexShrink: 0,
  },
  documentReticle: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#141414',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ff5e00',
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 0px 24px rgba(255, 99, 8, 0.30)',
      },
      ios: {
        shadowColor: '#FF6308',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  reticleReceipt: {
    height: 440,
  },
  reticleBarcode: {
    height: 220,
  },
  reticleQr: {
    height: 280,
  },
  reticlePhoto: {
    height: 310,
  },

  /* Corner Reticle Brackets */
  cornerBracket: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#FF5E00',
    zIndex: 2,
  },
  bracketTopLeft: {
    top: 8,
    left: 8,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  bracketTopRight: {
    top: 8,
    right: 8,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  bracketBottomLeft: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  bracketBottomRight: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },

  /* Simulated Receipt Preview */
  receiptPreviewContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  receiptPaper: {
    width: 250,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    gap: 8,
  },
  receiptHeader: {
    alignItems: 'center',
    gap: 3,
  },
  receiptStoreName: {
    fontFamily: 'Onest_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#0A0A0A',
    letterSpacing: 0.5,
  },
  receiptDate: {
    fontFamily: 'Onest_400Regular',
    fontSize: 9,
    color: '#7D8187',
  },
  receiptDivider: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(10, 10, 10, 0.12)',
    marginTop: 4,
  },
  receiptDividerSubtle: {
    height: 0.5,
    width: '100%',
    backgroundColor: 'rgba(10, 10, 10, 0.08)',
    marginVertical: 4,
  },
  receiptBody: {
    gap: 3,
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptRowHighlight: {
    backgroundColor: 'rgba(255, 94, 0, 0.12)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  receiptItemTitle: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 10,
    fontWeight: '600',
    color: '#0A0A0A',
    flex: 1,
  },
  receiptItemPrice: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 10,
    fontWeight: '600',
    color: '#0A0A0A',
  },
  receiptItemSku: {
    fontFamily: 'Onest_400Regular',
    fontSize: 8.5,
    color: '#7D8187',
  },
  receiptTotalLabel: {
    fontFamily: 'Onest_700Bold',
    fontSize: 10,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  receiptTotalAmount: {
    fontFamily: 'Onest_700Bold',
    fontSize: 11,
    fontWeight: '700',
    color: '#ff5e00',
  },
  ocrTagRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  ocrTag: {
    backgroundColor: 'rgba(40, 200, 64, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 0.5,
    borderColor: 'rgba(40, 200, 64, 0.35)',
  },
  ocrTagText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 8,
    fontWeight: '500',
    color: '#28C840',
  },
  receiptBarcode: {
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  barcodeBars: {
    height: 16,
    width: 140,
    backgroundColor: '#0A0A0A',
    opacity: 0.75,
    borderRadius: 1,
  },
  barcodeText: {
    fontFamily: 'Onest_400Regular',
    fontSize: 7.5,
    color: '#7D8187',
    letterSpacing: 2,
  },

  /* Barcode & QR Reticle Content */
  barcodePreviewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  barcodeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  qrCodeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  barcodeCodeText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 11,
    color: '#FF5E00',
    letterSpacing: 1,
  },
  barcodeAimGuide: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  barcodeAimText: {
    fontFamily: 'Onest_400Regular',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  /* Product Photo Content */
  photoPreviewContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  crosshairH: {
    position: 'absolute',
    width: 28,
    height: 1.5,
    backgroundColor: 'rgba(255, 94, 0, 0.45)',
  },
  crosshairV: {
    position: 'absolute',
    height: 28,
    width: 1.5,
    backgroundColor: 'rgba(255, 94, 0, 0.45)',
  },
  productSilhouette: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  productSilhouetteText: {
    fontFamily: 'Onest_400Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.55)',
    textAlign: 'center',
  },

  /* Laser Beam */
  scanLaserBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    zIndex: 10,
  },
  scanLaserGradient: {
    width: '100%',
    height: 3,
  },

  /* Flash overlay */
  flashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    zIndex: 15,
  },

  /* Success overlay */
  successOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 10, 10, 0.88)',
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
  },
  successTitle: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  successSub: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
  },

  /* OCR Feedback Pill */
  ocrFeedbackPill: {
    backgroundColor: '#1F1F1E',
    borderRadius: 9999,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ocrFeedbackText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 16,
  },

  /* Shutter Bar */
  shutterBar: {
    height: 100,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    flexShrink: 0,
  },
  galleryButton: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuterRing: {
    width: 72,
    height: 72,
    borderRadius: 9999,
    borderWidth: 3,
    borderColor: '#ff5e00',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 14px rgba(255, 99, 8, 0.40)',
      },
      ios: {
        shadowColor: '#FF6308',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 7,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  manualButton: {
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualLabel: {
    fontFamily: 'Onest_500Medium',
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  /* Bottom Sheet Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    maxWidth: 393,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    gap: 16,
  },
  modalDragHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(10, 10, 10, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitleCol: {
    flex: 1,
    gap: 2,
  },
  modalTitle: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 17,
    fontWeight: '600',
    color: '#0A0A0A',
  },
  modalSku: {
    fontFamily: 'Onest_400Regular',
    fontSize: 13,
    color: '#7D8187',
  },
  modalCloseBtn: {
    padding: 4,
  },
  stockNumbersRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stockNumberBox: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  stockLabel: {
    fontFamily: 'Onest_500Medium',
    fontSize: 9.5,
    color: '#7D8187',
    letterSpacing: 0.5,
  },
  stockValue: {
    fontFamily: 'Onest_700Bold',
    fontSize: 22,
    fontWeight: '700',
  },
  segmentedActionRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F2',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  segmentedBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentedBtnActiveOut: {
    backgroundColor: '#FF5E00',
  },
  segmentedBtnActiveIn: {
    backgroundColor: '#28C840',
  },
  segmentedBtnText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 13,
    fontWeight: '500',
    color: '#0A0A0A',
  },
  segmentedBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  confirmActionButton: {
    width: '100%',
    borderRadius: 9999,
    overflow: 'hidden',
    marginTop: 4,
  },
  confirmGradient: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
