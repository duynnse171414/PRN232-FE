import { useState } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  voucherService,
  type VoucherInput,
} from "../../../../services/voucherService";

interface CreateVoucherPageProps {
  onBack: () => void;
}

const initialFormData = {
  code: "",
  name: "",
  discountPercent: "",
  maxDiscount: "",
  minOrderAmount: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

export default function CreateVoucherPage({ onBack }: CreateVoucherPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormData);

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

      await voucherService.createVoucher(payload);
      onBack();
    } catch (err: any) {
      setError(err?.message ?? "Không thể tạo voucher");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tạo voucher mới</h1>
        <p className="text-muted-foreground mt-2">
          Thêm mã giảm giá mới vào hệ thống
        </p>
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
                placeholder="WELCOME10"
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
                placeholder="Giảm 10% đơn đầu"
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
              {isLoading ? "Đang tạo..." : "Tạo voucher"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}