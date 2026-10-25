import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import {
  Image as ImageIcon,
  QrCode,
  ArrowDownUp,
  CircleCheck,
  ArrowUpDown,
  Wrench,
} from 'lucide-react-native';
import { EquipmentItem, WIGO_COLORS } from '@/constants/wigo-theme';

interface WigoItemCardProps {
  item: EquipmentItem;
  onPress?: () => void;
  onQrPress?: () => void;
}

export function WigoItemCard({
  item,
  onPress,
  onQrPress,
}: WigoItemCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.card}
    >
      {/* Card Top */}
      <View style={styles.cardTop}>
        {/* Thumbnail */}
        <View style={styles.thumbnail}>
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.thumbnailImage} />
          ) : (
            <ImageIcon size={20} color={WIGO_COLORS.iconDarkSubdued} strokeWidth={1.75} />
          )}
        </View>

        {/* Details */}
        <View style={styles.details}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.skuText}>{item.sku}</Text>
            <Text style={styles.costText}>· {item.cost}</Text>
          </View>
        </View>

        {/* Action Pills */}
        <View style={styles.actionPills}>
          {/* QR Pill Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onQrPress}
            style={styles.actionPillButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <QrCode size={15} color={WIGO_COLORS.textDark} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Frame 3: Status / Quantity Badges */}
      <View style={styles.frame3}>
        <View style={styles.pillsRow}>
          {/* Available Tag */}
          <View style={styles.availTag}>
            <CircleCheck size={10} color={WIGO_COLORS.statusGreen} strokeWidth={2.2} />
            <Text style={styles.availText}>{item.availableCount}</Text>
          </View>

          {/* Out Tag */}
          <View style={styles.outTag}>
            <ArrowUpDown size={10} color={WIGO_COLORS.statusOrange} strokeWidth={2.2} />
            <Text style={styles.outText}>{item.outCount}</Text>
          </View>

          {/* Service Tag (rendered if serviceCount exists and > 0) */}
          {item.serviceCount !== undefined && item.serviceCount > 0 && (
            <View style={styles.serviceTag}>
              <Wrench size={10} color={WIGO_COLORS.statusYellow} strokeWidth={2.2} />
              <Text style={styles.serviceText}>{item.serviceCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: WIGO_COLORS.cardBackground,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.borderSubtle,
    padding: 12,
    gap: 10,
    width: '100%',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 4,
    backgroundColor: WIGO_COLORS.thumbnailBackground,
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.dividerSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  details: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  itemTitle: {
    fontFamily: 'Geist_500Medium',
    fontSize: 16,
    fontWeight: '500',
    color: WIGO_COLORS.textDark,
    letterSpacing: -0.2,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skuText: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    fontWeight: '400',
    color: WIGO_COLORS.textSubdued,
    lineHeight: 15,
  },
  costText: {
    fontFamily: 'Onest_400Regular',
    fontSize: 12,
    fontWeight: '400',
    color: WIGO_COLORS.textSubdued,
    lineHeight: 15,
  },
  actionPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionPillButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: WIGO_COLORS.pillBackground,
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: WIGO_COLORS.dividerSubtle,
    width: '100%',
  },
  frame3: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 16,
  },
  availText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: WIGO_COLORS.statusGreen,
    lineHeight: 13,
  },
  outTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 16,
  },
  outText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: WIGO_COLORS.statusOrange,
    lineHeight: 13,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 16,
  },
  serviceText: {
    fontFamily: 'Onest_500Medium',
    fontSize: 12,
    fontWeight: '500',
    color: WIGO_COLORS.statusYellow,
    lineHeight: 13,
  },
});
