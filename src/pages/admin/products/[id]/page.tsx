import { useState, useEffect } from "react";
import { ProductForm } from "../../../../components/admin/product-form";
import { Product, CreateProductInput } from "../../../../lib/types/product";
import { Card } from "../../../../components/ui/card";
import { productService } from "../../../../services/productService";

interface EditProductPageProps {
  productId: string;
  onBack: () => void;
}

export default function EditProductPage({
  productId,
  onBack,
}: EditProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getAdminProductById(productId);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi kết nối");
        console.error(err);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleSubmit = async (data: CreateProductInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await productService.updateAdminProduct(productId, data);
      onBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Chỉnh sửa sản phẩm
          </h1>
        </div>
        <Card className="p-12 text-center text-muted-foreground">
          Đang tải...
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Chỉnh sửa sản phẩm
          </h1>
        </div>
        <Card className="p-12 text-center text-destructive">
          {error || "Không tìm thấy sản phẩm"}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Chỉnh sửa sản phẩm
        </h1>
        <p className="text-muted-foreground mt-2">{product.name}</p>
      </div>

      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive text-destructive">
          {error}
        </Card>
      )}

      <ProductForm
        product={product}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
