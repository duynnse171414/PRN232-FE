"use client";

import { useState, useEffect } from "react";
import { Product, CreateProductInput } from "../../lib/types/product";
import { categoryService } from "../../services/categoryService";
import { promotionService } from "../../services/promotionService";
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
  const [formData, setFormData] = useState<CreateProductInput>(
    product
      ? {
          name: product.name ?? "",
          sku: product.sku ?? "",
          slug: product.slug ?? "",
          category: product.category ?? "",
          categoryId: product.categoryId,
          brandId: product.brandId,
          description: product.description ?? "",
          warranty: product.warranty ?? "",
          price: product.price ?? 0,
          discountPrice: product.discountPrice,
          stock: product.stock ?? 0,
          imageUrl: product.imageUrl ?? "",
          images: product.images ?? [],
          status: product.status ?? "draft",
          specifications: product.specifications ?? {},
          promotionIds: product.promotionIds ?? [],
        }
      : {
          name: "",
          sku: "",
          slug: "",
          category: "Laptops",
          categoryId: undefined,
          brandId: undefined,
          description: "",
          warranty: "",
          price: 0,
          discountPrice: undefined,
          stock: 0,
          imageUrl: "",
          images: [],
          status: "draft",
          specifications: {},
          promotionIds: [],
        },
  );

  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [promotions, setPromotions] = useState<
    { id: number | string; name: string }[]
  >([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);

  const statuses = ["draft", "active", "inactive"];

  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(
          data.map((cat) => ({
            id: Number(cat.id),
            name: cat.name,
          })),
        );
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const data = await promotionService.getPromotions();
        setPromotions(data);
      } catch (error) {
        console.error("Failed to load promotions:", error);
      } finally {
        setLoadingPromotions(false);
      }
    };

    loadPromotions();
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
        name === "price" || name === "discountPrice" || name === "stock"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleAddSpec = () => {
    if (specKey && specValue) {
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey]: specValue,
        },
      }));
      setSpecKey("");
      setSpecValue("");
    }
  };

  const handleRemoveSpec = (key: string) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const handleTogglePromotion = (promotionId: string) => {
    setFormData((prev) => {
      const existing = prev.promotionIds || [];
      const next = existing.includes(promotionId)
        ? existing.filter((id) => id !== promotionId)
        : [...existing, promotionId];
      return { ...prev, promotionIds: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleCategoryChange = (value: string) => {
    const selected = categories.find((cat) => cat.name === value);
    setFormData((prev) => ({
      ...prev,
      category: value,
      categoryId: selected?.id,
    }));
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

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Slug *
            </label>
            <Input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="asus-rog-gaming-laptop"
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
                name="category"
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                disabled={loadingCategories}
              >
                {loadingCategories ? (
                  <option>Đang tải...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Trạng thái *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "active"
                      ? "Kích hoạt"
                      : status === "inactive"
                        ? "Tắt"
                        : "Nháp"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Khuyến mãi
            </label>
            <div className="grid grid-cols-2 gap-3 p-3 border border-border rounded-md bg-background">
              {loadingPromotions ? (
                <div className="text-sm text-muted-foreground">Đang tải...</div>
              ) : promotions.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Không có khuyến mãi
                </div>
              ) : (
                promotions.map((promo) => (
                  <label
                    key={promo.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={formData.promotionIds?.includes(
                        String(promo.id),
                      )}
                      onChange={() => handleTogglePromotion(String(promo.id))}
                      className="h-4 w-4"
                    />
                    <span className="text-foreground">{promo.name}</span>
                  </label>
                ))
              )}
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
        <div className="grid grid-cols-3 gap-4">
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
              Giá khuyến mãi
            </label>
            <Input
              type="number"
              name="discountPrice"
              value={formData.discountPrice || ""}
              onChange={handleInputChange}
              placeholder="0"
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
              Hình ảnh chính *
            </label>
            <Input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="/gaming-laptop.jpg"
              required
            />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Nhập URL hình ảnh phân cách bằng dấu phẩy:
            </p>
            <textarea
              name="images"
              value={formData.images.join(", ")}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  images: e.target.value
                    .split(",")
                    .map((img) => img.trim())
                    .filter(Boolean),
                }))
              }
              placeholder="/image1.jpg, /image2.jpg, /image3.jpg"
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground mt-2"
            />
          </div>
        </div>
      </Card>

      {/* Specifications */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Thông số kỹ thuật
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="text"
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
              placeholder="VD: Processor"
            />
            <Input
              type="text"
              value={specValue}
              onChange={(e) => setSpecValue(e.target.value)}
              placeholder="VD: Intel Core i9-13900HX"
            />
          </div>
          <Button
            type="button"
            onClick={handleAddSpec}
            variant="outline"
            className="w-full"
          >
            Thêm thông số
          </Button>

          <div className="space-y-2">
            {Object.entries(formData.specifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-2 bg-card rounded border border-border"
              >
                <div>
                  <p className="font-medium text-foreground">{key}</p>
                  <p className="text-sm text-muted-foreground">{value}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(key)}
                  className="text-destructive hover:text-destructive/80 font-medium"
                >
                  Xóa
                </button>
              </div>
            ))}
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
