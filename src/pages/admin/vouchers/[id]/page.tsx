import { useEffect, useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  voucherService,
  type VoucherDto,
  type VoucherInput,
} from "../../../../services/voucherService";

interface EditVoucherPageProps {
  voucherId: string;
  onBack: () => void;
}

function toDateTimeLocal(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const normalized = new Date(date.getTime() - offset * 60_000);
  return normalized.toISOString().slice(0, 16);
}

export default function EditVoucherPage({
  voucherId,
  onBack,
}: EditVoucherPageProps) {
  const [voucher, setVoucher] = useState<VoucherDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVoucher, setIsLoadingVoucher] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    discountPercent: "",
    maxDiscount: "",
    minOrderAmount: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        const data = await voucherService.getVoucherById(voucherId);
        setVoucher(data);
        setFormData({
          code: data.code,
          name: data.name,
          discountPercent: String(data.discountPercent),
          maxDiscount: String(data.maxDiscount),
          minOrderAmount: String(data.minOrderAmount),
          startDate: toDateTimeLocal(data.startDate),
          endDate: toDateTimeLocal(data.endDate),
          isActive: data.isActive,
        });
      } catch (err: any) {
        setError(err?.message ?? "Không tìm thấy voucher");
      } finally {
        setIsLoadingVoucher(false);
      }
    };

    fetchVoucher();
  }, [voucherId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload: VoucherInput = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        discountPercent: Number(formData.discountPercent),
        maxDiscount: Number(formData.maxDiscount),
        minOrderAmount: Number(formData.minOrderAmount),
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
      };

      await voucherService.updateVoucher(voucherId, payload);
      onBack();
    } catch (err: any) {
      setError(err?.message ?? "Không thể cập nhật voucher");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingVoucher) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Chỉnh sửa voucher
          </h1>
        </div>
        <Card className="p-12 text-center text-muted-foreground">Đang tải...</Card>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Chỉnh sửa voucher
          </h1>
        </div>
        <Card className="p-12 text-center text-destructive">
          {error || "Không tìm thấy voucher"}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Chỉnh sửa voucher</h1>
        <p className="text-muted-foreground mt-2">{voucher.code}</p>
      </div>

      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive text-destructive">
          {error}
        </Card>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mã voucher *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, code: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Tên voucher *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountPercent">Giảm giá (%) *</Label>
              <Input
                id="discountPercent"
                type="number"
                min="0"
                max="100"
                value={formData.discountPercent}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    discountPercent: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDiscount">Giảm tối đa *</Label>
              <Input
                id="maxDiscount"
                type="number"
                min="0"
                value={formData.maxDiscount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxDiscount: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minOrderAmount">Đơn tối thiểu *</Label>
              <Input
                id="minOrderAmount"
                type="number"
                min="0"
                value={formData.minOrderAmount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minOrderAmount: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Ngày bắt đầu *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Ngày kết thúc *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            <span className="text-sm text-foreground">Kích hoạt voucher</span>
          </label>

          <div className="flex items-center gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}