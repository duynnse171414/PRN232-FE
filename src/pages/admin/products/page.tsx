import { useState, useEffect } from "react";
import { Product } from "../../../lib/types/product";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card } from "../../../components/ui/card";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { productService } from "../../../services/productService";

interface ProductsPageProps {
  onEditProduct: (productId: string) => void;
  onCreateProduct: () => void;
}

export default function ProductsPage({
  onEditProduct,
  onCreateProduct,
}: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [brands, setBrands] = useState<Array<{ id: number; name: string }>>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await productService.getAdminProducts({
        search,
        categoryId: categoryId ? Number(categoryId) : undefined,
        brandId: brandId ? Number(brandId) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page,
        limit: 10,
      });

      setProducts(result.products);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, categoryId, brandId, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryId, brandId, minPrice, maxPrice, page]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoryData, brandData] = await Promise.all([
          productService.getCategories(),
          productService.getBrands(),
        ]);
        setCategories(categoryData);
        setBrands(brandData);
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };

    fetchFilters();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await productService.deleteAdminProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Thương hiệu
            </label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">Tất cả thương hiệu</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Giá từ
            </label>
            <Input
              type="number"
              min={0}
              placeholder="VD: 1000000"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Đến giá
            </label>
            <Input
              type="number"
              min={0}
              placeholder="VD: 5000000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSearch("");
                setCategoryId("");
                setBrandId("");
                setMinPrice("");
                setMaxPrice("");
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
                      Thương hiệu
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Kho
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
                            className="w-12 h-12 rounded object-cover bg-muted border border-border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/48x48?text=N%2FA";
                            }}
                          />
                          <div>
                            <p className="font-medium text-foreground">
                              {product.name}
                            </p>
                            {product.sku && (
                              <p className="text-xs text-muted-foreground">
                                SKU: {product.sku}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {product.brandName ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        ₫{product.price.toLocaleString("vi-VN")}
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
