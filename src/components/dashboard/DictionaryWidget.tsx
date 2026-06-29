import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { BookMarked, Search, Volume2 } from 'lucide-react-native';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';
import { Card, Input, MetaText, Text } from '@/components/ui';
import { dictionaryService, type DictionaryEntry } from '@/services';

async function openAudio(url: string) {
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    Alert.alert('Audio unavailable', 'Pronunciation audio cannot be opened on this device.');
    return;
  }

  await Linking.openURL(url);
}

export function DictionaryWidget() {
  const [word, setWord] = useState('');
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await dictionaryService.lookup(word);
      setEntry(result);
    } catch (lookupError) {
      setEntry(null);
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : 'Failed to look up this word.'
      );
    } finally {
      setLoading(false);
    }
  };

  const primaryMeaning = entry?.meanings[0];
  const relatedMeanings = entry?.meanings.slice(1) || [];

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <BookMarked size={18} color={colors.accentPrimary} />
          <Text variant="mono" size="xs" color="secondary" uppercase>
            English Dictionary
          </Text>
        </View>
        <Text variant="display" size="lg" style={styles.title}>
          Look up a word.
        </Text>
        <MetaText style={styles.subtitle}>
          Get a concise definition, pronunciation, example, and related words.
        </MetaText>
      </View>

      <View style={styles.searchRow}>
        <Input
          value={word}
          onChangeText={setWord}
          placeholder="Try: resilient"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleLookup}
          containerStyle={styles.inputWrap}
        />
        <Pressable
          onPress={handleLookup}
          disabled={loading || !word.trim()}
          style={({ pressed }) => [
            styles.searchButton,
            pressed && styles.searchButtonPressed,
            (loading || !word.trim()) && styles.disabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Search size={20} color={colors.textPrimary} />
          )}
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text size="sm" color="danger">
            {error}
          </Text>
        </View>
      )}

      {entry && primaryMeaning && (
        <View style={styles.result}>
          <View style={styles.wordRow}>
            <View style={styles.wordInfo}>
              <View style={styles.wordTitleRow}>
                <Text variant="display" size="lg" style={styles.word}>
                  {entry.word}
                </Text>
                <View style={styles.partBadge}>
                  <Text variant="mono" size="xs" color="secondary" uppercase>
                    {primaryMeaning.partOfSpeech}
                  </Text>
                </View>
              </View>
              {entry.phonetic && (
                <MetaText size="xs" style={styles.phonetic}>
                  {entry.phonetic}
                </MetaText>
              )}
            </View>

            {entry.audioUrl && (
              <Pressable
                onPress={() => openAudio(entry.audioUrl as string)}
                style={styles.audioButton}
              >
                <Volume2 size={18} color={colors.textPrimary} />
              </Pressable>
            )}
          </View>

          <Text size="base" style={styles.definition}>
            {primaryMeaning.definition}
          </Text>

          {primaryMeaning.example && (
            <Text variant="bodyItalic" size="sm" color="secondary" style={styles.example}>
              &quot;{primaryMeaning.example}&quot;
            </Text>
          )}

          {primaryMeaning.synonyms.length > 0 && (
            <View style={styles.synonyms}>
              {primaryMeaning.synonyms.map((synonym) => (
                <Pressable
                  key={synonym}
                  onPress={() => setWord(synonym)}
                  style={styles.synonym}
                >
                  <MetaText size="xs">{synonym}</MetaText>
                </Pressable>
              ))}
            </View>
          )}

          {relatedMeanings.length > 0 && (
            <View style={styles.related}>
              {relatedMeanings.map((meaning) => (
                <View key={`${meaning.partOfSpeech}-${meaning.definition}`} style={styles.relatedItem}>
                  <Text variant="mono" size="xs" color="secondary" uppercase>
                    {meaning.partOfSpeech}
                  </Text>
                  <MetaText size="xs" style={styles.relatedText}>
                    {meaning.definition}
                  </MetaText>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[6],
  },
  header: {
    marginBottom: spacing[5],
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  title: {
    lineHeight: 34,
  },
  subtitle: {
    marginTop: spacing[2],
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'flex-start',
  },
  inputWrap: {
    flex: 1,
  },
  searchButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
  searchButtonPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  disabled: {
    opacity: 0.5,
  },
  errorBox: {
    marginTop: spacing[4],
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: 'rgba(192, 57, 43, 0.12)',
  },
  result: {
    marginTop: spacing[6],
    paddingTop: spacing[5],
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  wordInfo: {
    flex: 1,
  },
  wordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  word: {
    lineHeight: 34,
  },
  partBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: colors.border,
  },
  phonetic: {
    marginTop: spacing[1],
  },
  audioButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
  definition: {
    marginTop: spacing[4],
  },
  example: {
    marginTop: spacing[3],
    paddingLeft: spacing[3],
    borderLeftWidth: 2,
    borderLeftColor: colors.accentPrimary,
  },
  synonyms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  synonym: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  related: {
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing[3],
  },
  relatedItem: {
    gap: spacing[1],
  },
  relatedText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
  },
});
