import { View, StyleSheet, SectionList, Pressable } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import { Text, MetaText, Card } from '@/components/ui';
import { TaskCard } from './TaskCard';
import { colors, spacing, screenPadding } from '@/constants/theme';
import type { StudyTask } from '@/types/task';

interface TaskListProps {
  tasks: StudyTask[];
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onEdit: (task: StudyTask) => void;
  onDelete: (id: string) => void;
}

interface TaskGroup {
  title: string;
  key: string;
  data: StudyTask[];
  isOverdue?: boolean;
  isRoutine?: boolean;
}

function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isTomorrow(dateStr: string): boolean {
  const date = new Date(dateStr);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}

function isOverdue(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function groupTasks(tasks: StudyTask[]): TaskGroup[] {
  const groups: TaskGroup[] = [];

  const routineTasks = tasks.filter((t) => t.is_recurring && t.status !== 'done');
  const overdueTasks = tasks.filter(
    (t) => !t.is_recurring && t.due_date && isOverdue(t.due_date) && t.status !== 'done'
  );
  const todayTasks = tasks.filter(
    (t) =>
      !t.is_recurring &&
      t.due_date &&
      isToday(t.due_date) &&
      !isOverdue(t.due_date) &&
      t.status !== 'done'
  );
  const tomorrowTasks = tasks.filter(
    (t) => !t.is_recurring && t.due_date && isTomorrow(t.due_date) && t.status !== 'done'
  );
  const upcomingTasks = tasks.filter(
    (t) =>
      !t.is_recurring &&
      t.due_date &&
      !isOverdue(t.due_date) &&
      !isToday(t.due_date) &&
      !isTomorrow(t.due_date) &&
      t.status !== 'done'
  );
  const noDueDateTasks = tasks.filter(
    (t) => !t.is_recurring && !t.due_date && t.status !== 'done'
  );
  const completedTasks = tasks.filter((t) => t.status === 'done');

  if (routineTasks.length > 0) {
    groups.push({
      title: 'Daily Routine',
      key: 'routine',
      data: routineTasks.sort((a, b) => (a.due_time || '').localeCompare(b.due_time || '')),
      isRoutine: true,
    });
  }

  if (overdueTasks.length > 0) {
    groups.push({
      title: 'Overdue',
      key: 'overdue',
      data: overdueTasks,
      isOverdue: true,
    });
  }

  if (todayTasks.length > 0) {
    groups.push({
      title: 'Today',
      key: 'today',
      data: todayTasks.sort((a, b) => (a.due_time || '').localeCompare(b.due_time || '')),
    });
  }

  if (tomorrowTasks.length > 0) {
    groups.push({
      title: 'Tomorrow',
      key: 'tomorrow',
      data: tomorrowTasks.sort((a, b) => (a.due_time || '').localeCompare(b.due_time || '')),
    });
  }

  if (upcomingTasks.length > 0) {
    groups.push({
      title: 'Upcoming',
      key: 'upcoming',
      data: upcomingTasks.sort((a, b) => (a.due_date || '').localeCompare(b.due_date || '')),
    });
  }

  if (noDueDateTasks.length > 0) {
    groups.push({
      title: 'No Due Date',
      key: 'no-date',
      data: noDueDateTasks,
    });
  }

  if (completedTasks.length > 0) {
    groups.push({
      title: 'Completed',
      key: 'completed',
      data: completedTasks.slice(0, 10),
    });
  }

  return groups;
}

function SectionHeader({
  title,
  count,
  completedCount,
  isExpanded,
  onToggle,
  isRoutine,
  isOverdue,
}: {
  title: string;
  count: number;
  completedCount?: number;
  isExpanded: boolean;
  onToggle: () => void;
  isRoutine?: boolean;
  isOverdue?: boolean;
}) {
  return (
    <Pressable style={styles.sectionHeader} onPress={onToggle}>
      <View style={styles.sectionTitleRow}>
        <Text
          variant="mono"
          size="xs"
          uppercase
          style={[styles.sectionTitle, isOverdue && styles.sectionTitleOverdue]}
        >
          {title}
        </Text>
        {completedCount !== undefined && (
          <MetaText>
            {completedCount}/{count}
          </MetaText>
        )}
        {completedCount === undefined && <MetaText>{count}</MetaText>}
      </View>
      {isExpanded ? (
        <ChevronUp size={16} color={colors.textSecondary} />
      ) : (
        <ChevronDown size={16} color={colors.textSecondary} />
      )}
    </Pressable>
  );
}

export function TaskList({ tasks, onToggleComplete, onEdit, onDelete }: TaskListProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const groups = useMemo(() => groupTasks(tasks), [tasks]);

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="display" size="lg" style={styles.emptyIcon}>
          📝
        </Text>
        <Text variant="headingBold" size="base" style={styles.emptyTitle}>
          No tasks yet
        </Text>
        <MetaText style={styles.emptyText}>
          Create your first task to get started!
        </MetaText>
      </View>
    );
  }

  return (
    <SectionList
      sections={groups.map((group) => ({
        ...group,
        data: collapsedSections.has(group.key) ? [] : group.data,
      }))}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => {
        const originalGroup = groups.find((g) => g.key === section.key);
        const completedCount = section.isRoutine
          ? originalGroup?.data.filter((t) => t.status === 'done').length
          : undefined;
        return (
          <SectionHeader
            title={section.title}
            count={originalGroup?.data.length || 0}
            completedCount={completedCount}
            isExpanded={!collapsedSections.has(section.key)}
            onToggle={() => toggleSection(section.key)}
            isRoutine={section.isRoutine}
            isOverdue={section.isOverdue}
          />
        );
      }}
      renderItem={({ item, section }) => (
        <TaskCard
          task={item}
          onToggleComplete={() =>
            onToggleComplete(item.id, item.status === 'done')
          }
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item.id)}
          isOverdue={section.isOverdue}
          showDate={section.key === 'upcoming'}
        />
      )}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing[16],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: screenPadding,
    paddingVertical: spacing[2],
    backgroundColor: colors.base,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  sectionTitle: {
    color: colors.textSecondary,
  },
  sectionTitleOverdue: {
    color: colors.danger,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: screenPadding,
  },
  emptyIcon: {
    marginBottom: spacing[4],
  },
  emptyTitle: {
    marginBottom: spacing[2],
  },
  emptyText: {
    textAlign: 'center',
  },
});
