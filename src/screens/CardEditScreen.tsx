import { View, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { colors, spacing, screenPadding } from '@/constants/theme';
import { Text, HeadingText, Button } from '@/components/ui';
import { CardForm, CardFormValues } from '@/components/flashcard/CardForm';
import { useCard, useUpdateCard } from '@/hooks';
import type { RootStackScreenProps } from '@/types/navigation';

export function CardEditScreen({ navigation, route }: RootStackScreenProps<'CardEdit'>) {
  const cardId = Number(route.params.cardId);
  const { data: card, isLoading, error } = useCard(cardId);
  const updateCard = useUpdateCard();

  const handleSubmit = (values: CardFormValues) => {
    if (!card) return;
    updateCard.mutate(
      {
        id: cardId,
        deckId: card.deck_id,
        input: {
          front: values.front,
          back: values.back,
          example: values.example || undefined,
          // Preserve fields not exposed in the form
          hint: card.hint,
          notes: card.notes,
          tags: card.tags,
        },
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: () => Alert.alert('Error', 'Failed to update card. Please try again.'),
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={8}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <HeadingText>Edit Card</HeadingText>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      ) : error || !card ? (
        <View style={styles.errorContainer}>
          <Text variant="body" color="secondary">Card not found</Text>
          <Button variant="secondary" onPress={() => navigation.goBack()} style={styles.backFallback}>
            Go Back
          </Button>
        </View>
      ) : (
        <CardForm
          initialValues={{
            front: card.front,
            back: card.back,
            example: card.example ?? '',
          }}
          submitLabel="Save Changes"
          isSubmitting={updateCard.isPending}
          onSubmit={handleSubmit}
        />
      )}
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
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: screenPadding,
  },
  backFallback: {
    marginTop: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: screenPadding,
    paddingVertical: spacing[4],
    gap: spacing[3],
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
