import { View, StyleSheet, Pressable } from 'react-native';
import { CheckSquare, ChevronRight, Circle, CheckCircle2 } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { Text, MetaText, Card, Badge } from '@/components/ui';
import type { StudyTask, Priority } from '@/types/task';

interface TasksTodayWidgetProps {
  tasks: StudyTask[];
  onToggleTask: (taskId: string, completed: boolean) => void;
  onViewAll: () => void;
}

const priorityColors: Record<Priority, string> = {
  urgent: colors.danger,
  high: colors.warning,
  medium: colors.accentPrimary,
  low: colors.textMuted,
};

function TaskRow({
  task,
  onToggle,
}: {
  task: StudyTask;
  onToggle: () => void;
}) {
  const isCompleted = task.status === 'done';

  return (
    <Pressable style={styles.taskRow} onPress={onToggle}>
      <View style={styles.checkbox}>
        {isCompleted ? (
          <CheckCircle2 size={20} color={colors.success} strokeWidth={2} />
        ) : (
          <Circle size={20} color={priorityColors[task.priority]} strokeWidth={2} />
        )}
      </View>
      <View style={styles.taskInfo}>
        <Text
          variant="body"
          size="sm"
          numberOfLines={1}
          style={isCompleted && styles.completedText}
        >
          {task.title}
        </Text>
        {task.due_time && (
          <MetaText size="xs" style={isCompleted && styles.completedMeta}>
            {task.due_time}
          </MetaText>
        )}
      </View>
      {task.category && (
        <Badge variant="secondary">
          {task.category.name}
        </Badge>
      )}
    </Pressable>
  );
}

export function TasksTodayWidget({ tasks, onToggleTask, onViewAll }: TasksTodayWidgetProps) {
  const todayTasks = tasks.slice(0, 5);
  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const totalCount = tasks.length;

  if (tasks.length === 0) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <CheckSquare size={18} color={colors.accentSecondary} strokeWidth={2} />
            <Text variant="headingBold" size="base">Today's Tasks</Text>
          </View>
        </View>
        <View style={styles.emptyState}>
          <Text variant="body" size="sm" color="secondary">
            No tasks scheduled for today
          </Text>
          <MetaText size="xs">Add tasks to plan your day</MetaText>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <CheckSquare size={18} color={colors.accentSecondary} strokeWidth={2} />
          <Text variant="headingBold" size="base">Today's Tasks</Text>
        </View>
        <View style={styles.countBadge}>
          <Text variant="mono" size="xs" style={{ color: colors.accentSecondary }}>
            {completedCount}/{totalCount}
          </Text>
        </View>
      </View>

      <View style={styles.taskList}>
        {todayTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={() => onToggleTask(task.id, task.status !== 'done')}
          />
        ))}
      </View>

      {tasks.length > 5 && (
        <Pressable style={styles.viewAllButton} onPress={onViewAll}>
          <Text variant="mono" size="xs" color="accent">
            View all tasks ({tasks.length - 5} more)
          </Text>
          <ChevronRight size={14} color={colors.accentPrimary} strokeWidth={2} />
        </Pressable>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  countBadge: {
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskList: {
    gap: spacing[2],
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkbox: {
    width: 24,
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
    gap: spacing[1],
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  completedMeta: {
    textDecorationLine: 'line-through',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[4],
    gap: spacing[1],
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
