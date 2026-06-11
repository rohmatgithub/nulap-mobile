export interface Deck {
  id: number;
  name: string;
  description?: string;
  tags?: string[];
  card_count: number;
  due_count: number;
  new_count: number;
  learning_count: number;
  review_count: number;
  mature_count: number;
  retention_rate?: number;
  last_studied?: string;
  created_at: string;
  updated_at: string;
}

export interface DeckListItem {
  id: number;
  name: string;
  description?: string;
  tags?: string[];
  card_count: number;
  due_count: number;
  new_count: number;
  learning_count: number;
  review_count: number;
  mature_count: number;
  last_studied?: string;
}

export interface CreateDeckInput {
  name: string;
  description?: string;
}

// Backend UpdateDeckRequest requires name
export interface UpdateDeckInput {
  name: string;
  description?: string;
  tags?: string[];
}

// Matches backend CardResponse (GET /cards/:id)
export interface Card {
  id: number;
  deck_id: number;
  front: string;
  back: string;
  example?: string;
  hint?: string;
  notes?: string;
  status: CardStatus;
  due_date: string | null;
  interval: number;
  ease_factor: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  last_reviewed_at?: string;
}

// Matches backend CardListResponse (GET /cards/deck/:deckId)
export interface CardListItem {
  id: number;
  front: string;
  back: string;
  example?: string;
  status: CardStatus;
  due_date: string | null;
  ease_factor: number;
}

// Matches backend StudyCardResponse
export interface StudyCard {
  id: number;
  front: string;
  back: string;
  example?: string;
  hint?: string;
}

// Matches backend GetDueCards payload (GET /cards/deck/:deckId/due)
export interface DueCardsResponse {
  deck_id: number;
  deck_name: string;
  cards: StudyCard[];
  total: number;
  study_ahead: boolean;
}

export type CardStatus = 'new' | 'learning' | 'review' | 'mature';

export interface CreateCardInput {
  deck_id: number;
  front: string;
  back: string;
  example?: string;
  hint?: string;
  notes?: string;
  tags?: string[];
}

// Backend UpdateCardRequest — no deck_id, front/back required
export interface UpdateCardInput {
  front: string;
  back: string;
  example?: string;
  hint?: string;
  notes?: string;
  tags?: string[];
}

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface ReviewCardInput {
  card_id: number;
  rating: ReviewRating;
  review_time_ms?: number;
}

// Matches backend ReviewResultResponse (POST /cards/:id/review)
export interface ReviewResult {
  next_due_date: string | null;
  new_interval: number;
  new_status: CardStatus;
  xp_earned: number;
  total_xp: number;
  leveled_up: boolean;
  new_level: number;
  daily_goal_met: boolean;
}

export interface StudySession {
  deck_id: number;
  cards_reviewed: number;
  cards_correct: number;
  xp_earned: number;
  duration_seconds: number;
}
