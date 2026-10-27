import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { Signal, Wifi, Battery } from 'lucide-react-native';
import { WIGO_COLORS } from '@/constants/wigo-theme';

export function WigoStatusBar({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const isLight = variant === 'light';
  const color = isLight ? '#FFFFFF' : WIGO_COLORS.textDark;

  return (
    <View style={styles.statusBar}>
      <Text style={[styles.timeText, { color }]}>9:41</Text>
      <View style={styles.statusIcons}>
        <Signal size={15} color={color} strokeWidth={2.2} />
        <Wifi size={15} color={color} strokeWidth={2.2} />
        <Battery size={18} color={color} strokeWidth={2.2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBar: {
    height: 48,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  timeText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 14,
    fontWeight: '500',
    color: WIGO_COLORS.textDark,
    lineHeight: 18,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
