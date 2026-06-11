import { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, Search, Trash2, Pencil } from 'lucide-react-native';
import { colors, spacing, fonts, fontSize, screenPadding } from '@/constants/theme';
import { Text, HeadingText, MetaText, Card, Badge, Button, Input, Modal } from '@/components/ui';
import type { BadgeVariant } from '@/components/ui/Badge';
import { useDeck, useDeckCards, useDeleteCard, useUpdateDeck, useDeleteDeck } from '@/hooks';
import { formatShortDate } from '@/utils';
import type { CardListItem, CardStatus } from '@/types/deck';
import type { RootStackScreenProps } from '@/types/navigation';

const statusBadgeVariant: Record<CardStatus, BadgeVariant> = {
  new: 'default',
  learning: 'warning',
  review: 'tertiary',
  mature: 'success',
};

function StatBox({ value, label, color }: { value: number; label: string; color?: 'warning' | 'success' | 'accent' | 'muted' }) {
  return (
    <View style={styles.statBox}>
      <Text variant="headingBold" size="xl" color={color === 'muted' ? 'secondary' : color}>
        {String(value)}
      </Text>
      <Text variant="mono" size="xs" color="muted" uppercase>
        {label}
      </Text>
    </View>
  );
}

function CardRow({
  card,
  onEdit,
  onDelete,
}: {
  card: CardListItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card style={styles.cardRow}>
      <View style={styles.cardRowHeader}>
        <View style={styles.cardRowContent}>
          <Text variant="headingBold" size="sm" numberOfLines={2}>
            {card.front}
          </Text>
          <MetaText numberOfLines={2} style={styles.cardBack}>
            {card.back}
          </MetaText>
        </View>
        <Badge variant={statusBadgeVariant[card.status] ?? 'default'}>{card.status}</Badge>
      </View>

      {card.example && (
        <View style={styles.cardExample}>
          <Text variant="bodyItalic" size="xs" color="secondary" numberOfLines={1}>
            {card.example}
          </Text>
        </View>
      )}

      <View style={styles.cardRowFooter}>
        <MetaText>
          {card.due_date ? `Due ${formatShortDate(card.due_date)}` : 'Not scheduled'}
        </MetaText>
        <View style={styles.cardRowActions}>
          <Pressable style={styles.iconButton} onPress={onEdit} hitSlop={8}>
            <Pencil size={16} color={colors.textSecondary} strokeWidth={2} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={onDelete} hitSlop={8}>
            <Trash2 size={16} color={colors.danger} strokeWidth={2} />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

export function DeckDetailScreen({ navigation, route }: RootStackScreenProps<'DeckDetail'>) {
  const deckId = Number(route.params.deckId);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditDeck, setShowEditDeck] = useState(false);
  const [deckForm, setDeckForm] = useState({ name: '', description: '' });

  const { data: deck, isLoading: deckLoading, error: deckError, refetch: refetchDeck } = useDeck(deckId);
  const {
    data: cards,
    isLoading: cardsLoading,
    refetch: refetchCards,
    isRefetching,
  } = useDeckCards(deckId);
  const deleteCard = useDeleteCard();
  const updateDeck = useUpdateDeck();
  const deleteDeck = useDeleteDeck();

  const isLoading = deckLoading || cardsLoading;

  const filteredCards = (cards ?? []).filter(
    (card) =>
      card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.back.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
    refetchDeck();
    refetchCards();
  };

  const handleDeleteCard = (card: CardListItem) => {
    Alert.alert('Delete Card?', `"${card.front}" will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteCard.mutate(
            { id: card.id, deckId },
            {
              onError: () => Alert.alert('Error', 'Failed to delete card. Please try again.'),
            }
          ),
      },
    ]);
  };

  const handleOpenEditDeck = () => {
    if (!deck) return;
    setDeckForm({ name: deck.name, description: deck.description ?? '' });
    setShowEditDeck(true);
  };

  const handleSaveDeck = () => {
    if (!deckForm.name.trim() || updateDeck.isPending) return;
    updateDeck.mutate(
      {
        id: deckId,
        input: {
          name: deckForm.name.trim(),
          description: deckForm.description.trim() || undefined,
        },
      },
      {
        onSuccess: () => setShowEditDeck(false),
        onError: () => Alert.alert('Error', 'Failed to update deck. Please try again.'),
      }
    );
  };

  const handleDeleteDeck = () => {
    if (!deck) return;
    Alert.alert(
      'Delete Deck?',
      `This will permanently delete "${deck.name}" and all ${deck.card_count} cards. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            deleteDeck.mutate(deckId, {
              onSuccess: () => navigation.goBack(),
              onError: () => Alert.alert('Error', 'Failed to delete deck. Please try again.'),
            }),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  if (deckError || !deck) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text variant="body" color="secondary">Deck not found</Text>
          <Button variant="secondary" onPress={() => navigation.goBack()} style={styles.retryButton}>
            Back to Decks
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={8}>
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <View style={styles.headerContent}>
          <HeadingText numberOfLines={1}>{deck.name}</HeadingText>
          <MetaText>{deck.card_count} cards</MetaText>
        </View>
        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate('CardCreate', { deckId: route.params.deckId })}
        >
          <Plus size={20} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
      </View>

      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CardRow
            card={item}
            onEdit={() => navigation.navigate('CardEdit', { cardId: String(item.id) })}
            onDelete={() => handleDeleteCard(item)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.accentPrimary}
          />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {deck.description && (
              <MetaText style={styles.description}>{deck.description}</MetaText>
            )}

            {/* Status stats */}
            <View style={styles.statsRow}>
              <StatBox value={deck.new_count} label="New" color="muted" />
              <StatBox value={deck.learning_count} label="Learning" color="warning" />
              <StatBox value={deck.review_count} label="Review" color="accent" />
              <StatBox value={deck.mature_count} label="Mature" color="success" />
            </View>

            {deck.due_count > 0 && (
              <Button
                variant="primary"
                onPress={() => {
                  Alert.alert('Coming Soon', 'Study mode will be available soon.');
                }}
                style={styles.studyButton}
              >
                {`Study Now (${deck.due_count} due)`}
              </Button>
            )}

            {/* Deck actions */}
            <View style={styles.deckActions}>
              <Button variant="secondary" onPress={handleOpenEditDeck} style={styles.deckActionButton}>
                Edit Deck
              </Button>
              <Button variant="danger" onPress={handleDeleteDeck} style={styles.deckActionButton}>
                Delete
              </Button>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Search size={16} color={colors.textMuted} strokeWidth={2} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search cards..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="body" color="secondary">
              {searchQuery ? 'No cards found' : 'No cards yet'}
            </Text>
            <MetaText style={styles.emptyHint}>
              {searchQuery ? 'Try a different search term' : 'Add your first card to start learning'}
            </MetaText>
          </View>
        }
      />

      {/* Edit Deck Modal */}
      <Modal visible={showEditDeck} onClose={() => setShowEditDeck(false)} title="Edit Deck">
        <Input
          label="Deck Name"
          placeholder="Enter deck name"
          value={deckForm.name}
          onChangeText={(name) => setDeckForm((f) => ({ ...f, name }))}
          editable={!updateDeck.isPending}
          containerStyle={styles.modalField}
        />
        <Input
          label="Description (optional)"
          placeholder="Enter deck description"
          value={deckForm.description}
          onChangeText={(description) => setDeckForm((f) => ({ ...f, description }))}
          multiline
          editable={!updateDeck.isPending}
          containerStyle={styles.modalField}
        />
        <View style={styles.modalActions}>
          <Button
            variant="secondary"
            onPress={() => setShowEditDeck(false)}
            style={styles.modalButton}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onPress={handleSaveDeck}
            disabled={!deckForm.name.trim() || updateDeck.isPending}
            style={styles.modalButton}
          >
            {updateDeck.isPending ? 'Saving...' : 'Save'}
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
  headerContent: {
    flex: 1,
  },
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.accentPrimary,
  },
  list: {
    padding: screenPadding,
    paddingTop: 0,
    flexGrow: 1,
  },
  listHeader: {
    marginBottom: spacing[4],
  },
  description: {
    marginBottom: spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing[1],
  },
  studyButton: {
    marginBottom: spacing[4],
  },
  deckActions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  deckActionButton: {
    flex: 1,
  },
  modalField: {
    marginBottom: spacing[4],
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  modalButton: {
    minWidth: 100,
  },
  searchContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: spacing[3],
    zIndex: 1,
  },
  searchInput: {
    height: 48,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    paddingLeft: spacing[8],
    paddingRight: spacing[4],
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[8],
    gap: spacing[2],
  },
  emptyHint: {
    textAlign: 'center',
  },
  cardRow: {
    marginBottom: spacing[3],
  },
  cardRowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  cardRowContent: {
    flex: 1,
    gap: spacing[1],
  },
  cardBack: {
    marginTop: spacing[1],
  },
  cardExample: {
    marginTop: spacing[3],
    paddingLeft: spacing[2],
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  cardRowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[3],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cardRowActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  iconButton: {
    padding: spacing[1],
  },
});
