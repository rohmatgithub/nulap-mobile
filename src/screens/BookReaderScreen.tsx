import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, List, MessageSquare, CreditCard, Check } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { colors, spacing, fonts } from '@/constants/theme';
import { Text, MetaText, Modal, ProgressBar, Button } from '@/components/ui';
import { ReaderHeader, ReaderSettings, WebViewReader } from '@/components/book';
import { bookService } from '@/services/book';
import type { ReaderSettingsData } from '@/components/book';
import {
  useBookProgress,
  useBookChapters,
  useBookHighlights,
  useBookBookmarks,
  useUpdateBookProgress,
  useCreateHighlight,
  useUpdateHighlight,
  useDeleteHighlight,
  useCreateBookmark,
  useDeleteBookmark,
  useDecks,
  useCreateCard,
} from '@/hooks';
import type { RootStackScreenProps } from '@/types/navigation';
import type { Chapter, Highlight, HighlightColor, CreateHighlightInput } from '@/types/book';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const HIGHLIGHT_BG_COLORS: Record<HighlightColor, string> = {
  yellow: 'rgba(196, 169, 81, 0.4)',
  green: 'rgba(74, 124, 89, 0.4)',
  blue: 'rgba(90, 143, 168, 0.4)',
  red: 'rgba(184, 74, 74, 0.4)',
};

const DEFAULT_SETTINGS: ReaderSettingsData = {
  fontSize: 18,
  lineHeight: 1.8,
  fontFamily: 'serif',
  theme: 'dark',
};

interface NoteModalState {
  visible: boolean;
  highlightId?: number;
  initialNote?: string;
  selectedText?: string;
  selectedColor?: HighlightColor;
}

function ChapterListModal({
  visible,
  chapters,
  currentChapter,
  onSelect,
  onClose,
}: {
  visible: boolean;
  chapters: Chapter[];
  currentChapter: number;
  onSelect: (num: number) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} onClose={onClose} title="Chapters">
      <ScrollView style={styles.chapterList} showsVerticalScrollIndicator={false}>
        {chapters.map((chapter) => (
          <Pressable
            key={chapter.id}
            style={[
              styles.chapterItem,
              chapter.chapter_number === currentChapter && styles.chapterItemActive,
            ]}
            onPress={() => onSelect(chapter.chapter_number)}
          >
            <View style={styles.chapterItemContent}>
              <Text
                variant="mono"
                size="xs"
                color={chapter.chapter_number === currentChapter ? 'primary' : 'secondary'}
              >
                {chapter.chapter_number}.
              </Text>
              <Text
                variant="body"
                size="sm"
                color={chapter.chapter_number === currentChapter ? 'primary' : 'secondary'}
                numberOfLines={2}
                style={styles.chapterTitle}
              >
                {chapter.title}
              </Text>
            </View>
            <MetaText size="xs">{chapter.reading_time_minutes} min</MetaText>
          </Pressable>
        ))}
      </ScrollView>
    </Modal>
  );
}

function HighlightsListModal({
  visible,
  highlights,
  onSelect,
  onClose,
  onDelete,
}: {
  visible: boolean;
  highlights: Highlight[];
  onSelect: (highlight: Highlight) => void;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  return (
    <Modal visible={visible} onClose={onClose} title="Highlights">
      <ScrollView style={styles.chapterList} showsVerticalScrollIndicator={false}>
        {highlights.length === 0 ? (
          <View style={styles.emptyHighlights}>
            <MetaText>No highlights yet</MetaText>
            <MetaText size="xs">Select text while reading to highlight</MetaText>
          </View>
        ) : (
          highlights.map((highlight) => (
            <Pressable
              key={highlight.id}
              style={[
                styles.highlightItem,
                { backgroundColor: HIGHLIGHT_BG_COLORS[highlight.color] },
              ]}
              onPress={() => onSelect(highlight)}
              onLongPress={() => {
                Alert.alert('Delete Highlight?', `"${highlight.text.substring(0, 50)}..."`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => onDelete(highlight.id) },
                ]);
              }}
            >
              <Text variant="bodyItalic" size="sm" numberOfLines={3}>
                "{highlight.text}"
              </Text>
              {highlight.note && (
                <View style={styles.highlightNote}>
                  <MessageSquare size={12} color={colors.textSecondary} />
                  <MetaText size="xs" numberOfLines={1}>{highlight.note}</MetaText>
                </View>
              )}
            </Pressable>
          ))
        )}
      </ScrollView>
    </Modal>
  );
}

