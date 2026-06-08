import { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { Search, X, ChevronDown } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors, spacing, fonts, fontSize } from '@/constants/theme';
import type { TaskFilters as TaskFiltersType, Priority, TaskStatus, Category } from '@/types/task';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/types/task';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFiltersChange: (filters: TaskFiltersType) => void;
  categories: Category[];
}

type FilterChipType = 'status' | 'priority' | 'category';

function FilterChip({
  label,
  isActive,
  onPress,
  color,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      style={[
        styles.chip,
        isActive && styles.chipActive,
        isActive && color ? { backgroundColor: color, borderColor: color } : null,
      ]}
      onPress={onPress}
    >
      <Text
        variant="mono"
        size="xs"
        style={[styles.chipText, isActive && styles.chipTextActive]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function TaskFilters({ filters, onFiltersChange, categories }: TaskFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const toggleStatus = (status: TaskStatus) => {
    const current = filters.status || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onFiltersChange({ ...filters, status: updated.length > 0 ? updated : undefined });
  };

  const togglePriority = (priority: Priority) => {
    const current = filters.priority || [];
    const updated = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority];
    onFiltersChange({ ...filters, priority: updated.length > 0 ? updated : undefined });
  };

  const setCategory = (categoryId?: string) => {
    onFiltersChange({ ...filters, category_id: categoryId });
  };

  const setSearch = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    (filters.status && filters.status.length > 0) ||
    (filters.priority && filters.priority.length > 0) ||
    filters.category_id ||
    filters.search;

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor={colors.textMuted}
            value={filters.search || ''}
            onChangeText={setSearch}
          />
          {filters.search && (
            <Pressable onPress={() => setSearch('')}>
              <X size={16} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
        <Pressable
          style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text variant="mono" size="xs">
            Filters
          </Text>
          <ChevronDown
            size={14}
            color={colors.textPrimary}
            style={{ transform: [{ rotate: showFilters ? '180deg' : '0deg' }] }}
          />
        </Pressable>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterSection}>
            <Text variant="mono" size="xs" color="secondary" uppercase style={styles.filterLabel}>
              Status
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((status) => (
                  <FilterChip
                    key={status}
                    label={STATUS_CONFIG[status].label}
                    isActive={filters.status?.includes(status) || false}
                    onPress={() => toggleStatus(status)}
                    color={STATUS_CONFIG[status].color}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text variant="mono" size="xs" color="secondary" uppercase style={styles.filterLabel}>
              Priority
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((priority) => (
                  <FilterChip
                    key={priority}
                    label={PRIORITY_CONFIG[priority].label}
                    isActive={filters.priority?.includes(priority) || false}
                    onPress={() => togglePriority(priority)}
                    color={PRIORITY_CONFIG[priority].color}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text variant="mono" size="xs" color="secondary" uppercase style={styles.filterLabel}>
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                <FilterChip
                  label="All"
                  isActive={!filters.category_id}
                  onPress={() => setCategory(undefined)}
                />
                {categories.map((category) => (
                  <FilterChip
                    key={category.id}
                    label={category.name}
                    isActive={filters.category_id === category.id}
                    onPress={() => setCategory(category.id)}
                    color={category.color}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {hasActiveFilters && (
            <Pressable style={styles.clearButton} onPress={clearFilters}>
              <Text variant="mono" size="xs" style={styles.clearText}>
                Clear all filters
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.base,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing[3],
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterToggleActive: {
    backgroundColor: colors.surfaceRaised,
  },
  filtersPanel: {
    paddingHorizontal: spacing[3],
    paddingBottom: spacing[3],
    gap: spacing[3],
  },
  filterSection: {
    gap: spacing[2],
  },
  filterLabel: {
    marginBottom: spacing[1],
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.base,
  },
  chipActive: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.accentPrimaryAlpha,
  },
  chipText: {
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.textPrimary,
  },
  clearButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing[2],
  },
  clearText: {
    color: colors.accentPrimary,
  },
});
