import { apiClient } from './apiClient';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface OrderDto {
  id: number;
  customerId: number;
  customerName: string;
  status: string;
  totalAmount: number;
  shippingFee: number;
  notes: string | null;
  trackingNumber: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface CheckoutFromCartRequest {
  addressId?: number;
  notes?: string;
}

export interface PlaceOrderRequest {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  addressId?: number;
  notes?: string;
  paymentMethod?: string;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}

export const orderService = {
  async checkoutFromCart(payload: CheckoutFromCartRequest): Promise<OrderDto> {
    const res = await apiClient.post<ApiEnvelope<OrderDto>>('/api/Orders/checkout', payload);
    return res.data;
  },

  async placeOrder(payload: PlaceOrderRequest): Promise<OrderDto> {
    const res = await apiClient.post<ApiEnvelope<OrderDto>>('/api/Orders', payload);
    return res.data;
  },

  async getOrderById(orderId: number): Promise<OrderDto> {
    const res = await apiClient.get<ApiEnvelope<OrderDto>>(`/api/Orders/${orderId}`);
    return res.data;
  },
};
