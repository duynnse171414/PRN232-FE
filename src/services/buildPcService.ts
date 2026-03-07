import { apiClient } from './apiClient';

export interface BuildPcProductDto {
  id: number;
  name: string;
  sku?: string | null;
  description?: string | null;
  warranty?: string | null;
  price: number;
  stock: number;
  brandId?: number | null;
  brandName?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  imageUrls?: string[];
  specs?: Array<{ key: string; value: string }>;
  createdAt?: string | null;
}

export interface BuildPcComponentTypeDto {
  id: number;
  name: string;
  isRequired: boolean;
  sortOrder: number;
  products: BuildPcProductDto[];
}

export interface CreateBuildDto {
  userId?: number | null;
  name: string;
  items: Array<{
    componentTypeId: number;
    productId: number;
    quantity: number;
  }>;
}

export interface BuildResponseDto {
  id: number;
  name: string;
  totalPrice: number;
  createdAt: string;
  items: Array<{
    componentTypeId: number;
    componentTypeName: string;
    productId: number;
    productName: string;
    productPrice: number;
    quantity: number;
  }>;
}

export const buildPcService = {
  async getComponents(): Promise<BuildPcComponentTypeDto[]> {
    return apiClient.get<BuildPcComponentTypeDto[]>('/api/BuildPC/components');
  },

  async createBuild(payload: CreateBuildDto): Promise<BuildResponseDto> {
    return apiClient.post<BuildResponseDto>('/api/BuildPC', payload);
  },

  async getBuildById(buildId: number): Promise<BuildResponseDto> {
    return apiClient.get<BuildResponseDto>(`/api/BuildPC/${buildId}`);
  },

  async getMyBuilds(): Promise<BuildResponseDto[]> {
    return apiClient.get<BuildResponseDto[]>('/api/BuildPC/my');
  },
};
