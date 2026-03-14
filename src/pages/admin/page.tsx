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
import OrdersPage from "./orders/page";
import CustomersPage from "./customers/page";
import BlogPage from "./blog/page";
import SettingsPage from "./settings/page";
import EditProductPage from "./products/[id]/page";
import CreateProductPage from "./products/create/page";

const revenueData = [
  { month: "T1", revenue: 4000, orders: 240 },
  { month: "T2", revenue: 5200, orders: 290 },
  { month: "T3", revenue: 4800, orders: 260 },
  { month: "T4", revenue: 6200, orders: 340 },
  { month: "T5", revenue: 5800, orders: 310 },
  { month: "T6", revenue: 7200, orders: 420 },
];

const categoryData = [
  { name: "Laptop", value: 35 },
  { name: "PC", value: 25 },
  { name: "Phụ kiện", value: 20 },
  { name: "Linh kiện", value: 20 },
];

const COLORS = ["#3b82f6", "#0ea5e9", "#06b6d4", "#10b981"];

const topProducts = [
  { id: 1, name: "Gaming Laptop ASUS ROG", sales: 250, revenue: "125M" },
  { id: 2, name: "RTX 4070 Graphics Card", sales: 180, revenue: "90M" },
  { id: 3, name: "Razer Mechanical Keyboard", sales: 320, revenue: "48M" },
  { id: 4, name: "Gaming Monitor LG 240Hz", sales: 145, revenue: "72.5M" },
  { id: 5, name: "Steelseries Gaming Headset", sales: 220, revenue: "33M" },
];

const recentOrders = [
  {
    id: "ĐH001",
    customer: "Nguyễn Văn A",
    total: "45.5M",
    status: "Hoàn thành",
    date: "2024-03-10",
  },
  {
    id: "ĐH002",
    customer: "Trần Thị B",
    total: "28.3M",
    status: "Đang giao",
    date: "2024-03-09",
  },
  {
    id: "ĐH003",
    customer: "Lê Văn C",
    total: "156.8M",
    status: "Chờ xác nhận",
    date: "2024-03-08",
  },
  {
    id: "ĐH004",
    customer: "Phạm Thị D",
    total: "89.2M",
    status: "Hoàn thành",
    date: "2024-03-07",
  },
];

const StatCard = ({
  icon: Icon,
  label,
  value,
  change,
  isPositive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}) => (
  <Card className="p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-2">{label}</p>
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
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
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  useEffect(() => {
    if (editingProductId) {
      setActiveSection("edit-product");
    }
  }, [editingProductId]);

  useEffect(() => {
    if (isCreatingProduct) {
      setActiveSection("create-product");
      setIsCreatingProduct(false); // Reset after setting section
    }
  }, [isCreatingProduct]);

  useEffect(() => {
    if (editingCategoryId) {
      setActiveSection("edit-category");
    }
  }, [editingCategoryId]);

  useEffect(() => {
    if (isCreatingCategory) {
      setActiveSection("create-category");
      setIsCreatingCategory(false); // Reset after setting section
    }
  }, [isCreatingCategory]);

  const renderSection = () => {
    switch (activeSection) {
      case "products":
        return (
          <ProductsPage
            onEditProduct={setEditingProductId}
            onCreateProduct={() => setIsCreatingProduct(true)}
          />
        );
      case "categories":
        return (
          <CategoriesPage
            onEditCategory={setEditingCategoryId}
            onCreateCategory={() => setIsCreatingCategory(true)}
          />
        );
      case "edit-category":
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
      case "edit-product":
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
      case "blog":
        return <BlogPage />;
      case "settings":
        return <SettingsPage />;
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
        <Button size="lg">Xuất báo cáo</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ShoppingCart className="w-6 h-6" />}
          label="Tổng doanh thu"
          value="32.8M"
          change="+12.5%"
          isPositive={true}
        />
        <StatCard
          icon={<BarChart3 className="w-6 h-6" />}
          label="Đơn hàng hôm nay"
          value="24"
          change="+8.2%"
          isPositive={true}
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Khách hàng mới"
          value="186"
          change="+3.1%"
          isPositive={true}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Tỷ lệ chuyển đổi"
          value="3.24%"
          change="-0.5%"
          isPositive={false}
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
            <LineChart data={revenueData}>
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
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
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
            {topProducts.map((product, index) => (
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
                    {product.revenue}đ
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
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-4 p-3 hover:bg-input rounded-lg transition-colors border-b border-border last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {order.id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.customer}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {order.total}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      order.status === "Hoàn thành"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Đang giao"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
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
