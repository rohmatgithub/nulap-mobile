import { View, StyleSheet, Pressable } from 'react-native';
import { List, CalendarDays, Calendar, RotateCcw } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

export type TaskViewMode = 'list' | 'schedule' | 'routine' | 'calendar';

interface ViewTabsProps {
  activeView: TaskViewMode;
  onViewChange: (view: TaskViewMode) => void;
}

const VIEWS: { key: TaskViewMode; label: string; icon: typeof List }[] = [
  { key: 'list', label: 'List', icon: List },
  { key: 'schedule', label: 'Schedule', icon: CalendarDays },
  { key: 'routine', label: 'Routine', icon: RotateCcw },
  { key: 'calendar', label: 'Calendar', icon: Calendar },
];

export function ViewTabs({ activeView, onViewChange }: ViewTabsProps) {
  return (
    <View style={styles.container}>
      {VIEWS.map((view) => {
        const Icon = view.icon;
        const isActive = activeView === view.key;
        return (
          <Pressable
            key={view.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onViewChange(view.key)}
          >
            <Icon
              size={16}
              color={isActive ? colors.accentPrimary : colors.textSecondary}
            />
            <Text
              variant="mono"
              size="xs"
              style={[styles.label, isActive && styles.labelActive]}
            >
              {view.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    paddingVertical: spacing[3],
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accentPrimary,
  },
  label: {
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.accentPrimary,
  },
});
