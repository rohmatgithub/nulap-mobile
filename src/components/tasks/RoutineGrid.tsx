import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Pencil, Trash2, Clock, Check } from 'lucide-react-native';
import { useMemo } from 'react';
import { Text, MetaText, Card } from '@/components/ui';
import { CategoryBadge } from './CategoryBadge';
import { colors, spacing, screenPadding, fonts, fontSize } from '@/constants/theme';
import type { StudyTask } from '@/types/task';

interface RoutineGridProps {
  tasks: StudyTask[];
  onEdit: (task: StudyTask) => void;
  onDelete: (id: string) => void;
  onAddRoutine: () => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_CODES = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

function getActiveDays(recurrenceRule?: string): string[] {
  if (!recurrenceRule) return DAY_CODES;

  if (recurrenceRule.includes('FREQ=DAILY')) return DAY_CODES;

  const bydayMatch = recurrenceRule.match(/BYDAY=([A-Z,]+)/);
  if (bydayMatch) {
    return bydayMatch[1].split(',');
  }

  return DAY_CODES;
}

function formatDuration(minutes?: number): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function RoutineCard({
  task,
  onEdit,
  onDelete,
}: {
  task: StudyTask;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const activeDays = useMemo(() => getActiveDays(task.recurrence_rule), [task.recurrence_rule]);

  const todayIndex = (new Date().getDay() + 6) % 7;
  const isCompletedToday = task.status === 'done';

  return (
    <Card style={styles.routineCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text variant="headingBold" size="base" numberOfLines={1} style={styles.cardTitle}>
            {task.title}
          </Text>
          <View style={styles.cardActions}>
            <Pressable onPress={onEdit} hitSlop={8}>
              <Pencil size={16} color={colors.textSecondary} />
            </Pressable>
            <Pressable onPress={onDelete} hitSlop={8}>
              <Trash2 size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>
        <View style={styles.cardMeta}>
          {task.category && <CategoryBadge category={task.category} />}
          {task.duration_minutes && (
            <View style={styles.metaItem}>
              <Clock size={12} color={colors.textSecondary} />
              <MetaText>{formatDuration(task.duration_minutes)}</MetaText>
            </View>
          )}
          {task.due_time && <MetaText>{task.due_time}</MetaText>}
        </View>
      </View>

      <View style={styles.weekGrid}>
        {DAYS.map((day, index) => {
          const isActive = activeDays.includes(DAY_CODES[index]);
          const isToday = index === todayIndex;
          const isCompleted = isToday && isCompletedToday;

          return (
            <View key={day} style={styles.dayColumn}>
              <Text
                variant="mono"
                size="xs"
                style={[styles.dayLabel, isToday && styles.dayLabelToday]}
              >
                {day}
              </Text>
              <View
                style={[
                  styles.dayCircle,
                  !isActive && styles.dayCircleInactive,
                  isCompleted && styles.dayCircleCompleted,
                  isToday && !isCompleted && styles.dayCircleToday,
                ]}
              >
                {isCompleted && <Check size={12} color={colors.base} strokeWidth={3} />}
                {!isCompleted && isActive && (
                  <View
                    style={[
                      styles.dayDot,
                      isToday && styles.dayDotToday,
                    ]}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

export function RoutineGrid({ tasks, onEdit, onDelete, onAddRoutine }: RoutineGridProps) {
  const routineTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.is_recurring)
        .sort((a, b) => (a.due_time || '').localeCompare(b.due_time || '')),
    [tasks]
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {routineTasks.map((task) => (
        <RoutineCard
          key={task.id}
          task={task}
          onEdit={() => onEdit(task)}
          onDelete={() => onDelete(task.id)}
        />
      ))}

      <Pressable style={styles.addCard} onPress={onAddRoutine}>
        <Text variant="mono" size="sm" style={styles.addText}>
          + Add new routine
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: screenPadding,
    gap: spacing[4],
    paddingBottom: spacing[16],
  },
  routineCard: {
    padding: spacing[4],
  },
  cardHeader: {
    marginBottom: spacing[4],
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  cardTitle: {
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dayColumn: {
    alignItems: 'center',
    gap: spacing[2],
  },
  dayLabel: {
    color: colors.textSecondary,
  },
  dayLabelToday: {
    color: colors.accentPrimary,
    fontWeight: '700',
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleInactive: {
    borderColor: colors.border,
    backgroundColor: colors.base,
  },
  dayCircleCompleted: {
    backgroundColor: colors.accentSecondary,
    borderColor: colors.accentSecondary,
  },
  dayCircleToday: {
    borderColor: colors.accentPrimary,
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
  },
  dayDotToday: {
    backgroundColor: colors.accentPrimary,
  },
  addCard: {
    padding: spacing[6],
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addText: {
    color: colors.accentPrimary,
  },
});
