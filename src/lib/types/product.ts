export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
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
  slug: string;
  category: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  imageUrl: string;
  images: string[];
  status: string;
  specifications: Record<string, string>;
  promotionIds?: string[];
}
