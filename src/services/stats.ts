import { apiClient } from './api';

export interface ActivityDay {
  date: string;
  count: number;
}

export const statsService = {
  getActivity: async (days = 7): Promise<ActivityDay[]> => {
    const { data } = await apiClient.get<ActivityDay[]>(`/stats/activity?days=${days}`);
    return data;
  },
};
