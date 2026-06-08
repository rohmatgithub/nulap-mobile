import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { Pencil, Trash2, Clock, RotateCcw } from 'lucide-react-native';
import { Text, MetaText } from '@/components/ui';
import { TaskCheckbox } from './TaskCheckbox';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { colors, spacing, fonts, fontSize } from '@/constants/theme';
import type { StudyTask } from '@/types/task';
import { PRIORITY_CONFIG } from '@/types/task';

interface TaskCardProps {
  task: StudyTask;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isOverdue?: boolean;
  showDate?: boolean;
}

function formatDuration(minutes?: number): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatTime(time?: string): string {
  if (!time) return '';
  return time;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = date.toDateString();
  if (dateOnly === today.toDateString()) return 'Today';
  if (dateOnly === tomorrow.toDateString()) return 'Tomorrow';
  if (dateOnly === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  isOverdue = false,
  showDate = false,
}: TaskCardProps) {
  const isCompleted = task.status === 'done';
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  const handleDelete = () => {
    Alert.alert(
      'Hapus Task',
      `Apakah Anda yakin ingin menghapus "${task.title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <View style={[styles.container, isOverdue && styles.overdue, isCompleted && styles.completed]}>
      <View style={styles.content}>
        <View style={styles.mainRow}>
          <TaskCheckbox
            checked={isCompleted}
            onToggle={onToggleComplete}
            borderColor={!isCompleted ? priorityConfig.color : undefined}
          />
          <View style={styles.titleContainer}>
            <Text
              variant="body"
              style={[styles.title, isCompleted && styles.titleCompleted]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
          </View>
          {isCompleted && (
            <Text variant="mono" size="xs" style={styles.xpReward}>
              +{task.xp_reward} XP
            </Text>
          )}
          {!isCompleted && (
            <View style={styles.actions}>
              <Pressable onPress={onEdit} style={styles.actionButton} hitSlop={8}>
                <Pencil size={16} color={colors.textSecondary} />
              </Pressable>
              <Pressable onPress={handleDelete} style={styles.actionButton} hitSlop={8}>
                <Trash2 size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          {task.category && <CategoryBadge category={task.category} />}
          {task.is_recurring && (
            <View style={styles.metaItem}>
              <RotateCcw size={12} color={colors.textSecondary} />
              <MetaText style={styles.metaText}>Recurring</MetaText>
            </View>
          )}
          {task.due_time && (
            <View style={styles.metaItem}>
              <Clock size={12} color={colors.textSecondary} />
              <MetaText style={styles.metaText}>{formatTime(task.due_time)}</MetaText>
            </View>
          )}
          {task.duration_minutes && (
            <MetaText style={styles.metaText}>{formatDuration(task.duration_minutes)}</MetaText>
          )}
          {showDate && task.due_date && (
            <MetaText style={[styles.metaText, isOverdue && styles.overdueText]}>
              {formatDate(task.due_date)}
            </MetaText>
          )}
          {!isCompleted && <PriorityBadge priority={task.priority} />}
        </View>

        {task.deck && (
          <View style={styles.deckRow}>
            <MetaText>
              📚 {task.deck.name}
              {task.deck.due_count > 0 && ` (${task.deck.due_count} due)`}
            </MetaText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  overdue: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  completed: {
    opacity: 0.6,
  },
  content: {
    gap: spacing[2],
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  xpReward: {
    color: colors.accentSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  actionButton: {
    padding: spacing[1],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginLeft: 32,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
  },
  overdueText: {
    color: colors.danger,
  },
  deckRow: {
    marginLeft: 32,
  },
});
