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
} from 'react-native';
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
} from 'lucide-react-native';

import { EquipmentItem, WIGO_COLORS } from '@/constants/wigo-theme';
import { addWigoItem } from '@/constants/wigo-store';

export default function WigoAddItemScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ photoCaptured?: string }>();
  const isPhotoCaptured = params.photoCaptured === 'true';

  // Form states initialized with mockup values
  const [itemName, setItemName] = useState('Makita 18V Brushless Angle Grinder');
  const [category, setCategory] = useState('Power Tools');
  const [sku, setSku] = useState('MKT-18V-GRD');
  const [purchaseDate, setPurchaseDate] = useState('18 Oct 2026');
  const [supplier, setSupplier] = useState('Mitra10 Hardware');
  const [purchaseCost, setPurchaseCost] = useState('Rp 2.450.000');
  const [unitCost, setUnitCost] = useState('Rp 490.000');
  const [quantity, setQuantity] = useState(5);
  const [lendingRate, setLendingRate] = useState('Rp 85.000');

  // AI autofill state indicator
  const [isAiParsed, setIsAiParsed] = useState(true);

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

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
    setIsAiParsed(true);
    Alert.alert('AI Receipt & Tag OCR', 'Autofilled specifications and billing data from scanned receipt.');
  };

  const handleCategoryCycle = () => {
    const categories = ['Power Tools', 'Heavy Machinery', 'Audio / Visual', 'Hand Tools', 'Generators'];
    const currentIndex = categories.indexOf(category);
    const nextCategory = categories[(currentIndex + 1) % categories.length];
    setCategory(nextCategory);
  };

  const handleSaveAndPrint = () => {
    if (!itemName.trim()) {
      Alert.alert('Required Field', 'Please enter an equipment name.');
      return;
    }

    const newItem: EquipmentItem = {
      id: Date.now().toString(),
      name: itemName.trim(),
      sku: sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      cost: lendingRate.trim() || '$45.00',
      availableCount: quantity,
      outCount: 0,
      serviceCount: 0,
      category: 'available',
    };

    addWigoItem(newItem);

    Alert.alert(
      'Label Sent to Printer',
      `Barcode label 50×30mm for "${newItem.name}" (${newItem.sku}) queued to Phomemo M110.`,
      [
        {
          text: 'Done',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleSaveDraft = () => {
    if (!itemName.trim()) {
      Alert.alert('Required Field', 'Please enter an equipment name.');
      return;
    }

    const newItem: EquipmentItem = {
      id: Date.now().toString(),
      name: itemName.trim(),
      sku: sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      cost: lendingRate.trim() || '$45.00',
      availableCount: quantity,
      outCount: 0,
      serviceCount: 0,
      category: 'available',
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
            <Text style={styles.screenSubtitle}>Item Intake & Labeling</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleAutofillDemo}
            style={styles.navCircularButton}
            accessibilityLabel="AI Autofill"
            accessibilityRole="button"
          >
            <Sparkles size={18} color="#ff5e00" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Dual Capture Row (Frame 4) */}
          <View style={styles.dualCaptureRow}>
            {/* Gear Photo Card: Item Picture */}
            <View style={styles.photoCard}>
              <View style={styles.photoHeader}>
                <Text style={styles.photoLabel}>Item Picture</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/scanner?mode=item_photo')}
                style={[
                  styles.photoSlot,
                  isPhotoCaptured && {
                    backgroundColor: 'rgba(40, 200, 64, 0.08)',
                    borderColor: 'rgba(40, 200, 64, 0.3)',
                  },
                ]}
              >
                {isPhotoCaptured ? (
                  <>
                    <CheckCircle2 size={24} color="#28C840" strokeWidth={2} />
                    <Text style={[styles.photoTag, { color: '#28C840' }]}>
                      Photo Attached
                    </Text>
                  </>
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
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/scanner?mode=receipt')}
                style={styles.photoSlot}
              >
                <FileCheck size={22} color="rgba(10, 10, 10, 0.6)" strokeWidth={2} />
                <Text style={styles.photoTag}>Take invoice picture</Text>
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
              <Text style={styles.fieldLabel}>Item Name & Model</Text>
              <View style={styles.inputBox}>
                <TextInput
                  value={itemName}
                  onChangeText={setItemName}
                  placeholder="e.g. Makita 18V Brushless Angle Grinder"
                  placeholderTextColor={WIGO_COLORS.textPlaceholder}
                  style={styles.inputTextGeist}
                />
              </View>
            </View>

            {/* Category and SKU Row */}
            <View style={styles.fieldRow}>
              <View style={styles.flexField}>
                <Text style={styles.fieldLabel}>Category</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleCategoryCycle}
                  style={styles.inputBoxBetween}
                >
                  <Text style={styles.inputTextGeist}>{category}</Text>
                  <ChevronDown size={14} color="#7D8187" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              <View style={styles.flexField}>
                <Text style={styles.fieldLabel}>Auto SKU</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={sku}
                    onChangeText={setSku}
                    placeholder="e.g. MKT-18V-GRD"
                    placeholderTextColor={WIGO_COLORS.textPlaceholder}
                    style={styles.inputTextOnest}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Section 2 - Invoice & Purchase Data */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleCol}>
                <Text style={styles.sectionTitleSmall}>Invoice & Purchase Data</Text>
                <Text style={styles.sectionSubtitle}>Information about when it purchase</Text>
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
              <View style={styles.flexField}>
                <Text style={styles.fieldLabel}>Purchase Date</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={purchaseDate}
                    onChangeText={setPurchaseDate}
                    placeholder="18 Oct 2026"
                    placeholderTextColor={WIGO_COLORS.textPlaceholder}
                    style={styles.inputTextOnest}
                  />
                </View>
              </View>

              <View style={styles.flexField}>
                <Text style={styles.fieldLabel}>Store / Supplier</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={supplier}
                    onChangeText={setSupplier}
                    placeholder="Mitra10 Hardware"
                    placeholderTextColor={WIGO_COLORS.textPlaceholder}
                    style={styles.inputTextGeist}
                  />
                </View>
              </View>
            </View>

            {/* Price Row */}
            <View style={styles.fieldRow}>
              <View style={styles.flexField}>
                <Text style={styles.fieldLabel}>Purchase Cost (Total)</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={purchaseCost}
                    onChangeText={setPurchaseCost}
                    placeholder="Rp 2.450.000"
                    placeholderTextColor={WIGO_COLORS.textPlaceholder}
                    style={styles.inputTextOnest}
                  />
                </View>
              </View>

              <View style={styles.flexField}>
                <Text style={styles.fieldLabel}>Unit Net Cost</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={unitCost}
                    onChangeText={setUnitCost}
                    placeholder="Rp 490.000"
                    placeholderTextColor={WIGO_COLORS.textPlaceholder}
                    style={styles.inputTextOnest}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Section 3 - Stock & Rental Rate */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleCol}>
                <Text style={styles.sectionTitleSmall}>Stock & Rental Rate</Text>
                <Text style={styles.sectionSubtitle}>Set item quantity & rental rate</Text>
              </View>
            </View>

            {/* Qty and Rate Row */}
            <View style={styles.fieldRow}>
              {/* Stepper Quantity */}
              <View style={styles.flexField}>
                <Text style={styles.fieldLabel}>Total Quantity (Units)</Text>
                <View style={styles.stepperBox}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleDecrement}
                    style={styles.stepperBtn}
                    accessibilityLabel="Decrease quantity"
                  >
                    <Minus size={12} color="#ff5e00" strokeWidth={2.4} />
                  </TouchableOpacity>

                  <Text style={styles.stepperValue}>{quantity}</Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleIncrement}
                    style={styles.stepperBtn}
                    accessibilityLabel="Increase quantity"
                  >
                    <Plus size={12} color="#ff5e00" strokeWidth={2.4} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Lending Rate */}
              <View style={styles.flexField}>
                <Text style={styles.fieldLabel}>Lending Rate / Day</Text>
                <View style={[styles.inputBox, { height: 40 }]}>
                  <TextInput
                    value={lendingRate}
                    onChangeText={setLendingRate}
                    placeholder="Rp 85.000"
                    placeholderTextColor={WIGO_COLORS.textPlaceholder}
                    style={styles.inputTextOnest}
                  />
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

        {/* Bottom Action Bar */}
        <View
          style={[
            styles.bottomActionBar,
            {
              paddingBottom: Platform.OS === 'web' ? 16 : Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* Save & Print CTA */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleSaveAndPrint}
            style={styles.savePrintWrapper}
          >
            <LinearGradient
              colors={['#FF6E1A', '#ED5000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.savePrintGradient}
            >
              <Printer size={18} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.savePrintText}>Save & Print Label</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Save Draft Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSaveDraft}
            style={styles.saveDraftBtn}
          >
            <Text style={styles.saveDraftText}>Save Item Without Printing</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    display: 'flex',
    flexDirection: 'column',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
      },
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
    fontFamily: 'Geist_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0A',
    lineHeight: 20,
    letterSpacing: -0.2,
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
    width: '100%',
  },
  photoLabel: {
    fontFamily: 'Geist_400Regular',
    fontSize: 11,
    fontWeight: '400',
    color: '#0A0A0A',
  },
  photoSlot: {
    height: 110,
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoTag: {
    fontFamily: 'Onest_500Medium',
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(10, 10, 10, 0.6)',
  },

  /* Section Cards */
  sectionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    padding: 12,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  sectionTitleCol: {
    flexDirection: 'column',
    gap: 0,
  },
  sectionTitle: {
    fontFamily: 'Onest_400Regular',
    fontSize: 16,
    fontWeight: '400',
    color: '#0A0A0A',
  },
  sectionTitleSmall: {
    fontFamily: 'Onest_400Regular',
    fontSize: 14,
    fontWeight: '400',
    color: '#0A0A0A',
  },
  sectionSubtitle: {
    fontFamily: 'Onest_400Regular',
    fontSize: 11,
    fontWeight: '400',
    color: '#7D8187',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 9999,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  aiBadgeText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 11,
    fontWeight: '500',
    color: '#ff5e00',
  },

  /* Form Fields */
  fieldGroup: {
    width: '100%',
    flexDirection: 'column',
    gap: 4,
  },
  fieldLabel: {
    fontFamily: 'Geist_400Regular',
    fontSize: 11,
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
  inputBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  inputBoxBetween: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 10, 10, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputTextGeist: {
    fontFamily: 'Geist_400Regular',
    fontSize: 13,
    fontWeight: '400',
    color: '#0A0A0A',
    lineHeight: 18,
    padding: 0,
    margin: 0,
  },
  inputTextOnest: {
    fontFamily: 'Onest_500Medium',
    fontSize: 13,
    fontWeight: '500',
    color: '#0A0A0A',
    lineHeight: 18,
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
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 18,
    fontWeight: '600',
    color: '#0A0A0A',
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
    gap: 2,
  },
  noticeTitle: {
    fontFamily: 'Geist_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: '#0A0A0A',
  },
  noticeSub: {
    fontFamily: 'Geist_400Regular',
    fontSize: 10,
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
    fontFamily: 'Geist_600SemiBold',
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
    fontFamily: 'Geist_500Medium',
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(10, 10, 10, 0.6)',
    lineHeight: 16,
  },
});
