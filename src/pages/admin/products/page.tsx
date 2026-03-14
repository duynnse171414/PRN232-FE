import { useState, useEffect } from "react";
import { Product } from "../../../lib/types/product";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card } from "../../../components/ui/card";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";

interface ProductsPageProps {
  onEditProduct: (productId: string) => void;
  onCreateProduct: () => void;
}

export default function ProductsPage({
  onEditProduct,
  onCreateProduct,
}: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (status) params.append("status", status);
      params.append("page", page.toString());
      params.append("limit", "10");

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, category, status]);

  useEffect(() => {
    fetchProducts();
  }, [search, category, status, page]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
        setDeleteId(null);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const categories = [
    "Laptops",
    "Graphics Cards",
    "Processors",
    "Motherboards",
    "RAM",
    "Storage",
    "Power Supplies",
    "Cases",
    "Cooling",
    "Monitors",
    "Keyboards",
    "Mice",
    "Headsets",
    "Peripherals",
  ];
  const statuses = ["active", "inactive", "draft"];

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      draft: "bg-yellow-100 text-yellow-800",
    };
    const labels: Record<string, string> = {
      active: "Kích hoạt",
      inactive: "Tắt",
      draft: "Nháp",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý sản phẩm
          </h1>
          <p className="text-muted-foreground mt-2">
            Quản lý, chỉnh sửa và thêm mới sản phẩm
          </p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onCreateProduct}
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm sản phẩm mới
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tên sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Danh mục
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Trạng thái
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">Tất cả trạng thái</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === "active"
                    ? "Kích hoạt"
                    : s === "inactive"
                      ? "Tắt"
                      : "Nháp"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSearch("");
                setCategory("");
                setStatus("");
              }}
            >
              Đặt lại
            </Button>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            Đang tải...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            Không có sản phẩm nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-card border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Danh mục
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Kho
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-card transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover bg-muted"
                          />
                          <div>
                            <p className="font-medium text-foreground">
                              {product.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {product.discountPrice ? (
                          <>
                            <span className="line-through text-muted-foreground mr-2">
                              ₫{product.price.toLocaleString()}
                            </span>
                            <span className="text-primary">
                              ₫{product.discountPrice.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          `₫${product.price.toLocaleString()}`
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        <span
                          className={
                            product.stock > 10
                              ? "text-green-600"
                              : product.stock > 0
                                ? "text-yellow-600"
                                : "text-red-600"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditProduct(product.id)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteId(product.id)}
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
            <div className="flex items-center justify-between p-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Trang {page} / {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(Math.max(1, page - 1))}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                >
                  Sau
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Xác nhận xóa
            </h3>
            <p className="text-muted-foreground mb-6">
              Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn
              tác.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteId(null)}
              >
                Hủy
              </Button>
              <Button
                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => handleDelete(deleteId)}
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
