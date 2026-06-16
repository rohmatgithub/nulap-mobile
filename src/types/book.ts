export type ContentType = 'text' | 'chapters';

export interface Book {
  id: number;
  title: string;
  author: string;
  description?: string;
  cover_url?: string;
  content_type: ContentType;
  content?: string;
  word_count: number;
  reading_time_minutes: number;
  total_chapters?: number;
  category?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: number;
  book_id: number;
  chapter_number: number;
  title: string;
  content: string;
  word_count: number;
  reading_time_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface UserBook {
  id: number;
  title: string;
  author: string;
  description?: string;
  cover_url?: string;
  content_type: ContentType;
  content?: string;
  word_count: number;
  reading_time_minutes: number;
  total_chapters?: number;
  category?: string;
  current_chapter_number: number;
  chapters_completed: number;
  scroll_position: number;
  progress: number;
  status: BookStatus;
  started_at: string;
  finished_at?: string;
  last_read_at: string;
  reading_time: number;
}

export type BookStatus = 'reading' | 'finished' | 'dropped';

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'red';

export interface Highlight {
  id: number;
  book_id: number;
  user_id: number;
  chapter_id?: number;
  text: string;
  color: HighlightColor;
  start_offset: number;
  end_offset: number;
  paragraph_index?: number;
  note?: string;
  flashcard_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: number;
  book_id: number;
  user_id: number;
  chapter_id?: number;
  scroll_position: number;
  title?: string;
  created_at: string;
}

export interface ReadingSession {
  id: number;
  book_id: number;
  user_id: number;
  chapter_id?: number;
  started_at: string;
  ended_at?: string;
  duration_minutes: number;
  xp_earned: number;
}

export interface UpdateProgressInput {
  current_chapter_number?: number;
  scroll_position: number;
  progress: number;
}

export interface CreateHighlightInput {
  book_id: number;
  chapter_id?: number;
  text: string;
  color: HighlightColor;
  start_offset: number;
  end_offset: number;
  paragraph_index?: number;
  note?: string;
}

export interface UpdateHighlightInput {
  color?: HighlightColor;
  note?: string;
}

export interface CreateBookmarkInput {
  book_id: number;
  chapter_id?: number;
  scroll_position: number;
  title?: string;
}

export interface ReaderSettings {
  font_size: number;
  line_height: number;
  font_family: 'system' | 'lora' | 'georgia';
  reading_mode: 'dark' | 'sepia' | 'light';
  column_width: 'narrow' | 'normal' | 'wide';
}
