"use client";

import { useState, useEffect } from "react";
import { Product, CreateProductInput } from "../../lib/types/product";
import { productService } from "../../services/productService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: CreateProductInput) => Promise<void>;
  isLoading?: boolean;
}

export function ProductForm({
  product,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState<
    Pick<
      CreateProductInput,
      | "name"
      | "sku"
      | "description"
      | "warranty"
      | "price"
      | "stock"
      | "categoryId"
      | "brandId"
      | "imageUrl"
    >
  >(
    product
      ? {
          name: product.name ?? "",
          sku: product.sku ?? "",
          categoryId: product.categoryId,
          brandId: product.brandId,
          description: product.description ?? "",
          warranty: product.warranty ?? "",
          price: product.price ?? 0,
          stock: product.stock ?? 0,
          imageUrl: product.imageUrl ?? "",
        }
      : {
          name: "",
          sku: "",
          categoryId: undefined,
          brandId: undefined,
          description: "",
          warranty: "",
          price: 0,
          stock: 0,
          imageUrl: "",
        },
  );

  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const data = await productService.getBrands();
        setBrands(data);
      } catch (error) {
        console.error("Failed to load brands:", error);
      } finally {
        setLoadingBrands(false);
      }
    };

    loadBrands();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stock" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: formData.name,
      sku: formData.sku,
      slug: formData.sku,
      category: "",
      categoryId: formData.categoryId,
      brandId: formData.brandId,
      description: formData.description,
      warranty: formData.warranty,
      price: formData.price,
      stock: formData.stock,
      imageUrl: formData.imageUrl,
      images: formData.imageUrl ? [formData.imageUrl] : [],
      status: "active",
      specifications: {},
      promotionIds: [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Thông tin cơ bản
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tên sản phẩm *
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="VD: ASUS ROG Gaming Laptop"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                SKU *
              </label>
              <Input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="VD: LAP-ROG-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Bảo hành *
              </label>
              <Input
                type="text"
                name="warranty"
                value={formData.warranty}
                onChange={handleInputChange}
                placeholder="VD: 24 tháng"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Danh mục *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId ? String(formData.categoryId) : ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                disabled={loadingCategories}
                required
              >
                {loadingCategories ? (
                  <option>Đang tải...</option>
                ) : (
                  <>
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Thương hiệu *
              </label>
              <select
                name="brandId"
                value={formData.brandId ? String(formData.brandId) : ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    brandId: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                disabled={loadingBrands}
                required
              >
                {loadingBrands ? (
                  <option>Đang tải...</option>
                ) : (
                  <>
                    <option value="">Chọn thương hiệu</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={String(brand.id)}>
                        {brand.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Mô tả *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Mô tả chi tiết sản phẩm..."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              required
            />
          </div>
        </div>
      </Card>

      {/* Pricing & Stock */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Giá và Kho
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Giá *
            </label>
            <Input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Kho hàng *
            </label>
            <Input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="0"
              required
            />
          </div>
        </div>
      </Card>

      {/* Images */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Hình ảnh</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              URL hình ảnh
            </label>
            <Input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://..."
            />
          </div>
        </div>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading
            ? "Đang lưu..."
            : product
              ? "Cập nhật sản phẩm"
              : "Tạo sản phẩm"}
        </Button>
      </div>
    </form>
  );
}
