import { useState, useEffect } from "react";
import { Search, ChevronDown, Eye, Loader2 } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { orderService, OrderDto } from "../../../services/orderService";

const STATUS_MAP: Record<string, string> = {
  Pending: "Chờ xác nhận",
  Processing: "Đang xử lý",
  Shipped: "Đang giao",
  Delivered: "Hoàn thành",
  Cancelled: "Hủy",
};

const getStatusLabel = (status: string) => STATUS_MAP[status] ?? status;

const getStatusColor = (status: string) => {
  switch (status) {
    case "Delivered":
    case "Hoàn thành":
      return "bg-green-100 text-green-700";
    case "Shipped":
    case "Đang giao":
      return "bg-blue-100 text-blue-700";
    case "Processing":
    case "Đang xử lý":
      return "bg-orange-100 text-orange-700";
    case "Pending":
    case "Chờ xác nhận":
      return "bg-yellow-100 text-yellow-700";
    case "Cancelled":
    case "Hủy":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const statuses = [
    "Tất cả",
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];
  const statusLabels: Record<string, string> = {
    "Tất cả": "Tất cả",
    Pending: "Chờ xác nhận",
    Processing: "Đang xử lý",
    Shipped: "Đang giao",
    Delivered: "Hoàn thành",
    Cancelled: "Hủy",
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await orderService.getAdminOrders();
        setOrders(result.orders);
      } catch (err: any) {
        setError(err?.message ?? "Không thể tải đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      String(order.id).includes(searchTerm) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "Tất cả" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = filteredOrders.reduce(
    (sum, o) => sum + o.totalAmount,
    0,
  );
  const completedCount = filteredOrders.filter(
    (o) => o.status === "Delivered",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý đơn hàng
          </h1>
          <p className="text-muted-foreground mt-1">
            Xem và quản lý tất cả các đơn hàng của bạn
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã đơn hàng hoặc tên khách hàng..."
                className="pl-10 bg-input border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? "bg-primary text-white"
                    : "bg-input text-foreground hover:bg-secondary"
                }`}
              >
                {statusLabels[status] ?? status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Loading / Error */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      {error && (
        <Card className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </Card>
      )}

      {/* Orders List */}
      {!loading && !error && (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <button
                onClick={() =>
                  setExpandedOrder(expandedOrder === order.id ? null : order.id)
                }
                className="w-full p-4 hover:bg-input/50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-foreground">
                        #{order.id}
                      </h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Khách hàng</p>
                        <p className="font-medium text-foreground">
                          {order.customerName}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sản phẩm</p>
                        <p className="font-medium text-foreground">
                          {order.items?.length ?? 0} sản phẩm
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tổng tiền</p>
                        <p className="font-semibold text-primary">
                          {order.totalAmount.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ml-4 ${
                      expandedOrder === order.id ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Expanded Details */}
              {expandedOrder === order.id && (
                <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Ghi chú
                      </p>
                      <p className="font-medium text-foreground">
                        {order.notes ?? "Không có"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Mã vận đơn
                      </p>
                      <p className="font-medium text-foreground">
                        {order.trackingNumber ?? "Chưa có"}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="bg-input rounded-lg p-4">
                      <p className="text-sm font-semibold text-foreground mb-3">
                        Danh sách sản phẩm
                      </p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-foreground">
                              {item.productName} × {item.quantity}
                            </span>
                            <span className="font-medium text-foreground">
                              {(item.price * item.quantity).toLocaleString(
                                "vi-VN",
                              )}
                              đ
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-border pt-2 mt-2 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Phí vận chuyển
                            </span>
                            <span className="font-medium text-foreground">
                              {order.shippingFee.toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold text-foreground">
                              Tổng cộng
                            </span>
                            <span className="font-bold text-primary text-lg">
                              {order.totalAmount.toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}

          {filteredOrders.length === 0 && (
            <Card className="text-center py-12">
              <p className="text-muted-foreground">Không tìm thấy đơn hàng</p>
            </Card>
          )}
        </div>
      )}

      {/* Summary */}
      {!loading && !error && (
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Tổng đơn hàng
              </p>
              <p className="text-2xl font-bold text-foreground">
                {filteredOrders.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Tổng doanh thu
              </p>
              <p className="text-2xl font-bold text-primary">
                {totalRevenue.toLocaleString("vi-VN")}đ
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Hoàn thành</p>
              <p className="text-2xl font-bold text-green-600">
                {completedCount}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
