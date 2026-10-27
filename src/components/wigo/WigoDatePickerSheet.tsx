import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  useReducedMotion,
  SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from 'lucide-react-native';
import { WIGO_COLORS } from '@/constants/wigo-theme';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// iOS sheet curve and durations per animate-expo skill
const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1);
const EASE_SHEET_OUT = Easing.bezier(0.72, 0.32, 0, 1);
const ENTER_DURATION = 500;
const EXIT_DURATION = 550;
const ESTIMATED_SHEET_HEIGHT = 500;

interface WigoDatePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  currentDateText?: string;
  onSelectDate: (formattedDate: string) => void;
}

interface WigoDatePickerSheetContentProps extends Omit<WigoDatePickerSheetProps, 'visible'> {
  translateY: SharedValue<number>;
  onRequestClose: () => void;
}

function WigoDatePickerSheetContent({
  currentDateText,
  onSelectDate,
  translateY,
  onRequestClose,
}: WigoDatePickerSheetContentProps) {
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
  const [selectedDate, setSelectedDate] = useState({
    year: initialDate.getFullYear(),
    month: initialDate.getMonth(),
    day: initialDate.getDate(),
  });

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
    setActiveYear(target.getFullYear());
    setActiveMonth(target.getMonth());
    setSelectedDate({
      year: target.getFullYear(),
      month: target.getMonth(),
      day: target.getDate(),
    });
  };

  const handleDayPress = (day: number) => {
    setSelectedDate({
      year: activeYear,
      month: activeMonth,
      day,
    });
  };

  const handleConfirm = () => {
    const formatted = formatSelection(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day
    );
    onSelectDate(formatted);
    onRequestClose();
  };

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.get() }],
  }));

  return (
    <TouchableWithoutFeedback onPress={onRequestClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <Animated.View style={[styles.sheetContainer, sheetAnimatedStyle]}>
            {/* Drag indicator */}
            <View style={styles.dragPill} />

            {/* Month / Year Navigator */}
            <View style={styles.monthNav}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handlePrevMonth}
                style={styles.navArrow}
              >
                <ChevronLeft size={18} color={WIGO_COLORS.orangeGradientStart} strokeWidth={2.2} />
              </TouchableOpacity>

              <Text style={styles.monthYearTitle}>
                {FULL_MONTH_NAMES[activeMonth]} {activeYear}
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleNextMonth}
                style={styles.navArrow}
              >
                <ChevronRight size={18} color={WIGO_COLORS.orangeGradientStart} strokeWidth={2.2} />
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
                const isSelected =
                  selectedDate.year === activeYear &&
                  selectedDate.month === activeMonth &&
                  selectedDate.day === day;

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
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleSelectQuickPreset(0)}
                style={styles.presetChip}
              >
                <Text style={styles.presetChipText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleConfirm}
                style={styles.confirmBtn}
              >
                <Check size={16} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.confirmBtnText}>Set Date</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
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
  const [isRendered, setIsRendered] = useState(visible);
  const reducedMotion = useReducedMotion();
  const translateY = useSharedValue(visible ? 0 : ESTIMATED_SHEET_HEIGHT);
  const isClosingRef = useRef(false);
  const isClosedRef = useRef(false);
  const prevVisibleRef = useRef(visible);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const finishClose = useCallback(() => {
    if (isClosedRef.current) return;
    isClosedRef.current = true;
    setIsRendered(false);
    isClosingRef.current = false;
    onCloseRef.current();
  }, []);

  const animateClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    isClosedRef.current = false;

    if (reducedMotion) {
      finishClose();
      return;
    }

    translateY.set(
      withTiming(
        ESTIMATED_SHEET_HEIGHT,
        { duration: EXIT_DURATION, easing: EASE_SHEET_OUT },
        (finished) => {
          'worklet';
          if (finished) {
            scheduleOnRN(finishClose);
          }
        }
      )
    );

    // Safety fallback timer for web / interrupted animation frame
    setTimeout(() => {
      finishClose();
    }, EXIT_DURATION + 60);
  }, [finishClose, reducedMotion, translateY]);

  useEffect(() => {
    const wasVisible = prevVisibleRef.current;
    prevVisibleRef.current = visible;

    if (visible && !wasVisible) {
      // Transition from closed -> open
      isClosingRef.current = false;
      isClosedRef.current = false;
      setIsRendered(true);
      if (reducedMotion) {
        translateY.set(0);
      } else {
        translateY.set(ESTIMATED_SHEET_HEIGHT);
        translateY.set(
          withTiming(0, { duration: ENTER_DURATION, easing: EASE_SHEET })
        );
      }
    } else if (!visible && wasVisible) {
      // Closed by parent
      if (isRendered && !isClosingRef.current) {
        animateClose();
      }
    }
  }, [visible, animateClose, isRendered, reducedMotion, translateY]);

  if (!isRendered) return null;

  return (
    <Modal
      visible={isRendered}
      transparent
      animationType="none"
      onRequestClose={animateClose}
    >
      <WigoDatePickerSheetContent
        onRequestClose={animateClose}
        onClose={onClose}
        currentDateText={currentDateText}
        onSelectDate={onSelectDate}
        translateY={translateY}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    // backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: WIGO_COLORS.cardBackground,
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    borderWidth: 0.5,
    borderColor: WIGO_COLORS.borderSubtle,
    borderBottomWidth: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  dragPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: WIGO_COLORS.dividerSubtle,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: WIGO_COLORS.borderSubtle,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: WIGO_COLORS.textDark,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  monthYearTitle: {
    fontFamily: Platform.OS === 'web' ? 'Onest, sans-serif' : 'Onest_700Bold',
    fontSize: 15,
    fontWeight: '600',
    color: WIGO_COLORS.textDark,
  },
  navArrow: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    // borderRadius: 8,
    // backgroundColor: '#1B1C21',
    // borderWidth: 1,
    // borderColor: '#292B32',
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
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: '#ff5e00',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
    color: WIGO_COLORS.textDark,
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
