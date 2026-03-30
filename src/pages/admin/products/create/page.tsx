import { useState } from "react";
import { ProductForm } from "../../../../components/admin/product-form";
import { CreateProductInput } from "../../../../lib/types/product";
import { Card } from "../../../../components/ui/card";
import { productService } from "../../../../services/productService";

interface CreateProductPageProps {
  onBack: () => void;
}

export default function CreateProductPage({ onBack }: CreateProductPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateProductInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await productService.createAdminProduct(data);
      onBack();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi kết nối";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tạo sản phẩm mới</h1>
        <p className="text-muted-foreground mt-2">
          Thêm sản phẩm mới vào cửa hàng
        </p>
      </div>

      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive text-destructive">
          {error}
        </Card>
      )}

      <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
