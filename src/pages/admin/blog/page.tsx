import { useState } from "react";
import { Plus, Search, Eye, Edit, Trash2, Calendar } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

const posts = [
  {
    id: 1,
    title: "Hướng dẫn chọn CPU cho gaming 2024",
    category: "Hướng dẫn",
    author: "Admin",
    date: "2024-03-10",
    views: 1250,
    status: "Công khai",
    excerpt: "Tìm hiểu về các CPU tốt nhất cho gaming năm 2024...",
  },
  {
    id: 2,
    title: "So sánh RTX 4070 vs RTX 4060 Ti",
    category: "So sánh",
    author: "Tech Editor",
    date: "2024-03-09",
    views: 890,
    status: "Công khai",
    excerpt: "Phân tích chi tiết hiệu suất giữa hai card đồ họa...",
  },
  {
    id: 3,
    title: "Bảo vệ và bảo trì PC gaming của bạn",
    category: "Mẹo & Thủ thuật",
    author: "Admin",
    date: "2024-03-08",
    views: 650,
    status: "Công khai",
    excerpt: "Những cách tốt nhất để giữ gìn PC gaming...",
  },
  {
    id: 4,
    title: "Những lỗi phổ biến khi xây dựng PC",
    category: "Hướng dẫn",
    author: "Tech Editor",
    date: "2024-03-07",
    views: 1520,
    status: "Công khai",
    excerpt: "Tránh những sai lầm khi lắp ráp PC...",
  },
  {
    id: 5,
    title: "Bản cập nhật sản phẩm mới",
    category: "Tin tức",
    author: "Admin",
    date: "2024-03-06",
    views: 350,
    status: "Nháp",
    excerpt: "Những sản phẩm mới đã được thêm vào kho...",
  },
];

const categories = [
  "Tất cả",
  "Hướng dẫn",
  "So sánh",
  "Mẹo & Thủ thuật",
  "Tin tức",
];

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Tất cả" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý Blog</h1>
          <p className="text-muted-foreground mt-1">
            Viết, chỉnh sửa và quản lý các bài viết blog
          </p>
        </div>
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          <Plus className="w-5 h-5 mr-2" />
          Viết bài mới
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm bài viết..."
                className="pl-10 bg-input border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-white"
                    : "bg-input text-foreground hover:bg-secondary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Blog Posts */}
      <div className="space-y-3">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {post.title}
                  </h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      post.status === "Công khai"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {post.status}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                  <span className="bg-secondary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </div>
                  <span>{post.author}</span>
                  <span>{post.views.toLocaleString()} lượt xem</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  className="p-2 hover:bg-input rounded-lg transition-colors"
                  title="Xem trước"
                >
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  className="p-2 hover:bg-input rounded-lg transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {filteredPosts.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy bài viết</p>
          </Card>
        )}
      </div>

      {/* Summary */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tổng bài viết</p>
            <p className="text-2xl font-bold text-foreground">{posts.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Bài công khai</p>
            <p className="text-2xl font-bold text-green-600">
              {posts.filter((p) => p.status === "Công khai").length}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tổng lượt xem</p>
            <p className="text-2xl font-bold text-primary">
              {posts.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
