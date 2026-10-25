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
} from 'lucide-react-native';

import { EquipmentItem, WIGO_ITEMS } from '@/constants/wigo-theme';
import { getWigoItemById, updateWigoItem } from '@/constants/wigo-store';

export default function WigoEquipmentDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();

  // Find item from store or fallback to the first item (Makita 18V Angle Grinder mockup default)
  const baseItem = useMemo(() => {
    if (params.id) {
      const found = getWigoItemById(params.id);
      if (found) return found;
    }
    return WIGO_ITEMS[0];
  }, [params.id]);

  // Screen editable state (matching mockup values)
  const [itemName, setItemName] = useState(baseItem.name);
  const [sku, setSku] = useState(baseItem.sku);
  const [categoryName, setCategoryName] = useState(baseItem.categoryName || 'Power Tool');
  const [serialNumber, setSerialNumber] = useState(baseItem.serialNumber || 'SN-8921-X992');
  const [includedInKit, setIncludedInKit] = useState(
    baseItem.includedInKit || '2x 5.0Ah Li-ion, Charger, Case'
  );
  const [physicalCondition, setPhysicalCondition] = useState(
    baseItem.physicalCondition || 'Grade A (Excellent)'
  );
  const [purchaseInvoice, setPurchaseInvoice] = useState(
    baseItem.purchaseInvoice || 'INV/2026/10/1889'
  );
  const [purchaseDate, setPurchaseDate] = useState(baseItem.purchaseDate || '18 Oct 2026');
  const [purchaseCostTotal, setPurchaseCostTotal] = useState(
    baseItem.purchaseCostTotal || 'Rp 2.450.000'
  );
  const [totalQuantity, setTotalQuantity] = useState(baseItem.totalQuantity || 5);
  const [lendingRate, setLendingRate] = useState(baseItem.lendingRate || 'Rp 85.000');
  const [availableCount, setAvailableCount] = useState(baseItem.availableCount);
  const [outCount, setOutCount] = useState(baseItem.outCount);
  const [serviceCount, setServiceCount] = useState(baseItem.serviceCount || 1);

  // Gallery state (5 thumbnail slots)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Modals for rich interactivity
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

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

  const handleSave = () => {
    const updated: EquipmentItem = {
      ...baseItem,
      name: itemName,
      sku,
      categoryName,
      serialNumber,
      includedInKit,
      physicalCondition,
      purchaseInvoice,
      purchaseDate,
      purchaseCostTotal,
      totalQuantity,
      lendingRate,
      cost: lendingRate,
      availableCount,
      outCount,
      serviceCount,
    };

    updateWigoItem(updated);

    Alert.alert('Changes Saved', `Updated equipment details for "${itemName}".`, [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your edits?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard & Go Back',
          style: 'destructive',
          onPress: () => router.back(),
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
            onPress={() => setIsHistoryModalOpen(true)}
            style={styles.navCircularButton}
            accessibilityLabel="Rental History"
            accessibilityRole="button"
          >
            <History size={18} color="#0A0A0A" strokeWidth={2.2} />
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
              <View style={styles.thumbnailsRow}>
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
              </View>
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
                onPress={() => setIsEditModalOpen(true)}
                style={styles.actionBadge}
              >
                <PenLine size={11} color="#FF5E00" strokeWidth={2.2} />
                <Text style={styles.actionBadgeText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.rowLabel}>Serial Number</Text>
              <Text style={styles.rowValueOnest}>{serialNumber}</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.rowLabel}>Included In Kit</Text>
              <Text style={styles.rowValueGeist}>{includedInKit}</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.rowLabel}>Physical Condition</Text>
              <Text style={styles.rowValueGeist}>{physicalCondition}</Text>
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
              <Text style={styles.rowValueOnest}>{purchaseInvoice}</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.rowLabel}>Purchase Date</Text>
              <Text style={styles.rowValueGeist}>{purchaseDate}</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.rowLabel}>Purchase Cost Total</Text>
              <Text style={styles.rowValueOnest}>{purchaseCostTotal}</Text>
            </View>
          </View>

          {/* Card 5: Stock & Rental Rate */}
          <View style={styles.specsCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.specsHeaderTitle}>Stock & Rental Rate</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsEditModalOpen(true)}
                style={styles.actionBadge}
              >
                <PenLine size={11} color="#FF5E00" strokeWidth={2.2} />
                <Text style={styles.actionBadgeText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.rowLabel}>Total Quantity</Text>
              <Text style={styles.rowValueOnest}>{totalQuantity} unit</Text>
            </View>

            <View style={styles.specRow}>
              <Text style={styles.rowLabel}>Lending Rate</Text>
              <Text style={styles.rowValueGeist}>{lendingRate}</Text>
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
          {/* Primary Save CTA */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleSave}
            style={styles.saveCtaWrapper}
          >
            <LinearGradient
              colors={['#FF6E1A', '#ED5000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.saveCtaGradient}
            >
              <Text style={styles.saveCtaText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Discard Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDiscard}
            style={styles.discardButton}
          >
            <Text style={styles.discardButtonText}>Discard Changes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit Specs Modal */}
      <Modal
        visible={isEditModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Equipment Specs</Text>
              <TouchableOpacity
                onPress={() => setIsEditModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} color="#0A0A0A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalFormScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Equipment Name</Text>
                <TextInput
                  value={itemName}
                  onChangeText={setItemName}
                  style={styles.inputField}
                  placeholder="e.g. Makita Angle Grinder"
                  placeholderTextColor="rgba(10, 10, 10, 0.3)"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Serial Number</Text>
                <TextInput
                  value={serialNumber}
                  onChangeText={setSerialNumber}
                  style={styles.inputField}
                  placeholder="e.g. SN-8921-X992"
                  placeholderTextColor="rgba(10, 10, 10, 0.3)"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Included in Kit</Text>
                <TextInput
                  value={includedInKit}
                  onChangeText={setIncludedInKit}
                  style={styles.inputField}
                  placeholder="e.g. 2x Batteries, Charger"
                  placeholderTextColor="rgba(10, 10, 10, 0.3)"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Physical Condition</Text>
                <TextInput
                  value={physicalCondition}
                  onChangeText={setPhysicalCondition}
                  style={styles.inputField}
                  placeholder="e.g. Grade A (Excellent)"
                  placeholderTextColor="rgba(10, 10, 10, 0.3)"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Lending Rate (per day)</Text>
                <TextInput
                  value={lendingRate}
                  onChangeText={setLendingRate}
                  style={styles.inputField}
                  placeholder="e.g. Rp 85.000"
                  placeholderTextColor="rgba(10, 10, 10, 0.3)"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>SKU Code</Text>
                <TextInput
                  value={sku}
                  onChangeText={setSku}
                  style={styles.inputField}
                  placeholder="e.g. MKT-18V-GRD"
                  placeholderTextColor="rgba(10, 10, 10, 0.3)"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <TextInput
                  value={categoryName}
                  onChangeText={setCategoryName}
                  style={styles.inputField}
                  placeholder="e.g. Power Tool"
                  placeholderTextColor="rgba(10, 10, 10, 0.3)"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Total Quantity</Text>
                <TextInput
                  value={totalQuantity.toString()}
                  onChangeText={(val) => {
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed) && parsed >= 0) setTotalQuantity(parsed);
                  }}
                  keyboardType="number-pad"
                  style={styles.inputField}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Available Stock</Text>
                <TextInput
                  value={availableCount.toString()}
                  onChangeText={(val) => {
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed) && parsed >= 0) setAvailableCount(parsed);
                  }}
                  keyboardType="number-pad"
                  style={styles.inputField}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Rented Out</Text>
                <TextInput
                  value={outCount.toString()}
                  onChangeText={(val) => {
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed) && parsed >= 0) setOutCount(parsed);
                  }}
                  keyboardType="number-pad"
                  style={styles.inputField}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>In Service / Maintenance</Text>
                <TextInput
                  value={serviceCount.toString()}
                  onChangeText={(val) => {
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed) && parsed >= 0) setServiceCount(parsed);
                  }}
                  keyboardType="number-pad"
                  style={styles.inputField}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Purchase Invoice</Text>
                <TextInput
                  value={purchaseInvoice}
                  onChangeText={setPurchaseInvoice}
                  style={styles.inputField}
                  placeholder="e.g. INV/2026/10/1889"
                  placeholderTextColor="rgba(10, 10, 10, 0.3)"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Purchase Date</Text>
                <TextInput
                  value={purchaseDate}
                  onChangeText={setPurchaseDate}
                  style={styles.inputField}
                  placeholder="e.g. 18 Oct 2026"
                  placeholderTextColor="rgba(10, 10, 10, 0.3)"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Purchase Total Cost</Text>
                <TextInput
                  value={purchaseCostTotal}
                  onChangeText={setPurchaseCostTotal}
                  style={styles.inputField}
                  placeholder="e.g. Rp 2.450.000"
                  placeholderTextColor="rgba(10, 10, 10, 0.3)"
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setIsEditModalOpen(false)}
              style={styles.modalDoneBtn}
            >
              <Text style={styles.modalDoneText}>Done Editing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

            <View style={styles.invoiceCard}>
              <View style={styles.specRow}>
                <Text style={styles.rowLabel}>Invoice No.</Text>
                <Text style={styles.rowValueOnest}>{purchaseInvoice}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.rowLabel}>Vendor / Store</Text>
                <Text style={styles.rowValueGeist}>Mitra10 Superstore</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.rowLabel}>Tax Invoice</Text>
                <Text style={styles.rowValueGeist}>F-PAJAK/1026/8892</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.rowLabel}>Warranty Period</Text>
                <Text style={styles.rowValueGreen}>24 Months Official Warranty</Text>
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
                <Text style={styles.rowValueGeist}>3.4 days / rental</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.rowLabel}>Lifetime Rental Events</Text>
                <Text style={styles.rowValueOnest}>1,350 bookings</Text>
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
    fontFamily: 'Geist_500Medium',
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
    fontFamily: 'Geist_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0A',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  screenSubtitle: {
    fontFamily: 'Onest_400Regular',
    fontSize: 11,
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
    height: 170,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
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
    fontFamily: 'Geist_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0A',
    lineHeight: 22,
  },
  skuSubtitle: {
    fontFamily: 'Onest_400Regular',
    fontSize: 11,
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
    fontWeight: '400',
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
    fontSize: 11,
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
    fontSize: 11,
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
    fontFamily: 'Geist_400Regular',
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(10, 10, 10, 0.6)',
  },
  rowValueGreen: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#28C840',
  },
  rowValueOnest: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#0A0A0A',
  },
  rowValueGeist: {
    fontFamily: 'Geist_500Medium',
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
    fontFamily: 'Geist_600SemiBold',
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
    fontFamily: 'Geist_500Medium',
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
    fontFamily: 'Geist_600SemiBold',
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
    fontFamily: 'Geist_500Medium',
    fontSize: 12,
    color: 'rgba(10, 10, 10, 0.7)',
  },
  inputField: {
    height: 40,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.15)',
    paddingHorizontal: 12,
    fontFamily: 'Geist_400Regular',
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
    fontFamily: 'Geist_600SemiBold',
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
    fontFamily: 'Geist_500Medium',
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
});
