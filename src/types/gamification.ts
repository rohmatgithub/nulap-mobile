export interface GamificationOverview {
  total_xp: number;
  level: number;
  xp_to_next_level: number;
  current_streak: number;
  longest_streak: number;
  cards_reviewed_today: number;
  tasks_completed_today: number;
  daily_goal: number;
  daily_progress: number;
}

export interface UserGamification {
  user_id: number;
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  daily_goal: number;
}

export interface DailyProgress {
  date: string;
  cards_reviewed: number;
  cards_correct: number;
  tasks_completed: number;
  xp_earned: number;
  reading_minutes: number;
  focus_minutes: number;
  goal_met: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  total_xp: number;
  level: number;
  current_streak: number;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement_value: number;
  xp_reward: number;
}

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_id: number;
  unlocked_at: string;
  achievement: Achievement;
}

export type AchievementCategory =
  | 'streak'
  | 'cards'
  | 'decks'
  | 'tasks'
  | 'books'
  | 'focus'
  | 'xp'
  | 'special';
