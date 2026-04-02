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
  paymentUrl?: string;
}

export interface CheckoutFromCartRequest {
  addressId?: number;
  voucherId?: number | null;
  voucherCode?: string | null;
  notes?: string;
  paymentMethod?: 'cod' | 'vnpay';
}

export interface PlaceOrderRequest {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  addressId?: number;
  voucherId?: number | null;
  voucherCode?: string | null;
  notes?: string;
  paymentMethod?: 'cod' | 'vnpay';
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}

export interface CreateVnpayPaymentUrlResponse {
  paymentUrl: string;
}

export const orderService = {
  async checkoutFromCart(payload: CheckoutFromCartRequest): Promise<OrderDto> {
    const normalizedPayload: CheckoutFromCartRequest = {
      addressId: payload.addressId,
      voucherId: payload.voucherId ?? null,
      voucherCode: payload.voucherCode ?? null,
      notes: payload.notes,
      paymentMethod: payload.paymentMethod,
    };

    const res = await apiClient.post<ApiEnvelope<OrderDto>>('/api/Orders/checkout', normalizedPayload);
    return res.data;
  },

  async placeOrder(payload: PlaceOrderRequest): Promise<OrderDto> {
    const normalizedPayload: PlaceOrderRequest = {
      ...payload,
      voucherId: payload.voucherId ?? null,
      voucherCode: payload.voucherCode ?? null,
    };

    const res = await apiClient.post<ApiEnvelope<OrderDto>>('/api/Orders', normalizedPayload);
    return res.data;
  },

  async createVnpayPaymentUrl(): Promise<string> {
    const res = await apiClient.post<ApiEnvelope<CreateVnpayPaymentUrlResponse> | CreateVnpayPaymentUrlResponse>(
      '/api/vnpay/create-payment-url'
    );

    if ((res as ApiEnvelope<CreateVnpayPaymentUrlResponse>)?.data?.paymentUrl) {
      return (res as ApiEnvelope<CreateVnpayPaymentUrlResponse>).data.paymentUrl;
    }

    return (res as CreateVnpayPaymentUrlResponse).paymentUrl;
  },

  async getOrderById(orderId: number): Promise<OrderDto> {
    const res = await apiClient.get<ApiEnvelope<OrderDto>>(`/api/Orders/${orderId}`);
    return res.data;
  },
};
