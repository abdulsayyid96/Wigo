import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { router } from 'expo-router';
import {
  EquipmentItem,
  WIGO_COLORS,
} from '@/constants/wigo-theme';
import { useWigoItems } from '@/constants/wigo-store';

import { WigoStatusBar } from '@/components/wigo/WigoStatusBar';
import { WigoHeader } from '@/components/wigo/WigoHeader';
import { WigoActionRow } from '@/components/wigo/WigoActionRow';
import { WigoMetricCard } from '@/components/wigo/WigoMetricCard';
import {
  WigoSearchAndFilter,
  FilterCategory,
} from '@/components/wigo/WigoSearchAndFilter';
import { WigoCatalogHeader } from '@/components/wigo/WigoCatalogHeader';
import { WigoItemCard } from '@/components/wigo/WigoItemCard';
import {
  WigoFloatingCapsuleTabBar,
  WigoTab,
} from '@/components/wigo/WigoFloatingCapsuleTabBar';
import { WigoQrModal } from '@/components/wigo/WigoQrModal';
import { WigoScanModal } from '@/components/wigo/WigoScanModal';
import { WigoAddItemModal } from '@/components/wigo/WigoAddItemModal';

export default function WigoDashboardScreen() {
  const [items, addItem] = useWigoItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');
  const [sortOrder, setSortOrder] = useState<'index' | 'name' | 'cost'>('index');
  const [activeTab, setActiveTab] = useState<WigoTab>('catalog');

  // Modals state
  const [selectedQrItem, setSelectedQrItem] = useState<EquipmentItem | null>(null);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  // Dynamic filter counts
  const filterCounts = useMemo(() => {
    return {
      all: items.length,
      available: items.filter((i) => i.availableCount > 0).length,
      rented: items.filter((i) => i.outCount > 0).length,
      service: items.filter((i) => (i.serviceCount ?? 0) > 0).length,
    };
  }, [items]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Category filter
        if (selectedFilter === 'available' && item.availableCount <= 0) return false;
        if (selectedFilter === 'rented' && item.outCount <= 0) return false;
        if (selectedFilter === 'service' && (!item.serviceCount || item.serviceCount <= 0))
          return false;

        // Search query filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(query);
          const matchSku = item.sku.toLowerCase().includes(query);
          return matchName || matchSku;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'name') return a.name.localeCompare(b.name);
        if (sortOrder === 'cost') {
          const costA = parseFloat(a.cost.replace(/[^0-9.]/g, '')) || 0;
          const costB = parseFloat(b.cost.replace(/[^0-9.]/g, '')) || 0;
          return costB - costA;
        }
        return 0; // 'index' default
      });
  }, [items, selectedFilter, searchQuery, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => {
      if (prev === 'index') return 'name';
      if (prev === 'name') return 'cost';
      return 'index';
    });
  };

  const handleAddItem = (newItem: EquipmentItem) => {
    addItem(newItem);
  };

  const handleScanSuccess = (action: 'in' | 'out', itemName: string) => {
    Alert.alert(
      action === 'out' ? 'Checked Out' : 'Checked In',
      `Successfully processed ${itemName} for rental tracking.`
    );
  };

  const handlePrinterPress = () => {
    Alert.alert(
      'Label Printer Status',
      'Phomemo M110 Thermal Label Printer is connected via Bluetooth.\nBattery: 94% | Roll: 40x30mm Labels'
    );
  };

  const handleNotificationsPress = () => {
    Alert.alert('Notifications', 'No pending maintenance or late returns.');
  };

  const sortLabel =
    sortOrder === 'index'
      ? 'index order'
      : sortOrder === 'name'
      ? 'alphabetical'
      : 'highest value';

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.outerCanvas}>
      {/* Phone Mockup Frame Container */}
      <View
        style={[
          styles.phoneFrame,
          {
            paddingTop: Platform.OS === 'web' ? 0 : insets.top,
          },
        ]}
      >
        {/* Mock Status Bar only for Web Desktop Preview */}
        {Platform.OS === 'web' && <WigoStatusBar />}

        {/* Scrollable Main Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 80 + (insets.bottom || 16) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            {/* 1. App Header */}
            <WigoHeader
              onPrinterPress={handlePrinterPress}
              onNotificationsPress={handleNotificationsPress}
            />

            {/* 2. Quick Action Row */}
            <WigoActionRow
              onScanPress={() => router.push('/scanner?mode=barcode')}
              onAddItemPress={() => router.push('/add-item')}
            />

            {/* 3. Metric Asset Value Card */}
            <WigoMetricCard />

            {/* 4. Search and Filter Chips */}
            <WigoSearchAndFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedFilter={selectedFilter}
              onSelectFilter={setSelectedFilter}
              filterCounts={filterCounts}
            />

            {/* 5. Section Header */}
            <WigoCatalogHeader
              title="Catalog"
              sortLabel={sortLabel}
              onSortPress={toggleSortOrder}
            />

            {/* 6. Item List */}
            <View style={styles.itemList}>
              {filteredItems.map((item) => (
                <WigoItemCard
                  key={item.id}
                  item={item}
                  onPress={() => setSelectedQrItem(item)}
                  onQrPress={() => setSelectedQrItem(item)}
                  onMovementPress={() => setIsScanOpen(true)}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Bottom MenuBar / Floating Capsule Tab Bar */}
        <View
          style={[
            styles.floatingBarWrapper,
            { bottom: Platform.OS === 'web' ? 20 : Math.max(insets.bottom, 12) },
          ]}
        >
          <WigoFloatingCapsuleTabBar
            activeTab={activeTab}
            onTabPress={(tab) => {
              setActiveTab(tab);
              if (tab === 'scan') router.push('/scanner?mode=barcode');
            }}
            onScanPress={() => router.push('/scanner?mode=barcode')}
          />
        </View>
      </View>

      {/* QR / Label Print Modal */}
      <WigoQrModal
        visible={!!selectedQrItem}
        item={selectedQrItem}
        onClose={() => setSelectedQrItem(null)}
      />

      {/* Scan In / Out Modal */}
      <WigoScanModal
        visible={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Add Item Modal */}
      <WigoAddItemModal
        visible={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        onAddItem={handleAddItem}
      />
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
    backgroundColor: WIGO_COLORS.background,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90, // Leave room for floating capsule tab bar
  },
  contentWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 16,
    width: '100%',
  },
  itemList: {
    gap: 8,
    width: '100%',
  },
  floatingBarWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
});
