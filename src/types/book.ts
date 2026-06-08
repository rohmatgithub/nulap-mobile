export interface Book {
  id: number;
  title: string;
  author: string;
  format: string;
  file_path?: string;
  cover_path?: string;
  total_pages: number;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface UserBook {
  id: number;
  title: string;
  author: string;
  cover_url?: string;
  format: string;
  file_url?: string;
  total_locations: number;
  total_pages?: number;
  category?: string;
  current_location: number;
  current_page?: number;
  progress: number;
  status: BookStatus;
  started_at?: string;
  finished_at?: string;
  last_read_at?: string;
  reading_time: number;
}

export type BookStatus = 'reading' | 'finished' | 'dropped';

export interface Highlight {
  id: number;
  book_id: number;
  user_id: number;
  text: string;
  note?: string;
  page_number: number;
  color: string;
  created_at: string;
}

export interface Bookmark {
  id: number;
  book_id: number;
  user_id: number;
  page_number: number;
  title?: string;
  created_at: string;
}

export interface ReadingSession {
  id: number;
  book_id: number;
  user_id: number;
  start_page: number;
  end_page: number;
  duration_minutes: number;
  started_at: string;
  ended_at?: string;
}

export interface UpdateProgressInput {
  current_page: number;
}

export interface CreateHighlightInput {
  book_id: number;
  text: string;
  note?: string;
  page_number: number;
  color?: string;
}

export interface CreateBookmarkInput {
  book_id: number;
  page_number: number;
  title?: string;
}
