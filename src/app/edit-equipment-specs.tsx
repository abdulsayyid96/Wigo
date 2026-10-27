import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  RefreshCcw,
  ChevronDown,
  Minus,
  Plus,
  CheckCircle2,
  ArrowUpDown,
  Wrench,
  Image as ImageIcon,
  Trash2,
  Signal,
  Wifi,
  Battery,
  CalendarIcon,
} from 'lucide-react-native';

import { EquipmentItem, WIGO_ITEMS, WIGO_COLORS } from '@/constants/wigo-theme';
import { getWigoItemById, updateWigoItem } from '@/constants/wigo-store';
import { formatIdrInput, calculateUnitCost } from '@/utils/currency';
import { WigoCategoryPickerSheet } from '@/components/wigo/WigoCategoryPickerSheet';
import { WigoDatePickerSheet } from '@/components/wigo/WigoDatePickerSheet';
import { WigoImageSourceModal } from '@/components/wigo/WigoImageSourceModal';


export default function WigoEditEquipmentSpecsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();

  // Fetch target equipment item or default fallback
  const baseItem = useMemo(() => {
    if (params.id) {
      const found = getWigoItemById(params.id);
      if (found) return found;
    }
    return WIGO_ITEMS[0];
  }, [params.id]);

  // Form states matching mockup
  const [itemName, setItemName] = useState(baseItem.name);
  const [serialNumber, setSerialNumber] = useState(baseItem.serialNumber || '');
  const [sku, setSku] = useState(baseItem.sku || '');
  const [categoryName, setCategoryName] = useState(baseItem.categoryName || 'Power Tool');
  const [physicalCondition, setPhysicalCondition] = useState(
    baseItem.physicalCondition || 'Very Good'
  );
  const [includedInKit, setIncludedInKit] = useState(baseItem.includedInKit || '');

  // Rate & Stock Distribution states
  const [totalQuantity, setTotalQuantity] = useState(baseItem.totalQuantity || 5);
  const [lendingRate, setLendingRate] = useState(baseItem.lendingRate || 'Rp 85.000');
  const [availableCount, setAvailableCount] = useState(baseItem.availableCount ?? 3);
  const [outCount, setOutCount] = useState(baseItem.outCount ?? 1);
  const [serviceCount, setServiceCount] = useState(baseItem.serviceCount ?? 1);

  // Invoice & Purchase states
  const [purchaseInvoice, setPurchaseInvoice] = useState(baseItem.purchaseInvoice || '');
  const [warrantyPeriod, setWarrantyPeriod] = useState(baseItem.warrantyPeriod || '24 Months');
  const [purchaseDate, setPurchaseDate] = useState(baseItem.purchaseDate || '18 Oct 2026');
  const [supplier, setSupplier] = useState(baseItem.supplier || 'Mitra10 Hardware');
  const [purchaseCostTotal, setPurchaseCostTotal] = useState(
    baseItem.purchaseCostTotal || 'Rp 2.450.000'
  );
  const [unitCost, setUnitCost] = useState(
    calculateUnitCost(baseItem.purchaseCostTotal || 'Rp 2.450.000', baseItem.totalQuantity || 5) ||
      'Rp 490.000'
  );
  const [invoiceImageUri, setInvoiceImageUri] = useState<string>(baseItem.invoiceImageUri || '');

  // Picker sheets
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isImageSourceModalOpen, setIsImageSourceModalOpen] = useState(false);

  // When purchase cost or quantity updates, recompute unit net cost automatically
  useEffect(() => {
    if (purchaseCostTotal && totalQuantity > 0) {
      const computed = calculateUnitCost(purchaseCostTotal, totalQuantity);
      if (computed) {
        setUnitCost(computed);
      }
    }
  }, [purchaseCostTotal, totalQuantity]);

  // Available is strictly derived from totalQuantity - (outCount + serviceCount)
  // Stepper handlers for total quantity
  const handleQuantityChange = (newQty: number) => {
    const validQty = Math.max(0, newQty);
    const committedCount = outCount + serviceCount;
    if (validQty < committedCount) {
      Alert.alert(
        'Invalid Total Quantity',
        `Total quantity cannot be less than the sum of rented (${outCount}) and maintenance (${serviceCount}) items (${committedCount}).`
      );
      return;
    }
    setTotalQuantity(validQty);
    setAvailableCount(validQty - committedCount);
  };

  const handleOutChange = (delta: number) => {
    const next = Math.max(0, outCount + delta);
    if (next + serviceCount > totalQuantity) {
      Alert.alert(
        'Stock Limit Exceeded',
        `Rented and maintenance items cannot exceed total quantity (${totalQuantity}). Maximum rented available is ${Math.max(0, totalQuantity - serviceCount)}.`
      );
      return;
    }
    setOutCount(next);
    setAvailableCount(totalQuantity - (next + serviceCount));
  };

  const handleOutInputChange = (text: string) => {
    const clean = text.replace(/\D/g, '');
    const num = clean === '' ? 0 : Math.max(0, parseInt(clean, 10));
    if (num + serviceCount > totalQuantity) {
      Alert.alert(
        'Stock Limit Exceeded',
        `Rented and maintenance items cannot exceed total quantity (${totalQuantity}). Maximum rented available is ${Math.max(0, totalQuantity - serviceCount)}.`
      );
      return;
    }
    setOutCount(num);
    setAvailableCount(totalQuantity - (num + serviceCount));
  };

  const handleServiceChange = (delta: number) => {
    const next = Math.max(0, serviceCount + delta);
    if (outCount + next > totalQuantity) {
      Alert.alert(
        'Stock Limit Exceeded',
        `Rented and maintenance items cannot exceed total quantity (${totalQuantity}). Maximum maintenance available is ${Math.max(0, totalQuantity - outCount)}.`
      );
      return;
    }
    setServiceCount(next);
    setAvailableCount(totalQuantity - (outCount + next));
  };

  const handleServiceInputChange = (text: string) => {
    const clean = text.replace(/\D/g, '');
    const num = clean === '' ? 0 : Math.max(0, parseInt(clean, 10));
    if (outCount + num > totalQuantity) {
      Alert.alert(
        'Stock Limit Exceeded',
        `Rented and maintenance items cannot exceed total quantity (${totalQuantity}). Maximum maintenance available is ${Math.max(0, totalQuantity - outCount)}.`
      );
      return;
    }
    setServiceCount(num);
    setAvailableCount(totalQuantity - (outCount + num));
  };

  // Reset Changes button in top nav
  const handleResetToSaved = () => {
    Alert.alert(
      'Reset Changes',
      'Discard all current modifications and restore original equipment values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setItemName(baseItem.name);
            setSerialNumber(baseItem.serialNumber || '');
            setSku(baseItem.sku || '');
            setCategoryName(baseItem.categoryName || 'Power Tool');
            setPhysicalCondition(baseItem.physicalCondition || 'Very Good');
            setIncludedInKit(baseItem.includedInKit || '');
            setTotalQuantity(baseItem.totalQuantity || 5);
            setLendingRate(baseItem.lendingRate || 'Rp 85.000');
            setAvailableCount(baseItem.availableCount ?? 3);
            setOutCount(baseItem.outCount ?? 1);
            setServiceCount(baseItem.serviceCount ?? 1);
            setPurchaseInvoice(baseItem.purchaseInvoice || '');
            setWarrantyPeriod(baseItem.warrantyPeriod || '24 Months');
            setPurchaseDate(baseItem.purchaseDate || '18 Oct 2026');
            setSupplier(baseItem.supplier || 'Mitra10 Hardware');
            setPurchaseCostTotal(baseItem.purchaseCostTotal || 'Rp 2.450.000');
            setUnitCost(
              calculateUnitCost(
                baseItem.purchaseCostTotal || 'Rp 2.450.000',
                baseItem.totalQuantity || 5
              ) || 'Rp 490.000'
            );
            setInvoiceImageUri(baseItem.invoiceImageUri || '');
          },
        },
      ]
    );
  };

  // Save changes handler
  const handleSave = () => {
    if (!itemName.trim()) {
      Alert.alert('Required Field', 'Please enter the item name and model.');
      return;
    }

    const updatedItem: EquipmentItem = {
      ...baseItem,
      name: itemName.trim(),
      sku: sku.trim(),
      categoryName: categoryName.trim(),
      serialNumber: serialNumber.trim(),
      includedInKit: includedInKit.trim(),
      physicalCondition: physicalCondition.trim(),
      totalQuantity,
      lendingRate: lendingRate.trim(),
      cost: lendingRate.trim(),
      availableCount,
      outCount,
      serviceCount,
      purchaseInvoice: purchaseInvoice.trim(),
      warrantyPeriod: warrantyPeriod.trim(),
      purchaseDate: purchaseDate.trim(),
      supplier: supplier.trim(),
      purchaseCostTotal: purchaseCostTotal.trim(),
      invoiceImageUri: invoiceImageUri || undefined,
      category: availableCount > 0 ? 'available' : outCount > 0 ? 'rented' : 'service',
    };

    updateWigoItem(updatedItem);

    Alert.alert('Specs Updated', `Changes for "${itemName}" have been saved.`, [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };

  // Discard changes
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

  // Invoice picture file display name
  const invoiceDisplayName = useMemo(() => {
    if (!invoiceImageUri) return 'Attach receipt photo';
    const filename = invoiceImageUri.split('/').pop() || 'invoice.jpg';
    return filename.length > 20 ? `${filename.slice(0, 17)}...` : filename;
  }, [invoiceImageUri]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.outerCanvas}
    >
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
            onPress={handleDiscard}
            style={styles.navCircularButton}
            accessibilityLabel="Back"
            accessibilityRole="button"
          >
            <ChevronLeft size={18} color="#0A0A0A" strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={styles.titleBox}>
            <Text style={styles.screenTitle}>Edit Equipment Specs</Text>
            <Text style={styles.screenSubtitle}>Manual item update</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleResetToSaved}
            style={styles.navCircularButton}
            accessibilityLabel="Reset Changes"
            accessibilityRole="button"
          >
            <RefreshCcw size={16} color="#0A0A0A" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* Scrollable Form Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section 1 - Equipment Details */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Equipment Details</Text>
              <Text style={styles.sectionSubtitle}>information of equipment</Text>
            </View>

            {/* Field: Item Name & Model */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Item Name & Model</Text>
              <View style={styles.inputBox}>
                <TextInput
                  value={itemName}
                  onChangeText={setItemName}
                  style={styles.textInput}
                  placeholder="e.g. Honda EU2200i Inverter Generator"
                  placeholderTextColor="#7D8187"
                />
              </View>
            </View>

            {/* Row: Serial Number | SKU Code */}
            <View style={styles.twoColumnRow}>
              <View style={styles.columnField}>
                <Text style={styles.fieldLabel}>Serial Number</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={serialNumber}
                    onChangeText={setSerialNumber}
                    style={styles.textInput}
                    placeholder="e.g. EAAJ-2948192"
                    placeholderTextColor="#7D8187"
                  />
                </View>
              </View>

              <View style={styles.columnField}>
                <Text style={styles.fieldLabel}>SKU Code</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={sku}
                    onChangeText={setSku}
                    style={styles.textInput}
                    placeholder="e.g. MKT-18V-GRD"
                    placeholderTextColor="#7D8187"
                  />
                </View>
              </View>
            </View>

            {/* Row: Category | Condition */}
            <View style={styles.twoColumnRow}>
              <View style={styles.columnField}>
                <Text style={styles.fieldLabel}>Category</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsCategoryPickerOpen(true)}
                  style={[styles.inputBox, styles.pickerInputBox]}
                >
                  <Text style={styles.textInput} numberOfLines={1}>
                    {categoryName}
                  </Text>
                  <ChevronDown size={14} color="#7D8187" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              <View style={styles.columnField}>
                <Text style={styles.fieldLabel}>Condition</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={physicalCondition}
                    onChangeText={setPhysicalCondition}
                    style={styles.textInput}
                    placeholder="e.g. Very Good"
                    placeholderTextColor="#7D8187"
                  />
                </View>
              </View>
            </View>

            {/* Field: Include in Kit */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Include in Kit</Text>
              <View style={styles.inputBox}>
                <TextInput
                  value={includedInKit}
                  onChangeText={setIncludedInKit}
                  style={styles.textInput}
                  placeholder="e.g. Box, DC Cord, Parallel Cable"
                  placeholderTextColor="#7D8187"
                />
              </View>
            </View>
          </View>

          {/* Section 2 - Rate & Stock Distribution */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Rate & Stock Distribution</Text>
              <Text style={styles.sectionSubtitle}>Edit Rates & Stocks Distribution</Text>
            </View>

            {/* Row: Total Quantity Stepper | Lending Rate / Day */}
            <View style={styles.twoColumnRow}>
              <View style={styles.columnField}>
                <Text style={styles.fieldLabel}>Total Quantity</Text>
                <View style={styles.stepperBox}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleQuantityChange(totalQuantity - 1)}
                    style={styles.stepperBtn}
                  >
                    <Minus size={12} color="#FF5E00" strokeWidth={2.5} />
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{totalQuantity}</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleQuantityChange(totalQuantity + 1)}
                    style={styles.stepperBtn}
                  >
                    <Plus size={12} color="#FF5E00" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.columnField}>
                <Text style={styles.fieldLabel}>Lending Rate / Day</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={lendingRate}
                    onChangeText={(text) => setLendingRate(formatIdrInput(text))}
                    style={styles.textInput}
                    placeholder="Rp 85.000"
                    placeholderTextColor="#7D8187"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Row: 3 Stock Distribution breakdown inputs */}
            <View style={styles.distributionRow}>
              {/* Available count (Read-only / Auto-calculated) */}
              <View style={styles.distributionColumn}>
                <View style={[styles.distributionInputBox, styles.disabledDistributionBox]}>
                  <CheckCircle2 size={16} color="#28C840" strokeWidth={2.2} />
                  <View style={styles.miniStepperGroup}>
                    <Text style={[styles.distributionValueText, { minWidth: 24, textAlign: 'center' }]}>
                      {availableCount}
                    </Text>
                  </View>
                </View>
                {/* <Text style={styles.distributionSublabel}>Available</Text> */}
              </View>

              {/* Rented / Out count */}
              <View style={styles.distributionColumn}>
                <View style={styles.distributionInputBox}>
                  <ArrowUpDown size={16} color="#FF5E00" strokeWidth={2.2} />
                  <View style={styles.miniStepperGroup}>
                    <TouchableOpacity
                      onPress={() => handleOutChange(-1)}
                      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                    >
                      {/* <Minus size={10} color="#7D8187" strokeWidth={2} /> */}
                    </TouchableOpacity>
                    {/* <Text style={styles.distributionValueText}>{outCount}</Text> */}
                    <TextInput
                      value={outCount === 0 ? '' : outCount.toString()}
                      onChangeText={handleOutInputChange}
                      style={[styles.distributionValueText, { minWidth: 24, paddingVertical: 0 }]}
                      placeholder="0"
                      placeholderTextColor="#7D8187"
                      keyboardType="numeric"
                      inputMode="numeric"
                    />
                    <TouchableOpacity
                      onPress={() => handleOutChange(1)}
                      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                    >
                      {/* <Plus size={10} color="#7D8187" strokeWidth={2} /> */}
                    </TouchableOpacity>
                  </View>
                </View>
                {/* <Text style={styles.distributionSublabel}>Rented</Text> */}
              </View>

              {/* Service / Maintenance count */}
              <View style={styles.distributionColumn}>
                <View style={styles.distributionInputBox}>
                  <Wrench size={16} color="#FEBC2E" strokeWidth={2.2} />
                  <View style={styles.miniStepperGroup}>
                    <TouchableOpacity
                      onPress={() => handleServiceChange(-1)}
                      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                    >
                      {/* <Minus size={10} color="#7D8187" strokeWidth={2} /> */}
                    </TouchableOpacity>
                    {/* <Text style={styles.distributionValueText}>{serviceCount}</Text> */}
                    <TextInput
                      value={serviceCount === 0 ? '0' : serviceCount.toString()}
                      onChangeText={handleServiceInputChange}
                      style={[styles.distributionValueText, { minWidth: 24, paddingVertical: 0 }]}
                      placeholder="0"
                      placeholderTextColor="#7D8187"
                      keyboardType="numeric"
                      inputMode="numeric"
                    />
                    <TouchableOpacity
                      onPress={() => handleServiceChange(1)}
                      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                    >
                      {/* <Plus size={10} color="#7D8187" strokeWidth={2} /> */}
                    </TouchableOpacity>
                  </View>
                </View>
                {/* <Text style={styles.distributionSublabel}>Maintenance</Text> */}
              </View>
            </View>
          </View>

          {/* Section 3 - Invoice & Purchase Data */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Invoice & Purchase Data</Text>
              <Text style={styles.sectionSubtitle}>Information about when it purchase</Text>
            </View>

            {/* Row: Invoice Number | Warranty Period */}
            <View style={styles.twoColumnRow}>
              <View style={styles.columnField}>
                <Text style={styles.fieldLabel}>Invoice Number</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={purchaseInvoice}
                    onChangeText={setPurchaseInvoice}
                    style={styles.textInput}
                    placeholder="INV/2024/03/891"
                    placeholderTextColor="#7D8187"
                  />
                </View>
              </View>

              <View style={styles.columnField}>
                <Text style={styles.fieldLabel}>Warranty Period</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={warrantyPeriod}
                    onChangeText={setWarrantyPeriod}
                    style={styles.textInput}
                    placeholder="24 Months"
                    placeholderTextColor="#7D8187"
                  />
                </View>
              </View>
            </View>

            {/* Row: Purchase Date | Store / Supplier */}
            <View style={styles.twoColumnRow}>
              <View style={styles.columnField}>
                <Text style={styles.fieldLabel}>Purchase Date</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsDatePickerOpen(true)}
                  style={styles.inputBox}
                >
                  <Text style={styles.textInput}>{purchaseDate}</Text>
                  <CalendarIcon size={14} color="#7D8187" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <View style={styles.columnField}>
                <Text style={styles.fieldLabel}>Store / Supplier</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={supplier}
                    onChangeText={setSupplier}
                    style={styles.textInput}
                    placeholder="Mitra10 Hardware"
                    placeholderTextColor="#7D8187"
                  />
                </View>
              </View>
            </View>

            {/* Row: Purchase Cost (Total) | Unit Net Cost */}
            <View style={styles.twoColumnRow}>
              <View style={styles.columnField}>
                <Text style={styles.fieldLabel}>Purchase Cost (Total)</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={purchaseCostTotal}
                    onChangeText={(text) => setPurchaseCostTotal(formatIdrInput(text))}
                    style={styles.textInput}
                    placeholder="Rp 2.450.000"
                    placeholderTextColor="#7D8187"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.columnField}>
                <Text style={styles.fieldLabel}>Unit Net Cost</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={unitCost}
                    onChangeText={(text) => setUnitCost(formatIdrInput(text))}
                    style={styles.textInput}
                    placeholder="Rp 490.000"
                    placeholderTextColor="#7D8187"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Field: Invoice / Receipt Picture */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Invoice / Receipt Picture</Text>
              <View style={styles.invoiceActionsRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsImageSourceModalOpen(true)}
                  style={styles.attachButton}
                >
                  <ImageIcon size={14} color="rgba(10, 10, 10, 0.6)" strokeWidth={2} />
                  <Text style={styles.attachLabel} numberOfLines={1}>
                    {invoiceDisplayName}
                  </Text>
                </TouchableOpacity>

                {invoiceImageUri ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setInvoiceImageUri('')}
                    style={styles.removeInvoiceBtn}
                    accessibilityLabel="Remove Invoice Picture"
                  >
                    <Trash2 size={14} color="#FFFFFF" strokeWidth={2.2} />
                  </TouchableOpacity>
                ) : null}
              </View>
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
          {/* Primary Save Changes CTA */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleSave}
            style={styles.saveCtaWrapper}
          >
            <LinearGradient
              colors={[WIGO_COLORS.orangeGradientStart, WIGO_COLORS.orangeGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.saveCtaGradient}
            >
              <Text style={styles.saveCtaText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Discard Changes Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDiscard}
            style={styles.discardButton}
          >
            <Text style={styles.discardButtonText}>Discard Changes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Picker Sheet */}
      <WigoCategoryPickerSheet
        visible={isCategoryPickerOpen}
        onClose={() => setIsCategoryPickerOpen(false)}
        selectedCategory={categoryName}
        onSelectCategory={(cat) => setCategoryName(cat)}
      />

      {/* Date Picker Sheet */}
      <WigoDatePickerSheet
        visible={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        currentDateText={purchaseDate}
        onSelectDate={(date) => setPurchaseDate(date)}
      />

      {/* Image Source Modal for Invoice Photo */}
      <WigoImageSourceModal
        visible={isImageSourceModalOpen}
        onClose={() => setIsImageSourceModalOpen(false)}
        title="Attach Invoice Photo"
        subtitle="Upload or capture a photo of purchase invoice/receipt"
        onImageSelected={({ uri }) => {
          setInvoiceImageUri(uri);
          setIsImageSourceModalOpen(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outerCanvas: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#F0F0F2' : '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 393,
    flex: 1,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        borderRadius: 44,
        overflow: 'hidden',
        boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.08), 0px 4px 16px rgba(0, 0, 0, 0.04)',
        borderWidth: 0.5,
        borderColor: 'rgba(10, 10, 10, 0.08)',
        maxHeight: 1030,
      },
      default: {},
    }),
  },
  statusBar: {
    height: 54,
    paddingHorizontal: 24,
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBarTime: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Onest_500Medium',
    color: '#0A0A0A',
    letterSpacing: 0,
    lineHeight: 18,
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topNavBar: {
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navCircularButton: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      },
    }),
  },
  titleBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Onest_600SemiBold',
    color: '#0A0A0A',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  screenSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Onest_400Regular',
    color: '#7D8187',
    letterSpacing: 0,
    lineHeight: 14,
  },
  scrollView: {
    flex: 1,
  },
  contentScroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    gap: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    // ...Platform.select({
    //   ios: {
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 1 },
    //     shadowOpacity: 0.03,
    //     shadowRadius: 3,
    //   },
    //   android: {
    //     elevation: 1,
    //   },
    //   web: {
    //     boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
    //   },
    // }),
  },
  sectionHeader: {
    gap: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Onest_500Medium',
    color: '#0A0A0A',
    lineHeight: 20,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Onest_400Regular',
    color: '#7D8187',
    lineHeight: 14,
  },
  fieldGroup: {
    gap: 4,
    width: '100%',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Onest_400Regular',
    color: 'rgba(10, 10, 10, 0.6)',
    lineHeight: 15,
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInput: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Onest_500Medium',
    color: '#0A0A0A',
    lineHeight: 17,
    padding: 0,
    flex: 1,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  columnField: {
    flex: 1,
    gap: 4,
  },
  stepperBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    paddingHorizontal: 8,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Onest_600SemiBold',
    color: '#0A0A0A',
  },
  distributionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  distributionColumn: {
    flex: 1,
    gap: 4,
  },
  distributionInputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disabledDistributionBox: {
    backgroundColor: '#F7F7F7',
    opacity: 0.9,
  },
  miniStepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  distributionValueText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Onest_600SemiBold',
    color: '#0A0A0A',
    width: 10,
    textAlign: 'center',
  },
  distributionSublabel: {
    fontSize: 11,
    fontFamily: 'Onest_400Regular',
    color: '#7D8187',
    textAlign: 'center',
  },
  invoiceActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  attachButton: {
    flex: 1,
    height: 36,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  attachLabel: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Onest_500Medium',
    color: 'rgba(10, 10, 10, 0.6)',
  },
  removeInvoiceBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FF5E00',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#FF5E00',
  },
  bottomActionBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  saveCtaWrapper: {
    width: "100%",
    height: 44,
    borderRadius: 9999,
  },
  saveCtaGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.orangeOutline,
    ...Platform.select({
      ios: {
        shadowColor: '#ED5000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {
        // elevation: 2,
      },
      web: {
        boxShadow: 'inset 0 1.5px 1px rgba(255, 255, 255, 0.5), inset 0 -1.5px 1px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  saveCtaText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Onest_600SemiBold',
    color: '#FFFFFF',
    
  },
  discardButton: {
    height: 42,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discardButtonText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Onest_500Medium',
    color: 'rgba(10, 10, 10, 0.6)',
  },
});
