import { apiClient } from './apiClient';
import { Product } from '../types';

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

const fallbackImage =
  'https://images.unsplash.com/photo-1733945761533-727f49908d70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

// Helper to extract arrays from wrappers like { data, total, page, pageSize }
function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const obj = payload as any;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.results)) return obj.results;
  }
  return [];
}

function mapProduct(item: BackendProduct): Product {
  const image = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : fallbackImage;

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
    name: item.name || 'Unnamed product',
    category: item.categoryName || 'Other',
    price: item.price ?? 0,
    image,
    description: item.description || 'No description',
    specifications,
    stock: item.stock ?? 0,
    rating: 4.5,
    reviews: 0,
    brand: item.brandName || 'Unknown',
  };
}

function toQueryString(query?: ProductQuery) {
  const params = new URLSearchParams();
  // Backend currently validates Search as required, so always send it.
  params.set('Search', query?.search ?? '');
  if (query?.categoryId) params.set('CategoryId', String(query.categoryId));
  if (query?.brandId) params.set('BrandId', String(query.brandId));
  if (query?.minPrice !== undefined) params.set('MinPrice', String(query.minPrice));
  if (query?.maxPrice !== undefined) params.set('MaxPrice', String(query.maxPrice));
  if (query?.page) params.set('Page', String(query.page));
  if (query?.pageSize) params.set('PageSize', String(query.pageSize));

  const q = params.toString();
  return q ? `?${q}` : '';
}

export const productService = {
  async getProducts(query?: ProductQuery): Promise<Product[]> {
    const res = await apiClient.get<unknown>(`/api/Products${toQueryString(query)}`);
    return unwrapArray<BackendProduct>(res).map(mapProduct);
  },

  async getProductById(id: string): Promise<Product> {
    const res = await apiClient.get<BackendProduct>(`/api/Products/${id}`);
    return mapProduct(res);
  },

  async getCategories(): Promise<{ id: number; name: string }[]> {
    const res = await apiClient.get<unknown>('/api/Categories');
    return unwrapArray<any>(res).map((x) => ({
      id: Number(x.id),
      name: x.name || x.categoryName || String(x.id),
    }));
  },

  async getBrands(): Promise<{ id: number; name: string }[]> {
    const res = await apiClient.get<unknown>('/api/Brands');
    return unwrapArray<any>(res).map((x) => ({
      id: Number(x.id),
      name: x.name || x.brandName || String(x.id),
    }));
  },
};
