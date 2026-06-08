export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  is_global?: boolean;
}

export interface StudyTask {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  due_date?: string;
  due_time?: string;
  duration_minutes?: number;
  category_id?: string;
  deck_id?: number;
  is_recurring: boolean;
  recurrence_rule?: string;
  xp_reward: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  deck?: {
    id: number;
    name: string;
    due_count: number;
  };
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  category_id?: string;
  deck_id?: number;
  due_date?: string;
  due_time?: string;
  duration_minutes?: number;
  is_recurring?: boolean;
  recurrence_rule?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: Priority[];
  category_id?: string;
  deck_id?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface TaskStats {
  completed: number;
  total: number;
  xp_possible: number;
}

export interface CreateCategoryInput {
  name: string;
  color?: string;
  icon?: string;
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; xp: number }> = {
  urgent: { label: 'Urgent', color: '#EF4444', xp: 25 },
  high: { label: 'High', color: '#F59E0B', xp: 20 },
  medium: { label: 'Medium', color: '#EAB308', xp: 15 },
  low: { label: 'Low', color: '#71717A', xp: 10 },
};

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: 'To Do', color: '#71717A' },
  in_progress: { label: 'In Progress', color: '#3B82F6' },
  done: { label: 'Done', color: '#22C55E' },
  cancelled: { label: 'Cancelled', color: '#EF4444' },
};

export const DURATION_OPTIONS = [
  { value: 5, label: '5m' },
  { value: 10, label: '10m' },
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
  { value: 45, label: '45m' },
  { value: 60, label: '1h' },
  { value: 90, label: '1.5h' },
  { value: 120, label: '2h' },
];

export const RECURRENCE_OPTIONS = [
  { value: 'FREQ=DAILY', label: 'Daily' },
  { value: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', label: 'Weekdays' },
  { value: 'FREQ=WEEKLY;BYDAY=SA,SU', label: 'Weekends' },
  { value: 'FREQ=WEEKLY', label: 'Weekly' },
];
