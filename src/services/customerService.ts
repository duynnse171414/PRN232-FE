import { apiClient } from "./apiClient";

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface CustomerDto {
  id: number;
  userId?: number;
  fullName?: string;
  name?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  city?: string;
  province?: string;
  address?: string;
  totalOrders?: number;
  totalSpent?: number;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
  joinDate?: string;
  addresses?: CustomerAddressDto[];
}

export interface CustomerAddressDto {
  id: number;
  addressLine?: string;
  city?: string;
  district?: string;
  ward?: string;
  isDefault?: boolean;
}

export interface AdminCustomersQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminCustomersResult {
  customers: CustomerDto[];
  total: number;
}

// Hàm bổ trợ để bóc tách dữ liệu từ Backend
function unwrapCustomers(payload: unknown): CustomerDto[] {
  if (Array.isArray(payload)) return payload as CustomerDto[];
  if (payload && typeof payload === "object") {
    const obj = payload as any;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.items)) return obj.items;
  }
  return [];
}

export const customerService = {
  // Lấy Profile cá nhân (Dùng cho Profile Page)
  async getMyProfile(): Promise<CustomerDto> {
    const res = await apiClient.get<ApiEnvelope<CustomerDto>>("/api/Customers/me");
    // Nếu BE trả về { data: { ... } } thì lấy .data, nếu không lấy res trực tiếp
    return (res as any).data || res;
  },

  // Cập nhật Profile (Dùng cho nút Save Changes)
  async updateMyProfile(payload: Partial<CustomerDto>): Promise<void> {
    await apiClient.put("/api/Customers/me", payload);
  },

  // Lấy danh sách khách hàng (Dùng cho Admin)
  async getAdminCustomers(query?: AdminCustomersQuery): Promise<AdminCustomersResult> {
    const params = new URLSearchParams();
    if (query?.search) params.set("search", query.search);
    if (query?.page !== undefined) params.set("page", String(query.page));
    if (query?.pageSize !== undefined) params.set("pageSize", String(query.pageSize));
    
    const qs = params.toString();
    const res = await apiClient.get<ApiEnvelope<unknown>>(`/api/Customers${qs ? `?${qs}` : ""}`);
    
    const payload = (res as any)?.data ?? res;
    const customers = unwrapCustomers(payload);
    const total = (payload as any)?.total ?? (payload as any)?.totalCount ?? customers.length;
    
    return { customers, total };
  },

  async deleteAdminCustomer(customerId: number): Promise<void> {
    await apiClient.delete(`/api/Customers/${customerId}`);
  },
};