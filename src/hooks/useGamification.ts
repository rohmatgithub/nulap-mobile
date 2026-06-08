import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationService } from '@/services/gamification';

export const GAMIFICATION_KEYS = {
  all: ['gamification'] as const,
  overview: () => [...GAMIFICATION_KEYS.all, 'overview'] as const,
  user: () => [...GAMIFICATION_KEYS.all, 'user'] as const,
  daily: () => [...GAMIFICATION_KEYS.all, 'daily'] as const,
  achievements: () => [...GAMIFICATION_KEYS.all, 'achievements'] as const,
  recentAchievements: () => [...GAMIFICATION_KEYS.achievements(), 'recent'] as const,
};

export function useGamificationOverview() {
  return useQuery({
    queryKey: GAMIFICATION_KEYS.overview(),
    queryFn: () => gamificationService.getOverview(),
  });
}

export function useUserGamification() {
  return useQuery({
    queryKey: GAMIFICATION_KEYS.user(),
    queryFn: () => gamificationService.getUserGamification(),
  });
}

export function useDailyProgress() {
  return useQuery({
    queryKey: GAMIFICATION_KEYS.daily(),
    queryFn: () => gamificationService.getDailyProgress(),
  });
}

export function useAchievements() {
  return useQuery({
    queryKey: GAMIFICATION_KEYS.achievements(),
    queryFn: () => gamificationService.getAchievements(),
  });
}

export function useRecentAchievements() {
  return useQuery({
    queryKey: GAMIFICATION_KEYS.recentAchievements(),
    queryFn: () => gamificationService.getRecentAchievements(),
  });
}

export function useUpdateDailyGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dailyGoal: number) => gamificationService.updateDailyGoal(dailyGoal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GAMIFICATION_KEYS.all });
    },
  });
}
