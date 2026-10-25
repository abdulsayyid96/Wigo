export interface EquipmentItem {
  id: string;
  name: string;
  sku: string;
  cost: string;
  availableCount: number;
  outCount: number;
  serviceCount?: number;
  category: 'all' | 'available' | 'rented' | 'service';
  imageUri?: string;
  categoryName?: string;
  serialNumber?: string;
  includedInKit?: string;
  physicalCondition?: string;
  purchaseInvoice?: string;
  purchaseDate?: string;
  purchaseCostTotal?: string;
  totalQuantity?: number;
  lendingRate?: string;
  supplier?: string;
  invoiceImageUri?: string;
  warrantyPeriod?: string;
  earnings?: {
    lifetime: string;
    ytd: string;
    monthly: string;
  };
  galleryImages?: string[];
}

export const WIGO_METRICS = {
  totalValueRp: '5.359.672.000',
  available: 96,
  totalCapacity: 234,
  vendor: 15,
  service: 3,
  printerModel: 'M110',
  printerOnline: true,
};

export const WIGO_ITEMS: EquipmentItem[] = [
  {
    id: '1',
    name: 'Makita 18V Brushless Angle Grinder',
    sku: 'MKT-18V-GRD',
    cost: 'Rp 85.000',
    availableCount: 3,
    outCount: 1,
    serviceCount: 1,
    category: 'available',
    categoryName: 'Power Tool',
    serialNumber: 'SN-8921-X992',
    includedInKit: '2x 5.0Ah Li-ion, Charger, Case',
    physicalCondition: 'Grade A (Excellent)',
    purchaseInvoice: 'INV/2026/10/1889',
    purchaseDate: '18 Oct 2026',
    purchaseCostTotal: 'Rp 2.450.000',
    totalQuantity: 5,
    lendingRate: 'Rp 85.000',
    supplier: 'Mitra10 Superstore',
    warrantyPeriod: '24 Months Official Warranty',
    earnings: {
      lifetime: 'Rp 114.750.000',
      ytd: 'Rp 38.250.000',
      monthly: 'Rp 6.375.000',
    },
  },
  {
    id: '2',
    name: 'DeWalt 20V Max Hammer Drill',
    sku: 'DW-887X',
    cost: '$280.00',
    availableCount: 8,
    outCount: 2,
    serviceCount: 0,
    category: 'available',
    categoryName: 'Power Tool',
    serialNumber: 'SN-DW-4410',
    includedInKit: '2x 20V Battery, Rapid Charger, Heavy Duty Bag',
    physicalCondition: 'Grade A (Like New)',
    purchaseInvoice: 'INV/2026/08/0412',
    purchaseDate: '12 Aug 2026',
    purchaseCostTotal: 'Rp 4.200.000',
    totalQuantity: 10,
    lendingRate: 'Rp 95.000',
    earnings: {
      lifetime: 'Rp 84.500.000',
      ytd: 'Rp 29.100.000',
      monthly: 'Rp 5.200.000',
    },
  },
  {
    id: '3',
    name: 'Honda EU2200i Generator',
    sku: 'HN-2200',
    cost: '$1,150.00',
    availableCount: 3,
    outCount: 1,
    serviceCount: 1,
    category: 'available',
    categoryName: 'Generator',
    serialNumber: 'SN-HN-9901',
    includedInKit: 'Oil funnel, spark plug wrench, 12V DC cables',
    physicalCondition: 'Grade B (Good)',
    purchaseInvoice: 'INV/2026/05/1190',
    purchaseDate: '04 May 2026',
    purchaseCostTotal: 'Rp 17.250.000',
    totalQuantity: 5,
    lendingRate: 'Rp 250.000',
    earnings: {
      lifetime: 'Rp 195.000.000',
      ytd: 'Rp 72.500.000',
      monthly: 'Rp 14.250.000',
    },
  },
  {
    id: '4',
    name: 'Sony FX3 Cinema Camera Kit',
    sku: 'SN-FX3',
    cost: '$3,899.00',
    availableCount: 1,
    outCount: 3,
    serviceCount: 0,
    category: 'rented',
    categoryName: 'Audio / Visual',
    serialNumber: 'SN-SN-8711',
    includedInKit: 'XLR Top Handle, 3x NP-FZ100, CFexpress Type A 160GB, Pelican 1510',
    physicalCondition: 'Grade A (Excellent)',
    purchaseInvoice: 'INV/2026/02/0081',
    purchaseDate: '15 Feb 2026',
    purchaseCostTotal: 'Rp 58.500.000',
    totalQuantity: 4,
    lendingRate: 'Rp 850.000',
    earnings: {
      lifetime: 'Rp 340.000.000',
      ytd: 'Rp 142.000.000',
      monthly: 'Rp 28.500.000',
    },
  },
  {
    id: '5',
    name: 'Bose S1 Pro+ PA System',
    sku: 'BO-S1P',
    cost: '$699.00',
    availableCount: 2,
    outCount: 1,
    serviceCount: 2,
    category: 'service',
    categoryName: 'Audio / Visual',
    serialNumber: 'SN-BO-3329',
    includedInKit: 'AC Power Cord, Wireless RF Transmitter, Slip Cover',
    physicalCondition: 'Grade B+ (Serviced)',
    purchaseInvoice: 'INV/2026/06/0771',
    purchaseDate: '22 Jun 2026',
    purchaseCostTotal: 'Rp 10.450.000',
    totalQuantity: 5,
    lendingRate: 'Rp 180.000',
    earnings: {
      lifetime: 'Rp 92.400.000',
      ytd: 'Rp 36.800.000',
      monthly: 'Rp 7.100.000',
    },
  },
];

export const WIGO_COLORS = {
  // Surfaces & Backgrounds
  background: '#F7F7F7',
  cardBackground: '#FFFFFF',
  thumbnailBackground: '#F7F7F7',
  pillBackground: '#F7F7F7',

  // Dark obsidian palette
  primaryDark: '#0A0A0A',
  darkGradientStart: 'rgba(10, 10, 10, 0.60)', // #0A0A0A99
  darkGradientEnd: '#0A0A0A',

  // Orange brand gradient
  orangeGradientStart: '#FF6E1A',
  orangeGradientEnd: '#ED5000',
  orangeOutline: 'rgba(255, 99, 8, 0.10)', // #FF63081A

  // Status & Indicators
  statusGreen: '#28C840',
  statusOrange: '#FF5E00',
  statusYellow: '#FEBC2E',

  // Borders & Dividers
  borderSubtle: 'rgba(10, 10, 10, 0.08)', // #0A0A0A14
  dividerSubtle: 'rgba(10, 10, 10, 0.04)', // #0A0A0A0A
  dividerCardDark: 'rgba(255, 255, 255, 0.15)', // #FFFFFF26

  // Text & Icons
  textDark: '#0A0A0A',
  textSubdued: '#7D8187',
  textPlaceholder: 'rgba(10, 10, 10, 0.25)', // #0A0A0A40
  textWhite: '#FFFFFF',
  textWhiteSubdued: 'rgba(255, 255, 255, 0.50)', // #FFFFFF80
  iconDarkSubdued: 'rgba(10, 10, 10, 0.60)', // #0A0A0A99
};
