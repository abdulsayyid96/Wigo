import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScanLine, Plus } from 'lucide-react-native';
import { WIGO_COLORS } from '@/constants/wigo-theme';

interface WigoActionRowProps {
  onScanPress?: () => void;
  onAddItemPress?: () => void;
}

export function WigoActionRow({ onScanPress, onAddItemPress }: WigoActionRowProps) {
  return (
    <View style={styles.actionRow}>
      {/* Scan Button with Gradient */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onScanPress}
        style={styles.buttonWrapper}
      >
        <LinearGradient
          colors={[WIGO_COLORS.orangeGradientStart, WIGO_COLORS.orangeGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.scanButtonGradient}
        >
          <ScanLine size={16} color={WIGO_COLORS.textWhite} strokeWidth={2.2} />
          <Text style={styles.scanButtonText}>Scan In / Out</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Item Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onAddItemPress}
        style={styles.buttonWrapper}
      >
        <View style={styles.addItemButton}>
          <Plus size={16} color={WIGO_COLORS.textDark} strokeWidth={2.2} />
          <Text style={styles.addItemText}>Add Item</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  buttonWrapper: {
    flex: 1,
    borderRadius: 9999,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.orangeOutline,
    ...Platform.select({
      ios: {
        shadowColor: '#ED5000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: 'inset 0 1.5px 1px rgba(255, 255, 255, 0.4), inset 0 -1.5px 1px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  scanButtonText: {
    fontFamily: 'Geist_500Medium',
    fontSize: 14,
    fontWeight: '500',
    color: WIGO_COLORS.textWhite,
    lineHeight: 18,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: WIGO_COLORS.cardBackground,
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.borderSubtle,
  },
  addItemText: {
    fontFamily: 'Geist_500Medium',
    fontSize: 14,
    fontWeight: '500',
    color: WIGO_COLORS.textDark,
    lineHeight: 18,
  },
});
