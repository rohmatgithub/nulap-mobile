import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import { Text, MetaText } from '@/components/ui';
import { TaskCard } from './TaskCard';
import { colors, spacing, screenPadding } from '@/constants/theme';
import type { StudyTask } from '@/types/task';

interface CalendarViewProps {
  tasks: StudyTask[];
  onSelectDate: (date: Date) => void;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onEdit: (task: StudyTask) => void;
  onDelete: (id: string) => void;
}

type CalendarMode = 'week' | 'month';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates(date: Date): Date[] {
  const result: Date[] = [];
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);

  for (let i = 0; i < 7; i++) {
    result.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  return result;
}

function getMonthDates(date: Date): Date[] {
  const result: Date[] = [];
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startOffset);

  const totalDays = startOffset + lastDay.getDate();
  const totalWeeks = Math.ceil(totalDays / 7);

  for (let i = 0; i < totalWeeks * 7; i++) {
    result.push(new Date(startDate));
    startDate.setDate(startDate.getDate() + 1);
  }

  return result;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

function isSameMonth(date1: Date, date2: Date): boolean {
  return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
}

function getTasksForDate(tasks: StudyTask[], date: Date): StudyTask[] {
  const dateStr = date.toISOString().split('T')[0];

  return tasks.filter((task) => {
    if (task.is_recurring) {
      const rule = task.recurrence_rule || '';

      const untilMatch = rule.match(/UNTIL=(\d{8})/);
      if (untilMatch) {
        const u = untilMatch[1];
        const untilDateStr = `${u.slice(0, 4)}-${u.slice(4, 6)}-${u.slice(6, 8)}`;
        if (dateStr > untilDateStr) return false;
      }

      if (rule.includes('FREQ=DAILY')) return true;

      if (rule.includes('FREQ=WEEKLY')) {
        const DAY_MAP: Record<number, string> = {
          0: 'SU', 1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA',
        };
        const bydayMatch = rule.match(/BYDAY=([A-Z,]+)/);
        if (bydayMatch) {
          const allowedDays = bydayMatch[1].split(',');
          return allowedDays.includes(DAY_MAP[date.getDay()]);
        }
      }

      return true;
    }

    return task.due_date === dateStr;
  });
}

export function CalendarView({
  tasks,
  onSelectDate,
  onToggleComplete,
  onEdit,
  onDelete,
}: CalendarViewProps) {
  const [mode, setMode] = useState<CalendarMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dates = useMemo(
    () => (mode === 'week' ? getWeekDates(currentDate) : getMonthDates(currentDate)),
    [mode, currentDate]
  );

  const selectedTasks = useMemo(
    () => getTasksForDate(tasks, selectedDate),
    [tasks, selectedDate]
  );

  const taskCountByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    dates.forEach((date) => {
      const dateStr = date.toDateString();
      counts[dateStr] = getTasksForDate(tasks, date).length;
    });
    return counts;
  }, [tasks, dates]);

  const goToPrev = () => {
    const d = new Date(currentDate);
    if (mode === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setCurrentDate(d);
  };

  const goToNext = () => {
    const d = new Date(currentDate);
    if (mode === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setCurrentDate(d);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onSelectDate(date);
  };

  const formatHeader = () => {
    if (mode === 'week') {
      const start = dates[0];
      const end = dates[6];
      if (start.getMonth() === end.getMonth()) {
        return `${start.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
      }
      return `${start.toLocaleDateString('id-ID', { month: 'short' })} - ${end.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={goToPrev} hitSlop={8}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text variant="headingBold" size="base">
          {formatHeader()}
        </Text>
        <Pressable onPress={goToNext} hitSlop={8}>
          <ChevronRight size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.modeToggle}>
        <Pressable
          style={[styles.modeButton, mode === 'week' && styles.modeButtonActive]}
          onPress={() => setMode('week')}
        >
          <Text variant="mono" size="xs" style={mode === 'week' ? styles.modeTextActive : undefined}>
            Week
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, mode === 'month' && styles.modeButtonActive]}
          onPress={() => setMode('month')}
        >
          <Text variant="mono" size="xs" style={mode === 'month' ? styles.modeTextActive : undefined}>
            Month
          </Text>
        </Pressable>
      </View>

      <View style={styles.daysHeader}>
        {DAYS.map((day) => (
          <View key={day} style={styles.dayHeaderCell}>
            <Text variant="mono" size="xs" color="secondary">
              {day}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {dates.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          const isCurrentMonth = isSameMonth(date, currentDate);
          const taskCount = taskCountByDate[date.toDateString()] || 0;

          return (
            <Pressable
              key={index}
              style={[
                styles.dateCell,
                mode === 'month' && styles.dateCellMonth,
                isSelected && styles.dateCellSelected,
              ]}
              onPress={() => handleDateSelect(date)}
            >
              <Text
                variant="mono"
                size={mode === 'week' ? 'base' : 'sm'}
                style={[
                  styles.dateText,
                  !isCurrentMonth && mode === 'month' && styles.dateTextOther,
                  isToday && styles.dateTextToday,
                  isSelected && styles.dateTextSelected,
                ]}
              >
                {date.getDate()}
              </Text>
              {taskCount > 0 && (
                <View style={[styles.badge, isSelected && styles.badgeSelected]}>
                  <Text variant="mono" size="xs" style={styles.badgeText}>
                    {taskCount}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false}>
        <View style={styles.taskListHeader}>
          <Text variant="mono" size="xs" color="secondary" uppercase>
            Tasks for {selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          </Text>
          <MetaText>{selectedTasks.length} tasks</MetaText>
        </View>

        {selectedTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <MetaText>No tasks for this day</MetaText>
          </View>
        ) : (
          selectedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={() => onToggleComplete(task.id, task.status === 'done')}
              onEdit={() => onEdit(task)}
              onDelete={() => onDelete(task.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: screenPadding,
    backgroundColor: colors.surface,
  },
  modeToggle: {
    flexDirection: 'row',
    marginHorizontal: screenPadding,
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.accentPrimary,
  },
  modeTextActive: {
    color: colors.textPrimary,
  },
  daysHeader: {
    flexDirection: 'row',
    paddingHorizontal: screenPadding,
    marginBottom: spacing[2],
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: screenPadding,
    marginBottom: spacing[4],
  },
  dateCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[1],
  },
  dateCellMonth: {
    aspectRatio: 1,
  },
  dateCellSelected: {
    backgroundColor: colors.accentPrimary,
  },
  dateText: {
    color: colors.textPrimary,
  },
  dateTextOther: {
    color: colors.textMuted,
  },
  dateTextToday: {
    color: colors.accentPrimary,
    fontWeight: '700',
  },
  dateTextSelected: {
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 2,
  },
  badgeSelected: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  badgeText: {
    color: colors.textSecondary,
  },
  taskList: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  taskListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: screenPadding,
  },
  emptyState: {
    padding: spacing[8],
    alignItems: 'center',
  },
});
