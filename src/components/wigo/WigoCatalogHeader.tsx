import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ArrowUpRight } from 'lucide-react-native';
import { WIGO_COLORS } from '@/constants/wigo-theme';

interface WigoCatalogHeaderProps {
  title?: string;
  sortLabel?: string;
  onSortPress?: () => void;
}

export function WigoCatalogHeader({
  title = 'Catalog',
  sortLabel = 'index order',
  onSortPress,
}: WigoCatalogHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onSortPress}
        style={styles.sortTag}
      >
        <ArrowUpRight size={12} color={WIGO_COLORS.textSubdued} strokeWidth={2} />
        <Text style={styles.sortText}>{sortLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 2,
  },
  sectionTitle: {
    fontFamily: 'Geist_500Medium',
    fontSize: 16,
    fontWeight: '500',
    color: WIGO_COLORS.textDark,
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  sortTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  sortText: {
    fontFamily: 'Onest_400Regular',
    fontSize: 11,
    fontWeight: '400',
    color: WIGO_COLORS.textSubdued,
    lineHeight: 14,
  },
});
