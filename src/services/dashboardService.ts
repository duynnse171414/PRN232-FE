import { apiClient } from "./apiClient";
import { orderService } from "./orderService";
import { productService } from "./productService";

export interface DashboardSummary {
  totalRevenue: number;
  todayOrders: number;
  newCustomers: number;
  conversionRate: number;
  revenueGrowthPercent: number;
  ordersGrowthPercent: number;
  customersGrowthPercent: number;
  conversionGrowthPercent: number;
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
    todayOrders: pickNumber(payload, [
      "todayOrders",
      "TodayOrders",
      "totalOrders",
      "TotalOrders",
      "orders",
      "Orders",
    ]),
    newCustomers: pickNumber(payload, [
      "newCustomers",
      "NewCustomers",
      "customers",
      "Customers",
    ]),
    conversionRate: pickNumber(payload, [
      "conversionRate",
      "ConversionRate",
      "conversion",
      "Conversion",
    ]),
    revenueGrowthPercent: pickNumber(payload, [
      "revenueGrowthPercent",
      "RevenueGrowthPercent",
      "revenueChangePercent",
      "RevenueChangePercent",
    ]),
    ordersGrowthPercent: pickNumber(payload, [
      "ordersGrowthPercent",
      "OrdersGrowthPercent",
      "ordersChangePercent",
      "OrdersChangePercent",
    ]),
    customersGrowthPercent: pickNumber(payload, [
      "customersGrowthPercent",
      "CustomersGrowthPercent",
      "customersChangePercent",
      "CustomersChangePercent",
    ]),
    conversionGrowthPercent: pickNumber(payload, [
      "conversionGrowthPercent",
      "ConversionGrowthPercent",
      "conversionChangePercent",
      "ConversionChangePercent",
    ]),
  };
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
    return normalizeDashboardSummary(response ?? {});
  },

  async getOverview(): Promise<DashboardOverview> {
    const [summary, ordersResult, productsResult] = await Promise.all([
      this.getSummary(),
      orderService.getAdminOrders({ page: 1, pageSize: 100 }),
      productService.getAdminProducts({ page: 1, limit: 100 }),
    ]);

    return {
      summary,
      revenueData: buildRevenueData(ordersResult.orders),
      categoryData: buildCategoryData(productsResult.products),
      topProducts: buildTopProducts(ordersResult.orders),
      recentOrders: buildRecentOrders(ordersResult.orders),
    };
  },
};
