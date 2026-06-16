import { View, StyleSheet, Pressable } from 'react-native';
import { BookOpen, ChevronRight, Play } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import { Text, MetaText, Card } from '@/components/ui';
import type { DeckListItem } from '@/types/deck';

interface StudyQueueWidgetProps {
  decks: DeckListItem[];
  onStudyDeck: (deckId: number) => void;
  onViewAll: () => void;
}

function DeckRow({
  deck,
  onStudy,
}: {
  deck: DeckListItem;
  onStudy: () => void;
}) {
  return (
    <Pressable style={styles.deckRow} onPress={onStudy}>
      <View style={styles.deckInfo}>
        <Text variant="headingBold" size="sm" numberOfLines={1}>
          {deck.name}
        </Text>
        <MetaText size="xs">
          {deck.due_count} due · {deck.card_count} total
        </MetaText>
      </View>
      <View style={styles.studyButton}>
        <Play size={14} color={colors.base} fill={colors.base} />
      </View>
    </Pressable>
  );
}

export function StudyQueueWidget({ decks, onStudyDeck, onViewAll }: StudyQueueWidgetProps) {
  const dueDecks = decks.filter((d) => d.due_count > 0).slice(0, 4);
  const totalDue = decks.reduce((sum, d) => sum + d.due_count, 0);

  if (dueDecks.length === 0) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <BookOpen size={18} color={colors.accentTertiary} strokeWidth={2} />
            <Text variant="headingBold" size="base">Study Queue</Text>
          </View>
        </View>
        <View style={styles.emptyState}>
          <Text variant="body" size="sm" color="secondary">
            No cards due right now
          </Text>
          <MetaText size="xs">Check back later or add new cards</MetaText>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BookOpen size={18} color={colors.accentTertiary} strokeWidth={2} />
          <Text variant="headingBold" size="base">Study Queue</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text variant="mono" size="xs" style={{ color: colors.accentTertiary }}>
            {totalDue} cards
          </Text>
        </View>
      </View>

      <View style={styles.deckList}>
        {dueDecks.map((deck) => (
          <DeckRow key={deck.id} deck={deck} onStudy={() => onStudyDeck(deck.id)} />
        ))}
      </View>

      {decks.filter((d) => d.due_count > 0).length > 4 && (
        <Pressable style={styles.viewAllButton} onPress={onViewAll}>
          <Text variant="mono" size="xs" color="accent">
            View all decks
          </Text>
          <ChevronRight size={14} color={colors.accentPrimary} strokeWidth={2} />
        </Pressable>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  totalBadge: {
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.border,
  },
  deckList: {
    gap: spacing[2],
  },
  deckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deckInfo: {
    flex: 1,
    gap: spacing[1],
  },
  studyButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTertiary,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[4],
    gap: spacing[1],
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
