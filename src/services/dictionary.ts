export interface DictionaryMeaning {
  partOfSpeech: string;
  definition: string;
  example?: string;
  synonyms: string[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  sourceUrl?: string;
  meanings: DictionaryMeaning[];
}

interface FreeDictionaryDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
}

interface FreeDictionaryMeaning {
  partOfSpeech: string;
  definitions: FreeDictionaryDefinition[];
  synonyms?: string[];
}

interface FreeDictionaryPhonetic {
  text?: string;
  audio?: string;
}

interface FreeDictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics?: FreeDictionaryPhonetic[];
  meanings?: FreeDictionaryMeaning[];
  sourceUrls?: string[];
}

function normalizeWord(word: string) {
  return word.trim().toLowerCase().replace(/[^a-z\s-]/g, '').replace(/\s+/g, ' ');
}

function getAudioUrl(phonetics?: FreeDictionaryPhonetic[]) {
  return phonetics?.find((phonetic) => phonetic.audio)?.audio;
}

function getPhonetic(entry: FreeDictionaryEntry) {
  return entry.phonetic || entry.phonetics?.find((phonetic) => phonetic.text)?.text;
}

function mapEntry(entry: FreeDictionaryEntry): DictionaryEntry {
  const meanings = (entry.meanings || [])
    .map((meaning): DictionaryMeaning | null => {
      const firstDefinition = meaning.definitions?.[0];
      if (!firstDefinition?.definition) return null;

      const synonyms = [
        ...(firstDefinition.synonyms || []),
        ...(meaning.synonyms || []),
      ];

      return {
        partOfSpeech: meaning.partOfSpeech,
        definition: firstDefinition.definition,
        example: firstDefinition.example,
        synonyms: Array.from(new Set(synonyms)).slice(0, 5),
      };
    })
    .filter((meaning): meaning is DictionaryMeaning => Boolean(meaning))
    .slice(0, 3);

  return {
    word: entry.word,
    phonetic: getPhonetic(entry),
    audioUrl: getAudioUrl(entry.phonetics),
    sourceUrl: entry.sourceUrls?.[0],
    meanings,
  };
}

export const dictionaryService = {
  async lookup(word: string): Promise<DictionaryEntry> {
    const normalizedWord = normalizeWord(word);

    if (!normalizedWord) {
      throw new Error('Enter an English word.');
    }

    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(normalizedWord)}`
    );

    if (response.status === 404) {
      throw new Error('Word not found.');
    }

    if (!response.ok) {
      throw new Error('Dictionary is unavailable right now.');
    }

    const entries = (await response.json()) as FreeDictionaryEntry[];
    const entry = entries[0];

    if (!entry) {
      throw new Error('Word not found.');
    }

    const mappedEntry = mapEntry(entry);
    if (mappedEntry.meanings.length === 0) {
      throw new Error('No definition available.');
    }

    return mappedEntry;
  },
};
