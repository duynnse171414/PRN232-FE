import { apiClient } from "./apiClient";

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

interface BackendCategory {
  id: number | string;
  name: string;
  productCount?: number;
}

function mapCategory(item: BackendCategory): Category {
  return {
    id: String(item.id),
    name: item.name,
    productCount: item.productCount,
  };
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const res = await apiClient.get<unknown>("/api/Categories");
    return unwrapArray<BackendCategory>(res).map(mapCategory);
  },

  async getCategoryById(id: string): Promise<Category> {
    const res = await apiClient.get<BackendCategory>(`/api/Categories/${id}`);
    return mapCategory(res);
  },

  async createCategory(input: CategoryInput): Promise<Category> {
    const res = await apiClient.post<BackendCategory>("/api/Categories", input);
    return mapCategory(res);
  },

  async updateCategory(id: string, input: CategoryInput): Promise<Category> {
    const res = await apiClient.put<BackendCategory>(
      `/api/Categories/${id}`,
      input,
    );
    return mapCategory(res);
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/api/Categories/${id}`);
  },
};
