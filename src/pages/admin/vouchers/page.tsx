import { useEffect, useMemo, useState } from "react";
import {
  Edit2,
  Loader2,
  Plus,
  Search,
  TicketPercent,
  Trash2,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  voucherService,
  type VoucherDto,
} from "../../../services/voucherService";

interface VouchersPageProps {
  onEditVoucher: (voucherId: string) => void;
  onCreateVoucher: () => void;
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function formatDate(value: string) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("vi-VN");
}

function getVoucherStatus(voucher: VoucherDto) {
  const now = Date.now();
  const start = new Date(voucher.startDate).getTime();
  const end = new Date(voucher.endDate).getTime();

  if (!voucher.isActive) {
    return { label: "Tắt", className: "bg-gray-100 text-gray-700" };
  }

  if (!Number.isNaN(start) && now < start) {
    return { label: "Sắp diễn ra", className: "bg-blue-100 text-blue-700" };
  }

  if (!Number.isNaN(end) && now > end) {
    return { label: "Hết hạn", className: "bg-red-100 text-red-700" };
  }

  return { label: "Đang áp dụng", className: "bg-green-100 text-green-700" };
}

export default function VouchersPage({
  onEditVoucher,
  onCreateVoucher,
}: VouchersPageProps) {
  const [vouchers, setVouchers] = useState<VoucherDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const statuses = ["Tất cả", "Đang áp dụng", "Sắp diễn ra", "Hết hạn", "Tắt"];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await voucherService.getAdminVouchers();
        setVouchers(result.vouchers);
      } catch (err: any) {
        setError(err?.message ?? "Không thể tải voucher");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredVouchers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return vouchers.filter((voucher) => {
      const status = getVoucherStatus(voucher).label;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        voucher.code.toLowerCase().includes(normalizedSearch) ||
        voucher.name.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        selectedStatus === "Tất cả" || status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatus, vouchers]);

  const activeCount = filteredVouchers.filter(
    (voucher) => getVoucherStatus(voucher).label === "Đang áp dụng",
  ).length;
  const totalDiscountBudget = filteredVouchers.reduce(
    (sum, voucher) => sum + voucher.maxDiscount,
    0,
  );

  const handleDelete = async (id: string) => {
    try {
      await voucherService.deleteVoucher(id);
      setVouchers((prev) => prev.filter((voucher) => String(voucher.id) !== id));
    } catch (err: any) {
      setError(err?.message ?? "Không thể xóa voucher");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý voucher
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi danh sách mã giảm giá đang có trong hệ thống
          </p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onCreateVoucher}
        >
          <Plus className="w-5 h-5 mr-2" />
          Tạo voucher
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã voucher hoặc tên chương trình..."
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

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredVouchers.map((voucher) => {
              const status = getVoucherStatus(voucher);

              return (
                <Card key={voucher.id} className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <TicketPercent className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {voucher.code}
                          </p>
                          <h3 className="font-semibold text-foreground">
                            {voucher.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="bg-input rounded-lg p-3">
                      <p className="text-muted-foreground mb-1">Giảm giá</p>
                      <p className="font-semibold text-foreground">
                        {voucher.discountPercent}%
                      </p>
                    </div>
                    <div className="bg-input rounded-lg p-3">
                      <p className="text-muted-foreground mb-1">Giảm tối đa</p>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(voucher.maxDiscount)}
                      </p>
                    </div>
                    <div className="bg-input rounded-lg p-3">
                      <p className="text-muted-foreground mb-1">
                        Đơn tối thiểu
                      </p>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(voucher.minOrderAmount)}
                      </p>
                    </div>
                    <div className="bg-input rounded-lg p-3">
                      <p className="text-muted-foreground mb-1">Ngày tạo</p>
                      <p className="font-semibold text-foreground">
                        {formatDate(voucher.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Bắt đầu</p>
                      <p className="font-medium text-foreground">
                        {formatDate(voucher.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Kết thúc</p>
                      <p className="font-medium text-foreground">
                        {formatDate(voucher.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditVoucher(String(voucher.id))}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(String(voucher.id))}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredVouchers.length === 0 && (
            <Card className="text-center py-12">
              <p className="text-muted-foreground">Không tìm thấy voucher</p>
            </Card>
          )}

          <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Tổng voucher
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {filteredVouchers.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Đang áp dụng
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {activeCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Tổng mức giảm tối đa
                </p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(totalDiscountBudget)}
                </p>
              </div>
            </div>
          </Card>

          {deleteId && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md p-6">
                <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
                <p className="text-muted-foreground mb-6">
                  Bạn có chắc chắn muốn xóa voucher này? Hành động này không thể
                  hoàn tác.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteId(null)}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(deleteId)}
                    className="flex-1"
                  >
                    Xóa
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
