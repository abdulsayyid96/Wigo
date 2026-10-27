import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  History,
  Image as ImageIcon,
  CircleCheck,
  ArrowUpDown,
  Wrench,
  TrendingUp,
  FileText,
  PenLine,
  Signal,
  Wifi,
  Battery,
  X,
  RotateCwClock,
  MoreVertical,
  Trash2,
  ZoomIn,
  Paperclip,
  Upload

} from 'lucide-react-native';

import { EquipmentItem, WIGO_ITEMS } from '@/constants/wigo-theme';
import { useWigoItems, deleteWigoItem } from '@/constants/wigo-store';

export default function WigoEquipmentDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const [items] = useWigoItems();

  // Find item from store or fallback to the first item (Makita 18V Angle Grinder mockup default)
  const baseItem = useMemo(() => {
    if (params.id) {
      const found = items.find((item) => item.id === params.id);
      if (found) return found;
    }
    return items[0] || WIGO_ITEMS[0];
  }, [params.id, items]);

  // Derived values directly from store/database
  const itemName = baseItem.name;
  const sku = baseItem.sku;
  const categoryName = baseItem.categoryName || 'Power Tool';
  const serialNumber = baseItem.serialNumber || 'SN-8921-X992';
  const includedInKit = baseItem.includedInKit || '2x 5.0Ah Li-ion, Charger, Case';
  const physicalCondition = baseItem.physicalCondition || 'Grade A (Excellent)';
  const purchaseInvoice = baseItem.purchaseInvoice || 'INV/2026/10/1889';
  const purchaseDate = baseItem.purchaseDate || '18 Oct 2026';
  const purchaseCostTotal = baseItem.purchaseCostTotal || 'Rp 2.450.000';
  const totalQuantity = baseItem.totalQuantity || 5;
  const lendingRate = baseItem.lendingRate || 'Rp 85.000';
  const availableCount = baseItem.availableCount ?? 3;
  const outCount = baseItem.outCount ?? 1;
  const serviceCount = baseItem.serviceCount ?? 0;
  const supplier = baseItem.supplier || 'Mitra10 Superstore';
  const warrantyPeriod = baseItem.warrantyPeriod || '24 Months Official Warranty';
  const invoiceImageUri = baseItem.invoiceImageUri || '';

  // Gallery state (5 thumbnail slots)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Modals for rich interactivity
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [isInvoiceImageModalOpen, setIsInvoiceImageModalOpen] = useState(false);

  // Stock distribution bar calculation
  const totalStock = Math.max(availableCount + outCount + serviceCount, 1);
  const availRatio = availableCount / totalStock;
  const outRatio = outCount / totalStock;
  const serviceRatio = serviceCount / totalStock;

  // Earnings
  const earnings = baseItem.earnings || {
    lifetime: 'Rp 114.750.000',
    ytd: 'Rp 38.250.000',
    monthly: 'Rp 6.375.000',
  };

  const handleOpenEditSpecs = () => {
    router.push({
      pathname: '/edit-equipment-specs',
      params: { id: baseItem.id },
    });
  };

  const handleDeleteEquipment = () => {
    setIsContextMenuOpen(false);
    Alert.alert(
      'Delete Equipment',
      `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteWigoItem(baseItem.id);
            Alert.alert('Equipment Deleted', `"${itemName}" was removed from inventory.`, [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.outerCanvas}>
      {/* 393px Phone Mockup Container */}
      <View
        style={[
          styles.phoneFrame,
          {
            paddingTop: Platform.OS === 'web' ? 0 : insets.top,
          },
        ]}
      >
        {/* Status Bar for Web Preview */}
        {Platform.OS === 'web' && (
          <View style={styles.statusBar}>
            <Text style={styles.statusBarTime}>9:41</Text>
            <View style={styles.statusBarIcons}>
              <Signal size={15} color="#0A0A0A" strokeWidth={2.2} />
              <Wifi size={15} color="#0A0A0A" strokeWidth={2.2} />
              <Battery size={20} color="#0A0A0A" strokeWidth={2.2} />
            </View>
          </View>
        )}

        {/* Top Nav Bar */}
        <View style={styles.topNavBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.navCircularButton}
            accessibilityLabel="Back"
            accessibilityRole="button"
          >
            <ChevronLeft size={18} color="#0A0A0A" strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={styles.titleBox}>
            <Text style={styles.screenTitle}>Equipment Detail</Text>
            <Text style={styles.screenSubtitle}>{categoryName}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsContextMenuOpen(true)}
            style={styles.navCircularButton}
            accessibilityLabel="More Options"
            accessibilityRole="button"
          >
            <MoreVertical size={18} color="#0A0A0A" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Equipment Photo Stage & Model Title */}
          <View style={styles.heroSection}>
            <View style={styles.photoStageContainer}>
              {/* Main Photo Stage */}
              <View style={styles.mainPhotoStage}>
                {baseItem.imageUri ? (
                  <Image source={{ uri: baseItem.imageUri }} style={styles.mainImage} />
                ) : (
                  <ImageIcon size={28} color="rgba(10, 10, 10, 0.25)" strokeWidth={1.75} />
                )}
              </View>

              {/* Thumbnails Row */}
              {/* <View style={styles.thumbnailsRow}>
                {[0, 1, 2, 3, 4].map((index) => {
                  const isSelected = selectedPhotoIndex === index;
                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.8}
                      onPress={() => setSelectedPhotoIndex(index)}
                      style={[
                        styles.thumbnailStage,
                        isSelected && styles.thumbnailStageActive,
                      ]}
                    >
                      <ImageIcon
                        size={18}
                        color={isSelected ? '#FF6E1A' : 'rgba(10, 10, 10, 0.25)'}
                        strokeWidth={1.75}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View> */}
            </View>

            {/* Hero Visual Row */}
            <View style={styles.heroVisualRow}>
              <Text style={styles.modelSpecsTitle}>{itemName}</Text>
              <Text style={styles.skuSubtitle}>{sku}</Text>
            </View>
          </View>

          {/* Card 1: Stock Distribution */}
          <View style={styles.specsCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.specsHeaderTitle}>Stock Distribution</Text>
            </View>

            {/* Distribution Segment Bar */}
            <View style={styles.distributionBar}>
              <View
                style={[
                  styles.segmentAvailable,
                  { flex: Math.max(availRatio, 0.05) },
                ]}
              />
              <View
                style={[
                  styles.segmentRentOut,
                  { flex: Math.max(outRatio, 0.05) },
                ]}
              />
              <View
                style={[
                  styles.segmentService,
                  { flex: Math.max(serviceRatio, 0.05) },
                ]}
              />
            </View>

            {/* Status Pills */}
            <View style={styles.pillsRow}>
              <View style={styles.availTag}>
                <CircleCheck size={10} color="#28C840" strokeWidth={2.4} />
                <Text style={styles.pillText}>{availableCount} Available</Text>
              </View>

              <View style={styles.outTag}>
                <ArrowUpDown size={10} color="#FF5E00" strokeWidth={2.4} />
                <Text style={styles.pillText}>{outCount} Rent Out</Text>
              </View>

              <View style={styles.serviceTag}>
                <Wrench size={10} color="#FEBC2E" strokeWidth={2.4} />
                <Text style={styles.pillText}>{serviceCount} On Service</Text>
              </View>
            </View>
          </View>

          {/* Card 2: Earnings */}
          <View style={styles.specsCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.specsHeaderTitle}>Earnings</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsStatsModalOpen(true)}
                style={styles.actionBadge}
              >
                <TrendingUp size={11} color="#FF5E00" strokeWidth={2.2} />
                <Text style={styles.actionBadgeText}>Stats</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.rowLabel}>Lifetime Earnings</Text>
              <Text style={styles.rowValueGreen}>{earnings.lifetime}</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.rowLabel}>Year-to-date Earnings</Text>
              <Text style={styles.rowValueGreen}>{earnings.ytd}</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.rowLabel}>Monthly Earnings</Text>
              <Text style={styles.rowValueGreen}>{earnings.monthly}</Text>
            </View>
          </View>

          {/* Card 3: Item Detail */}
          <View style={styles.specsCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.specsHeaderTitle}>Item Detail</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleOpenEditSpecs}
                style={styles.actionBadge}
              >
                <PenLine size={11} color="#FF5E00" strokeWidth={2.2} />
                <Text style={styles.actionBadgeText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.rowLabel}>Serial Number</Text>
              <Text style={styles.rowValue}>{serialNumber}</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.rowLabel}>Included In Kit</Text>
              <Text style={styles.rowValue}>{includedInKit}</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.rowLabel}>Physical Condition</Text>
              <Text style={styles.rowValue}>{physicalCondition}</Text>
            </View>
          </View>

          {/* Card 4: Purchase Detail */}
          <View style={styles.specsCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.specsHeaderTitle}>Purchase Detail</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsInvoiceModalOpen(true)}
                style={styles.actionBadge}
              >
                <FileText size={11} color="#FF5E00" strokeWidth={2.2} />
                <Text style={styles.actionBadgeText}>Invoice</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.rowLabel}>Purchase Invoice</Text>
              <Text style={styles.rowValue}>{purchaseInvoice}</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.rowLabel}>Purchase Date</Text>
              <Text style={styles.rowValue}>{purchaseDate}</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.rowLabel}>Purchase Cost Total</Text>
              <Text style={styles.rowValue}>{purchaseCostTotal}</Text>
            </View>
          </View>

          {/* Card 5: Stock & Rental Rate */}
          <View style={styles.specsCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.specsHeaderTitle}>Stock & Rental Rate</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleOpenEditSpecs}
                style={styles.actionBadge}
              >
                <PenLine size={11} color="#FF5E00" strokeWidth={2.2} />
                <Text style={styles.actionBadgeText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.rowLabel}>Total Quantity</Text>
              <Text style={styles.rowValue}>{totalQuantity} unit</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.rowLabel}>Lending Rate</Text>
              <Text style={styles.rowValue}>{lendingRate}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View
          style={[
            styles.bottomActionBar,
            { paddingBottom: Platform.OS === 'web' ? 16 : Math.max(insets.bottom, 16) },
          ]}
        >
          {/* Primary Edit Specs CTA */}
          {/* <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleOpenEditSpecs}
            style={styles.saveCtaWrapper}
          >
            <LinearGradient
              colors={['#FF6E1A', '#ED5000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.saveCtaGradient, { flexDirection: 'row', gap: 6 }]}
            >
              <PenLine size={16} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.saveCtaText}>Edit Equipment Specs</Text>
            </LinearGradient>
          </TouchableOpacity> */}
        </View>
      </View>

      {/* History Modal */}
      <Modal
        visible={isHistoryModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsHistoryModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <History size={18} color="#FF6E1A" />
                <Text style={styles.modalTitle}>Equipment History</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsHistoryModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} color="#0A0A0A" />
              </TouchableOpacity>
            </View>

            <View style={styles.historyList}>
              <View style={styles.historyItem}>
                <View style={styles.historyDotGreen} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.historyTitle}>Checked In from PT Jaya Konstruksi</Text>
                  <Text style={styles.historyTime}>Yesterday at 16:30 · Inspected & Cleaned</Text>
                </View>
              </View>
              <View style={styles.historyItem}>
                <View style={styles.historyDotOrange} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.historyTitle}>Rented Out to Studio Bali Kencana</Text>
                  <Text style={styles.historyTime}>21 Oct 2026 · 4 Days Rental</Text>
                </View>
              </View>
              <View style={styles.historyItem}>
                <View style={styles.historyDotYellow} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.historyTitle}>Maintenance & Carbon Brush Check</Text>
                  <Text style={styles.historyTime}>18 Oct 2026 · Passed Calibration</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setIsHistoryModalOpen(false)}
              style={styles.modalDoneBtn}
            >
              <Text style={styles.modalDoneText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Invoice Modal */}
      <Modal
        visible={isInvoiceModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsInvoiceModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <FileText size={18} color="#FF6E1A" />
                <Text style={styles.modalTitle}>Purchase Receipt & Invoice</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsInvoiceModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} color="#0A0A0A" />
              </TouchableOpacity>
            </View>
            
            {/* Invoice image preview container */}
            {invoiceImageUri ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setIsInvoiceImageModalOpen(true)}
                style={styles.invoiceImageContainer}
              >
                <Image
                  source={{ uri: invoiceImageUri }}
                  style={styles.invoiceImagePreview}
                  resizeMode="cover"
                />
                <View style={styles.tapToZoomBadge}>
                  <ZoomIn size={12} color="#FFFFFF" strokeWidth={2.2} />
                  <Text style={styles.tapToZoomText}>Tap to zoom receipt</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.noInvoiceImagePlaceholder}>
                <ImageIcon size={26} color="rgba(10, 10, 10, 0.25)" strokeWidth={1.8} />
                <Text style={styles.noInvoiceText}>No invoice picture attached</Text>
                <Text style={styles.noInvoiceSubtext}>
                  Add receipt image in Edit Details to store paper bills
                </Text>
              </View>
            )}

            <View style={styles.invoiceCard}>
              <View style={styles.specRow}>
                <Text style={styles.rowLabel}>Invoice No.</Text>
                <Text style={styles.rowValue}>{purchaseInvoice || '-'}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.rowLabel}>Supplier / Store</Text>
                <Text style={styles.rowValue}>{supplier || 'Mitra10 Superstore'}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.rowLabel}>Warranty Period</Text>
                <Text style={styles.rowValueGreen}>{`${warrantyPeriod} Months` || '24 Months Official Warranty'}</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setIsInvoiceModalOpen(false)}
              style={styles.modalDoneBtn}
            >
              <Text style={styles.modalDoneText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Stats Modal */}
      <Modal
        visible={isStatsModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsStatsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={18} color="#FF6E1A" />
                <Text style={styles.modalTitle}>Equipment Performance Stats</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsStatsModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} color="#0A0A0A" />
              </TouchableOpacity>
            </View>

            <View style={styles.invoiceCard}>
              <View style={styles.specRow}>
                <Text style={styles.rowLabel}>Utilization Rate</Text>
                <Text style={styles.rowValueGreen}>78% this month</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.rowLabel}>Payback ROI</Text>
                <Text style={styles.rowValueGreen}>4,683% (Asset Fully Recouped)</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.rowLabel}>Average Rental Duration</Text>
                <Text style={styles.rowValue}>3.4 days / rental</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.rowLabel}>Lifetime Rental Events</Text>
                <Text style={styles.rowValue}>1,350 bookings</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setIsStatsModalOpen(false)}
              style={styles.modalDoneBtn}
            >
              <Text style={styles.modalDoneText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Three-dot Context Menu Dropdown */}
      <Modal
        visible={isContextMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsContextMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.contextMenuOverlay}
          activeOpacity={1}
          onPress={() => setIsContextMenuOpen(false)}
        >
          <View
            style={[
              styles.contextMenuDropdown,
              {
                top: Platform.OS === 'web' ? 56 : insets.top + 23,
                right: 16,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.contextMenuItem}
              activeOpacity={0.7}
              onPress={() => {
                setIsContextMenuOpen(false);
                handleOpenEditSpecs();
              }}
            >
              <PenLine size={16} color="#0A0A0A" strokeWidth={2} />
              <Text style={styles.contextMenuText}>Edit Specs</Text>
            </TouchableOpacity>

            <View style={styles.contextMenuDivider} />

            <TouchableOpacity
              style={styles.contextMenuItem}
              activeOpacity={0.7}
              onPress={() => {
                setIsContextMenuOpen(false);
                setIsHistoryModalOpen(true);
              }}
            >
              <History size={16} color="#0A0A0A" strokeWidth={2} />
              <Text style={styles.contextMenuText}>Rental History</Text>
            </TouchableOpacity>

            <View style={styles.contextMenuDivider} />

            <TouchableOpacity
              style={styles.contextMenuItem}
              activeOpacity={0.7}
              onPress={handleDeleteEquipment}
            >
              <Trash2 size={16} color="#E02424" strokeWidth={2} />
              <Text style={[styles.contextMenuText, { color: '#E02424', fontWeight: '600' }]}>
                Delete Equipment
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Fullscreen Invoice Lightbox Modal */}
      <Modal
        visible={isInvoiceImageModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsInvoiceImageModalOpen(false)}
      >
        <View style={styles.fullscreenImageOverlay}>
          <TouchableOpacity
            style={styles.fullscreenCloseBtn}
            onPress={() => setIsInvoiceImageModalOpen(false)}
            activeOpacity={0.8}
            accessibilityLabel="Close image preview"
          >
            <X size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          {invoiceImageUri ? (
            <Image
              source={{ uri: invoiceImageUri }}
              style={styles.fullscreenInvoiceImage}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerCanvas: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#EAEAEF' : '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneFrame: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 393 : undefined,
    height: Platform.OS === 'web' ? '96vh' : '100%',
    maxHeight: Platform.OS === 'web' ? 980 : undefined,
    backgroundColor: '#FFFFFF',
    borderWidth: Platform.OS === 'web' ? 0.5 : 0,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    borderRadius: Platform.OS === 'web' ? 44 : 0,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow:
          '0 20px 40px -10px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)',
      },
      default: {},
    }),
  },
  statusBar: {
    height: 54,
    paddingTop: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  statusBarTime: {
    fontFamily: 'Onest_500Medium',
    fontSize: 14,
    fontWeight: '500',
    color: '#0A0A0A',
    lineHeight: 18,
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  /* Top Nav Bar */
  topNavBar: {
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  navCircularButton: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
  },
  screenTitle: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0A',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  screenSubtitle: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    fontWeight: '400',
    color: '#7D8187',
    lineHeight: 13,
  },

  /* Scrollable Content */
  scrollView: {
    flex: 1,
  },
  contentScroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 14,
  },

  /* Hero Visual & Photos */
  heroSection: {
    gap: 16,
    width: '100%',
  },
  photoStageContainer: {
    gap: 10,
    width: '100%',
  },
  mainPhotoStage: {
    width: '100%',
    height: 360,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    overflow: 'hidden',
  },
  thumbnailStage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F7F7F7',
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailStageActive: {
    borderColor: '#FF6E1A',
    backgroundColor: '#FFF8F4',
  },
  heroVisualRow: {
    gap: 4,
    width: '100%',
  },
  modelSpecsTitle: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0A',
    lineHeight: 22,
  },
  skuSubtitle: {
    fontFamily: 'Onest_400Regular',
    fontSize: 14,
    fontWeight: '400',
    color: '#7D8187',
    lineHeight: 13,
  },

  /* Specifications Cards */
  specsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    padding: 16,
    gap: 12,
    width: '100%',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  specsHeaderTitle: {
    fontFamily: 'Onest_400Regular',
    fontSize: 16,
    fontWeight: '800',
    color: '#0A0A0A',
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingLeft: 8,
    paddingRight: 4,
    borderRadius: 9999,
  },
  actionBadgeText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#FF5E00',
  },

  /* Distribution Bar */
  distributionBar: {
    height: 11,
    borderRadius: 9999,
    flexDirection: 'row',
    gap: 4,
    width: '100%',
    overflow: 'hidden',
  },
  segmentAvailable: {
    backgroundColor: '#28C840',
    borderRadius: 44,
    height: 11,
  },
  segmentRentOut: {
    backgroundColor: '#FF5E00',
    borderRadius: 44,
    height: 11,
  },
  segmentService: {
    backgroundColor: '#FEBC2E',
    borderRadius: 44,
    height: 11,
  },

  /* Status Pills */
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  availTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 16,
  },
  outTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 16,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 16,
  },
  pillText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#0A0A0A',
    lineHeight: 13,
  },

  /* Spec Rows */
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    width: '100%',
  },
  rowLabel: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(10, 10, 10, 0.6)',
  },
  rowValueGreen: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#28C840',
  },
  rowValue: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#0A0A0A',
  },

  /* Bottom Action Bar */
  bottomActionBar: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(10, 10, 10, 0.04)',
  },
  saveCtaWrapper: {
    width: '100%',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  saveCtaGradient: {
    height: 48,
    width: '100%',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#FFA066',
    ...Platform.select({
      web: {
        boxShadow:
          'inset 0 1.5px 0 rgba(255, 255, 255, 0.5), inset 0 -2.5px 3px rgba(0, 0, 0, 0.2)',
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
  saveCtaText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  discardButton: {
    height: 42,
    width: '100%',
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discardButtonText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(10, 10, 10, 0.6)',
    lineHeight: 16,
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
      },
      default: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0A',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F7',
  },
  modalFormScroll: {
    maxHeight: 340,
  },
  formGroup: {
    gap: 6,
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    color: 'rgba(10, 10, 10, 0.7)',
  },
  inputField: {
    height: 40,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.15)',
    paddingHorizontal: 12,
    fontFamily: 'Onest_400Regular',
    fontSize: 13,
    color: '#0A0A0A',
    backgroundColor: '#FAFAFA',
  },
  modalDoneBtn: {
    height: 44,
    borderRadius: 9999,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDoneText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(10, 10, 10, 0.05)',
  },
  historyDotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#28C840',
    marginTop: 5,
  },
  historyDotOrange: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5E00',
    marginTop: 5,
  },
  historyDotYellow: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FEBC2E',
    marginTop: 5,
  },
  historyTitle: {
    fontFamily: 'Onest_500Medium',
    fontSize: 13,
    color: '#0A0A0A',
  },
  historyTime: {
    fontFamily: 'Onest_400Regular',
    fontSize: 11,
    color: '#7D8187',
  },
  invoiceCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  contextMenuOverlay: {
    flex: 1,
    // backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  contextMenuDropdown: {
    position: 'absolute',
    width: 190,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  contextMenuText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 14,
    color: '#0A0A0A',
  },
  contextMenuDivider: {
    height: 0.5,
    backgroundColor: 'rgba(10, 10, 10, 0.08)',
    marginVertical: 4,
  },
  invoiceImageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#EAEAEA',
    position: 'relative',
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.1)',
    marginBottom: 8,
  },
  invoiceImagePreview: {
    width: '100%',
    height: '100%',
  },
  tapToZoomBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(10, 10, 10, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tapToZoomText: {
    color: '#FFFFFF',
    fontFamily: 'Onest_500Medium',
    fontSize: 11,
  },
  noInvoiceImagePlaceholder: {
    width: '100%',
    height: 110,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(10, 10, 10, 0.15)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: '#FAFAFA',
    gap: 4,
    marginBottom: 8,
  },
  noInvoiceText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 13,
    color: '#0A0A0A',
  },
  noInvoiceSubtext: {
    fontFamily: 'Onest_400Regular',
    fontSize: 11,
    color: '#7D8187',
    textAlign: 'center',
  },
  fullscreenImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  fullscreenCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenInvoiceImage: {
    width: '100%',
    height: '80%',
  },
  editInvoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  editInvoiceThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#EAEAEA',
  },
  editInvoiceBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.15)',
  },
  editInvoiceBtnText: {
    width: 14,
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    color: '#0A0A0A',
  },
});
