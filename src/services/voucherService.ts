import { apiClient } from "./apiClient";

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface VoucherDto {
  id: number;
  code: string;
  name: string;
  discountPercent: number;
  maxDiscount: number;
  minOrderAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface VoucherInput {
  code: string;
  name: string;
  discountPercent: number;
  maxDiscount: number;
  minOrderAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface AdminVouchersResult {
  vouchers: VoucherDto[];
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

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return fallback;
}

function normalizeVoucher(voucher: unknown): VoucherDto | null {
  if (!voucher || typeof voucher !== "object") return null;
  const source = voucher as Record<string, unknown>;

  return {
    id: toNumber(source.id ?? source.Id),
    code: toString(source.code ?? source.Code),
    name: toString(source.name ?? source.Name),
    discountPercent: toNumber(source.discountPercent ?? source.DiscountPercent),
    maxDiscount: toNumber(source.maxDiscount ?? source.MaxDiscount),
    minOrderAmount: toNumber(source.minOrderAmount ?? source.MinOrderAmount),
    startDate: toString(source.startDate ?? source.StartDate),
    endDate: toString(source.endDate ?? source.EndDate),
    isActive: toBoolean(source.isActive ?? source.IsActive),
    createdAt: toString(source.createdAt ?? source.CreatedAt),
  };
}

function unwrapVouchers(payload: unknown): VoucherDto[] {
  const container = payload as Record<string, unknown> | null;

  const rawVouchers = Array.isArray(payload)
    ? payload
    : Array.isArray(container?.data)
      ? container.data
      : Array.isArray(container?.items)
        ? container.items
        : Array.isArray(container?.vouchers)
          ? container.vouchers
          : [];

  return rawVouchers
    .map((voucher) => normalizeVoucher(voucher))
    .filter((voucher): voucher is VoucherDto => voucher !== null);
}

function unwrapVoucher(payload: unknown): VoucherDto | null {
  const container = payload as Record<string, unknown> | null;
  const rawVoucher = container?.data ?? payload;
  return normalizeVoucher(rawVoucher);
}

export const voucherService = {
  async getAdminVouchers(): Promise<AdminVouchersResult> {
    const res = await apiClient.get<ApiEnvelope<unknown> | unknown>(
      "/api/Vouchers",
    );
    const vouchers = unwrapVouchers(res);
    const payload = (res as Record<string, unknown>)?.data ?? res;
    const payloadObj = payload as Record<string, unknown>;
    const total = toNumber(
      payloadObj?.total ?? payloadObj?.totalCount,
      vouchers.length,
    );

    return { vouchers, total };
  },

  async getVoucherById(id: string): Promise<VoucherDto> {
    const res = await apiClient.get<ApiEnvelope<unknown> | unknown>(
      `/api/Vouchers/${id}`,
    );
    const voucher = unwrapVoucher(res);

    if (!voucher) {
      throw new Error("Không tìm thấy voucher");
    }

    return voucher;
  },

  async createVoucher(input: VoucherInput): Promise<void> {
    await apiClient.post<unknown>("/api/Vouchers", input);
  },

  async updateVoucher(id: string, input: VoucherInput): Promise<void> {
    await apiClient.put<unknown>(`/api/Vouchers/${id}`, input);
  },

  async deleteVoucher(id: string): Promise<void> {
    await apiClient.delete(`/api/Vouchers/${id}`);
  },
};
