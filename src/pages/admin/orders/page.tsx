import { useState } from "react";
import { Search, ChevronDown, Eye, Printer } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

const orders = [
  {
    id: "ĐH001",
    customer: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    products: 3,
    total: "245,500,000",
    status: "Hoàn thành",
    date: "2024-03-10",
    payment: "Chuyển khoản",
  },
  {
    id: "ĐH002",
    customer: "Trần Thị B",
    email: "tranthib@email.com",
    products: 2,
    total: "128,300,000",
    status: "Đang giao",
    date: "2024-03-09",
    payment: "Thẻ tín dụng",
  },
  {
    id: "ĐH003",
    customer: "Lê Văn C",
    email: "levanc@email.com",
    products: 1,
    total: "156,800,000",
    status: "Chờ xác nhận",
    date: "2024-03-08",
    payment: "QR Code",
  },
  {
    id: "ĐH004",
    customer: "Phạm Thị D",
    email: "phamthid@email.com",
    products: 4,
    total: "389,200,000",
    status: "Hoàn thành",
    date: "2024-03-07",
    payment: "COD",
  },
  {
    id: "ĐH005",
    customer: "Hoàng Văn E",
    email: "hoangvane@email.com",
    products: 2,
    total: "195,600,000",
    status: "Hủy",
    date: "2024-03-06",
    payment: "Chuyển khoản",
  },
  {
    id: "ĐH006",
    customer: "Đỗ Thị F",
    email: "dothif@email.com",
    products: 3,
    total: "325,400,000",
    status: "Đang giao",
    date: "2024-03-05",
    payment: "Thẻ tín dụng",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Hoàn thành":
      return "bg-green-100 text-green-700";
    case "Đang giao":
      return "bg-blue-100 text-blue-700";
    case "Chờ xác nhận":
      return "bg-yellow-100 text-yellow-700";
    case "Hủy":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const statuses = ["Tất cả", "Chờ xác nhận", "Đang giao", "Hoàn thành", "Hủy"];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "Tất cả" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Orders List */}
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
                      {order.id}
                    </h3>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {order.date}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Khách hàng</p>
                      <p className="font-medium text-foreground">
                        {order.customer}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sản phẩm</p>
                      <p className="font-medium text-foreground">
                        {order.products} sản phẩm
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Thanh toán</p>
                      <p className="font-medium text-foreground">
                        {order.payment}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tổng tiền</p>
                      <p className="font-semibold text-primary">
                        {order.total}đ
                      </p>
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform ${
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
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium text-foreground">{order.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Ngày đặt hàng
                    </p>
                    <p className="font-medium text-foreground">{order.date}</p>
                  </div>
                </div>

                <div className="bg-input rounded-lg p-4">
                  <p className="text-sm font-semibold text-foreground mb-3">
                    Chi tiết đơn hàng
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span className="font-medium text-foreground">
                        {order.total}đ
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Phí vận chuyển
                      </span>
                      <span className="font-medium text-foreground">
                        30,000đ
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giảm giá</span>
                      <span className="font-medium text-green-600">
                        -50,000đ
                      </span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2 flex justify-between">
                      <span className="font-semibold text-foreground">
                        Tổng cộng
                      </span>
                      <span className="font-bold text-primary text-lg">
                        {parseInt(order.total.replace(/,/g, "")) +
                          30000 -
                          50000}
                        đ
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Xem chi tiết
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Printer className="w-4 h-4 mr-2" />
                    In đơn hàng
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

      {/* Summary */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tổng đơn hàng</p>
            <p className="text-2xl font-bold text-foreground">
              {filteredOrders.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-primary">
              {filteredOrders
                .reduce(
                  (sum, order) => sum + parseInt(order.total.replace(/,/g, "")),
                  0,
                )
                .toLocaleString()}
              đ
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Hoàn thành</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredOrders.filter((o) => o.status === "Hoàn thành").length}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
