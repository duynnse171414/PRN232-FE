import { apiClient } from "./apiClient";
import { productService } from "./productService";

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

export interface DashboardRevenuePoint {
  month: string;
  revenue: number;
  orders: number;
}

export interface DashboardCategoryPoint {
  name: string;
  value: number;
}

export interface DashboardTopProduct {
  id: number;
  name: string;
  sales: number;
  revenue: number;
}

export interface DashboardRecentOrder {
  id: number;
  customer: string;
  total: number;
  status: string;
  date: string;
}

export interface DashboardOverview {
  summary: DashboardSummary;
  revenueData: DashboardRevenuePoint[];
  categoryData: DashboardCategoryPoint[];
  topProducts: DashboardTopProduct[];
  recentOrders: DashboardRecentOrder[];
}

function pickNumber(
  payload: Record<string, unknown>,
  keys: string[],
  defaultValue = 0,
) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }

  return defaultValue;
}

function pickString(
  payload: Record<string, unknown>,
  keys: string[],
  defaultValue = "",
) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value;
  }

  return defaultValue;
}

function unwrapObject(payload: unknown): Record<string, unknown> {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const obj = payload as Record<string, unknown>;
    if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
      return obj.data as Record<string, unknown>;
    }
    return obj;
  }

  return {};
}

function normalizeDashboardSummary(
  payload: Record<string, unknown>,
): DashboardSummary {
  return {
    totalRevenue: pickNumber(payload, [
      "totalRevenue",
      "TotalRevenue",
      "revenue",
      "Revenue",
    ]),
    totalOrders: pickNumber(payload, [
      "totalOrders",
      "TotalOrders",
      "orders",
      "Orders",
    ]),
    pendingOrders: pickNumber(payload, ["pendingOrders", "PendingOrders"]),
    completedOrders: pickNumber(payload, [
      "completedOrders",
      "CompletedOrders",
    ]),
    cancelledOrders: pickNumber(payload, [
      "cancelledOrders",
      "CancelledOrders",
    ]),
    totalCustomers: pickNumber(payload, [
      "totalCustomers",
      "TotalCustomers",
      "customers",
      "Customers",
    ]),
    totalProducts: pickNumber(payload, [
      "totalProducts",
      "TotalProducts",
      "products",
      "Products",
    ]),
  };
}

function normalizeTopProducts(
  payload: Record<string, unknown>,
): DashboardTopProduct[] {
  const topSellingProducts = Array.isArray(payload.topSellingProducts)
    ? payload.topSellingProducts
    : Array.isArray(payload.TopSellingProducts)
      ? payload.TopSellingProducts
      : [];

  return topSellingProducts
    .filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === "object",
    )
    .map((item) => ({
      id: pickNumber(item, ["productId", "ProductId", "id", "Id"]),
      name: String(
        item.productName ??
          item.ProductName ??
          item.name ??
          item.Name ??
          "Sản phẩm",
      ),
      sales: pickNumber(item, [
        "totalQuantitySold",
        "TotalQuantitySold",
        "sales",
        "Sales",
        "quantity",
        "Quantity",
      ]),
      revenue: pickNumber(item, [
        "totalRevenue",
        "TotalRevenue",
        "revenue",
        "Revenue",
      ]),
    }))
    .filter((item) => item.id > 0 || item.name);
}

function normalizeRevenueData(
  payload: Record<string, unknown>,
): DashboardRevenuePoint[] {
  const revenueData = Array.isArray(payload.revenueData)
    ? payload.revenueData
    : Array.isArray(payload.RevenueData)
      ? payload.RevenueData
      : [];

  return revenueData
    .filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === "object",
    )
    .map((item) => ({
      month: pickString(item, ["month", "Month", "label", "Label"]),
      revenue: pickNumber(item, [
        "revenue",
        "Revenue",
        "totalRevenue",
        "TotalRevenue",
      ]),
      orders: pickNumber(item, [
        "orders",
        "Orders",
        "totalOrders",
        "TotalOrders",
      ]),
    }))
    .filter((item) => item.month.length > 0);
}

function normalizeCategoryData(
  payload: Record<string, unknown>,
): DashboardCategoryPoint[] {
  const categoryData = Array.isArray(payload.categoryData)
    ? payload.categoryData
    : Array.isArray(payload.CategoryData)
      ? payload.CategoryData
      : [];

  return categoryData
    .filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === "object",
    )
    .map((item) => ({
      name: pickString(item, ["name", "Name", "categoryName", "CategoryName"]),
      value: pickNumber(item, [
        "value",
        "Value",
        "count",
        "Count",
        "percentage",
        "Percentage",
        "totalProducts",
        "TotalProducts",
      ]),
    }))
    .filter((item) => item.name.length > 0);
}

