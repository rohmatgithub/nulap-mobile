import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, fonts, fontSize } from '@/constants/theme';
import { Text } from '@/components/ui';

interface FlashCardProps {
  front: string;
  back: string;
  example?: string;
  hint?: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashCard({ front, back, example, hint, isFlipped, onFlip }: FlashCardProps) {
  const rotation = useSharedValue(0);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 1], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 1], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const handleFlip = () => {
    rotation.value = withTiming(isFlipped ? 0 : 1, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
    onFlip();
  };

  return (
    <Pressable onPress={handleFlip} style={styles.container}>
      {/* Front */}
      <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
        <View style={styles.cardContent}>
          <Text
            variant="bodyItalic"
            size="xl"
            color="primary"
            style={styles.frontText}
          >
            {front}
          </Text>
          <Text variant="mono" size="xs" color="muted" uppercase style={styles.hintText}>
            Tap to reveal
          </Text>
        </View>
      </Animated.View>

      {/* Back */}
      <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
        <View style={styles.cardContent}>
          <Text
            variant="headingBold"
            size="lg"
            color="primary"
            style={styles.backText}
          >
            {back}
          </Text>
          {example && (
            <View style={styles.exampleContainer}>
              <Text variant="mono" size="xs" color="muted" uppercase>
                Example
              </Text>
              <Text variant="bodyItalic" size="sm" color="secondary" style={styles.exampleText}>
                "{example}"
              </Text>
            </View>
          )}
          {hint && (
            <View style={styles.hintContainer}>
              <Text variant="mono" size="xs" color="muted" uppercase>
                Hint
              </Text>
              <Text variant="body" size="sm" color="secondary">
                {hint}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 280,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    minHeight: 280,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    shadowColor: colors.borderStrong,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardFront: {
    backgroundColor: colors.surface,
  },
  cardBack: {
    backgroundColor: colors.surfaceRaised,
  },
  cardContent: {
    flex: 1,
    padding: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  frontText: {
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  backText: {
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  hintText: {
    textAlign: 'center',
  },
  exampleContainer: {
    width: '100%',
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 2,
    borderTopColor: colors.border,
    alignItems: 'center',
    gap: spacing[2],
  },
  exampleText: {
    textAlign: 'center',
  },
  hintContainer: {
    width: '100%',
    marginTop: spacing[3],
    alignItems: 'center',
    gap: spacing[1],
  },
});
