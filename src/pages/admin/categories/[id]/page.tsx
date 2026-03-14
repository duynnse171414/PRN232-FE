import { useState, useEffect } from "react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { categoryService } from "../../../../services/categoryService";
import { Category, CategoryInput } from "../../../../types";

interface EditCategoryPageProps {
  categoryId: string;
  onBack: () => void;
}

export default function EditCategoryPage({
  categoryId,
  onBack,
}: EditCategoryPageProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await categoryService.getCategoryById(categoryId);
        setCategory(data);
        setFormData({
          name: data.name,
        });
      } catch (err) {
        setError("Không tìm thấy danh mục");
        console.error(err);
      } finally {
        setIsLoadingCategory(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload: CategoryInput = {
        name: formData.name,
      };

      await categoryService.updateCategory(categoryId, payload);
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

  if (isLoadingCategory) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Chỉnh sửa danh mục
          </h1>
        </div>
        <Card className="p-12 text-center text-muted-foreground">
          Đang tải...
        </Card>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Chỉnh sửa danh mục
          </h1>
        </div>
        <Card className="p-12 text-center text-destructive">
          {error || "Không tìm thấy danh mục"}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Chỉnh sửa danh mục
        </h1>
        <p className="text-muted-foreground mt-2">{category.name}</p>
      </div>

      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive text-destructive">
          {error}
        </Card>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Tên danh mục *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Nhập tên danh mục"
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
