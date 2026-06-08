import { apiClient } from './api';
import type {
  StudyTask,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  TaskStats,
  Priority,
  TaskStatus,
} from '@/types/task';

interface TaskResponse {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  due_date: string | null;
  due_time: string | null;
  duration_minutes: number | null;
  category_id: number | null;
  deck_id: number | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  xp_reward: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
    color: string;
    icon: string;
  };
  deck?: {
    id: number;
    name: string;
    due_count: number;
  };
}

function mapToStudyTask(response: TaskResponse): StudyTask {
  return {
    id: String(response.id),
    title: response.title,
    description: response.description || undefined,
    priority: response.priority,
    status: response.status,
    due_date: response.due_date || undefined,
    due_time: response.due_time || undefined,
    duration_minutes: response.duration_minutes || undefined,
    category_id: response.category_id ? String(response.category_id) : undefined,
    deck_id: response.deck_id || undefined,
    is_recurring: response.is_recurring,
    recurrence_rule: response.recurrence_rule || undefined,
    xp_reward: response.xp_reward,
    completed_at: response.completed_at || undefined,
    created_at: response.created_at,
    updated_at: response.updated_at,
    category: response.category
      ? {
          id: String(response.category.id),
          name: response.category.name,
          color: response.category.color,
          icon: response.category.icon,
        }
      : undefined,
    deck: response.deck
      ? {
          id: response.deck.id,
          name: response.deck.name,
          due_count: response.deck.due_count,
        }
      : undefined,
  };
}

function buildQueryString(filters?: TaskFilters): string {
  if (!filters) return '';

  const params = new URLSearchParams();

  if (filters.status && filters.status.length > 0) {
    params.set('status', filters.status.join(','));
  }
  if (filters.priority && filters.priority.length > 0) {
    params.set('priority', filters.priority.join(','));
  }
  if (filters.category_id) {
    params.set('category_id', filters.category_id);
  }
  if (filters.deck_id) {
    params.set('deck_id', String(filters.deck_id));
  }
  if (filters.search) {
    params.set('search', filters.search);
  }
  if (filters.start_date) {
    params.set('start_date', filters.start_date);
  }
  if (filters.end_date) {
    params.set('end_date', filters.end_date);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export const taskService = {
  getAll: async (filters?: TaskFilters): Promise<StudyTask[]> => {
    const queryString = buildQueryString(filters);
    const { data } = await apiClient.get<TaskResponse[]>(`/tasks${queryString}`);
    return data.map(mapToStudyTask);
  },

  getById: async (id: string): Promise<StudyTask> => {
    const { data } = await apiClient.get<TaskResponse>(`/tasks/${id}`);
    return mapToStudyTask(data);
  },

  getTodayStats: async (): Promise<TaskStats> => {
    const { data } = await apiClient.get<TaskStats>('/tasks/stats/today');
    return data;
  },

  create: async (input: CreateTaskInput): Promise<StudyTask> => {
    const request = {
      title: input.title,
      description: input.description,
      priority: input.priority,
      category_id: input.category_id ? Number(input.category_id) : undefined,
      deck_id: input.deck_id,
      due_date: input.due_date,
      due_time: input.due_time,
      duration_minutes: input.duration_minutes,
      is_recurring: input.is_recurring,
      recurrence_rule: input.recurrence_rule,
    };
    const { data } = await apiClient.post<TaskResponse>('/tasks', request);
    return mapToStudyTask(data);
  },

  update: async (id: string, input: UpdateTaskInput): Promise<StudyTask> => {
    const request = {
      title: input.title,
      description: input.description,
      priority: input.priority,
      category_id: input.category_id ? Number(input.category_id) : undefined,
      deck_id: input.deck_id,
      due_date: input.due_date,
      due_time: input.due_time,
      duration_minutes: input.duration_minutes,
      is_recurring: input.is_recurring,
      recurrence_rule: input.recurrence_rule,
      status: input.status,
    };
    const { data } = await apiClient.put<TaskResponse>(`/tasks/${id}`, request);
    return mapToStudyTask(data);
  },

  updateStatus: async (id: string, status: TaskStatus): Promise<StudyTask> => {
    const { data } = await apiClient.patch<TaskResponse>(`/tasks/${id}/status`, { status });
    return mapToStudyTask(data);
  },

  complete: async (id: string): Promise<StudyTask> => {
    const { data } = await apiClient.patch<TaskResponse>(`/tasks/${id}/complete`, {});
    return mapToStudyTask(data);
  },

  uncomplete: async (id: string): Promise<StudyTask> => {
    const { data } = await apiClient.patch<TaskResponse>(`/tasks/${id}/uncomplete`, {});
    return mapToStudyTask(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
