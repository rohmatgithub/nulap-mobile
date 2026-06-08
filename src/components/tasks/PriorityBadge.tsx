import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { spacing, fonts, fontSize } from '@/constants/theme';
import type { Priority } from '@/types/task';
import { PRIORITY_CONFIG } from '@/types/task';

interface PriorityBadgeProps {
  priority: Priority;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, showLabel = false, size = 'sm' }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];

  if (!showLabel) {
    return (
      <View
        style={[
          styles.dot,
          size === 'md' && styles.dotMd,
          { backgroundColor: config.color },
        ]}
      />
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: config.color }]}>
      <Text variant="mono" size="xs" style={styles.label}>
        {priority.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotMd: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  label: {
    color: '#FFFFFF',
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
});
