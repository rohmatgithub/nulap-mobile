import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { colors, spacing, screenPadding } from '@/constants/theme';
import { Text, HeadingText, MetaText, Card, Badge, ProgressBar, Button } from '@/components/ui';
import { useDecks } from '@/hooks';
import { formatRelativeDate } from '@/utils';
import type { DeckListItem } from '@/types/deck';
import type { MainTabScreenProps } from '@/types/navigation';

function DeckCard({ deck, onPress }: { deck: DeckListItem; onPress: () => void }) {
  const hasDue = deck.due_count > 0;
  const progress = deck.card_count > 0
    ? Math.round((deck.mature_count / deck.card_count) * 100)
    : 0;

  return (
    <Card onPress={onPress} style={styles.deckCard}>
      <View style={styles.deckHeader}>
        <Text variant="headingBold" size="base" style={styles.deckName} numberOfLines={1}>
          {deck.name}
        </Text>
        {hasDue ? (
          <Badge variant="primary">{`${deck.due_count} due`}</Badge>
        ) : (
          <Badge variant="secondary">Up to date</Badge>
        )}
      </View>

      {deck.description && (
        <MetaText style={styles.deckDescription} numberOfLines={2}>
          {deck.description}
        </MetaText>
      )}

      <View style={styles.deckStats}>
        <MetaText>{deck.card_count} cards</MetaText>
        {deck.last_studied && (
          <>
            <MetaText>·</MetaText>
            <MetaText>Last studied {formatRelativeDate(deck.last_studied)}</MetaText>
          </>
        )}
      </View>

      <ProgressBar progress={progress} style={styles.deckProgress} />

      {hasDue && (
        <Button variant="primary" onPress={onPress} style={styles.studyButton}>
          Study Now
        </Button>
      )}
    </Card>
  );
}

export function DecksScreen({ navigation }: MainTabScreenProps<'Decks'>) {
  const { data: decks, isLoading, error, refetch, isRefetching } = useDecks();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text variant="body" color="secondary">Failed to load decks</Text>
          <Button variant="secondary" onPress={() => refetch()} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <HeadingText>Flashcard Decks</HeadingText>
          <MetaText>{decks?.length ?? 0} decks</MetaText>
        </View>
        <Pressable style={styles.addButton} onPress={() => {
          Alert.alert('Coming Soon', 'Create deck will be available soon.');
        }}>
          <Plus size={20} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
      </View>

      <FlatList
        data={decks ?? []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DeckCard
            deck={item}
            onPress={() => navigation.navigate('DeckDetail', { deckId: String(item.id) })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.accentPrimary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="body" color="secondary">No decks yet</Text>
          </View>
        }
      />
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[8],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: screenPadding,
    paddingVertical: spacing[4],
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
    gap: spacing[4],
  },
  deckCard: {
    marginBottom: spacing[1],
  },
  deckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  deckName: {
    flex: 1,
    marginRight: spacing[2],
  },
  deckDescription: {
    marginBottom: spacing[3],
  },
  deckStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  deckProgress: {
    marginBottom: spacing[3],
  },
  studyButton: {
    marginTop: spacing[1],
  },
});
