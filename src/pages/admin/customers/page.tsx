import { useState, useEffect } from "react";
import { Search, Mail, Phone, MapPin, Trash2, Loader2 } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  customerService,
  CustomerDto,
} from "../../../services/customerService";

function getCustomerName(c: CustomerDto): string {
  return c.fullName ?? c.name ?? c.email;
}

function getCustomerPhone(c: CustomerDto): string {
  return c.phoneNumber ?? c.phone ?? "—";
}

function getCustomerLocation(c: CustomerDto): string {
  const selectedAddress =
    c.addresses?.find((address) => address.isDefault) ?? c.addresses?.[0];

  if (selectedAddress) {
    const parts = [
      selectedAddress.addressLine,
      selectedAddress.ward,
      selectedAddress.district,
      selectedAddress.city,
    ].filter(Boolean);

    if (parts.length > 0) return parts.join(", ");
  }

  return c.city ?? c.province ?? c.address ?? "—";
}

function isActive(c: CustomerDto): boolean {
  if (c.isActive !== undefined) return c.isActive;
  if (c.status)
    return (
      c.status.toLowerCase() !== "inactive" &&
      c.status.toLowerCase() !== "banned"
    );
  return true;
}

function getJoinDate(c: CustomerDto): string {
  const raw = c.createdAt ?? c.joinDate;
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString("vi-VN");
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");

  const statuses = ["Tất cả", "Hoạt động", "Không hoạt động"];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await customerService.getAdminCustomers();
        setCustomers(result.customers);
      } catch (err: any) {
        setError(err?.message ?? "Không thể tải khách hàng");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const name = getCustomerName(customer).toLowerCase();
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCustomerPhone(customer).includes(searchTerm);
    const active = isActive(customer);
    const matchesStatus =
      selectedStatus === "Tất cả" ||
      (selectedStatus === "Hoạt động" && active) ||
      (selectedStatus === "Không hoạt động" && !active);
    return matchesSearch && matchesStatus;
  });

  const activeCount = customers.filter(isActive).length;
  const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent ?? 0), 0);

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa khách hàng này?")) return;
    try {
      await customerService.deleteAdminCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err?.message ?? "Xóa thất bại");
    }
  };

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

      {/* Customers Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => {
              const active = isActive(customer);
              return (
                <Card
                  key={customer.id}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                        {getCustomerName(customer).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {getCustomerName(customer)}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Tham gia {getJoinDate(customer)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {active ? "Hoạt động" : "Không hoạt động"}
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
                      <span className="text-muted-foreground">
                        {getCustomerPhone(customer)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">
                        {getCustomerLocation(customer)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDelete(customer.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                  {activeCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Tổng chi tiêu
                </p>
                <p className="text-2xl font-bold text-primary">
                  {totalSpent.toLocaleString("vi-VN")}đ
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
