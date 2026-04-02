import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card } from "../../components/ui-admin/card";
import { Button } from "../../components/ui-admin/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AdminLayout from "./layout";
import ProductsPage from "./products/page";
import CategoriesPage from "./categories/page";
import EditCategoryPage from "./categories/[id]/page";
import CreateCategoryPage from "./categories/create/page";
import BrandsPage from "./brands/page";
import EditBrandPage from "./brands/[id]/page";
import CreateBrandPage from "./brands/create/page";
import OrdersPage from "./orders/page";
import CustomersPage from "./customers/page";
import VouchersPage from "./vouchers/page";
import EditVoucherPage from "./vouchers/[id]/page";
import CreateVoucherPage from "./vouchers/create/page";
import EditProductPage from "./products/[id]/page";
import CreateProductPage from "./products/create/page";
import {
  dashboardService,
  type DashboardOverview,
  type DashboardSummary,
} from "../../services/dashboardService";

const COLORS = ["#3b82f6", "#0ea5e9", "#06b6d4", "#10b981"];

const StatCard = ({
  icon: Icon,
  label,
  value,
  meta,
  change,
  isPositive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  meta?: string;
  change?: string;
  isPositive?: boolean;
}) => (
  <Card className="p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-2">{label}</p>
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        {change ? (
          <div
            className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {change}
          </div>
        ) : meta ? (
          <p className="mt-2 text-sm text-muted-foreground">{meta}</p>
        ) : null}
      </div>
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {Icon}
      </div>
    </div>
  </Card>
);

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);

  const handleEditProduct = (productId: string) => {
    setEditingProductId(productId);
    setActiveSection("edit-product");
  };

  const handleCreateProduct = () => {
    setActiveSection("create-product");
  };

  const handleEditCategory = (categoryId: string) => {
    setEditingCategoryId(categoryId);
    setActiveSection("edit-category");
  };

  const handleCreateCategory = () => {
    setActiveSection("create-category");
  };

  const handleEditBrand = (brandId: string) => {
    setEditingBrandId(brandId);
    setActiveSection("edit-brand");
  };

  const handleCreateBrand = () => {
    setActiveSection("create-brand");
  };

  const handleEditVoucher = (voucherId: string) => {
    setEditingVoucherId(voucherId);
    setActiveSection("edit-voucher");
  };

  const handleCreateVoucher = () => {
    setActiveSection("create-voucher");
  };

  const renderSection = () => {
    switch (activeSection) {
      case "products":
        return (
          <ProductsPage
            onEditProduct={handleEditProduct}
            onCreateProduct={handleCreateProduct}
          />
        );
      case "categories":
        return (
          <CategoriesPage
            onEditCategory={handleEditCategory}
            onCreateCategory={handleCreateCategory}
          />
        );
      case "brands":
        return (
          <BrandsPage
            onEditBrand={handleEditBrand}
            onCreateBrand={handleCreateBrand}
          />
        );
      case "edit-category":
        if (!editingCategoryId) {
          return (
            <CategoriesPage
              onEditCategory={handleEditCategory}
              onCreateCategory={handleCreateCategory}
            />
          );
        }
        return (
          <EditCategoryPage
            categoryId={editingCategoryId!}
            onBack={() => setActiveSection("categories")}
          />
        );
      case "create-category":
        return (
          <CreateCategoryPage onBack={() => setActiveSection("categories")} />
        );
      case "edit-brand":
        if (!editingBrandId) {
          return (
            <BrandsPage
              onEditBrand={handleEditBrand}
              onCreateBrand={handleCreateBrand}
            />
          );
        }
        return (
          <EditBrandPage
            brandId={editingBrandId}
            onBack={() => setActiveSection("brands")}
          />
        );
      case "create-brand":
        return <CreateBrandPage onBack={() => setActiveSection("brands")} />;
      case "edit-product":
        if (!editingProductId) {
          return (
            <ProductsPage
              onEditProduct={handleEditProduct}
              onCreateProduct={handleCreateProduct}
            />
          );
        }
        return (
          <EditProductPage
            productId={editingProductId!}
            onBack={() => setActiveSection("products")}
          />
        );
      case "create-product":
        return (
          <CreateProductPage onBack={() => setActiveSection("products")} />
        );
      case "orders":
        return <OrdersPage />;
      case "customers":
        return <CustomersPage />;
      case "vouchers":
        return (
          <VouchersPage
            onEditVoucher={handleEditVoucher}
            onCreateVoucher={handleCreateVoucher}
          />
        );
      case "edit-voucher":
        if (!editingVoucherId) {
          return (
            <VouchersPage
              onEditVoucher={handleEditVoucher}
              onCreateVoucher={handleCreateVoucher}
            />
          );
        }
        return (
          <EditVoucherPage
            voucherId={editingVoucherId}
            onBack={() => setActiveSection("vouchers")}
          />
        );
      case "create-voucher":
        return <CreateVoucherPage onBack={() => setActiveSection("vouchers")} />;
      case "dashboard":
      default:
        return <DashboardContent />;
    }
  };

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {renderSection()}
    </AdminLayout>
  );
}

