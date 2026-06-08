export interface Deck {
  id: number;
  name: string;
  description?: string;
  card_count: number;
  due_count: number;
  new_count: number;
  mastered_count: number;
  created_at: string;
  updated_at: string;
}

export interface DeckListItem {
  id: number;
  name: string;
  description?: string;
  card_count: number;
  due_count: number;
  new_count: number;
  mastered_count: number;
  last_studied?: string;
}

export interface CreateDeckInput {
  name: string;
  description?: string;
}

export interface UpdateDeckInput {
  name?: string;
  description?: string;
}

export interface Card {
  id: number;
  deck_id: number;
  front: string;
  back: string;
  status: CardStatus;
  ease_factor: number;
  interval: number;
  due_date?: string;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export type CardStatus = 'new' | 'learning' | 'review' | 'mastered';

export interface CreateCardInput {
  deck_id: number;
  front: string;
  back: string;
}

export interface ReviewCardInput {
  card_id: number;
  rating: 1 | 2 | 3 | 4; // 1=Again, 2=Hard, 3=Good, 4=Easy
}

export interface StudySession {
  deck_id: number;
  cards_reviewed: number;
  cards_correct: number;
  xp_earned: number;
  duration_seconds: number;
}
