import { AddressOption } from "../types";
import { apiClient } from "./apiClient";

function normalizeAddressList(payload: unknown): any[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const obj = payload as any;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.items)) return obj.items;
  }
  return [];
}

function mapAddress(item: any, index: number): AddressOption | null {
  const id = Number(item?.id ?? item?.addressId ?? index + 1);
  if (!Number.isFinite(id) || id <= 0) return null;

  const label =
    [
      item?.line1,
      item?.line2,
      item?.addressLine,
      item?.street,
      item?.ward,
      item?.district,
      item?.city,
      item?.province,
      item?.country,
    ]
      .filter(Boolean)
      .join(", ") || `Address #${id}`;

  return { id, label };
}

export const addressService = {
  async getMyAddresses(): Promise<AddressOption[]> {
    try {
      const res = await apiClient.get<unknown>("/api/Customers/me/addresses");
      const rawList = normalizeAddressList(res);
      return rawList
        .map((item, index) => mapAddress(item, index))
        .filter((x): x is AddressOption => !!x);
    } catch {
      return [];
    }
  },
};
