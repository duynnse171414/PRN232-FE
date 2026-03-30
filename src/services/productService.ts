import { apiClient } from "./apiClient";
import { categoryService } from "./categoryService";
import { Product } from "../types";
import {
  CreateProductInput,
  Product as AdminProduct,
} from "../lib/types/product";

interface BackendSpec {
  key: string;
  value: string;
}

// ProductDto from backend
interface BackendProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  brandId: number;
  brandName: string;
  categoryId: number;
  categoryName: string;
  imageUrls?: string[];
  specs?: BackendSpec[];
}

interface ProductQuery {
  search?: string;
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  error?: string;
  pagination?: {
    totalPages?: number;
  };
}

export interface AdminProductsQuery {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface AdminProductsResult {
  products: AdminProduct[];
  totalPages: number;
}

interface AdminProductUpsertDto {
  name: string;
  sku: string;
  description: string;
  warranty: string;
  price: number;
  stock: number;
  brandId?: number;
  categoryId?: number;
}

const fallbackImage =
  "https://images.unsplash.com/photo-1733945761533-727f49908d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

// Helper to extract arrays from wrappers like { data, total, page, pageSize }
function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const obj = payload as any;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.results)) return obj.results;
  }
  return [];
}

function mapProduct(item: BackendProduct): Product {
  const image =
    item.imageUrls && item.imageUrls.length > 0
      ? item.imageUrls[0]
      : fallbackImage;

  const specifications: Record<string, string> = {};
  if (item.specs) {
    for (const spec of item.specs) {
      if (spec.key) {
        specifications[spec.key] = spec.value;
      }
    }
  }

  return {
    id: String(item.id),
    name: item.name || "Unnamed product",
    category: item.categoryName || "Other",
    price: item.price ?? 0,
    image,
    description: item.description || "No description",
    specifications,
    stock: item.stock ?? 0,
    rating: 4.5,
    reviews: 0,
    brand: item.brandName || "Unknown",
  };
}

function toQueryString(query?: ProductQuery) {
  const params = new URLSearchParams();
  // Backend currently validates Search as required, so always send it.
  params.set("Search", query?.search ?? "");
  if (query?.categoryId) params.set("CategoryId", String(query.categoryId));
  if (query?.brandId) params.set("BrandId", String(query.brandId));
  if (query?.minPrice !== undefined)
    params.set("MinPrice", String(query.minPrice));
  if (query?.maxPrice !== undefined)
    params.set("MaxPrice", String(query.maxPrice));
  if (query?.page) params.set("Page", String(query.page));
  if (query?.pageSize) params.set("PageSize", String(query.pageSize));

  const q = params.toString();
  return q ? `?${q}` : "";
}

function toAdminProductUpsertDto(
  payload: CreateProductInput,
): AdminProductUpsertDto {
  return {
    name: payload.name,
    sku: payload.sku,
    description: payload.description,
    warranty: payload.warranty,
    price: payload.price,
    stock: payload.stock,
    brandId: payload.brandId,
    categoryId: payload.categoryId,
  };
}

export const productService = {
  async getProducts(query?: ProductQuery): Promise<Product[]> {
    const res = await apiClient.get<unknown>(
      `/api/Products${toQueryString(query)}`,
    );
    return unwrapArray<BackendProduct>(res).map(mapProduct);
  },

  async getProductById(id: string): Promise<Product> {
    const res = await apiClient.get<BackendProduct>(`/api/Products/${id}`);
    return mapProduct(res);
  },

  async getCategories(): Promise<{ id: number; name: string }[]> {
    const categories = await categoryService.getCategories();
    return categories.map((cat) => ({
      id: Number(cat.id),
      name: cat.name,
    }));
  },

  async getBrands(): Promise<{ id: number; name: string }[]> {
    const res = await apiClient.get<unknown>("/api/Brands");
    return unwrapArray<any>(res).map((x) => ({
      id: Number(x.id),
      name: x.name || x.brandName || String(x.id),
    }));
  },

  async getAdminProducts(
    query: AdminProductsQuery,
  ): Promise<AdminProductsResult> {
    const params = new URLSearchParams();
    if (query.search) params.append("search", query.search);
    if (query.category) params.append("category", query.category);
    if (query.status) params.append("status", query.status);
    params.append("page", String(query.page ?? 1));
    params.append("limit", String(query.limit ?? 10));

    const response = await apiClient.get<
      ApiEnvelope<AdminProduct[]> | AdminProduct[]
    >(`/api/Products?${params.toString()}`);

    if (Array.isArray(response)) {
      return { products: response, totalPages: 1 };
    }

    if (response.success === false) {
      throw new Error(response.error || "Không thể tải danh sách sản phẩm");
    }

    return {
      products: response.data ?? [],
      totalPages: response.pagination?.totalPages ?? 1,
    };
  },

  async getAdminProductById(productId: string): Promise<AdminProduct> {
    const response = await apiClient.get<
      ApiEnvelope<AdminProduct> | AdminProduct
    >(`/api/Products/${productId}`);

    if (response && typeof response === "object" && "id" in response) {
      return response as AdminProduct;
    }

    const wrapped = response as ApiEnvelope<AdminProduct>;
    if (wrapped.success === false || !wrapped.data) {
      throw new Error(wrapped.error || "Không tìm thấy sản phẩm");
    }

    return wrapped.data;
  },

  async createAdminProduct(payload: CreateProductInput): Promise<void> {
    const dto = toAdminProductUpsertDto(payload);
    const response = await apiClient.post<ApiEnvelope<unknown> | unknown>(
      "/api/Products",
      dto,
    );

    if (
      response &&
      typeof response === "object" &&
      "success" in (response as Record<string, unknown>) &&
      (response as ApiEnvelope<unknown>).success === false
    ) {
      throw new Error(
        (response as ApiEnvelope<unknown>).error || "Không thể tạo sản phẩm",
      );
    }
  },

  async updateAdminProduct(
    productId: string,
    payload: CreateProductInput,
  ): Promise<void> {
    const dto = toAdminProductUpsertDto(payload);
    const response = await apiClient.put<ApiEnvelope<unknown> | unknown>(
      `/api/Products/${productId}`,
      dto,
    );

    if (
      response &&
      typeof response === "object" &&
      "success" in (response as Record<string, unknown>) &&
      (response as ApiEnvelope<unknown>).success === false
    ) {
      throw new Error(
        (response as ApiEnvelope<unknown>).error ||
          "Không thể cập nhật sản phẩm",
      );
    }
  },

  async deleteAdminProduct(productId: string): Promise<void> {
    await apiClient.delete(`/api/Products/${productId}`);
  },
};
