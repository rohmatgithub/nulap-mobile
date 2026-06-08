import { apiClient } from './api';
import type { Category, CreateCategoryInput } from '@/types/task';

interface CategoryResponse {
  id: number;
  name: string;
  color: string;
  icon: string;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

function mapToCategory(response: CategoryResponse): Category {
  return {
    id: String(response.id),
    name: response.name,
    color: response.color,
    icon: response.icon,
    is_global: response.is_global,
  };
}

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<CategoryResponse[]>('/categories');
    return data.map(mapToCategory);
  },

  getById: async (id: string): Promise<Category> => {
    const { data } = await apiClient.get<CategoryResponse>(`/categories/${id}`);
    return mapToCategory(data);
  },

  create: async (input: CreateCategoryInput): Promise<Category> => {
    const { data } = await apiClient.post<CategoryResponse>('/categories', input);
    return mapToCategory(data);
  },

  update: async (id: string, input: CreateCategoryInput): Promise<Category> => {
    const { data } = await apiClient.put<CategoryResponse>(`/categories/${id}`, input);
    return mapToCategory(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
