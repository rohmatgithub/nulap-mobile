import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task';
import { categoryService } from '@/services/category';
import type {
  StudyTask,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  TaskStatus,
  CreateCategoryInput,
} from '@/types/task';

export const TASK_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_KEYS.all, 'list'] as const,
  list: (filters?: TaskFilters) => [...TASK_KEYS.lists(), filters] as const,
  details: () => [...TASK_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TASK_KEYS.details(), id] as const,
  stats: () => [...TASK_KEYS.all, 'stats'] as const,
  todayStats: () => [...TASK_KEYS.stats(), 'today'] as const,
};

export const CATEGORY_KEYS = {
  all: ['categories'] as const,
  lists: () => [...CATEGORY_KEYS.all, 'list'] as const,
};

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: TASK_KEYS.list(filters),
    queryFn: () => taskService.getAll(filters),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: TASK_KEYS.detail(id),
    queryFn: () => taskService.getById(id),
    enabled: !!id,
  });
}

export function useTodayStats() {
  return useQuery({
    queryKey: TASK_KEYS.todayStats(),
    queryFn: () => taskService.getTodayStats(),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: CATEGORY_KEYS.lists(),
    queryFn: () => categoryService.getAll(),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => taskService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      taskService.update(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(id) });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.complete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TASK_KEYS.lists() });

      const previousTasks = queryClient.getQueryData<StudyTask[]>(TASK_KEYS.list());

      queryClient.setQueriesData<StudyTask[]>(
        { queryKey: TASK_KEYS.lists() },
        (old) =>
          old?.map((task) =>
            task.id === id
              ? { ...task, status: 'done' as TaskStatus, completed_at: new Date().toISOString() }
              : task
          )
      );

      return { previousTasks };
    },
    onError: (_, __, context) => {
      if (context?.previousTasks) {
        queryClient.setQueriesData({ queryKey: TASK_KEYS.lists() }, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
}

export function useUncompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.uncomplete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TASK_KEYS.lists() });

      const previousTasks = queryClient.getQueryData<StudyTask[]>(TASK_KEYS.list());

      queryClient.setQueriesData<StudyTask[]>(
        { queryKey: TASK_KEYS.lists() },
        (old) =>
          old?.map((task) =>
            task.id === id
              ? { ...task, status: 'todo' as TaskStatus, completed_at: undefined }
              : task
          )
      );

      return { previousTasks };
    },
    onError: (_, __, context) => {
      if (context?.previousTasks) {
        queryClient.setQueriesData({ queryKey: TASK_KEYS.lists() }, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TASK_KEYS.lists() });

      const previousTasks = queryClient.getQueryData<StudyTask[]>(TASK_KEYS.list());

      queryClient.setQueriesData<StudyTask[]>(
        { queryKey: TASK_KEYS.lists() },
        (old) => old?.filter((task) => task.id !== id)
      );

      return { previousTasks };
    },
    onError: (_, __, context) => {
      if (context?.previousTasks) {
        queryClient.setQueriesData({ queryKey: TASK_KEYS.lists() }, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoryService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
}
