import { useQuery } from '@tanstack/react-query';
import { statsService, ActivityDay } from '@/services/stats';

export const STATS_KEYS = {
  all: ['stats'] as const,
  activity: (days: number) => [...STATS_KEYS.all, 'activity', days] as const,
};

export function useActivity(days = 7) {
  return useQuery({
    queryKey: STATS_KEYS.activity(days),
    queryFn: () => statsService.getActivity(days),
  });
}

export type { ActivityDay };
