import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, borderRadius } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  height = 6,
  color = colors.accentSecondary,
  backgroundColor = colors.border,
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      width: withTiming(`${clampedProgress}%`, { duration: 300 }),
    };
  });

  return (
    <View style={[styles.container, { height, backgroundColor }, style]}>
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: color },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: borderRadius.none,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.none,
  },
});