function NoteModal({
  visible,
  initialNote,
  selectedText,
  onSave,
  onClose,
}: {
  visible: boolean;
  initialNote?: string;
  selectedText?: string;
  onSave: (note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState(initialNote || '');

  useEffect(() => {
    if (visible) {
      setNote(initialNote || '');
    }
  }, [visible, initialNote]);

  return (
    <Modal visible={visible} onClose={onClose} title="Add Note">
      {selectedText && (
        <View style={styles.notePreview}>
          <Text variant="bodyItalic" size="sm" numberOfLines={3} color="secondary">
            "{selectedText}"
          </Text>
        </View>
      )}
      <TextInput
        style={styles.noteInput}
        value={note}
        onChangeText={setNote}
        placeholder="Write your note..."
        placeholderTextColor={colors.textMuted}
        multiline
        autoFocus
      />
      <View style={styles.noteActions}>
        <Button variant="secondary" onPress={onClose} style={styles.noteButton}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onPress={() => {
            onSave(note);
            onClose();
          }}
          style={styles.noteButton}
        >
          Save Note
        </Button>
      </View>
    </Modal>
  );
}

const HIGHLIGHT_COLOR_OPTIONS: { color: HighlightColor; label: string }[] = [
  { color: 'yellow', label: 'Yellow' },
  { color: 'green', label: 'Green' },
  { color: 'blue', label: 'Blue' },
  { color: 'red', label: 'Red' },
];

// Parse stored note to extract pure note and flashcard definition
function parseStoredNote(note: string | undefined): { pureNote: string; flashcardDef: string } {
  if (!note) return { pureNote: '', flashcardDef: '' };

  // Check if it has both note and flashcard (separated by ---)
  if (note.includes('\n---\n📚 ')) {
    const parts = note.split('\n---\n📚 ');
    return { pureNote: parts[0], flashcardDef: parts[1] || '' };
  }

  // Check if it's only flashcard definition
  if (note.startsWith('📚 ')) {
    return { pureNote: '', flashcardDef: note.slice(3) };
  }

  // It's just a pure note
  return { pureNote: note, flashcardDef: '' };
}

interface HighlightModalProps {
  visible: boolean;
  selectedText?: string;
  decks: Array<{ id: number; name: string }>;
  decksLoading: boolean;
  existingHighlight?: Highlight;
  onSave: (data: {
    color: HighlightColor;
    note?: string;
    flashcard?: { deckId: number; front: string; back: string };
  }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function HighlightModal({
  visible,
  selectedText,
  decks,
  decksLoading,
  existingHighlight,
  onSave,
  onDelete,
  onClose,
}: HighlightModalProps) {
  const isEditMode = !!existingHighlight;
  const [selectedColor, setSelectedColor] = useState<HighlightColor>('yellow');
  const [note, setNote] = useState('');
  const [enableFlashcard, setEnableFlashcard] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [flashcardBack, setFlashcardBack] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (visible) {
      if (existingHighlight) {
        const parsedNote = parseStoredNote(existingHighlight.note);
        setSelectedColor(existingHighlight.color);
        setNote(parsedNote.pureNote);
        setEnableFlashcard(!!existingHighlight.flashcard_id || !!parsedNote.flashcardDef);
        setFlashcardBack(parsedNote.flashcardDef);
      } else {
        setSelectedColor('yellow');
        setNote('');
        setEnableFlashcard(false);
        setFlashcardBack('');
      }
      setShowDeleteConfirm(false);
      if (decks.length > 0) {
        setSelectedDeckId(decks[0].id);
      }
    }
  }, [visible, decks, existingHighlight]);

  const canSave = !enableFlashcard || (selectedDeckId && flashcardBack.trim());

  const handleSave = () => {
    const data: Parameters<typeof onSave>[0] = { color: selectedColor };

    if (note.trim()) {
      data.note = note.trim();
    }

    if (enableFlashcard && selectedDeckId && flashcardBack.trim() && selectedText) {
      data.flashcard = {
        deckId: selectedDeckId,
        front: selectedText,
        back: flashcardBack.trim(),
      };
    }

    onSave(data);
  };

  return (
    <Modal visible={visible} onClose={onClose} title={isEditMode ? "Edit Highlight" : "Highlight"}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {selectedText && (
          <View style={styles.highlightTextPreview}>
            <MetaText size="xs" style={styles.previewLabel}>SELECTED TEXT</MetaText>
            <Text variant="bodyItalic" size="sm" numberOfLines={4} color="secondary">
              "{selectedText}"
            </Text>
          </View>
        )}

        <View style={styles.colorSection}>
          <MetaText size="xs" style={styles.sectionLabel}>COLOR</MetaText>
          <View style={styles.colorRow}>
            {HIGHLIGHT_COLOR_OPTIONS.map(({ color, label }) => (
              <Pressable
                key={color}
                style={[
                  styles.colorCircle,
                  { backgroundColor: HIGHLIGHT_BG_COLORS[color] },
                  selectedColor === color && styles.colorCircleSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Check size={16} color={colors.textPrimary} strokeWidth={3} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.noteSection}>
          <MetaText size="xs" style={styles.sectionLabel}>NOTE (OPTIONAL)</MetaText>
          <TextInput
            style={styles.highlightNoteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Add your thoughts..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.flashcardSection}>
          <Pressable
            style={styles.flashcardToggle}
            onPress={() => setEnableFlashcard(!enableFlashcard)}
          >
            <View style={[styles.checkbox, enableFlashcard && styles.checkboxChecked]}>
              {enableFlashcard && <Check size={14} color={colors.textPrimary} strokeWidth={3} />}
            </View>
            <CreditCard size={18} color={colors.textSecondary} />
            <Text variant="body" size="sm">Save as Flashcard</Text>
          </Pressable>

          {enableFlashcard && (
            <View style={styles.flashcardFields}>
              <View style={styles.fieldGroup}>
                <MetaText size="xs" style={styles.sectionLabel}>DECK</MetaText>
                {decksLoading ? (
                  <ActivityIndicator size="small" color={colors.accentPrimary} />
                ) : decks.length === 0 ? (
                  <Text variant="body" size="sm" color="secondary">
                    No decks found. Create a deck first.
                  </Text>
                ) : (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedDeckId}
                      onValueChange={(value) => setSelectedDeckId(value)}
                      style={styles.picker}
                      dropdownIconColor={colors.textSecondary}
                      mode="dropdown"
                      itemStyle={styles.pickerItem}
                      numberOfLines={1}
                    >
                      {decks.map((deck) => (
                        <Picker.Item
                          key={deck.id}
                          label={deck.name}
                          value={deck.id}
                          style={styles.pickerItemStyle}
                          color={Platform.OS === 'android' ? colors.textPrimary : undefined}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <MetaText size="xs" style={styles.sectionLabel}>FRONT (WORD/PHRASE)</MetaText>
                <View style={styles.flashcardFront}>
                  <Text variant="body" size="sm" color="secondary" numberOfLines={2}>
                    {selectedText?.slice(0, 100)}{(selectedText?.length || 0) > 100 ? '...' : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <MetaText size="xs" style={styles.sectionLabel}>BACK (DEFINITION) *</MetaText>
                <TextInput
                  style={styles.highlightNoteInput}
                  value={flashcardBack}
                  onChangeText={setFlashcardBack}
                  placeholder="Definition, translation, or meaning..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          )}
        </View>

        {/* Delete Confirmation */}
        {showDeleteConfirm && isEditMode && onDelete && (
          <View style={styles.deleteConfirmSection}>
            <Text variant="body" size="sm" color="primary">
              Are you sure you want to delete this highlight?
            </Text>
            {existingHighlight?.flashcard_id && (
              <Text variant="body" size="xs" color="secondary" style={{ marginTop: spacing[2] }}>
                Note: The linked flashcard will NOT be deleted.
              </Text>
            )}
            <View style={styles.deleteConfirmActions}>
              <Button
                variant="secondary"
                onPress={() => setShowDeleteConfirm(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onPress={() => {
                  onDelete();
                  setShowDeleteConfirm(false);
                }}
                style={{ flex: 1, backgroundColor: colors.danger, borderColor: colors.danger }}
              >
                Delete
              </Button>
            </View>
          </View>
        )}

        {/* Actions */}
        {!showDeleteConfirm && (
          <View style={styles.highlightModalActions}>
            {isEditMode && onDelete ? (
              <Pressable
                style={styles.deleteButton}
                onPress={() => setShowDeleteConfirm(true)}
              >
                <Text variant="mono" size="xs" style={{ color: colors.danger }}>
                  Delete
                </Text>
              </Pressable>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <View style={styles.saveActions}>
              <Button variant="secondary" onPress={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onPress={handleSave}
                disabled={!canSave}
              >
                {isEditMode ? 'Update' : 'Save'}
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
}

export function BookReaderScreen({ navigation, route }: RootStackScreenProps<'BookReader'>) {
  const bookId = Number(route.params.bookId);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [settings, setSettings] = useState<ReaderSettingsData>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [currentChapterNumber, setCurrentChapterNumber] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [progress, setProgress] = useState(0);
  const [noteModal, setNoteModal] = useState<NoteModalState>({ visible: false });
  const [highlightModal, setHighlightModal] = useState<{
    visible: boolean;
    text?: string;
    paragraphIndex?: number;
    startOffset?: number;
    endOffset?: number;
    editingHighlight?: Highlight;
  }>({ visible: false });
  const [clickedHighlight, setClickedHighlight] = useState<{
    highlight: Highlight;
    position: { x: number; y: number };
  } | null>(null);
  const [pendingHighlight, setPendingHighlight] = useState<{
    text: string;
    color: HighlightColor;
  } | null>(null);

  const { data: book, isLoading: bookLoading } = useBookProgress(bookId);
  const { data: chapters } = useBookChapters(bookId);
  const { data: highlights, refetch: refetchHighlights } = useBookHighlights(bookId);
  const { data: bookmarks } = useBookBookmarks(bookId);
  const { data: decks, isLoading: decksLoading } = useDecks();
  const updateProgress = useUpdateBookProgress();
  const createHighlight = useCreateHighlight();
  const updateHighlight = useUpdateHighlight();
  const deleteHighlight = useDeleteHighlight();
  const createBookmark = useCreateBookmark();
  const deleteBookmark = useDeleteBookmark();
  const createCard = useCreateCard();

  const isChapterBased = book?.content_type === 'chapters';
  const currentChapter = useMemo(() => {
    if (!isChapterBased || !chapters) return null;
    return chapters.find((c) => c.chapter_number === currentChapterNumber);
  }, [isChapterBased, chapters, currentChapterNumber]);

  const content = useMemo(() => {
    if (isChapterBased && currentChapter) {
      return currentChapter.content;
    }
    return book?.content || '';
  }, [isChapterBased, currentChapter, book?.content]);

  const isCurrentPageBookmarked = useMemo(() => {
    if (!bookmarks) return false;
    return bookmarks.some((b) =>
      isChapterBased
        ? b.chapter_id === currentChapter?.id
        : Math.abs((b.scroll_position || 0) - scrollPosition) < 100
    );
  }, [bookmarks, isChapterBased, currentChapter, scrollPosition]);

  // Load initial state from book progress
  useEffect(() => {
    if (book) {
      if (book.current_chapter_number && book.current_chapter_number !== currentChapterNumber) {
        setCurrentChapterNumber(book.current_chapter_number);
      }
      setProgress(book.progress || 0);
    }
  }, [book]);

  // Reset scroll position when chapter changes
  useEffect(() => {
    setScrollPosition(0);
  }, [currentChapterNumber]);

  const saveProgress = useCallback(
    (newProgress: number, newScrollPosition: number, chapterNum?: number) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        updateProgress.mutate({
          bookId,
          input: {
            current_chapter_number: chapterNum || currentChapterNumber,
            scroll_position: newScrollPosition,
            progress: newProgress,
          },
        });
      }, 1000);
    },
    [bookId, currentChapterNumber, updateProgress]
  );

  const goToChapter = useCallback(
    (num: number) => {
      if (!chapters) return;
      if (num >= 1 && num <= chapters.length) {
        setCurrentChapterNumber(num);
        setShowChapters(false);
        saveProgress(progress, 0, num);
      }
    },
    [chapters, progress, saveProgress]
  );

  const handleBookmark = useCallback(() => {
    if (isCurrentPageBookmarked) {
      const bookmark = bookmarks?.find((b) =>
        isChapterBased
          ? b.chapter_id === currentChapter?.id
          : Math.abs((b.scroll_position || 0) - scrollPosition) < 100
      );
      if (bookmark) {
        deleteBookmark.mutate({ bookId, bookmarkId: bookmark.id });
      }
    } else {
      createBookmark.mutate({
        bookId,
        input: {
          book_id: bookId,
          chapter_id: currentChapter?.id,
          scroll_position: scrollPosition,
          title: isChapterBased ? currentChapter?.title : undefined,
        },
      });
    }
  }, [
    isCurrentPageBookmarked,
    bookmarks,
    isChapterBased,
    currentChapter,
    scrollPosition,
    bookId,
    createBookmark,
    deleteBookmark,
  ]);

  const handleSaveNote = useCallback(
    async (note: string) => {
      if (noteModal.highlightId) {
        try {
          await updateHighlight.mutateAsync({
            bookId,
            highlightId: noteModal.highlightId,
            input: { note },
          });
          refetchHighlights();
        } catch (error) {
          Alert.alert('Error', 'Failed to update note');
        }
      } else if (pendingHighlight) {
        const input: CreateHighlightInput = {
          book_id: bookId,
          chapter_id: currentChapter?.id,
          text: pendingHighlight.text,
          color: pendingHighlight.color,
          start_offset: 0,
          end_offset: pendingHighlight.text.length,
          note,
        };

        try {
          await createHighlight.mutateAsync({ bookId, input });
          refetchHighlights();
          setPendingHighlight(null);
        } catch (error) {
          Alert.alert('Error', 'Failed to create highlight with note');
        }
      }
      setNoteModal({ visible: false });
    },
    [noteModal.highlightId, pendingHighlight, bookId, currentChapter, createHighlight, updateHighlight, refetchHighlights]
  );

  const handleDeleteHighlight = useCallback(
    async (highlightId: number) => {
      try {
        await deleteHighlight.mutateAsync({ bookId, highlightId });
        refetchHighlights();
      } catch (error) {
        Alert.alert('Error', 'Failed to delete highlight');
      }
    },
    [bookId, deleteHighlight, refetchHighlights]
  );

  const handleTextSelected = useCallback(
    async (text: string, color: HighlightColor, paragraphIndex: number, startOffset: number, endOffset: number) => {
      if (!text) return;

      const input: CreateHighlightInput = {
        book_id: bookId,
        chapter_id: currentChapter?.id,
        text,
        color,
        paragraph_index: paragraphIndex,
        start_offset: startOffset,
        end_offset: endOffset,
      };

      try {
        await createHighlight.mutateAsync({ bookId, input });
        refetchHighlights();
      } catch (error) {
        Alert.alert('Error', 'Failed to create highlight');
      }
    },
    [bookId, currentChapter, createHighlight, refetchHighlights]
  );

  const handleWebViewScroll = useCallback(
    (scrollY: number, contentHeight: number, viewHeight: number) => {
      setScrollPosition(scrollY);
      const maxScroll = contentHeight - viewHeight;

      let newProgress: number;
      if (isChapterBased && chapters) {
        const chapterProgress = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
        const chaptersCompleted = currentChapterNumber - 1;
        newProgress = ((chaptersCompleted + chapterProgress / 100) / chapters.length) * 100;
      } else {
        newProgress = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
      }

      setProgress(Math.min(100, Math.max(0, newProgress)));
      saveProgress(newProgress, scrollY);
    },
    [isChapterBased, chapters, currentChapterNumber, saveProgress]
  );

  const handleOpenMoreOptions = useCallback(
    (text: string, paragraphIndex: number, startOffset: number, endOffset: number) => {
      setHighlightModal({
        visible: true,
        text,
        paragraphIndex,
        startOffset,
        endOffset,
      });
    },
    []
  );

  const handleSaveHighlightWithNote = useCallback(
    async (data: {
      color: HighlightColor;
      note?: string;
      flashcard?: { deckId: number; front: string; back: string };
    }) => {
      if (!highlightModal.text) return;

      // Build note content like web does
      let noteContent: string | undefined;
      if (data.note && data.flashcard) {
        noteContent = `${data.note}\n---\n📚 ${data.flashcard.back}`;
      } else if (data.flashcard) {
        noteContent = `📚 ${data.flashcard.back}`;
      } else if (data.note) {
        noteContent = data.note;
      }

      const input: CreateHighlightInput = {
        book_id: bookId,
        chapter_id: currentChapter?.id,
        text: highlightModal.text,
        color: data.color,
        paragraph_index: highlightModal.paragraphIndex,
        start_offset: highlightModal.startOffset || 0,
        end_offset: highlightModal.endOffset || highlightModal.text.length,
        note: noteContent,
      };

      try {
        const highlight = await createHighlight.mutateAsync({ bookId, input });

        // Create flashcard linked to highlight
        if (data.flashcard && highlight) {
          await bookService.createCardFromHighlight(
            bookId,
            highlight.id,
            data.flashcard.deckId,
            data.flashcard.front,
            data.flashcard.back
          );
        }

        refetchHighlights();
        setHighlightModal({ visible: false });
      } catch (error) {
        Alert.alert('Error', 'Failed to create highlight');
      }
    },
    [bookId, currentChapter, highlightModal, createHighlight, createCard, refetchHighlights]
  );

  const handleHighlightClick = useCallback(
    (highlight: Highlight, position: { x: number; y: number }) => {
      setClickedHighlight({ highlight, position });
    },
    []
  );

  const handleEditHighlight = useCallback(() => {
    if (!clickedHighlight) return;
    setHighlightModal({
      visible: true,
      text: clickedHighlight.highlight.text,
      editingHighlight: clickedHighlight.highlight,
    });
    setClickedHighlight(null);
  }, [clickedHighlight]);

  const handleUpdateHighlight = useCallback(
    async (data: {
      color: HighlightColor;
      note?: string;
      flashcard?: { deckId: number; front: string; back: string };
    }) => {
      if (!highlightModal.editingHighlight) return;

      try {
        await updateHighlight.mutateAsync({
          bookId,
          highlightId: highlightModal.editingHighlight.id,
          input: { color: data.color, note: data.note },
        });

        // Create flashcard if enabled and doesn't exist
        if (data.flashcard && !highlightModal.editingHighlight.flashcard_id) {
          await createCard.mutateAsync({
            deck_id: data.flashcard.deckId,
            front: data.flashcard.front,
            back: data.flashcard.back,
          });
        }

        refetchHighlights();
        setHighlightModal({ visible: false });
      } catch (error) {
        Alert.alert('Error', 'Failed to update highlight');
      }
    },
    [bookId, highlightModal.editingHighlight, updateHighlight, createCard, refetchHighlights]
  );

  const handleDeleteHighlightFromModal = useCallback(async () => {
    if (!highlightModal.editingHighlight) return;

    try {
      await deleteHighlight.mutateAsync({
        bookId,
        highlightId: highlightModal.editingHighlight.id,
      });
      refetchHighlights();
      setHighlightModal({ visible: false });
    } catch (error) {
      Alert.alert('Error', 'Failed to delete highlight');
    }
  }, [bookId, highlightModal.editingHighlight, deleteHighlight, refetchHighlights]);

  const themeColors = useMemo(() => {
    switch (settings.theme) {
      case 'sepia':
        return {
          bg: '#2A2318',
          text: '#E8DFC9',
          muted: '#A09080',
          border: '#4A4038',
        };
      case 'light':
        return {
          bg: '#F5F3ED',
          text: '#1A1A18',
          muted: '#6A6A5A',
          border: '#D5D5C8',
        };
      default:
        return {
          bg: colors.base,
          text: colors.textPrimary,
          muted: colors.textSecondary,
          border: colors.border,
        };
    }
  }, [settings.theme]);

  if (bookLoading || !book) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  const hasPrevChapter = isChapterBased && currentChapterNumber > 1;
  const hasNextChapter = isChapterBased && chapters && currentChapterNumber < chapters.length;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ReaderHeader
          title={isChapterBased && currentChapter ? currentChapter.title : book.title}
          author={book.author}
          progress={progress}
          highlightsCount={highlights?.length || 0}
          onBack={() => navigation.goBack()}
          onSettings={() => setShowSettings(true)}
          onBookmark={handleBookmark}
          onHighlights={() => setShowHighlights(true)}
          isBookmarked={isCurrentPageBookmarked}
        />

        <ProgressBar
          progress={progress}
          color={colors.accentSecondary}
          style={styles.progressBar}
          height={3}
        />

        <View style={styles.content}>
          <WebViewReader
            content={content}
            settings={settings}
            highlights={highlights}
            onTextSelected={handleTextSelected}
            onOpenMoreOptions={handleOpenMoreOptions}
            onHighlightClick={handleHighlightClick}
            onScroll={handleWebViewScroll}
          />
        </View>

        {isChapterBased && chapters && (
          <View style={[styles.chapterNav, { borderTopColor: themeColors.border }]}>
            <Pressable
              style={[styles.chapterNavButton, !hasPrevChapter && styles.chapterNavButtonDisabled]}
              onPress={() => goToChapter(currentChapterNumber - 1)}
              disabled={!hasPrevChapter}
            >
              <ChevronLeft
                size={20}
                color={hasPrevChapter ? themeColors.text : themeColors.muted}
              />
            </Pressable>

            <Pressable
              style={styles.chapterNavCenter}
              onPress={() => setShowChapters(true)}
            >
              <List size={16} color={themeColors.muted} />
              <Text variant="mono" size="xs" color="secondary">
                {currentChapterNumber} / {chapters.length}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.chapterNavButton, !hasNextChapter && styles.chapterNavButtonDisabled]}
              onPress={() => goToChapter(currentChapterNumber + 1)}
              disabled={!hasNextChapter}
            >
              <ChevronRight
                size={20}
                color={hasNextChapter ? themeColors.text : themeColors.muted}
              />
            </Pressable>
          </View>
        )}
      </SafeAreaView>

      <ReaderSettings
        visible={showSettings}
        settings={settings}
        onClose={() => setShowSettings(false)}
        onChange={setSettings}
      />

      {isChapterBased && chapters && (
        <ChapterListModal
          visible={showChapters}
          chapters={chapters}
          currentChapter={currentChapterNumber}
          onSelect={goToChapter}
          onClose={() => setShowChapters(false)}
        />
      )}

      <HighlightsListModal
        visible={showHighlights}
        highlights={highlights || []}
        onSelect={(h) => {
          setNoteModal({
            visible: true,
            highlightId: h.id,
            initialNote: h.note,
            selectedText: h.text,
          });
          setShowHighlights(false);
        }}
        onClose={() => setShowHighlights(false)}
        onDelete={handleDeleteHighlight}
      />

      <NoteModal
        visible={noteModal.visible}
        initialNote={noteModal.initialNote}
        selectedText={noteModal.selectedText}
        onSave={handleSaveNote}
        onClose={() => {
          setNoteModal({ visible: false });
          setPendingHighlight(null);
        }}
      />

      {/* Highlight Tooltip/Popover */}
      {clickedHighlight && (
        <>
          <Pressable
            style={styles.tooltipOverlay}
            onPress={() => setClickedHighlight(null)}
          />
          <View
            style={[
              styles.highlightTooltip,
              {
                left: Math.min(
                  Math.max(clickedHighlight.position.x - 125, 16),
                  Dimensions.get('window').width - 266
                ),
                top: Math.min(clickedHighlight.position.y, Dimensions.get('window').height - 200),
              },
            ]}
          >
            {clickedHighlight.highlight.note && (
              <View style={styles.tooltipNoteSection}>
                <Text variant="body" size="sm" color="primary">
                  {clickedHighlight.highlight.note}
                </Text>
              </View>
            )}
            {clickedHighlight.highlight.flashcard_id && (
              <View style={styles.tooltipFlashcardBadge}>
                <CreditCard size={12} color={colors.accentTertiary} />
                <MetaText size="xs">Linked to Flashcard</MetaText>
              </View>
            )}
            <View style={styles.tooltipActions}>
              <Pressable style={styles.tooltipEditBtn} onPress={handleEditHighlight}>
                <MessageSquare size={14} color={colors.textPrimary} />
                <Text variant="mono" size="xs">Edit</Text>
              </Pressable>
              <Pressable
                style={styles.tooltipCloseBtn}
                onPress={() => setClickedHighlight(null)}
              >
                <Text variant="mono" size="xs" color="secondary">Close</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}

      <HighlightModal
        visible={highlightModal.visible}
        selectedText={highlightModal.text}
        decks={decks?.map(d => ({ id: d.id, name: d.name })) || []}
        decksLoading={decksLoading}
        existingHighlight={highlightModal.editingHighlight}
        onSave={highlightModal.editingHighlight ? handleUpdateHighlight : handleSaveHighlightWithNote}
        onDelete={highlightModal.editingHighlight ? handleDeleteHighlightFromModal : undefined}
        onClose={() => setHighlightModal({ visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    borderRadius: 0,
  },
  content: {
    flex: 1,
  },
  chapterNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  chapterNavButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNavButtonDisabled: {
    opacity: 0.4,
  },
  chapterNavCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  chapterList: {
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chapterItemActive: {
    backgroundColor: colors.accentPrimaryAlpha,
  },
  chapterItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  chapterTitle: {
    flex: 1,
  },
  emptyHighlights: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    gap: spacing[2],
  },
  highlightItem: {
    padding: spacing[3],
    marginBottom: spacing[2],
    borderLeftWidth: 3,
    borderLeftColor: colors.accentTertiary,
  },
  highlightNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  notePreview: {
    backgroundColor: colors.surfaceRaised,
    padding: spacing[3],
    marginBottom: spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: colors.accentTertiary,
  },
  noteInput: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    color: colors.textPrimary,
    padding: spacing[3],
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[3],
    marginTop: spacing[4],
  },
  noteButton: {
    minWidth: 100,
  },
  highlightTextPreview: {
    backgroundColor: colors.surfaceRaised,
    padding: spacing[3],
    marginBottom: spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: colors.accentTertiary,
  },
  previewLabel: {
    marginBottom: spacing[2],
    letterSpacing: 1,
  },
  colorSection: {
    marginBottom: spacing[4],
  },
  sectionLabel: {
    marginBottom: spacing[2],
    letterSpacing: 1,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderColor: colors.textPrimary,
    transform: [{ scale: 1.1 }],
  },
  colorCheck: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.textPrimary,
  },
  noteSection: {
    marginBottom: spacing[4],
  },
  highlightNoteInput: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    color: colors.textPrimary,
    padding: spacing[3],
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  highlightModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[4],
  },
  deleteButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  saveActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  deleteConfirmSection: {
    marginTop: spacing[4],
    padding: spacing[3],
    backgroundColor: 'rgba(192, 57, 43, 0.1)',
    borderWidth: 2,
    borderColor: colors.danger,
  },
  deleteConfirmActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
  },
  flashcardSection: {
    marginBottom: spacing[4],
    padding: spacing[3],
    borderWidth: 2,
    borderColor: colors.border,
  },
  flashcardToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  flashcardFields: {
    marginTop: spacing[4],
    gap: spacing[3],
  },
  fieldGroup: {
    gap: spacing[2],
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  picker: {
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    height: Platform.OS === 'ios' ? 120 : 48,
    marginVertical: Platform.OS === 'ios' ? -8 : 0,
  },
  pickerItem: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: fonts.body,
    height: 120,
  },
  pickerItemStyle: {
    backgroundColor: colors.surface,
  },
  flashcardFront: {
    padding: spacing[3],
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderColor: colors.border,
  },
  tooltipOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
  },
  highlightTooltip: {
    position: 'absolute',
    zIndex: 50,
    width: 250,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    shadowColor: colors.borderStrong,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  tooltipNoteSection: {
    padding: spacing[3],
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  tooltipFlashcardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  tooltipActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
  },
  tooltipEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  tooltipCloseBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
});