function normalizeRecentOrders(
  payload: Record<string, unknown>,
): DashboardRecentOrder[] {
  const recentOrders = Array.isArray(payload.recentOrders)
    ? payload.recentOrders
    : Array.isArray(payload.RecentOrders)
      ? payload.RecentOrders
      : [];

  return recentOrders
    .filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === "object",
    )
    .map((item) => ({
      id: pickNumber(item, ["id", "Id", "orderId", "OrderId"]),
      customer: pickString(item, [
        "customer",
        "Customer",
        "customerName",
        "CustomerName",
      ]),
      total: pickNumber(item, ["total", "Total", "totalAmount", "TotalAmount"]),
      status: pickString(item, ["status", "Status"], "Pending"),
      date: pickString(item, ["date", "Date", "createdAt", "CreatedAt"]),
    }))
    .filter((item) => item.id > 0 || item.customer.length > 0);
}

function getMonthLabel(date: Date) {
  return `T${date.getMonth() + 1}`;
}

function buildRevenueData(
  orders: Array<{ createdAt: string; totalAmount: number }>,
): DashboardRevenuePoint[] {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: getMonthLabel(date),
      revenue: 0,
      orders: 0,
    };
  });

  const byKey = new Map(months.map((item) => [item.key, item]));

  for (const order of orders) {
    const createdAt = new Date(order.createdAt);
    if (Number.isNaN(createdAt.getTime())) continue;

    const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
    const bucket = byKey.get(key);
    if (!bucket) continue;

    bucket.revenue += order.totalAmount ?? 0;
    bucket.orders += 1;
  }

  return months.map(({ month, revenue, orders }) => ({
    month,
    revenue,
    orders,
  }));
}

function buildCategoryData(
  products: Array<{ category: string }>,
): DashboardCategoryPoint[] {
  if (products.length === 0) return [];

  const counts = new Map<string, number>();
  for (const product of products) {
    const categoryName = product.category || "Khác";
    counts.set(categoryName, (counts.get(categoryName) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      value: Math.round((count / products.length) * 100),
    }));
}

function buildTopProducts(
  orders: Array<{
    items?: Array<{
      productId: number;
      productName: string;
      quantity: number;
      price: number;
    }>;
  }>,
): DashboardTopProduct[] {
  const stats = new Map<
    number,
    { id: number; name: string; sales: number; revenue: number }
  >();

  for (const order of orders) {
    for (const item of order.items ?? []) {
      const current = stats.get(item.productId) ?? {
        id: item.productId,
        name: item.productName,
        sales: 0,
        revenue: 0,
      };

      current.sales += item.quantity ?? 0;
      current.revenue += (item.quantity ?? 0) * (item.price ?? 0);
      stats.set(item.productId, current);
    }
  }

  return Array.from(stats.values())
    .sort((a, b) => b.sales - a.sales || b.revenue - a.revenue)
    .slice(0, 5);
}

function buildRecentOrders(
  orders: Array<{
    id: number;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>,
): DashboardRecentOrder[] {
  return [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5)
    .map((order) => ({
      id: order.id,
      customer: order.customerName,
      total: order.totalAmount,
      status: order.status,
      date: order.createdAt,
    }));
}

export const dashboardService = {
  async getSummary() {
    const response = await apiClient.get<Record<string, unknown>>(
      "/api/Dashboard/summary",
    );
    const payload = unwrapObject(response);
    const summaryPayload = payload.summary
      ? unwrapObject(payload.summary)
      : payload;

    return normalizeDashboardSummary(summaryPayload);
  },

  async getOverview(): Promise<DashboardOverview> {
    const summaryResponse = await apiClient.get<Record<string, unknown>>(
      "/api/Dashboard/summary",
    );
    const payload = unwrapObject(summaryResponse);
    const summaryPayload = payload.summary
      ? unwrapObject(payload.summary)
      : payload;
    const summary = normalizeDashboardSummary(summaryPayload);
    const topProducts = normalizeTopProducts(payload).length
      ? normalizeTopProducts(payload)
      : normalizeTopProducts(summaryPayload);
    const revenueData = normalizeRevenueData(payload);
    let categoryData = normalizeCategoryData(payload);
    const recentOrders = normalizeRecentOrders(payload);

    if (categoryData.length === 0) {
      const productsResult = await productService
        .getAdminProducts({ page: 1, limit: 100 })
        .catch(() => null);

      categoryData = buildCategoryData(productsResult?.products ?? []);
    }

    return {
      summary,
      revenueData,
      categoryData,
      topProducts,
      recentOrders,
    };
  },
};
