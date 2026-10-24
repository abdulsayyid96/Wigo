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
    name: 'DeWalt 20V Max Hammer Drill',
    sku: 'DW-887X',
    cost: '$280.00',
    availableCount: 8,
    outCount: 2,
    serviceCount: 0,
    category: 'available',
  },
  {
    id: '2',
    name: 'Honda EU2200i Generator',
    sku: 'HN-2200',
    cost: '$1,150.00',
    availableCount: 3,
    outCount: 1,
    serviceCount: 1,
    category: 'available',
  },
  {
    id: '3',
    name: 'Sony FX3 Cinema Camera Kit',
    sku: 'SN-FX3',
    cost: '$3,899.00',
    availableCount: 1,
    outCount: 3,
    serviceCount: 0,
    category: 'rented',
  },
  {
    id: '4',
    name: 'Bose S1 Pro+ PA System',
    sku: 'BO-S1P',
    cost: '$699.00',
    availableCount: 2,
    outCount: 1,
    serviceCount: 2,
    category: 'service',
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
