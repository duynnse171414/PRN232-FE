import { apiClient } from "./apiClient";

export interface AddressDto {
  id: number;
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  isDefault?: boolean;
  line1?: string;
}

export const addressService = {
  async getMyAddresses(): Promise<AddressDto[]> {
    try {
      const res = await apiClient.get<any>("/api/Customers/me/addresses");
      let rawData = res;
      if (res && typeof res === 'object') {
        if (Array.isArray(res.data)) rawData = res.data;
        else if (res.data && Array.isArray(res.data.data)) rawData = res.data.data;
      }
      if (!Array.isArray(rawData)) return [];
      return rawData.map((item: any) => ({
        id: item.id || item.addressId,
        street: item.street || item.line1 || item.addressLine || "Unknown Street",
        ward: item.ward || "",
        district: item.district || "",
        city: item.city || item.province || "",
        province: item.province || "",
        zipCode: item.zipCode || "",
        isDefault: !!item.isDefault
      }));
    } catch (error) {
      console.error("Error fetching addresses:", error);
      return [];
    }
  },

  async createAddress(payload: any): Promise<AddressDto> {
    const res = await apiClient.post<AddressDto>("/api/Customers/me/addresses", payload);
    return (res as any).data || res;
  },

  async updateAddress(id: number, payload: any): Promise<void> {
    await apiClient.put(`/api/Customers/me/addresses/${id}`, payload);
  },

  async deleteAddress(id: number): Promise<void> {
    await apiClient.delete(`/api/Customers/me/addresses/${id}`);
  }
};