function DashboardContent() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOverview = async () => {
      try {
        const data = await dashboardService.getOverview();
        if (isMounted) {
          setOverview(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard overview", error);
      }
    };

    fetchOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  const summary: DashboardSummary | null = overview?.summary ?? null;

  const getOrderStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      Pending: "Chờ xác nhận",
      Processing: "Đang xử lý",
      Shipped: "Đang giao",
      Delivered: "Hoàn thành",
      Cancelled: "Hủy",
    };
    return labels[status] ?? status;
  };

  const formatRevenue = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  const formatPercentChange = (value: number) => {
    const prefix = value > 0 ? "+" : "";
    return `${prefix}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Chào mừng bạn quay lại! Đây là trang tổng quan của bạn.
          </p>
        </div>
        {/* <Button size="lg">Xuất báo cáo</Button> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ShoppingCart className="w-6 h-6" />}
          label="Tổng doanh thu"
          value={formatRevenue(summary?.totalRevenue ?? 0)}
          meta={`${summary?.completedOrders ?? 0} đơn hoàn thành`}
        />
        <StatCard
          icon={<BarChart3 className="w-6 h-6" />}
          label="Tổng đơn hàng"
          value={String(summary?.totalOrders ?? 0)}
          meta={`Chờ xử lý ${summary?.pendingOrders ?? 0} · Hủy ${summary?.cancelledOrders ?? 0}`}
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Khách hàng"
          value={String(summary?.totalCustomers ?? 0)}
          meta="Tổng số khách hàng trong hệ thống"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Sản phẩm"
          value={String(summary?.totalProducts ?? 0)}
          meta={`${overview?.topProducts.length ?? 0} sản phẩm đang có doanh số`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Doanh thu & Đơn hàng
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overview?.revenueData ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ fill: "#0ea5e9", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Danh mục sản phẩm
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={overview?.categoryData ?? []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(overview?.categoryData ?? []).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Sản phẩm bán chạy
            </h2>
            <Button variant="ghost" size="sm">
              Xem tất cả
            </Button>
          </div>
          <div className="space-y-3">
            {(overview?.topProducts ?? []).map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-3 hover:bg-input rounded-lg transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {product.sales} đơn
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">
                    {formatRevenue(product.revenue)}đ
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Đơn hàng gần đây
            </h2>
            <Button variant="ghost" size="sm">
              Xem tất cả
            </Button>
          </div>
          <div className="space-y-3">
            {(overview?.recentOrders ?? []).map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-4 p-3 hover:bg-input rounded-lg transition-colors border-b border-border last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    #{order.id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.customer}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {formatRevenue(order.total)}đ
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      getOrderStatusLabel(order.status) === "Hoàn thành"
                        ? "bg-green-100 text-green-700"
                        : getOrderStatusLabel(order.status) === "Đang giao"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {getOrderStatusLabel(order.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
