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
  sku?: string;
  description?: string;
  warranty?: string;
  price: number;
  stock: number;
  brandId: number;
  brandName: string;
  categoryId: number;
  categoryName: string;
  imageUrls?: string[];
  specs?: BackendSpec[];
  createdAt?: string;
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
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
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
  imageUrls?: string[];
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

function mapAdminProduct(item: BackendProduct): AdminProduct {
  return {
    id: String(item.id),
    name: item.name ?? "Unnamed",
    sku: item.sku,
    slug: item.sku ?? String(item.id),
    category: item.categoryName ?? "",
    categoryId: item.categoryId,
    brandId: item.brandId,
    brandName: item.brandName ?? "",
    description: item.description ?? "",
    warranty: item.warranty,
    price: item.price ?? 0,
    stock: item.stock ?? 0,
    imageUrl: item.imageUrls?.[0] ?? fallbackImage,
    images: item.imageUrls ?? [],
    status: "active",
    specifications: {},
  };
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
  const imageUrls = payload.images?.length
    ? payload.images.filter(Boolean)
    : payload.imageUrl
      ? [payload.imageUrl]
      : [];

  return {
    name: payload.name,
    sku: payload.sku,
    description: payload.description,
    warranty: payload.warranty,
    price: payload.price,
    stock: payload.stock,
    brandId: payload.brandId,
    categoryId: payload.categoryId,
    imageUrls,
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
    params.append("Search", query.search ?? "");
    if (query.categoryId !== undefined)
      params.append("CategoryId", String(query.categoryId));
    if (query.brandId !== undefined)
      params.append("BrandId", String(query.brandId));
    if (query.minPrice !== undefined)
      params.append("MinPrice", String(query.minPrice));
    if (query.maxPrice !== undefined)
      params.append("MaxPrice", String(query.maxPrice));
    params.append("Page", String(query.page ?? 1));
    params.append("PageSize", String(query.limit ?? 10));

    const response = await apiClient.get<any>(
      `/api/Products?${params.toString()}`,
    );

    // Handle { data: [], total, page, pageSize } envelope
    const items: BackendProduct[] = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
        ? response.data
        : [];

    const total: number = response?.total ?? items.length;
    const pageSize: number = response?.pageSize ?? query.limit ?? 10;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      products: items.map(mapAdminProduct),
      totalPages,
    };
  },

  async getAdminProductById(productId: string): Promise<AdminProduct> {
    const response = await apiClient.get<
      ApiEnvelope<BackendProduct> | BackendProduct
    >(`/api/Products/${productId}`);

    if (response && typeof response === "object" && "id" in response) {
      return mapAdminProduct(response as BackendProduct);
    }

    const wrapped = response as ApiEnvelope<BackendProduct>;
    if (wrapped.success === false || !wrapped.data) {
      throw new Error(wrapped.error || "Không tìm thấy sản phẩm");
    }

    return mapAdminProduct(wrapped.data);
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
