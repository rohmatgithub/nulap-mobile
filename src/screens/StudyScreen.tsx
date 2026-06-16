import { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Undo2 } from 'lucide-react-native';
import { colors, spacing, screenPadding } from '@/constants/theme';
import { Text, ProgressBar, Button, Modal } from '@/components/ui';
import { FlashCard, RatingButtons } from '@/components/flashcard';
import { useDueCards, useReviewCard } from '@/hooks';
import type { RootStackScreenProps } from '@/types/navigation';
import type { ReviewRating, StudyCard } from '@/types/deck';

interface RatingRecord {
  index: number;
  rating: ReviewRating;
  xp: number;
}

export function StudyScreen({ navigation, route }: RootStackScreenProps<'Study'>) {
  const deckId = Number(route.params.deckId);
  const initialStudyAhead = route.params.studyAhead ?? false;

  const [studyAhead, setStudyAhead] = useState(initialStudyAhead);
  const { data, isLoading, error, refetch } = useDueCards(deckId, studyAhead);
  const reviewCard = useReviewCard();

  const handleStudyAhead = () => {
    setStudyAhead(true);
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [ratings, setRatings] = useState<ReviewRating[]>([]);
  const [lastRating, setLastRating] = useState<RatingRecord | null>(null);
  const [sessionXP, setSessionXP] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [dailyGoalMet, setDailyGoalMet] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const cardStartTimeRef = useRef<number>(Date.now());

  const cards = data?.cards ?? [];
  const currentCard = cards[currentIndex];
  const cardsRemaining = cards.length - currentIndex;
  const isLastCard = currentIndex === cards.length - 1;
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRate = useCallback(
    async (rating: ReviewRating) => {
      if (!currentCard) return;

      const reviewTimeMs = Date.now() - cardStartTimeRef.current;
      let xpEarned = 0;

      try {
        const result = await reviewCard.mutateAsync({
          cardId: currentCard.id,
          deckId,
          rating,
          reviewTimeMs,
        });

        xpEarned = result.xp_earned;
        setSessionXP((prev) => prev + result.xp_earned);

        if (result.leveled_up) {
          setLeveledUp(true);
          setNewLevel(result.new_level);
        }
        if (result.daily_goal_met) {
          setDailyGoalMet(true);
        }
      } catch (err) {
        console.error('Failed to submit review:', err);
        Alert.alert('Error', 'Failed to submit review. Please try again.');
        return;
      }

      setLastRating({ index: currentIndex, rating, xp: xpEarned });
      setRatings((prev) => [...prev, rating]);

      if (isLastCard) {
        const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const allRatings = [...ratings, rating];

        navigation.replace('StudyDone', {
          deckId: String(deckId),
          ratings: allRatings.join(','),
          xp: String(sessionXP + xpEarned),
          duration: String(durationSeconds),
          levelUp: leveledUp || (xpEarned > 0 && newLevel > 0) ? '1' : '0',
          level: String(newLevel),
          goalMet: dailyGoalMet ? '1' : '0',
        });
      } else {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
        cardStartTimeRef.current = Date.now();
      }
    },
    [currentCard, currentIndex, isLastCard, deckId, ratings, navigation, reviewCard, sessionXP, leveledUp, newLevel, dailyGoalMet]
  );

  const handleUndo = useCallback(() => {
    if (lastRating && currentIndex > 0) {
      setCurrentIndex(lastRating.index);
      setRatings((prev) => prev.slice(0, -1));
      setSessionXP((prev) => Math.max(0, prev - lastRating.xp));
      setIsFlipped(true);
      setLastRating(null);
    }
  }, [lastRating, currentIndex]);

  const handleExit = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    setShowExitModal(false);
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
          <Text variant="body" color="muted" style={styles.loadingText}>
            Loading cards...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text variant="body" color="secondary">Failed to load cards</Text>
          <Button variant="secondary" onPress={() => refetch()} style={styles.retryButton}>
            Retry
          </Button>
          <Button variant="ghost" onPress={() => navigation.goBack()} style={styles.retryButton}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!cards.length) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text variant="heading" size="lg" color="primary" style={styles.emptyTitle}>
            {studyAhead ? 'No more cards' : 'No cards due'}
          </Text>
          <Text variant="body" color="secondary" style={styles.emptyText}>
            {studyAhead
              ? "You've reviewed all available cards in this deck."
              : "Great job! You've reviewed all your due cards."}
          </Text>
          <Button variant="primary" onPress={() => navigation.goBack()} style={styles.emptyButton}>
            Back to Deck
          </Button>
          {!studyAhead && (
            <Button variant="secondary" onPress={handleStudyAhead} style={styles.studyAheadButton}>
              Study Ahead
            </Button>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Progress Bar */}
      <ProgressBar progress={progress} height={4} color={colors.accentPrimary} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={handleExit} hitSlop={8}>
          <X size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text variant="mono" size="sm" color="muted">
            {cardsRemaining} cards remaining
          </Text>
          {studyAhead && (
            <Text variant="mono" size="xs" color="accent">
              Study Ahead
            </Text>
          )}
        </View>

        <View style={styles.headerActions}>
          {lastRating && (
            <Pressable style={styles.headerButton} onPress={handleUndo} hitSlop={8}>
              <Undo2 size={20} color={colors.textSecondary} strokeWidth={2} />
            </Pressable>
          )}
          {!lastRating && <View style={styles.headerButtonPlaceholder} />}
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {currentCard && (
          <FlashCard
            front={currentCard.front}
            back={currentCard.back}
            example={currentCard.example}
            hint={currentCard.hint}
            isFlipped={isFlipped}
            onFlip={handleFlip}
          />
        )}
      </View>

      {/* Rating Buttons */}
      <View style={styles.ratingContainer}>
        <RatingButtons
          onRate={handleRate}
          disabled={!isFlipped || reviewCard.isPending}
          visible={isFlipped}
        />
        {!isFlipped && (
          <Text variant="mono" size="xs" color="muted" style={styles.flipHint}>
            Tap card to reveal answer
          </Text>
        )}
      </View>

      {/* Exit Modal */}
      <Modal visible={showExitModal} onClose={() => setShowExitModal(false)} title="Exit Study Session?">
        <Text variant="body" color="secondary" style={styles.modalText}>
          You have reviewed {currentIndex} of {cards.length} cards. Your progress has been saved.
        </Text>
        <View style={styles.modalActions}>
          <Button variant="secondary" onPress={() => setShowExitModal(false)} style={styles.modalButton}>
            Continue
          </Button>
          <Button variant="danger" onPress={confirmExit} style={styles.modalButton}>
            Exit
          </Button>
        </View>
      </Modal>
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
    gap: spacing[4],
  },
  loadingText: {
    marginTop: spacing[2],
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
    padding: screenPadding,
  },
  emptyTitle: {
    marginBottom: spacing[2],
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  emptyButton: {
    minWidth: 200,
  },
  studyAheadButton: {
    minWidth: 200,
    marginTop: spacing[3],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: screenPadding,
    paddingVertical: spacing[3],
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: screenPadding,
    paddingVertical: spacing[4],
    justifyContent: 'center',
  },
  ratingContainer: {
    paddingHorizontal: screenPadding,
    paddingVertical: spacing[6],
    minHeight: 140,
    justifyContent: 'center',
  },
  flipHint: {
    textAlign: 'center',
  },
  modalText: {
    marginBottom: spacing[6],
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  modalButton: {
    minWidth: 100,
  },
});
