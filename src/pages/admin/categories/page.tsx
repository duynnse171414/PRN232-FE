import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card } from "../../../components/ui/card";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { categoryService } from "../../../services/categoryService";
import { Category } from "../../../types";

interface CategoriesPageProps {
  onEditCategory: (categoryId: string) => void;
  onCreateCategory: () => void;
}

export default function CategoriesPage({
  onEditCategory,
  onCreateCategory,
}: CategoriesPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
        setTotalPages(1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    try {
      await categoryService.deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Quản lý danh mục
            </h1>
            <p className="text-muted-foreground mt-2">
              Quản lý các danh mục sản phẩm
            </p>
          </div>
        </div>
        <Card className="p-12 text-center text-muted-foreground">
          Đang tải...
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý danh mục
          </h1>
          <p className="text-muted-foreground mt-2">
            Quản lý các danh mục sản phẩm
          </p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onCreateCategory}
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm danh mục mới
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Tìm kiếm danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 font-medium">Tên danh mục</th>
                <th className="text-left p-4 font-medium">Số sản phẩm</th>
                <th className="text-left p-4 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-border hover:bg-muted/50"
                >
                  <td className="p-4">
                    <div className="font-medium">{category.name}</div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {category.productCount} sản phẩm
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditCategory(category.id)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteId(category.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Hiển thị {filteredCategories.length} danh mục
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Trước
            </Button>
            <span className="text-sm text-muted-foreground">
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
            <p className="text-muted-foreground mb-6">
              Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể
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
    </div>
  );
}
