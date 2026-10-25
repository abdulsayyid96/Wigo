import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EquipmentItem, WIGO_COLORS, WIGO_METRICS } from '@/constants/wigo-theme';
import { parseIdrNumber } from '@/utils/currency';

interface WigoMetricCardProps {
  items?: EquipmentItem[];
}

export function WigoMetricCard({ items }: WigoMetricCardProps) {
  // Calculate dynamically if items are provided, otherwise fallback to default
  const metrics = React.useMemo(() => {
    if (!items) return WIGO_METRICS;
    if (items.length === 0) {
      return {
        totalValueRp: '0',
        available: 0,
        totalCapacity: 0,
        vendor: 0,
        service: 0,
      };
    }

    let totalVal = 0;
    let available = 0;
    let out = 0;
    let service = 0;
    const vendors = new Set<string>();

    items.forEach((item) => {
      const val = parseIdrNumber(item.purchaseCostTotal || item.cost);
      totalVal += val;
      available += item.availableCount || 0;
      out += item.outCount || 0;
      service += item.serviceCount || 0;
      if (item.categoryName) vendors.add(item.categoryName);
    });

    const formattedVal = totalVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return {
      totalValueRp: formattedVal || '0',
      available,
      totalCapacity: available + out + service,
      vendor: vendors.size,
      service,
    };
  }, [items]);

  return (
    <LinearGradient
      colors={['#1c1c1e', '#0A0A0A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.card}
    >
      {/* Top Value Asset Section */}
      <View style={styles.topSection}>
        <Text style={styles.metricLabel}>Total Value Asset</Text>
        <View style={styles.valueRow}>
          <Text style={styles.currencyPrefix}>Rp</Text>
          <Text style={styles.currencyAmount}>{metrics.totalValueRp}</Text>
        </View>
      </View>

      {/* Frame 1: Sub-metrics Row */}
      <View style={styles.subMetricsRow}>
        {/* Available Metric */}
        <View style={styles.metricColumn}>
          <View style={styles.columnHeader}>
            <Text style={styles.columnLabel}>Available</Text>
            <View style={[styles.statusDot, { backgroundColor: WIGO_COLORS.statusGreen }]} />
          </View>
          <View style={styles.columnValueRow}>
            <Text style={styles.primaryValue}>{metrics.available}</Text>
            <Text style={styles.secondaryValue}>/ {metrics.totalCapacity}</Text>
          </View>
        </View>

        {/* Vendor Metric */}
        <View style={styles.metricColumn}>
          <View style={styles.columnHeader}>
            <Text style={styles.columnLabel}>Categories</Text>
            <View style={[styles.statusDot, { backgroundColor: WIGO_COLORS.statusOrange }]} />
          </View>
          <View style={styles.columnValueRow}>
            <Text style={styles.primaryValue}>{metrics.vendor}</Text>
          </View>
        </View>

        {/* Service Metric */}
        <View style={styles.metricColumn}>
          <View style={styles.columnHeader}>
            <Text style={styles.columnLabel}>Service</Text>
            <View style={[styles.statusDot, { backgroundColor: WIGO_COLORS.statusYellow }]} />
          </View>
          <View style={styles.columnValueRow}>
            <Text style={styles.primaryValue}>{metrics.service}</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 18,
    gap: 16,
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.borderSubtle,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: 'inset 0 1.5px 3px rgba(255, 255, 255, 0.3), inset 0 -3px 5px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  topSection: {
    gap: 6,
    width: '100%',
  },
  metricLabel: {
    fontFamily: 'Geist_400Regular',
    fontSize: 12,
    fontWeight: '500',
    color: WIGO_COLORS.textWhite,
    letterSpacing: 0.5,
    lineHeight: 14,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  currencyPrefix: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: WIGO_COLORS.textWhite,
    letterSpacing: -0.2,
    lineHeight: 20,
    marginTop: 3,
  },
  currencyAmount: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 32,
    fontWeight: '600',
    color: WIGO_COLORS.textWhite,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  subMetricsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: WIGO_COLORS.dividerCardDark,
    paddingTop: 12,
  },
  metricColumn: {
    flex: 1,
    gap: 6,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  columnLabel: {
    fontFamily: 'Geist_400Regular',
    fontSize: 12,
    fontWeight: '400',
    color: WIGO_COLORS.textWhite,
    lineHeight: 15,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  columnValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  primaryValue: {
    fontFamily: 'Onest_600SemiBold',
    fontSize: 24,
    fontWeight: '600',
    color: WIGO_COLORS.textWhite,
    letterSpacing: -0.2,
    lineHeight: 21,
  },
  secondaryValue: {
    fontFamily: 'Onest_400Regular',
    fontSize: 16,
    fontWeight: '400',
    color: WIGO_COLORS.textWhiteSubdued,
    lineHeight: 13,
  },
});
