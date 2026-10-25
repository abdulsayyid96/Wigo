import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Search } from 'lucide-react-native';
import { WIGO_COLORS } from '@/constants/wigo-theme';

export type FilterCategory = 'all' | 'available' | 'rented' | 'service';

interface FilterChipData {
  id: FilterCategory;
  label: string;
  count: number;
}

interface WigoSearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: FilterCategory;
  onSelectFilter: (filter: FilterCategory) => void;
  filterCounts?: {
    all: number;
    available: number;
    rented: number;
    service: number;
  };
}

export function WigoSearchAndFilter({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onSelectFilter,
  filterCounts = { all: 12, available: 8, rented: 3, service: 1 },
}: WigoSearchAndFilterProps) {
  const chips: FilterChipData[] = [
    { id: 'all', label: 'All', count: filterCounts.all },
    { id: 'available', label: 'Available', count: filterCounts.available },
    { id: 'rented', label: 'Rented', count: filterCounts.rented },
    { id: 'service', label: 'Service', count: filterCounts.service },
  ];

  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Search size={15} color={WIGO_COLORS.textSubdued} strokeWidth={2} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search equipment, sku, or batch..."
          placeholderTextColor={WIGO_COLORS.textPlaceholder}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter Chips Row */}
      {/* <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsRow}
      >
        {chips.map((chip) => {
          const isSelected = selectedFilter === chip.id;
          return (
            <TouchableOpacity
              key={chip.id}
              activeOpacity={0.8}
              onPress={() => onSelectFilter(chip.id)}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
              ]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  isSelected ? styles.chipLabelSelected : styles.chipLabelUnselected,
                ]}
              >
                {chip.label}
              </Text>
              <Text
                style={[
                  styles.chipCount,
                  isSelected ? styles.chipCountSelected : styles.chipCountUnselected,
                ]}
              >
                {chip.count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: WIGO_COLORS.cardBackground,
    borderRadius: 9999,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.borderSubtle,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Geist_400Regular',
    fontSize: 13,
    color: WIGO_COLORS.textDark,
    paddingVertical: 0,
    lineHeight: 18,
  },
  filterChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 9999,
    borderWidth: 0.5,
  },
  chipSelected: {
    backgroundColor: WIGO_COLORS.primaryDark,
    borderColor: WIGO_COLORS.primaryDark,
  },
  chipUnselected: {
    backgroundColor: WIGO_COLORS.cardBackground,
    borderColor: WIGO_COLORS.borderSubtle,
  },
  chipLabel: {
    fontFamily: 'Geist_500Medium',
    fontSize: 11,
    lineHeight: 14,
  },
  chipLabelSelected: {
    color: WIGO_COLORS.textWhite,
    fontWeight: '500',
  },
  chipLabelUnselected: {
    color: WIGO_COLORS.textPlaceholder,
    fontWeight: '400',
  },
  chipCount: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
  },
  chipCountSelected: {
    color: WIGO_COLORS.textWhite,
    fontWeight: '600',
  },
  chipCountUnselected: {
    color: WIGO_COLORS.textPlaceholder,
    fontWeight: '400',
  },
});
