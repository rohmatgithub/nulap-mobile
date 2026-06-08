import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo } from 'react';
import { Text, MetaText, Card } from '@/components/ui';
import { TaskCard } from './TaskCard';
import { colors, spacing, screenPadding } from '@/constants/theme';
import type { StudyTask } from '@/types/task';

interface ScheduleViewProps {
  tasks: StudyTask[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onEdit: (task: StudyTask) => void;
  onDelete: (id: string) => void;
  onAddTask: () => void;
}

function formatDateHeader(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

function shouldShowOnDate(task: StudyTask, date: Date): boolean {
  if (!task.is_recurring) {
    return task.due_date === date.toISOString().split('T')[0];
  }

  const rule = task.recurrence_rule || '';

  const untilMatch = rule.match(/UNTIL=(\d{8})/);
  if (untilMatch) {
    const u = untilMatch[1];
    const untilDateStr = `${u.slice(0, 4)}-${u.slice(4, 6)}-${u.slice(6, 8)}`;
    if (date.toISOString().split('T')[0] > untilDateStr) return false;
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

export function ScheduleView({
  tasks,
  selectedDate,
  onDateChange,
  onToggleComplete,
  onEdit,
  onDelete,
  onAddTask,
}: ScheduleViewProps) {
  const isToday = isSameDay(selectedDate, new Date());

  const goToPrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    onDateChange(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    onDateChange(next);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const { routineTasks, otherTasks, totalDuration } = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];

    const filtered = tasks.filter((task) => {
      if (task.is_recurring) {
        return shouldShowOnDate(task, selectedDate);
      }
      return task.due_date === dateStr;
    });

    const routine = filtered
      .filter((t) => t.is_recurring)
      .sort((a, b) => (a.due_time || '').localeCompare(b.due_time || ''));
    const other = filtered
      .filter((t) => !t.is_recurring)
      .sort((a, b) => (a.due_time || '').localeCompare(b.due_time || ''));

    const total = filtered.reduce((sum, t) => sum + (t.duration_minutes || 0), 0);

    return { routineTasks: routine, otherTasks: other, totalDuration: total };
  }, [tasks, selectedDate]);

  const completedRoutine = routineTasks.filter((t) => t.status === 'done').length;
  const completedOther = otherTasks.filter((t) => t.status === 'done').length;

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={goToPrevDay} style={styles.navButton} hitSlop={8}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.dateContainer}>
          <Text variant="headingBold" size="base">
            {formatDateHeader(selectedDate)}
          </Text>
          <MetaText>Total: {formatDuration(totalDuration)}</MetaText>
        </View>
        <Pressable onPress={goToNextDay} style={styles.navButton} hitSlop={8}>
          <ChevronRight size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      {!isToday && (
        <Pressable style={styles.todayButton} onPress={goToToday}>
          <Text variant="mono" size="xs" style={styles.todayText}>
            Go to Today
          </Text>
        </Pressable>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {routineTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="mono" size="xs" uppercase color="secondary">
                🔄 Daily Routine
              </Text>
              <MetaText>
                ({completedRoutine}/{routineTasks.length})
              </MetaText>
            </View>
            <Card noPadding>
              {routineTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={() =>
                    onToggleComplete(task.id, task.status === 'done')
                  }
                  onEdit={() => onEdit(task)}
                  onDelete={() => onDelete(task.id)}
                />
              ))}
            </Card>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="mono" size="xs" uppercase color="secondary">
              Other Tasks
            </Text>
            <MetaText>
              ({completedOther}/{otherTasks.length})
            </MetaText>
          </View>

          {otherTasks.length > 0 ? (
            <Card noPadding>
              {otherTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={() =>
                    onToggleComplete(task.id, task.status === 'done')
                  }
                  onEdit={() => onEdit(task)}
                  onDelete={() => onDelete(task.id)}
                />
              ))}
            </Card>
          ) : (
            <Pressable style={styles.emptyCard} onPress={onAddTask}>
              <MetaText>No tasks for this day</MetaText>
              <Text variant="mono" size="sm" style={styles.addTaskText}>
                + Add Task
              </Text>
            </Pressable>
          )}
        </View>
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
    paddingVertical: spacing[4],
    paddingHorizontal: screenPadding,
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  navButton: {
    padding: spacing[1],
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
  },
  todayButton: {
    alignSelf: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    marginVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.accentPrimary,
  },
  todayText: {
    color: colors.accentPrimary,
  },
  content: {
    flex: 1,
    padding: screenPadding,
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  emptyCard: {
    padding: spacing[6],
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: spacing[2],
  },
  addTaskText: {
    color: colors.accentPrimary,
  },
});
