import React, { useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Sparkles,
  Camera,
  FileCheck,
  ChevronDown,
  Minus,
  Plus,
  Printer,
  Signal,
  Wifi,
  Battery,
  CheckCircle2,
  Calendar as CalendarIcon,
  X,
} from 'lucide-react-native';

import { EquipmentItem, WIGO_COLORS } from '@/constants/wigo-theme';
import { addWigoItem } from '@/constants/wigo-store';
import { formatIdrInput, calculateUnitCost } from '@/utils/currency';
import { WigoCategoryPickerSheet } from '@/components/wigo/WigoCategoryPickerSheet';
import { WigoDatePickerSheet } from '@/components/wigo/WigoDatePickerSheet';
import { WigoImageSourceModal } from '@/components/wigo/WigoImageSourceModal';
import { WigoApiKeyModal } from '@/components/wigo/WigoApiKeyModal';
import { WigoQrModal } from '@/components/wigo/WigoQrModal';
import {
  scanReceiptWithGemini,
  getGeminiApiKey,
  saveGeminiApiKey,
} from '@/services/gemini-vision';

const getTodayFormatted = () => {
  const d = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export default function WigoAddItemScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    photoCaptured?: string;
    capturedUri?: string;
    mode?: string;
  }>();

  // Form states initialized with clean defaults
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Power Tools');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [sku, setSku] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(getTodayFormatted());
  const [supplier, setSupplier] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [lendingRate, setLendingRate] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');

  // AI autofill state indicator
  const [isAiParsed, setIsAiParsed] = useState(false);
  const [isUnitCostManual, setIsUnitCostManual] = useState(false);

  // Photo capture states
  const [itemPhotoUri, setItemPhotoUri] = useState<string | null>(
    params.photoCaptured === 'true' && params.capturedUri ? params.capturedUri : null
  );
  const [receiptPhotoUri, setReceiptPhotoUri] = useState<string | null>(
    params.mode === 'receipt' && params.capturedUri ? params.capturedUri : null
  );
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);

  // Bottom sheet modal visibility states
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isImageSourceModalOpen, setIsImageSourceModalOpen] = useState(false);
  const [imageSourceTarget, setImageSourceTarget] = useState<'item' | 'receipt'>('item');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [pendingReceiptBase64, setPendingReceiptBase64] = useState<string | null>(null);
  const [savedItemForQr, setSavedItemForQr] = useState<EquipmentItem | null>(null);

  // Quantity handlers
  const handleDecrement = () => {
    const newQty = Math.max(1, quantity - 1);
    setQuantity(newQty);
    if (!isUnitCostManual && purchaseCost) {
      setUnitCost(calculateUnitCost(purchaseCost, newQty));
    }
  };

  const handleIncrement = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    if (!isUnitCostManual && purchaseCost) {
      setUnitCost(calculateUnitCost(purchaseCost, newQty));
    }
  };

  const handleQuantityTextChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (!digits) {
      setQuantity(1);
      if (!isUnitCostManual && purchaseCost) {
        setUnitCost(calculateUnitCost(purchaseCost, 1));
      }
      return;
    }
    const val = Math.max(1, parseInt(digits, 10));
    setQuantity(val);
    if (!isUnitCostManual && purchaseCost) {
      setUnitCost(calculateUnitCost(purchaseCost, val));
    }
  };

  // Currency handlers
  const handlePurchaseCostChange = (text: string) => {
    const formatted = formatIdrInput(text);
    setPurchaseCost(formatted);
    if (!isUnitCostManual) {
      setUnitCost(calculateUnitCost(formatted, quantity));
    }
  };

  const handleUnitCostChange = (text: string) => {
    setIsUnitCostManual(true);
    setUnitCost(formatIdrInput(text));
  };

  const handleLendingRateChange = (text: string) => {
    setLendingRate(formatIdrInput(text));
  };

  // Demo autofill
  const handleAutofillDemo = () => {
    setItemName('Makita 18V Brushless Angle Grinder');
    setCategory('Power Tools');
    setSku('MKT-18V-GRD');
    setPurchaseDate('18 Oct 2026');
    setSupplier('Mitra10 Hardware');
    setPurchaseCost('Rp 2.450.000');
    setUnitCost('Rp 490.000');
    setQuantity(5);
    setLendingRate('Rp 85.000');
    setWarrantyPeriod('24 Months Official Warranty');
    setIsAiParsed(true);
    setIsUnitCostManual(false);
    Alert.alert('AI Receipt & Tag OCR', 'Autofilled specifications and billing data from demo receipt.');
  };

  const handleAddCustomCategory = (newCat: string) => {
    if (!customCategories.includes(newCat)) {
      setCustomCategories((prev) => [...prev, newCat]);
    }
  };

  // Photo selection handler
  const handleImageSelected = async (result: { uri: string; base64?: string }) => {
    if (imageSourceTarget === 'item') {
      setItemPhotoUri(result.uri);
    } else {
      setReceiptPhotoUri(result.uri);
      if (result.base64) {
        handleProcessReceiptOcr(result.base64);
      }
    }
  };

  // Gemini Vision OCR execution
  const handleProcessReceiptOcr = async (base64Data: string, keyOverride?: string) => {
    try {
      const apiKey = keyOverride || (await getGeminiApiKey());
      if (!apiKey) {
        setPendingReceiptBase64(base64Data);
        setIsApiKeyModalOpen(true);
        return;
      }

      setIsScanningReceipt(true);
      const parsed = await scanReceiptWithGemini(base64Data, apiKey);

      // Silently populate fields without noisy dialogs
      if (parsed.itemName) setItemName(parsed.itemName);
      if (parsed.category) setCategory(parsed.category);
      if (parsed.purchaseDate) setPurchaseDate(parsed.purchaseDate);
      if (parsed.supplier) setSupplier(parsed.supplier);
      if (parsed.quantity) setQuantity(parsed.quantity);

      if (parsed.purchaseCostTotal) {
        const formattedTotal = formatIdrInput(parsed.purchaseCostTotal.toString());
        setPurchaseCost(formattedTotal);
        if (parsed.unitCost) {
          setUnitCost(formatIdrInput(parsed.unitCost.toString()));
          setIsUnitCostManual(true);
        } else {
          setUnitCost(calculateUnitCost(formattedTotal, parsed.quantity || 1));
        }
      } else if (parsed.unitCost) {
        setUnitCost(formatIdrInput(parsed.unitCost.toString()));
      }

      // Auto SKU suggestion if empty
      if (!sku && parsed.itemName) {
        const words = parsed.itemName.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(Boolean);
        const prefix = words.slice(0, 3).map((w) => w.slice(0, 3).toUpperCase()).join('-');
        if (prefix) setSku(prefix);
      }

      setIsAiParsed(true);
    } catch (err: any) {
      if (err.message === 'MISSING_API_KEY') {
        setPendingReceiptBase64(base64Data);
        setIsApiKeyModalOpen(true);
      } else {
        console.warn('Gemini OCR notice:', err);
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert(err.message || 'Could not parse receipt data. You can continue filling details manually.');
        } else {
          Alert.alert(
            'Receipt Scan Notice',
            err.message || 'Could not parse receipt data. You can continue filling details manually.'
          );
        }
      }
    } finally {
      setIsScanningReceipt(false);
    }
  };

  const handleSaveApiKey = async (newKey: string) => {
    await saveGeminiApiKey(newKey);
    if (pendingReceiptBase64) {
      handleProcessReceiptOcr(pendingReceiptBase64, newKey);
      setPendingReceiptBase64(null);
    }
  };

  const handleSaveAndPrint = () => {
    if (!itemName.trim()) {
      Alert.alert('Required Field', 'Please enter an equipment name.');
      return;
    }

    const costValue = lendingRate.trim() || 'Rp 50.000';
    const newItem: EquipmentItem = {
      id: Date.now().toString(),
      name: itemName.trim(),
      sku: sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      cost: costValue,
      availableCount: quantity,
      outCount: 0,
      serviceCount: 0,
      category: 'available',
      categoryName: category,
      imageUri: itemPhotoUri || undefined,
      supplier: supplier.trim() || undefined,
      invoiceImageUri: receiptPhotoUri || undefined,
      warrantyPeriod: warrantyPeriod.trim() || undefined,
      purchaseDate: purchaseDate,
      purchaseInvoice: supplier.trim() ? `INV/${supplier.trim().slice(0, 4).toUpperCase()}/${Date.now().toString().slice(-4)}` : undefined,
      purchaseCostTotal: purchaseCost.trim() || undefined,
      totalQuantity: quantity,
      lendingRate: costValue,
    };

    addWigoItem(newItem);
    setSavedItemForQr(newItem);
  };

  const handleSaveDraft = () => {
    if (!itemName.trim()) {
      Alert.alert('Required Field', 'Please enter an equipment name.');
      return;
    }

    const costValue = lendingRate.trim() || 'Rp 50.000';
    const newItem: EquipmentItem = {
      id: Date.now().toString(),
      name: itemName.trim(),
      sku: sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      cost: costValue,
      availableCount: quantity,
      outCount: 0,
      serviceCount: 0,
      category: 'available',
      categoryName: category,
      imageUri: itemPhotoUri || undefined,
      supplier: supplier.trim() || undefined,
      invoiceImageUri: receiptPhotoUri || undefined,
      warrantyPeriod: warrantyPeriod.trim() || undefined,
      purchaseDate: purchaseDate,
      purchaseInvoice: supplier.trim() ? `INV/${supplier.trim().slice(0, 4).toUpperCase()}/${Date.now().toString().slice(-4)}` : undefined,
      purchaseCostTotal: purchaseCost.trim() || undefined,
      totalQuantity: quantity,
      lendingRate: costValue,
    };

    addWigoItem(newItem);

    Alert.alert('Saved', `"${newItem.name}" saved to catalog.`, [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
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
        {/* Status Bar */}
        {Platform.OS === 'web' ? (
          <View style={styles.statusBar}>
            <Text style={styles.statusBarTime}>9:41</Text>
            <View style={styles.statusBarIcons}>
              <Signal size={15} color="#0A0A0A" strokeWidth={2.2} />
              <Wifi size={15} color="#0A0A0A" strokeWidth={2.2} />
              <Battery size={20} color="#0A0A0A" strokeWidth={2.2} />
            </View>
          </View>
        ) : null}

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
            <Text style={styles.screenTitle}>Add New Equipment</Text>
            <Text style={styles.screenSubtitle}>Item Input & Labeling</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleAutofillDemo}
            style={styles.navCircularButton}
            accessibilityLabel="AI Autofill Demo"
            accessibilityRole="button"
          >
            <Sparkles size={18} color="#ff5e00" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Dual Capture Row (Real Image Picker & Gemini OCR) */}
            <View style={styles.dualCaptureRow}>
              {/* Gear Photo Card: Item Picture */}
              <View style={styles.photoCard}>
                <View style={styles.photoHeader}>
                  <Text style={styles.photoLabel}>Item Picture</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setImageSourceTarget('item');
                    setIsImageSourceModalOpen(true);
                  }}
                  style={[
                    styles.photoSlot,
                    itemPhotoUri ? styles.photoSlotAttached : null,
                  ]}
                >
                  {itemPhotoUri ? (
                    <View style={styles.thumbnailWrapper}>
                      <Image
                        source={{ uri: itemPhotoUri }}
                        style={styles.photoThumbnail}
                        contentFit="cover"
                      />
                      <View style={styles.thumbnailBadge}>
                        <CheckCircle2 size={13} color="#FFFFFF" strokeWidth={2.4} />
                        <Text style={styles.thumbnailBadgeText}>Photo Added</Text>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Camera size={22} color="rgba(10, 10, 10, 0.6)" strokeWidth={2} />
                      <Text style={styles.photoTag}>Take item picture</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Gear Photo Card: Bill / Invoice */}
              <View style={styles.photoCard}>
                <View style={styles.photoHeader}>
                  <Text style={styles.photoLabel}>Bill / Invoice</Text>
                  {isScanningReceipt && (
                    <View style={styles.scanningBadge}>
                      {/* <ActivityIndicator size="small" color="#ff5e00" /> */}
                      <Text style={styles.scanningText}>Scanning...</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setImageSourceTarget('receipt');
                    setIsImageSourceModalOpen(true);
                  }}
                  style={[
                    styles.photoSlot,
                    receiptPhotoUri ? styles.photoSlotAttached : null,
                  ]}
                >
                  {receiptPhotoUri ? (
                    <View style={styles.thumbnailWrapper}>
                      <Image
                        source={{ uri: receiptPhotoUri }}
                        style={styles.photoThumbnail}
                        contentFit="cover"
                      />
                      <View style={styles.thumbnailBadge}>
                        <FileCheck size={13} color="#FFFFFF" strokeWidth={2.4} />
                        <Text style={styles.thumbnailBadgeText}>Receipt Attached</Text>
                      </View>
                    </View>
                  ) : (
                    <>
                      <FileCheck size={22} color="rgba(10, 10, 10, 0.6)" strokeWidth={2} />
                      <Text style={styles.photoTag}>Take invoice picture</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Section 1 - Equipment Details */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleCol}>
                  <Text style={styles.sectionTitle}>Equipment Details</Text>
                  <Text style={styles.sectionSubtitle}>Insert information of equipment</Text>
                </View>
                {isAiParsed && (
                  <View style={styles.aiBadge}>
                    <Sparkles size={11} color="#ff5e00" strokeWidth={2.2} />
                    <Text style={styles.aiBadgeText}>AI Parsed</Text>
                  </View>
                )}
              </View>

              {/* Item Name & Model */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Item Name & Model *</Text>
                <View style={styles.inputBoxWithAction}>
                  <TextInput
                    value={itemName}
                    onChangeText={setItemName}
                    placeholder="e.g. Makita 18V Brushless Angle Grinder"
                    placeholderTextColor={WIGO_COLORS.textPlaceholder}
                    style={[styles.inputText, { flex: 1 }]}
                  />
                  {itemName.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setItemName('')}
                      style={styles.clearBtn}
                      accessibilityLabel="Clear item name"
                    >
                      <X size={13} color="#8A8F98" strokeWidth={2.2} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Category and SKU Row */}
              <View style={styles.fieldRow}>
                {/* Category Dropdown (Opens Sheet) */}
                <View style={styles.flexField}>
                  <Text style={styles.fieldLabel}>Category</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setIsCategoryPickerOpen(true)}
                    style={styles.inputBoxBetween}
                  >
                    <Text style={styles.inputText} numberOfLines={1}>
                      {category}
                    </Text>
                    <ChevronDown size={14} color="#7D8187" strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                {/* SKU Text Input */}
                <View style={styles.flexField}>
                  <Text style={styles.fieldLabel}>Auto SKU</Text>
                  <View style={styles.inputBoxWithAction}>
                    <TextInput
                      value={sku}
                      onChangeText={(t) => setSku(t.toUpperCase())}
                      placeholder="e.g. MKT-18V-GRD"
                      placeholderTextColor={WIGO_COLORS.textPlaceholder}
                      style={[styles.inputText, { flex: 1 }]}
                      autoCapitalize="characters"
                    />
                    {sku.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setSku('')}
                        style={styles.clearBtn}
                      >
                        <X size={13} color="#8A8F98" strokeWidth={2.2} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Section 2 - Invoice & Purchase Data */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleCol}>
                  <Text style={styles.sectionTitle}>Invoice & Purchase Data</Text>
                  <Text style={styles.sectionSubtitle}>Information about purchase & billing</Text>
                </View>
                {isAiParsed && (
                  <View style={styles.aiBadge}>
                    <Sparkles size={11} color="#ff5e00" strokeWidth={2.2} />
                    <Text style={styles.aiBadgeText}>AI Parsed</Text>
                  </View>
                )}
              </View>

              {/* Date and Supplier Row */}
              <View style={styles.fieldRow}>
                {/* Purchase Date (Opens Date Sheet) */}
                <View style={styles.flexField}>
                  <Text style={styles.fieldLabel}>Purchase Date</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setIsDatePickerOpen(true)}
                    style={styles.inputBoxBetween}
                  >
                    <Text style={styles.inputText}>{purchaseDate}</Text>
                    <CalendarIcon size={14} color="#7D8187" strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                {/* Supplier Input */}
                <View style={styles.flexField}>
                  <Text style={styles.fieldLabel}>Store / Supplier</Text>
                  <View style={styles.inputBoxWithAction}>
                    <TextInput
                      value={supplier}
                      onChangeText={setSupplier}
                      placeholder="e.g. Mitra10 Hardware"
                      placeholderTextColor={WIGO_COLORS.textPlaceholder}
                      style={[styles.inputText, { flex: 1 }]}
                    />
                    {supplier.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setSupplier('')}
                        style={styles.clearBtn}
                      >
                        <X size={13} color="#8A8F98" strokeWidth={2.2} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Price Row (Currency) */}
              <View style={styles.fieldRow}>
                {/* Purchase Cost */}
                <View style={styles.flexField}>
                  <Text style={styles.fieldLabel}>Purchase Cost (Total)</Text>
                  <View style={styles.inputBoxWithAction}>
                    <TextInput
                      value={purchaseCost}
                      onChangeText={handlePurchaseCostChange}
                      placeholder="Rp 0"
                      placeholderTextColor={WIGO_COLORS.textPlaceholder}
                      style={[styles.inputText, { flex: 1 }]}
                      keyboardType="numeric"
                    />
                    {purchaseCost.length > 0 && (
                      <TouchableOpacity
                        onPress={() => handlePurchaseCostChange('')}
                        style={styles.clearBtn}
                      >
                        <X size={13} color="#8A8F98" strokeWidth={2.2} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Unit Net Cost */}
                <View style={styles.flexField}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.fieldLabel}>Unit Net Cost</Text>
                    {!isUnitCostManual && purchaseCost ? (
                      <Text style={styles.autoCalcTag}>Auto</Text>
                    ) : null}
                  </View>
                  <View style={styles.inputBoxWithAction}>
                    <TextInput
                      value={unitCost}
                      onChangeText={handleUnitCostChange}
                      placeholder="Rp 0"
                      placeholderTextColor={WIGO_COLORS.textPlaceholder}
                      style={[styles.inputText, { flex: 1 }]}
                      keyboardType="numeric"
                    />
                    {unitCost.length > 0 && (
                      <TouchableOpacity
                        onPress={() => handleUnitCostChange('')}
                        style={styles.clearBtn}
                      >
                        <X size={13} color="#8A8F98" strokeWidth={2.2} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Warranty Period Row */}
              <View style={styles.fieldRow}>
                <View style={styles.flexField}>
                  <Text style={styles.fieldLabel}>Warranty Period</Text>
                  <View style={styles.inputBoxWithAction}>
                    <TextInput
                      value={warrantyPeriod}
                      onChangeText={setWarrantyPeriod}
                      placeholder="e.g. 24 Months Official Warranty"
                      placeholderTextColor={WIGO_COLORS.textPlaceholder}
                      style={[styles.inputText, { flex: 1 }]}
                    />
                    {warrantyPeriod.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setWarrantyPeriod('')}
                        style={styles.clearBtn}
                      >
                        <X size={13} color="#8A8F98" strokeWidth={2.2} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Section 3 - Stock & Rental Rate */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleCol}>
                  <Text style={styles.sectionTitle}>Stock & Rental Rate</Text>
                  <Text style={styles.sectionSubtitle}>Set item quantity & rental rate</Text>
                </View>
              </View>

              {/* Qty and Rate Row */}
              <View style={styles.fieldRow}>
                {/* Hybrid Stepper Quantity (Direct number input + +/- buttons) */}
                <View style={styles.flexField}>
                  <Text style={styles.fieldLabel}>Total Quantity (Units)</Text>
                  <View style={styles.stepperBox}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleDecrement}
                      style={styles.stepperBtn}
                      accessibilityLabel="Decrease quantity"
                    >
                      <Minus size={13} color="#ff5e00" strokeWidth={2.4} />
                    </TouchableOpacity>

                    <TextInput
                      value={quantity.toString()}
                      onChangeText={handleQuantityTextChange}
                      keyboardType="numeric"
                      style={styles.stepperInput}
                      selectTextOnFocus
                    />

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleIncrement}
                      style={styles.stepperBtn}
                      accessibilityLabel="Increase quantity"
                    >
                      <Plus size={13} color="#ff5e00" strokeWidth={2.4} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Lending Rate Currency */}
                <View style={styles.flexField}>
                  <Text style={styles.fieldLabel}>Lending Rate / Day</Text>
                  <View style={[styles.inputBoxWithAction, { height: 40 }]}>
                    <TextInput
                      value={lendingRate}
                      onChangeText={handleLendingRateChange}
                      placeholder="Rp 0"
                      placeholderTextColor={WIGO_COLORS.textPlaceholder}
                      style={[styles.inputText, { flex: 1 }]}
                      keyboardType="numeric"
                    />
                    {lendingRate.length > 0 && (
                      <TouchableOpacity
                        onPress={() => handleLendingRateChange('')}
                        style={styles.clearBtn}
                      >
                        <X size={13} color="#8A8F98" strokeWidth={2.2} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Label Format Banner */}
            <View style={styles.labelFormatBanner}>
              <View style={styles.labelIconBox}>
                <Printer size={16} color="#ff5e00" strokeWidth={2.2} />
              </View>
              <View style={styles.labelTextCol}>
                <Text style={styles.noticeTitle}>Ready for 50×30mm Thermal Label</Text>
                <Text style={styles.noticeSub}>Scannable barcode generated automatically on save.</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Bottom Action Bar */}
        <View
          style={[
            styles.bottomActionBar,
            {
              paddingBottom: Platform.OS === 'web' ? 16 : Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* Primary Save and Print Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSaveAndPrint}
            style={styles.savePrintWrapper}
          >
            <LinearGradient
              colors={['#FF6B00', '#ED5000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.savePrintGradient}
            >
              <Printer size={18} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.savePrintText}>Save and Print Label</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Save Draft Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSaveDraft}
            style={styles.saveDraftBtn}
          >
            <Text style={styles.saveDraftText}>Save as Draft</Text>
          </TouchableOpacity>
        </View>

        {/* Category Picker Bottom Sheet */}
        <WigoCategoryPickerSheet
          visible={isCategoryPickerOpen}
          onClose={() => setIsCategoryPickerOpen(false)}
          selectedCategory={category}
          onSelectCategory={setCategory}
          customCategories={customCategories}
          onAddCustomCategory={handleAddCustomCategory}
        />

        {/* Date Picker Bottom Sheet */}
        <WigoDatePickerSheet
          visible={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          currentDateText={purchaseDate}
          onSelectDate={setPurchaseDate}
        />

        {/* Image Source Action Sheet (Camera vs Gallery) */}
        <WigoImageSourceModal
          visible={isImageSourceModalOpen}
          onClose={() => setIsImageSourceModalOpen(false)}
          title={
            imageSourceTarget === 'item'
              ? 'Capture Item Picture'
              : 'Scan Bill / Invoice'
          }
          subtitle={
            imageSourceTarget === 'item'
              ? 'Photograph equipment to store thumbnail in catalog'
              : 'Photograph receipt to autofill fields via Gemini Vision'
          }
          onImageSelected={handleImageSelected}
        />

        {/* API Key Modal Fallback */}
        <WigoApiKeyModal
          visible={isApiKeyModalOpen}
          onClose={() => {
            setIsApiKeyModalOpen(false);
            setPendingReceiptBase64(null);
          }}
          onSaveKey={handleSaveApiKey}
        />

        {/* QR Code / Label Print Modal */}
        <WigoQrModal
          visible={!!savedItemForQr}
          item={savedItemForQr}
          onClose={() => {
            setSavedItemForQr(null);
            router.back();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerCanvas: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#EAEAEF' : WIGO_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneFrame: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 393 : undefined,
    height: Platform.OS === 'web' ? '96vh' : '100%',
    maxHeight: Platform.OS === 'web' ? 980 : undefined,
    backgroundColor: WIGO_COLORS.cardBackground,
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

  /* Status Bar */
  statusBar: {
    height: 54,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
    flexShrink: 0,
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
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    flexShrink: 0,
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  screenTitle: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0A',
    lineHeight: 20,
    letterSpacing: -0.2,
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
    width: '100%',
  },
  contentScroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 14,
  },

  /* Dual Capture Row */
  dualCaptureRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  photoCard: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
  },
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  photoLabel: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    fontWeight: '400',
    color: '#0A0A0A',
  },
  scanningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scanningText: {
    fontSize: 10,
    color: '#ff5e00',
    fontWeight: '600',
  },
  photoSlot: {
    height: 120,
    borderRadius: 16,
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  photoSlotAttached: {
    borderStyle: 'solid',
    borderColor: 'rgba(255, 94, 0, 0.4)',
    backgroundColor: '#0F1012',
    padding: 0,
  },
  thumbnailWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(10, 10, 10, 0.78)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    justifyContent: 'center',
  },
  thumbnailBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  photoTag: {
    fontFamily: 'Onest_400Regular',
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(10, 10, 10, 0.6)',
  },

  /* Section Cards */
  sectionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    padding: 14,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  sectionTitleCol: {
    flexDirection: 'column',
    gap: 2,
  },
  sectionTitle: {
    fontFamily: 'Onest_500Medium',
    fontSize: 16,
    fontWeight: '500',
    color: '#0A0A0A',
  },
  sectionTitleSmall: {
    fontFamily: 'Onest_500Medium',
    fontSize: 16,
    fontWeight: '500',
    color: '#0A0A0A',
  },
  sectionSubtitle: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    fontWeight: '400',
    color: '#7D8187',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    // borderRadius: 9999,
    // paddingVertical: 3,
    // paddingHorizontal: 7,
    // backgroundColor: 'rgba(255, 94, 0, 0.08)',
  },
  aiBadgeText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#ff5e00',
  },
  autoCalcTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff5e00',
    // backgroundColor: 'rgba(255, 94, 0, 0.1)',
    // paddingHorizontal: 5,
    // paddingVertical: 1,
    // borderRadius: 4,
  },

  /* Form Fields */
  fieldGroup: {
    width: '100%',
    flexDirection: 'column',
    gap: 4,
  },
  fieldLabel: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(10, 10, 10, 0.6)',
    lineHeight: 14,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  flexField: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },
  inputBoxWithAction: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    paddingHorizontal: 10,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputBoxBetween: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    paddingHorizontal: 12,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#0A0A0A',
    letterSpacing: -0.2,
    padding: 0,
    margin: 0,
  },

  /* Stepper Box */
  stepperBox: {
    height: 40,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperBtn: {
    width: 28,
    height: 28,
    // borderRadius: 6,
    // backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperInput: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    color: '#0A0A0A',
    textAlign: 'center',
    minWidth: 40,
    padding: 0,
    margin: 0,
  },

  /* Label Format Banner */
  labelFormatBanner: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  labelIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  labelTextCol: {
    flex: 1,
    flexDirection: 'column',
    gap: 1,
  },
  noticeTitle: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#0A0A0A',
  },
  noticeSub: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    fontWeight: '400',
    color: '#7D8187',
  },

  /* Bottom Action Bar */
  bottomActionBar: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
    flexDirection: 'column',
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
  },
  savePrintWrapper: {
    width: '100%',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  savePrintGradient: {
    height: 48,
    width: '100%',
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 0.5,
    borderColor: '#FFA066',
    ...Platform.select({
      web: {
        boxShadow: 'inset 0 1.5px 0 rgba(255, 255, 255, 0.5), inset 0 -2.5px 3px rgba(0, 0, 0, 0.2)',
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
  savePrintText: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  saveDraftBtn: {
    height: 42,
    width: '100%',
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  saveDraftText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(10, 10, 10, 0.6)',
    lineHeight: 16,
  },
});
