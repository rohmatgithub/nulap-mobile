import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { colors, spacing, screenPadding } from '@/constants/theme';
import { Text, HeadingText, Button } from '@/components/ui';
import { CardForm, CardFormValues } from '@/components/flashcard/CardForm';
import { useCreateCard } from '@/hooks';
import type { RootStackScreenProps } from '@/types/navigation';

export function CardCreateScreen({ navigation, route }: RootStackScreenProps<'CardCreate'>) {
  const deckId = Number(route.params?.deckId);
  const createCard = useCreateCard();

  if (!deckId) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text variant="body" color="secondary">No deck selected</Text>
          <Button variant="secondary" onPress={() => navigation.goBack()} style={styles.backFallback}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = (values: CardFormValues) => {
    createCard.mutate(
      {
        deck_id: deckId,
        front: values.front,
        back: values.back,
        example: values.example || undefined,
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: () => Alert.alert('Error', 'Failed to create card. Please try again.'),
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={8}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <HeadingText>Add Card</HeadingText>
      </View>

      <CardForm
        submitLabel="Add Card"
        isSubmitting={createCard.isPending}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
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
