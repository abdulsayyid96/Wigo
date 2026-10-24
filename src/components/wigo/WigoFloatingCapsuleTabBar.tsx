import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  LayoutGrid,
  ClipboardList,
  ScanLine,
  History,
  SlidersHorizontal,
} from 'lucide-react-native';
import { WIGO_COLORS } from '@/constants/wigo-theme';

export type WigoTab = 'catalog' | 'rentals' | 'scan' | 'logs' | 'config';

interface WigoFloatingCapsuleTabBarProps {
  activeTab: WigoTab;
  onTabPress: (tab: WigoTab) => void;
  onScanPress?: () => void;
}

export function WigoFloatingCapsuleTabBar({
  activeTab,
  onTabPress,
  onScanPress,
}: WigoFloatingCapsuleTabBarProps) {
  return (
    <View style={styles.menuBarContainer}>
      <View style={styles.floatingCapsule}>
        {/* Tab 1: Catalog */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onTabPress('catalog')}
          style={styles.tabItem}
        >
          <LayoutGrid
            size={18}
            color={activeTab === 'catalog' ? WIGO_COLORS.textDark : WIGO_COLORS.textSubdued}
            strokeWidth={2.2}
          />
        </TouchableOpacity>

        {/* Tab 2: Rentals */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onTabPress('rentals')}
          style={styles.tabItem}
        >
          <ClipboardList
            size={18}
            color={activeTab === 'rentals' ? WIGO_COLORS.textDark : WIGO_COLORS.textSubdued}
            strokeWidth={2}
          />
        </TouchableOpacity>

        {/* Tab 3: Center Elevated Scan Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onScanPress ?? (() => onTabPress('scan'))}
          style={styles.scanButtonWrapper}
        >
          <LinearGradient
            colors={[WIGO_COLORS.orangeGradientStart, WIGO_COLORS.orangeGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.scanButton}
          >
            <ScanLine size={20} color={WIGO_COLORS.textWhite} strokeWidth={2.4} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Tab 4: Logs */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onTabPress('logs')}
          style={styles.tabItem}
        >
          <History
            size={18}
            color={activeTab === 'logs' ? WIGO_COLORS.textDark : WIGO_COLORS.textSubdued}
            strokeWidth={2}
          />
        </TouchableOpacity>

        {/* Tab 5: Config */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onTabPress('config')}
          style={styles.tabItem}
        >
          <SlidersHorizontal
            size={18}
            color={activeTab === 'config' ? WIGO_COLORS.textDark : WIGO_COLORS.textSubdued}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuBarContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 361,
    height: 60,
    backgroundColor: WIGO_COLORS.cardBackground,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.borderSubtle,
    ...Platform.select({
      ios: {
        shadowColor: '#0A0A0A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 16px rgba(10, 10, 10, 0.08)',
      },
    }),
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonWrapper: {
    width: 120,
    height: 44,
    borderRadius: 9999,
  },
  scanButton: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.orangeOutline,
    ...Platform.select({
      ios: {
        shadowColor: '#ED5000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: 'inset 0 1.5px 1px rgba(255, 255, 255, 0.5), inset 0 -1.5px 1px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
});
