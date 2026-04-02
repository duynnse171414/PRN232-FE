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
  // Thêm hàm này để sửa lỗi ở ProfilePage.tsx
  async getMyOrders(): Promise<OrderDto[]> {
    // Lưu ý: Endpoint này phải khớp với Swagger của bạn (thường là /api/Orders/my-orders hoặc tương đương)
    const res = await apiClient.get<ApiEnvelope<OrderDto[]> | OrderDto[]>('/api/Orders/my');
    
    // Xử lý nếu BE trả về envelope hoặc array trực tiếp
    if (Array.isArray(res)) return res;
    return (res as ApiEnvelope<OrderDto[]>).data;
  },

  async checkoutFromCart(payload: CheckoutFromCartRequest): Promise<OrderDto> {
    const res = await apiClient.post<ApiEnvelope<OrderDto>>('/api/Orders/checkout', payload);
    return res.data;
  },

  async placeOrder(payload: PlaceOrderRequest): Promise<OrderDto> {
    const res = await apiClient.post<ApiEnvelope<OrderDto>>('/api/Orders', payload);
    return res.data;
  },

  async createVnpayPaymentUrl(orderId?: number, amount?: number): Promise<string> {
    // Cập nhật để truyền tham số nếu BE yêu cầu
    const res = await apiClient.post<ApiEnvelope<CreateVnpayPaymentUrlResponse>>(
      '/api/vnpay/create-payment-url', 
      { orderId, amount }
    );
    return res.data.paymentUrl;
  },

  async getOrderById(orderId: number): Promise<OrderDto> {
    const res = await apiClient.get<ApiEnvelope<OrderDto>>(`/api/Orders/${orderId}`);
    return res.data;
  },
};