import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Printer, Bell } from 'lucide-react-native';
import { WIGO_COLORS, WIGO_METRICS } from '@/constants/wigo-theme';

interface WigoHeaderProps {
  onPrinterPress?: () => void;
  onNotificationsPress?: () => void;
}

export function WigoHeader({ onPrinterPress, onNotificationsPress }: WigoHeaderProps) {
  return (
    <View style={styles.header}>
      {/* Brand Box */}
      <View style={styles.brandBox}>
        <Text style={styles.brandTitle}>wigo</Text>
      </View>

      {/* Header Actions */}
      <View style={styles.headerActions}>
        {/* Printer Indicator Pill */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPrinterPress}
          style={styles.printerIndicator}
        >
          <View style={styles.statusDot} />
          <Printer size={15} color={WIGO_COLORS.iconDarkSubdued} strokeWidth={2} />
          <Text style={styles.printerText}>{WIGO_METRICS.printerModel}</Text>
        </TouchableOpacity>

        {/* Bell Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onNotificationsPress}
          style={styles.bellButton}
        >
          <Bell size={15} color={WIGO_COLORS.iconDarkSubdued} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 4,
  },
  brandBox: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontFamily: 'Onest_700Bold',
    fontSize: 32,
    fontWeight: '700',
    color: WIGO_COLORS.textDark,
    letterSpacing: -2,
    lineHeight: 42,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  printerIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingRight: 10,
    paddingLeft: 8,
    borderRadius: 9999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: WIGO_COLORS.statusGreen,
  },
  printerText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 11,
    fontWeight: '500',
    color: WIGO_COLORS.iconDarkSubdued,
    lineHeight: 14,
  },
  bellButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: WIGO_COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.borderSubtle,
  },
});
