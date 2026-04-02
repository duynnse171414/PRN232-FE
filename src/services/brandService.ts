import { apiClient } from "./apiClient";
import { Brand, BrandInput } from "../types";

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

interface BackendBrand {
  id: number | string;
  name?: string;
  brandName?: string;
  productCount?: number;
  totalProducts?: number;
  totalProduct?: number;
}

function mapBrand(item: BackendBrand): Brand {
  return {
    id: String(item.id),
    name: item.name ?? item.brandName ?? "Unknown",
    productCount:
      item.productCount ?? item.totalProducts ?? item.totalProduct ?? 0,
  };
}

export const brandService = {
  async getBrands(): Promise<Brand[]> {
    const res = await apiClient.get<unknown>("/api/Brands");
    return unwrapArray<BackendBrand>(res).map(mapBrand);
  },

  async getBrandById(id: string): Promise<Brand> {
    const res = await apiClient.get<unknown>(`/api/Brands/${id}`);
    const brand = unwrapObject<BackendBrand>(res);
    if (!brand) {
      throw new Error("Không tìm thấy thương hiệu");
    }
    return mapBrand(brand);
  },

  async createBrand(input: BrandInput): Promise<void> {
    await apiClient.post<unknown>("/api/Brands", input);
  },

  async updateBrand(id: string, input: BrandInput): Promise<void> {
    await apiClient.put<unknown>(`/api/Brands/${id}`, input);
  },

  async deleteBrand(id: string): Promise<void> {
    await apiClient.delete(`/api/Brands/${id}`);
  },
};
