import { View, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, spacing, fonts, fontSize } from '@/constants/theme';
import { Text } from '@/components/ui';
import type { ReviewRating } from '@/types/deck';

interface RatingOption {
  rating: ReviewRating;
  label: string;
  interval: string;
  color: string;
  bgColor: string;
}

const ratingOptions: RatingOption[] = [
  {
    rating: 'again',
    label: 'Again',
    interval: '<10m',
    color: '#FFFFFF',
    bgColor: colors.danger,
  },
  {
    rating: 'hard',
    label: 'Hard',
    interval: '1d',
    color: '#FFFFFF',
    bgColor: colors.warning,
  },
  {
    rating: 'good',
    label: 'Good',
    interval: '3d',
    color: '#FFFFFF',
    bgColor: colors.success,
  },
  {
    rating: 'easy',
    label: 'Easy',
    interval: '7d',
    color: '#FFFFFF',
    bgColor: colors.info,
  },
];

interface RatingButtonsProps {
  onRate: (rating: ReviewRating) => void;
  disabled?: boolean;
  visible?: boolean;
}

export function RatingButtons({ onRate, disabled = false, visible = true }: RatingButtonsProps) {
  if (!visible) return null;

  return (
    <Animated.View entering={FadeInUp.duration(200)} style={styles.container}>
      {ratingOptions.map((option, index) => (
        <Pressable
          key={option.rating}
          onPress={() => onRate(option.rating)}
          disabled={disabled}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: option.bgColor },
            pressed && styles.buttonPressed,
            disabled && styles.buttonDisabled,
          ]}
        >
          <Text variant="headingBold" size="sm" style={[styles.label, { color: option.color }]}>
            {option.label}
          </Text>
          <Text variant="mono" size="xs" style={[styles.interval, { color: option.color }]}>
            {option.interval}
          </Text>
          <Text variant="mono" size="xs" style={[styles.keyHint, { color: option.color }]}>
            {index + 1}
          </Text>
        </Pressable>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
  },
  button: {
    flex: 1,
    maxWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
  buttonPressed: {
    transform: [{ translateY: 2 }, { translateX: 2 }],
    shadowOffset: { width: 0, height: 0 },
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  interval: {
    marginTop: spacing[1],
    opacity: 0.8,
  },
  keyHint: {
    marginTop: spacing[1],
    opacity: 0.6,
  },
});
