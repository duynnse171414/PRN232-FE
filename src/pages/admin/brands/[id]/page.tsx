import { useState, useEffect } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { brandService } from "../../../../services/brandService";
import { Brand, BrandInput } from "../../../../types";

interface EditBrandPageProps {
  brandId: string;
  onBack: () => void;
}

export default function EditBrandPage({ brandId, onBack }: EditBrandPageProps) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBrand, setIsLoadingBrand] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const data = await brandService.getBrandById(brandId);
        setBrand(data);
        setFormData({
          name: data.name,
        });
      } catch (err) {
        setError("Không tìm thấy thương hiệu");
        console.error(err);
      } finally {
        setIsLoadingBrand(false);
      }
    };

    fetchBrand();
  }, [brandId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload: BrandInput = {
        name: formData.name,
      };

      await brandService.updateBrand(brandId, payload);
      onBack();
    } catch (err) {
      setError("Lỗi kết nối");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoadingBrand) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Chỉnh sửa thương hiệu
          </h1>
        </div>
        <Card className="p-12 text-center text-muted-foreground">
          Đang tải...
        </Card>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Chỉnh sửa thương hiệu
          </h1>
        </div>
        <Card className="p-12 text-center text-destructive">
          {error || "Không tìm thấy thương hiệu"}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Chỉnh sửa thương hiệu
        </h1>
        <p className="text-muted-foreground mt-2">{brand.name}</p>
      </div>

      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive text-destructive">
          {error}
        </Card>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Tên thương hiệu *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Nhập tên thương hiệu"
              required
            />
          </div>

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
