import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Calendar, Clock, RotateCcw, Plus } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, Button } from '@/components/ui';
import { colors, spacing, fonts, fontSize, screenPadding } from '@/constants/theme';
import type { StudyTask, CreateTaskInput, Priority, Category } from '@/types/task';
import { PRIORITY_CONFIG, DURATION_OPTIONS, RECURRENCE_OPTIONS } from '@/types/task';

interface TaskInputProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: CreateTaskInput) => void;
  categories: Category[];
  onCreateCategory?: (name: string, color: string) => void;
  editTask?: StudyTask;
  initialDate?: string;
}

const CATEGORY_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981',
  '#6366F1', '#14B8A6', '#EF4444', '#22C55E', '#A855F7',
  '#06B6D4', '#71717A', '#D946EF', '#F97316', '#84CC16',
];

export function TaskInput({
  visible,
  onClose,
  onSubmit,
  categories,
  onCreateCategory,
  editTask,
  initialDate,
}: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [dueTime, setDueTime] = useState<Date | undefined>();
  const [duration, setDuration] = useState<number>(30);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<string>('FREQ=DAILY');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0]);

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || '');
      setPriority(editTask.priority);
      setCategoryId(editTask.category_id);
      setDueDate(editTask.due_date ? new Date(editTask.due_date) : undefined);
      setDueTime(
        editTask.due_time
          ? new Date(`2000-01-01T${editTask.due_time}`)
          : undefined
      );
      setDuration(editTask.duration_minutes || 30);
      setIsRecurring(editTask.is_recurring);
      setRecurrenceRule(editTask.recurrence_rule || 'FREQ=DAILY');
      setShowDescription(!!editTask.description);
    } else {
      resetForm();
      if (initialDate) {
        setDueDate(new Date(initialDate));
      }
    }
  }, [editTask, initialDate, visible]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategoryId(undefined);
    setDueDate(undefined);
    setDueTime(undefined);
    setDuration(30);
    setIsRecurring(false);
    setRecurrenceRule('FREQ=DAILY');
    setShowDescription(false);
    setShowNewCategory(false);
    setNewCategoryName('');
    setNewCategoryColor(CATEGORY_COLORS[0]);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const input: CreateTaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category_id: categoryId,
      due_date: dueDate?.toISOString().split('T')[0],
      due_time: dueTime
        ? `${dueTime.getHours().toString().padStart(2, '0')}:${dueTime.getMinutes().toString().padStart(2, '0')}`
        : undefined,
      duration_minutes: duration,
      is_recurring: isRecurring,
      recurrence_rule: isRecurring ? recurrenceRule : undefined,
    };

    onSubmit(input);
    resetForm();
    onClose();
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim() || !onCreateCategory) return;
    onCreateCategory(newCategoryName.trim(), newCategoryColor);
    setShowNewCategory(false);
    setNewCategoryName('');
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Set date';
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (time?: Date) => {
    if (!time) return '--:--';
    return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8}>
            <X size={24} color={colors.textPrimary} />
          </Pressable>
          <Text variant="headingBold" size="base">
            {editTask ? 'Edit Task' : 'New Task'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <TextInput
            style={styles.titleInput}
            placeholder="Task title..."
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          {showDescription ? (
            <TextInput
              style={styles.descriptionInput}
              placeholder="Add description..."
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          ) : (
            <Pressable onPress={() => setShowDescription(true)}>
              <Text variant="mono" size="sm" color="secondary">
                + Add description
              </Text>
            </Pressable>
          )}

          <View style={styles.section}>
            <View style={styles.row}>
              <Pressable
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={16} color={colors.textSecondary} />
                <Text variant="mono" size="sm">
                  {formatDate(dueDate)}
                </Text>
              </Pressable>

              <Pressable
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock size={16} color={colors.textSecondary} />
                <Text variant="mono" size="sm">
                  {formatTime(dueTime)}
                </Text>
              </Pressable>
            </View>

            {(showDatePicker || showTimePicker) && (
              <DateTimePicker
                value={showDatePicker ? (dueDate || new Date()) : (dueTime || new Date())}
                mode={showDatePicker ? 'date' : 'time'}
                display="spinner"
                onChange={(_, date) => {
                  if (showDatePicker) {
                    setShowDatePicker(false);
                    if (date) setDueDate(date);
                  } else {
                    setShowTimePicker(false);
                    if (date) setDueTime(date);
                  }
                }}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text variant="mono" size="xs" color="secondary" uppercase style={styles.label}>
              Duration
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {DURATION_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[styles.chip, duration === opt.value && styles.chipActive]}
                    onPress={() => setDuration(opt.value)}
                  >
                    <Text
                      variant="mono"
                      size="xs"
                      style={duration === opt.value ? styles.chipTextActive : undefined}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.rowBetween}>
              <Text variant="mono" size="xs" color="secondary" uppercase style={styles.label}>
                Category
              </Text>
              <Pressable onPress={() => setShowNewCategory(!showNewCategory)}>
                <Plus size={16} color={colors.accentPrimary} />
              </Pressable>
            </View>

            {showNewCategory && (
              <View style={styles.newCategoryForm}>
                <TextInput
                  style={styles.newCategoryInput}
                  placeholder="Category name"
                  placeholderTextColor={colors.textMuted}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.colorRow}>
                    {CATEGORY_COLORS.map((color) => (
                      <Pressable
                        key={color}
                        style={[
                          styles.colorDot,
                          { backgroundColor: color },
                          newCategoryColor === color && styles.colorDotActive,
                        ]}
                        onPress={() => setNewCategoryColor(color)}
                      />
                    ))}
                  </View>
                </ScrollView>
                <Button variant="secondary" onPress={handleCreateCategory}>
                  Add Category
                </Button>
              </View>
            )}

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                <Pressable
                  style={[styles.chip, !categoryId && styles.chipActive]}
                  onPress={() => setCategoryId(undefined)}
                >
                  <Text
                    variant="mono"
                    size="xs"
                    style={!categoryId ? styles.chipTextActive : undefined}
                  >
                    None
                  </Text>
                </Pressable>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.chip,
                      categoryId === cat.id && { backgroundColor: cat.color, borderColor: cat.color },
                    ]}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                    <Text
                      variant="mono"
                      size="xs"
                      style={categoryId === cat.id ? styles.chipTextActive : undefined}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Pressable
              style={styles.recurringToggle}
              onPress={() => setIsRecurring(!isRecurring)}
            >
              <RotateCcw size={16} color={isRecurring ? colors.accentPrimary : colors.textSecondary} />
              <Text variant="mono" size="sm" style={isRecurring ? { color: colors.accentPrimary } : undefined}>
                Repeat
              </Text>
            </Pressable>

            {isRecurring && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={[styles.chip, recurrenceRule === opt.value && styles.chipActive]}
                      onPress={() => setRecurrenceRule(opt.value)}
                    >
                      <Text
                        variant="mono"
                        size="xs"
                        style={recurrenceRule === opt.value ? styles.chipTextActive : undefined}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <Text variant="mono" size="xs" color="secondary" uppercase style={styles.label}>
              Priority
            </Text>
            <View style={styles.priorityRow}>
              {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                <Pressable
                  key={p}
                  style={[
                    styles.priorityButton,
                    { borderColor: PRIORITY_CONFIG[p].color },
                    priority === p && { backgroundColor: PRIORITY_CONFIG[p].color },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    variant="mono"
                    size="xs"
                    style={[
                      styles.priorityText,
                      priority === p && styles.priorityTextActive,
                    ]}
                  >
                    {p.charAt(0).toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button variant="secondary" onPress={onClose} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onPress={handleSubmit}
            disabled={!title.trim()}
            style={{ flex: 1 }}
          >
            {editTask ? 'Save' : 'Create Task'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: screenPadding,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
    padding: screenPadding,
  },
  titleInput: {
    fontFamily: fonts.body,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing[4],
  },
  descriptionInput: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[3],
    marginBottom: spacing[4],
    minHeight: 80,
    textAlignVertical: 'top',
  },
  section: {
    marginBottom: spacing[5],
  },
  label: {
    marginBottom: spacing[2],
  },
  row: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.accentPrimaryAlpha,
  },
  chipTextActive: {
    color: colors.textPrimary,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  recurringToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  priorityRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  priorityButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  priorityText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  priorityTextActive: {
    color: colors.textPrimary,
  },
  newCategoryForm: {
    padding: spacing[3],
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing[3],
    gap: spacing[3],
  },
  newCategoryInput: {
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[2],
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  colorDotActive: {
    borderWidth: 3,
    borderColor: colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing[3],
    padding: screenPadding,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
});
