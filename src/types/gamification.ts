export interface UserGamification {
  total_xp: number;
  level: number;
  xp_for_current_level: number;
  xp_for_next_level: number;
  xp_progress: number;
  daily_goal: number;
  streak_freezes_available: number;
  max_streak_freezes: number;
}

export interface DailyProgress {
  date: string;
  cards_reviewed: number;
  daily_goal: number;
  goal_met: boolean;
  xp_earned: number;
  progress_percent: number;
}

export interface WeeklyXP {
  current_week_xp: number;
  previous_week_xp: number;
  trend_percent: number;
}

export interface StreakInfo {
  current_streak: number;
  freezes_available: number;
  freeze_used_today: boolean;
}

export interface GamificationOverview {
  user: UserGamification;
  daily_progress: DailyProgress;
  weekly_xp: WeeklyXP;
  streak: StreakInfo;
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
