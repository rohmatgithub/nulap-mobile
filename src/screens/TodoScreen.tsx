import { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Check } from 'lucide-react-native';
import { colors, spacing, screenPadding, fonts, fontSize } from '@/constants/theme';
import { Text, HeadingText, MetaText, Card, Badge, Button } from '@/components/ui';
import { useTasks, useCreateTask, useCompleteTask, useUncompleteTask } from '@/hooks';
import type { StudyTask, Priority } from '@/types/task';
import type { MainTabScreenProps } from '@/types/navigation';

interface TaskGroup {
  title: string;
  data: StudyTask[];
}

const priorityColors: Record<Priority, string> = {
  low: colors.textMuted,
  medium: colors.accentTertiary,
  high: colors.accentSecondary,
  urgent: colors.accentPrimary,
};

function groupTasksByDate(tasks: StudyTask[]): TaskGroup[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const groups: Record<string, StudyTask[]> = {
    'Hari Ini': [],
    'Besok': [],
    'Minggu Ini': [],
    'Nanti': [],
    'Tanpa Tanggal': [],
  };

  tasks.forEach((task) => {
    if (!task.due_date) {
      groups['Tanpa Tanggal'].push(task);
      return;
    }

    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate.getTime() === today.getTime()) {
      groups['Hari Ini'].push(task);
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      groups['Besok'].push(task);
    } else if (dueDate > today && dueDate < nextWeek) {
      groups['Minggu Ini'].push(task);
    } else {
      groups['Nanti'].push(task);
    }
  });

  return Object.entries(groups)
    .filter(([_, tasks]) => tasks.length > 0)
    .map(([title, data]) => ({ title, data }));
}

function TaskItem({
  task,
  onToggle,
  isToggling,
}: {
  task: StudyTask;
  onToggle: () => void;
  isToggling: boolean;
}) {
  const isCompleted = task.status === 'done';

  return (
    <Pressable
      style={[styles.todoItem, isCompleted && styles.todoCompleted]}
      onPress={onToggle}
      disabled={isToggling}
    >
      <Pressable
        style={[
          styles.checkbox,
          isCompleted && styles.checkboxChecked,
          !isCompleted && { borderColor: priorityColors[task.priority] },
        ]}
        onPress={onToggle}
        disabled={isToggling}
      >
        {isCompleted && <Check size={12} color={colors.base} strokeWidth={3} />}
      </Pressable>
      <View style={styles.taskContent}>
        <Text
          variant="body"
          style={[styles.todoText, isCompleted && styles.todoTextCompleted]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        {task.category && (
          <MetaText size="xs">{task.category.name}</MetaText>
        )}
      </View>
      {!isCompleted && (
        <View style={[styles.priorityDot, { backgroundColor: priorityColors[task.priority] }]} />
      )}
    </Pressable>
  );
}

function TaskGroupHeader({ title, count }: { title: string; count: number }) {
  return (
    <View style={styles.groupHeader}>
      <Text variant="mono" size="xs" color="secondary" uppercase>
        {title}
      </Text>
      <Badge variant="default">{String(count)}</Badge>
    </View>
  );
}

export function TodoScreen({ navigation }: MainTabScreenProps<'Todo'>) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  const { data: tasks, isLoading, error, refetch, isRefetching } = useTasks({
    status: ['todo', 'in_progress', 'done'],
  });

  const createTaskMutation = useCreateTask();
  const completeTaskMutation = useCompleteTask();
  const uncompleteTaskMutation = useUncompleteTask();

  const taskGroups = useMemo(() => {
    if (!tasks) return [];
    const activeTasks = tasks.filter((t) => t.status !== 'cancelled');
    return groupTasksByDate(activeTasks);
  }, [tasks]);

  const handleToggleTask = async (task: StudyTask) => {
    setTogglingIds((prev) => new Set(prev).add(task.id));
    try {
      if (task.status === 'done') {
        await uncompleteTaskMutation.mutateAsync(task.id);
      } else {
        await completeTaskMutation.mutateAsync(task.id);
      }
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  };

  const handleAddTask = async () => {
    const title = newTaskTitle.trim();
    if (!title) return;

    setNewTaskTitle('');
    try {
      await createTaskMutation.mutateAsync({
        title,
        priority: 'medium',
        due_date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      setNewTaskTitle(title);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text variant="body" color="secondary">Failed to load tasks</Text>
          <Button variant="secondary" onPress={() => refetch()} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <HeadingText>Tugas</HeadingText>
        <MetaText>{tasks?.filter((t) => t.status !== 'done').length ?? 0} aktif</MetaText>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tambah tugas baru..."
          placeholderTextColor={colors.textMuted}
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
          editable={!createTaskMutation.isPending}
        />
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
            createTaskMutation.isPending && styles.addButtonDisabled,
          ]}
          onPress={handleAddTask}
          disabled={createTaskMutation.isPending}
        >
          {createTaskMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.textPrimary} />
          ) : (
            <Plus size={20} color={colors.textPrimary} strokeWidth={2} />
          )}
        </Pressable>
      </View>

      <FlatList
        data={taskGroups}
        keyExtractor={(item) => item.title}
        renderItem={({ item: group }) => (
          <View style={styles.group}>
            <TaskGroupHeader title={group.title} count={group.data.length} />
            <Card noPadding>
              {group.data.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => handleToggleTask(task)}
                  isToggling={togglingIds.has(task.id)}
                />
              ))}
            </Card>
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.accentPrimary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="body" color="secondary">No tasks yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: screenPadding,
  },
  retryButton: {
    marginTop: spacing[4],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[8],
  },
  header: {
    paddingHorizontal: screenPadding,
    paddingVertical: spacing[4],
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: screenPadding,
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing[4],
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.accentPrimary,
  },
  addButtonPressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  list: {
    paddingHorizontal: screenPadding,
    paddingBottom: spacing[16],
  },
  group: {
    marginBottom: spacing[6],
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  todoCompleted: {
    opacity: 0.5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    marginRight: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accentSecondary,
    borderColor: colors.accentSecondary,
  },
  taskContent: {
    flex: 1,
    gap: spacing[1],
  },
  todoText: {
    flex: 1,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing[2],
  },
});
