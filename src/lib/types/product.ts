export interface Product {
  id: string;
  name: string;
  sku?: string;
  slug: string;
  category: string;
  categoryId?: number;
  brandId?: number;
  description: string;
  warranty?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  imageUrl: string;
  images: string[];
  status: string;
  specifications: Record<string, string>;
  promotionIds?: string[];
}

export interface CreateProductInput {
  name: string;
  sku: string;
  slug: string;
  category: string;
  categoryId?: number;
  brandId?: number;
  description: string;
  warranty: string;
  price: number;
  discountPrice?: number;
  stock: number;
  imageUrl: string;
  images: string[];
  status: string;
  specifications: Record<string, string>;
  promotionIds?: string[];
}
