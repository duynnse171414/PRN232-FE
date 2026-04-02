import { apiClient } from "./apiClient";

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
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
  paymentMethod?: "cod" | "vnpay";
}

export interface PlaceOrderRequest {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  addressId?: number;
  voucherId?: number | null;
  voucherCode?: string | null;
  notes?: string;
  paymentMethod?: "cod" | "vnpay";
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}

export interface CreateVnpayPaymentUrlResponse {
  paymentUrl: string;
}

export interface AdminOrdersResult {
  orders: OrderDto[];
  total: number;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeOrderItem(item: unknown): OrderItem | null {
  if (!item || typeof item !== "object") return null;
  const source = item as Record<string, unknown>;

  const productId = toNumber(source.productId ?? source.ProductId);
  const quantity = toNumber(source.quantity ?? source.Quantity);
  const price = toNumber(source.price ?? source.Price);

  return {
    productId,
    productName: toString(source.productName ?? source.ProductName, "Sản phẩm"),
    quantity,
    price,
  };
}

function normalizeOrder(order: unknown): OrderDto | null {
  if (!order || typeof order !== "object") return null;
  const source = order as Record<string, unknown>;

  const rawItems = Array.isArray(source.items)
    ? source.items
    : Array.isArray(source.Items)
      ? source.Items
      : [];

  const items = rawItems
    .map((item) => normalizeOrderItem(item))
    .filter((item): item is OrderItem => item !== null);

  return {
    id: toNumber(source.id ?? source.Id),
    customerId: toNumber(source.customerId ?? source.CustomerId),
    customerName: toString(
      source.customerName ?? source.CustomerName,
      "Khách lẻ",
    ),
    status: toString(source.status ?? source.Status, "Pending"),
    totalAmount: toNumber(source.totalAmount ?? source.TotalAmount),
    shippingFee: toNumber(source.shippingFee ?? source.ShippingFee),
    notes:
      source.notes === null || typeof source.notes === "string"
        ? source.notes
        : source.Notes === null || typeof source.Notes === "string"
          ? source.Notes
          : null,
    trackingNumber:
      source.trackingNumber === null ||
      typeof source.trackingNumber === "string"
        ? source.trackingNumber
        : source.TrackingNumber === null ||
            typeof source.TrackingNumber === "string"
          ? source.TrackingNumber
          : null,
    createdAt: toString(
      source.createdAt ?? source.CreatedAt,
      new Date().toISOString(),
    ),
    items,
    paymentUrl: toString(
      source.paymentUrl ?? source.PaymentUrl,
      undefined as never,
    ),
  };
}

function unwrapOrders(payload: unknown): OrderDto[] {
  const container = payload as Record<string, unknown> | null;

  const rawOrders = Array.isArray(payload)
    ? payload
    : Array.isArray(container?.data)
      ? container?.data
      : Array.isArray(container?.items)
        ? container?.items
        : Array.isArray(container?.orders)
          ? container?.orders
          : [];

  return rawOrders
    .map((order) => normalizeOrder(order))
    .filter((order): order is OrderDto => order !== null);
}

function unwrapSingleOrder(payload: unknown): OrderDto {
  const container = payload as Record<string, unknown> | null;
  const rawOrder = container?.data ?? payload;
  const normalized = normalizeOrder(rawOrder);

  if (!normalized) {
    throw new Error("Không thể xử lý dữ liệu đơn hàng");
  }

  return normalized;
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

    const res = await apiClient.post<ApiEnvelope<OrderDto> | OrderDto>(
      "/api/Orders/checkout",
      normalizedPayload,
    );
    return unwrapSingleOrder(res);
  },

  async placeOrder(payload: PlaceOrderRequest): Promise<OrderDto> {
    const normalizedPayload: PlaceOrderRequest = {
      ...payload,
      voucherId: payload.voucherId ?? null,
      voucherCode: payload.voucherCode ?? null,
    };

    const res = await apiClient.post<ApiEnvelope<OrderDto> | OrderDto>(
      "/api/Orders",
      normalizedPayload,
    );
    return unwrapSingleOrder(res);
  },

  async getAdminOrders(): Promise<AdminOrdersResult> {
    const res = await apiClient.get<unknown>("/api/Orders");
    const orders = unwrapOrders(res);

    const payload = (res as Record<string, unknown>)?.data ?? res;
    const payloadObj = payload as Record<string, unknown>;
    const total = toNumber(
      payloadObj?.total ?? payloadObj?.totalCount,
      orders.length,
    );

    return { orders, total };
  },

  async createVnpayPaymentUrl(): Promise<string> {
    const res = await apiClient.post<
      ApiEnvelope<CreateVnpayPaymentUrlResponse> | CreateVnpayPaymentUrlResponse
    >("/api/vnpay/create-payment-url");
    const wrapped = res as ApiEnvelope<CreateVnpayPaymentUrlResponse>;

    if (wrapped?.data?.paymentUrl) {
      return wrapped.data.paymentUrl;
    }

    return (res as CreateVnpayPaymentUrlResponse).paymentUrl;
  },

  async getOrderById(orderId: number): Promise<OrderDto> {
    const res = await apiClient.get<ApiEnvelope<OrderDto> | OrderDto>(
      `/api/Orders/${orderId}`,
    );
    return unwrapSingleOrder(res);
  },
};
