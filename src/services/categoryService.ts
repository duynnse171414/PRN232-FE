import { apiClient } from "./apiClient";
import { Category, CategoryInput } from "../types";

const unwrapArray = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const obj = payload as any;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.results)) return obj.results;
  }
  return [];
};

const unwrapObject = <T>(payload: unknown): T | null => {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const obj = payload as any;
    if (obj.data && typeof obj.data === "object") return obj.data as T;
    return obj as T;
  }
  return null;
};

interface BackendCategory {
  id: number | string;
  name: string;
  productCount?: number;
  totalProducts?: number;
  totalProduct?: number;
}

function mapCategory(item: BackendCategory): Category {
  return {
    id: String(item.id),
    name: item.name,
    productCount:
      item.productCount ?? item.totalProducts ?? item.totalProduct ?? 0,
  };
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const res = await apiClient.get<unknown>("/api/Categories");
    return unwrapArray<BackendCategory>(res).map(mapCategory);
  },

  async getCategoryById(id: string): Promise<Category> {
    const res = await apiClient.get<unknown>(`/api/Categories/${id}`);
    const category = unwrapObject<BackendCategory>(res);
    if (!category) {
      throw new Error("Không tìm thấy danh mục");
    }
    return mapCategory(category);
  },

  async createCategory(input: CategoryInput): Promise<void> {
    await apiClient.post<unknown>("/api/Categories", input);
  },

  async updateCategory(id: string, input: CategoryInput): Promise<void> {
    await apiClient.put<unknown>(`/api/Categories/${id}`, input);
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/api/Categories/${id}`);
  },
};
