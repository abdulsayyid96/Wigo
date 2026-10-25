import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from 'lucide-react-native';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface WigoDatePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  currentDateText?: string;
  onSelectDate: (formattedDate: string) => void;
}

function WigoDatePickerSheetContent({
  onClose,
  currentDateText,
  onSelectDate,
}: Omit<WigoDatePickerSheetProps, 'visible'>) {
  // Parse initial date from currentDateText (e.g. "18 Oct 2026" or current date)
  const initialDate = useMemo(() => {
    if (currentDateText) {
      const parts = currentDateText.trim().split(/\s+/);
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const monthIndex = MONTH_NAMES.findIndex(
          (m) => m.toLowerCase() === parts[1].toLowerCase().slice(0, 3)
        );
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && monthIndex !== -1 && !isNaN(year)) {
          return new Date(year, monthIndex, day);
        }
      }
      const parsed = new Date(currentDateText);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  }, [currentDateText]);

  const [activeYear, setActiveYear] = useState(initialDate.getFullYear());
  const [activeMonth, setActiveMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());

  const handlePrevMonth = () => {
    if (activeMonth === 0) {
      setActiveMonth(11);
      setActiveYear((y) => y - 1);
    } else {
      setActiveMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (activeMonth === 11) {
      setActiveMonth(0);
      setActiveYear((y) => y + 1);
    } else {
      setActiveMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(activeYear, activeMonth, 1).getDay();

  const formatSelection = (y: number, m: number, d: number) => {
    const monthShort = MONTH_NAMES[m];
    return `${d} ${monthShort} ${y}`;
  };

  const handleSelectQuickPreset = (daysOffset: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysOffset);
    const formatted = formatSelection(
      target.getFullYear(),
      target.getMonth(),
      target.getDate()
    );
    onSelectDate(formatted);
    onClose();
  };

  const handleDayPress = (day: number) => {
    setSelectedDay(day);
    const formatted = formatSelection(activeYear, activeMonth, day);
    onSelectDate(formatted);
    onClose();
  };

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View style={styles.sheetContainer}>
            {/* Drag indicator */}
            <View style={styles.dragPill} />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.iconCircle}>
                  <CalendarIcon size={16} color="#ff5e00" strokeWidth={2.4} />
                </View>
                <View>
                  <Text style={styles.title}>Select Date</Text>
                  <Text style={styles.subtitle}>Choose purchase or intake date</Text>
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onClose}
                style={styles.closeBtn}
                accessibilityLabel="Close date picker"
              >
                <X size={16} color="#9DA1A8" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {/* Quick Presets */}
            <View style={styles.presetRow}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleSelectQuickPreset(0)}
                style={styles.presetChip}
              >
                <Text style={styles.presetChipText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleSelectQuickPreset(-1)}
                style={styles.presetChip}
              >
                <Text style={styles.presetChipText}>Yesterday</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleSelectQuickPreset(-7)}
                style={styles.presetChip}
              >
                <Text style={styles.presetChipText}>7 Days Ago</Text>
              </TouchableOpacity>
            </View>

            {/* Month / Year Navigator */}
            <View style={styles.monthNav}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handlePrevMonth}
                style={styles.navArrow}
              >
                <ChevronLeft size={18} color="#D0D4DC" strokeWidth={2.2} />
              </TouchableOpacity>

              <Text style={styles.monthYearTitle}>
                {FULL_MONTH_NAMES[activeMonth]} {activeYear}
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleNextMonth}
                style={styles.navArrow}
              >
                <ChevronRight size={18} color="#D0D4DC" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {/* Weekday headers */}
            <View style={styles.weekdayRow}>
              {WEEKDAY_NAMES.map((wd) => (
                <Text key={wd} style={styles.weekdayText}>
                  {wd}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {/* Empty cells before month starts */}
              {Array.from({ length: firstDayWeekday }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.dayCell} />
              ))}

              {/* Day numbers */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isCurrentMonthYear =
                  activeYear === initialDate.getFullYear() &&
                  activeMonth === initialDate.getMonth();
                const isSelected = isCurrentMonthYear && selectedDay === day;

                return (
                  <TouchableOpacity
                    key={`day-${day}`}
                    activeOpacity={0.7}
                    onPress={() => handleDayPress(day)}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Footer Selected Display */}
            <View style={styles.footer}>
              <View style={styles.footerInfo}>
                <Text style={styles.footerLabel}>Selected:</Text>
                <Text style={styles.footerValue}>
                  {formatSelection(activeYear, activeMonth, selectedDay)}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  const formatted = formatSelection(
                    activeYear,
                    activeMonth,
                    selectedDay
                  );
                  onSelectDate(formatted);
                  onClose();
                }}
                style={styles.confirmBtn}
              >
                <Check size={16} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.confirmBtnText}>Set Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
}

export function WigoDatePickerSheet({
  visible,
  onClose,
  currentDateText,
  onSelectDate,
}: WigoDatePickerSheetProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <WigoDatePickerSheetContent
        onClose={onClose}
        currentDateText={currentDateText}
        onSelectDate={onSelectDate}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#141518',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: '#26282E',
    borderBottomWidth: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  dragPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#353840',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#202227',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 94, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 94, 0, 0.25)',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'Geist, sans-serif' : undefined,
  },
  subtitle: {
    fontSize: 12,
    color: '#8A8F98',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E2025',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1B1C21',
    borderWidth: 1,
    borderColor: '#292B32',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D0D4DC',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  monthYearTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'Geist, sans-serif' : undefined,
  },
  navArrow: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1B1C21',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#292B32',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  weekdayText: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6E737D',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: '#ff5e00',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#D0D4DC',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#202227',
  },
  footerInfo: {
    flexDirection: 'column',
  },
  footerLabel: {
    fontSize: 11,
    color: '#8A8F98',
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ff5e00',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
