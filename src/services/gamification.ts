import { apiClient } from './api';
import type {
  GamificationOverview,
  UserGamification,
  DailyProgress,
  UserAchievement,
} from '@/types/gamification';

export const gamificationService = {
  getOverview: async (): Promise<GamificationOverview> => {
    const { data } = await apiClient.get<GamificationOverview>('/gamification');
    return data;
  },

  getUserGamification: async (): Promise<UserGamification> => {
    const { data } = await apiClient.get<UserGamification>('/gamification/user');
    return data;
  },

  getDailyProgress: async (): Promise<DailyProgress> => {
    const { data } = await apiClient.get<DailyProgress>('/gamification/daily');
    return data;
  },

  updateDailyGoal: async (dailyGoal: number): Promise<void> => {
    await apiClient.put('/gamification/daily-goal', { daily_goal: dailyGoal });
  },

  // Achievements
  getAchievements: async (): Promise<UserAchievement[]> => {
    const { data } = await apiClient.get<UserAchievement[]>('/achievements');
    return data;
  },

  getRecentAchievements: async (): Promise<UserAchievement[]> => {
    const { data } = await apiClient.get<UserAchievement[]>('/achievements/recent');
    return data;
  },
};
