import { useState } from "react";
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

const customers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "+84 912 345 678",
    location: "Hà Nội",
    orders: 5,
    spent: "1,245,000",
    status: "Hoạt động",
    joinDate: "2023-01-15",
    avatar: "👨",
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "tranthib@email.com",
    phone: "+84 912 456 789",
    location: "TPHCM",
    orders: 3,
    spent: "875,500",
    status: "Hoạt động",
    joinDate: "2023-03-20",
    avatar: "👩",
  },
  {
    id: 3,
    name: "Lê Văn C",
    email: "levanc@email.com",
    phone: "+84 912 567 890",
    location: "Đà Nẵng",
    orders: 8,
    spent: "2,156,000",
    status: "Hoạt động",
    joinDate: "2023-02-10",
    avatar: "👨",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    email: "phamthid@email.com",
    phone: "+84 912 678 901",
    location: "Hải Phòng",
    orders: 2,
    spent: "450,000",
    status: "Không hoạt động",
    joinDate: "2023-05-05",
    avatar: "👩",
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    email: "hoangvane@email.com",
    phone: "+84 912 789 012",
    location: "Cần Thơ",
    orders: 6,
    spent: "1,678,000",
    status: "Hoạt động",
    joinDate: "2023-04-18",
    avatar: "👨",
  },
  {
    id: 6,
    name: "Đỗ Thị F",
    email: "dothif@email.com",
    phone: "+84 912 890 123",
    location: "Hà Nội",
    orders: 4,
    spent: "892,500",
    status: "Hoạt động",
    joinDate: "2023-06-22",
    avatar: "👩",
  },
];

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const statuses = ["Tất cả", "Hoạt động", "Không hoạt động"];

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    const matchesStatus =
      selectedStatus === "Tất cả" || customer.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý khách hàng
          </h1>
          <p className="text-muted-foreground mt-1">
            Xem và quản lý danh sách khách hàng của bạn
          </p>
        </div>
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          Thêm khách hàng
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, email hoặc điện thoại..."
                className="pl-10 bg-input border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
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

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <Card
            key={customer.id}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
                  {customer.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {customer.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Tham gia {customer.joinDate}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  customer.status === "Hoạt động"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {customer.status}
              </span>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4 pb-4 border-b border-border">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground truncate">
                  {customer.email}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">
                  {customer.location}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-border">
              <div className="bg-input rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground">Đơn hàng</p>
                <p className="text-lg font-bold text-primary">
                  {customer.orders}
                </p>
              </div>
              <div className="bg-input rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground">Đã chi</p>
                <p className="text-lg font-bold text-primary">
                  {customer.spent}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 text-sm">
                <MessageSquare className="w-4 h-4 mr-1" />
                Tin nhắn
              </Button>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-red-600">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy khách hàng</p>
        </Card>
      )}

      {/* Summary Stats */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5">
        <h3 className="font-semibold text-foreground mb-4">
          Thống kê khách hàng
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Tổng khách hàng
            </p>
            <p className="text-2xl font-bold text-foreground">
              {customers.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Hoạt động</p>
            <p className="text-2xl font-bold text-green-600">
              {customers.filter((c) => c.status === "Hoạt động").length}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-primary">
              {customers
                .reduce(
                  (sum, c) => sum + parseInt(c.spent.replace(/,/g, "")),
                  0,
                )
                .toLocaleString()}
              đ
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Trung bình chi</p>
            <p className="text-2xl font-bold text-accent">
              {Math.round(
                customers.reduce(
                  (sum, c) => sum + parseInt(c.spent.replace(/,/g, "")),
                  0,
                ) / customers.length,
              ).toLocaleString()}
              đ
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
