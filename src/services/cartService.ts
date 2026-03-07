import { apiClient } from './apiClient';

interface CartItemDto {
  cartItemId: number;
  productId: number;
  productName: string;
  productPrice: number;
  imageUrl?: string;
  quantity: number;
  subtotal: number;
}

interface CartDto {
  cartId: number;
  items: CartItemDto[];
  total: number;
}

export const cartService = {
  async getCart(): Promise<CartDto> {
    return apiClient.get<CartDto>('/api/Carts');
  },

  async addItem(productId: number, quantity: number = 1): Promise<CartDto> {
    await apiClient.post('/api/Carts/items', { productId, quantity });
    return this.getCart();
  },

  async updateItem(cartItemId: number, quantity: number): Promise<CartDto> {
    await apiClient.put(`/api/Carts/items/${cartItemId}`, { quantity });
    return this.getCart();
  },

  async removeItem(cartItemId: number): Promise<CartDto> {
    await apiClient.delete(`/api/Carts/items/${cartItemId}`);
    return this.getCart();
  },

  async clearCart(): Promise<CartDto> {
    await apiClient.delete('/api/Carts');
    return this.getCart();
  },
};

