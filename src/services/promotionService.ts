import { apiClient } from "./apiClient";

export interface Promotion {
  id: number | string;
  name: string;
  discount_percent?: number;
  start_date?: string;
  end_date?: string;
}

function toNumber(value: unknown): number | undefined {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const obj = payload as any;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.results)) return obj.results;
  }
  return [];
}

export const promotionService = {
  async getPromotions(): Promise<Promotion[]> {
    const res = await apiClient.get<unknown>("/api/Promotions");
    return unwrapArray<any>(res).map((x) => ({
      id: x.id,
      name: x.name,
      discount_percent: toNumber(
        x.discount_percent ??
          x.discountPercent ??
          x.discount_percentage ??
          x.discountPercentage ??
          x.percent ??
          x.value,
      ),
      start_date: x.start_date,
      end_date: x.end_date,
    }));
  },
};
