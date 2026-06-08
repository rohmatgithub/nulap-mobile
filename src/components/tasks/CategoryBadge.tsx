import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { spacing, fonts, fontSize } from '@/constants/theme';
import type { Category } from '@/types/task';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.dot,
          size === 'md' && styles.dotMd,
          { backgroundColor: category.color },
        ]}
      />
      <Text
        variant="mono"
        size={size === 'sm' ? 'xs' : 'sm'}
        color="secondary"
        style={styles.name}
      >
        {category.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotMd: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
  },
});
