export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  specifications: Record<string, string>;
  stock: number;
  rating: number;
  reviews: number;
  brand: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface BuildConfig {
  cpu?: Product;
  gpu?: Product;
  motherboard?: Product;
  ram?: Product;
  storage?: Product;
  psu?: Product;
  case?: Product;
  cooler?: Product;
}

export interface AddressOption {
  id: number;
  label: string;
}

export interface Category {
  id: string;
  name: string;
  productCount?: number;
}

export interface CategoryInput {
  name: string;
}

export interface Brand {
  id: string;
  name: string;
  productCount?: number;
}

export interface BrandInput {
  name: string;
}
