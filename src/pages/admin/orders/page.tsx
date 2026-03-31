import { useState } from "react";
import { Search, ChevronDown, Eye, Printer, X, Package, Truck, CheckCircle, Clock, XCircle, MapPin, CreditCard, User, Mail, Phone, Hash, Calendar } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

const orders = [
  {
    id: "ĐH001",
    customer: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0901 234 567",
    products: 3,
    total: "245,500,000",
    status: "Hoàn thành",
    date: "2024-03-10",
    payment: "Chuyển khoản",
    address: "123 Nguyễn Huệ, Q.1, TP.HCM",
    note: "Giao giờ hành chính",
    items: [
      { name: "Intel Core i9-13900K", qty: 1, price: "12,500,000" },
      { name: "ASUS ROG RTX 4080", qty: 1, price: "25,000,000" },
      { name: "Kingston Fury 32GB DDR5", qty: 2, price: "4,000,000" },
    ],
  },
  {
    id: "ĐH002",
    customer: "Trần Thị B",
    email: "tranthib@email.com",
    phone: "0912 345 678",
    products: 2,
    total: "128,300,000",
    status: "Đang giao",
    date: "2024-03-09",
    payment: "Thẻ tín dụng",
    address: "456 Lê Lợi, Q.3, TP.HCM",
    note: "",
    items: [
      { name: "AMD Ryzen 9 7950X", qty: 1, price: "15,800,000" },
      { name: "Samsung 990 Pro 2TB", qty: 1, price: "5,500,000" },
    ],
  },
  {
    id: "ĐH003",
    customer: "Lê Văn C",
    email: "levanc@email.com",
    phone: "0923 456 789",
    products: 1,
    total: "156,800,000",
    status: "Chờ xác nhận",
    date: "2024-03-08",
    payment: "QR Code",
    address: "789 Điện Biên Phủ, Bình Thạnh, TP.HCM",
    note: "Gọi trước khi giao",
    items: [
      { name: "ASUS ROG STRIX Z790-E", qty: 1, price: "10,200,000" },
    ],
  },
  {
    id: "ĐH004",
    customer: "Phạm Thị D",
    email: "phamthid@email.com",
    phone: "0934 567 890",
    products: 4,
    total: "389,200,000",
    status: "Hoàn thành",
    date: "2024-03-07",
    payment: "COD",
    address: "321 Võ Văn Tần, Q.3, TP.HCM",
    note: "",
    items: [
      { name: "Intel Core i7-13700K", qty: 1, price: "9,800,000" },
      { name: "MSI GeForce RTX 4070", qty: 1, price: "18,500,000" },
      { name: "Corsair RM850x PSU", qty: 1, price: "3,200,000" },
      { name: "NZXT H510 Case", qty: 1, price: "2,700,000" },
    ],
  },
  {
    id: "ĐH005",
    customer: "Hoàng Văn E",
    email: "hoangvane@email.com",
    phone: "0945 678 901",
    products: 2,
    total: "195,600,000",
    status: "Hủy",
    date: "2024-03-06",
    payment: "Chuyển khoản",
    address: "654 Cách Mạng Tháng 8, Q.10, TP.HCM",
    note: "Hủy do hết hàng",
    items: [
      { name: "AMD Ryzen 7 7700X", qty: 1, price: "8,900,000" },
      { name: "Gigabyte B650 AORUS", qty: 1, price: "7,300,000" },
    ],
  },
  {
    id: "ĐH006",
    customer: "Đỗ Thị F",
    email: "dothif@email.com",
    phone: "0956 789 012",
    products: 3,
    total: "325,400,000",
    status: "Đang giao",
    date: "2024-03-05",
    payment: "Thẻ tín dụng",
    address: "987 Phan Xích Long, Phú Nhuận, TP.HCM",
    note: "",
    items: [
      { name: "Intel Core i5-13600K", qty: 1, price: "7,500,000" },
      { name: "G.Skill Trident Z5 32GB", qty: 1, price: "6,200,000" },
      { name: "WD Black SN850X 1TB", qty: 1, price: "3,800,000" },
    ],
  },
];

type Order = typeof orders[0];

const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  "Hoàn thành":    { color: "#16a34a", bg: "#f0fdf4", icon: CheckCircle, label: "Hoàn thành" },
  "Đang giao":     { color: "#2563eb", bg: "#eff6ff", icon: Truck,        label: "Đang giao" },
  "Chờ xác nhận":  { color: "#d97706", bg: "#fffbeb", icon: Clock,        label: "Chờ xác nhận" },
  "Hủy":           { color: "#dc2626", bg: "#fff5f5", icon: XCircle,      label: "Hủy" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || { color: "#64748b", bg: "#f8fafc", icon: Package, label: status };
  const Icon = cfg.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}22`, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────
function OrderDetailPanel({ order, onClose }: { order: Order; onClose: () => void }) {
  const subtotal = parseInt(order.total.replace(/,/g, ""));
  const shipping = 30000;
  const discount = 50000;
  const grandTotal = subtotal + shipping - discount;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.45)", backdropFilter: "blur(4px)", zIndex: 40 }}
      />
      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "min(520px, 100vw)",
        background: "#fff", zIndex: 50, overflowY: "auto",
        boxShadow: "-8px 0 40px rgba(0,0,0,.15)",
        animation: "slideIn .25s ease",
      }}>
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:none}}`}</style>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#0b1120,#1e3a8a)", padding: "20px 24px", position: "sticky", top: 0, zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#fff" }}>
              Chi tiết đơn hàng
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,.1)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "background .2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.1)")}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#60a5fa" }}>{order.id}</span>
            <StatusBadge status={order.status} />
          </div>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Customer info */}
          <section>
            <div style={sectionTitle}>Thông tin khách hàng</div>
            <div style={infoCard}>
              {[
                { icon: User,     label: "Họ tên",    value: order.customer },
                { icon: Mail,     label: "Email",     value: order.email },
                { icon: Phone,    label: "Điện thoại",value: order.phone },
                { icon: MapPin,   label: "Địa chỉ",   value: order.address },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={iconWrap}><Icon size={13} color="#3b82f6" /></div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".4px" }}>{label}</div>
                    <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 500, marginTop: 1 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Order meta */}
          <section>
            <div style={sectionTitle}>Thông tin đơn hàng</div>
            <div style={infoCard}>
              {[
                { icon: Hash,       label: "Mã đơn",        value: order.id },
                { icon: Calendar,   label: "Ngày đặt",       value: order.date },
                { icon: CreditCard, label: "Thanh toán",     value: order.payment },
                { icon: Truck,      label: "Vận chuyển",     value: "Giao hàng nhanh" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={iconWrap}><Icon size={13} color="#3b82f6" /></div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".4px" }}>{label}</div>
                    <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 500, marginTop: 1 }}>{value}</div>
                  </div>
                </div>
              ))}
              {order.note && (
                <div style={{ gridColumn: "1/-1", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#92400e" }}>
                  📝 {order.note}
                </div>
              )}
            </div>
          </section>

          {/* Products */}
          <section>
            <div style={sectionTitle}>Sản phẩm ({order.products})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, border: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#eff6ff,#dbeafe)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Package size={14} color="#3b82f6" />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", lineHeight: 1.3 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>Số lượng: {item.qty}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8", flexShrink: 0 }}>{item.price}đ</div>
                </div>
              ))}
            </div>
          </section>

          {/* Price summary */}
          <section>
            <div style={sectionTitle}>Tổng kết</div>
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "16px", border: "1px solid #f1f5f9" }}>
              {[
                { label: "Tạm tính", value: `${order.total}đ`, color: "#0f172a" },
                { label: "Phí vận chuyển", value: "30,000đ", color: "#0f172a" },
                { label: "Giảm giá", value: "-50,000đ", color: "#16a34a" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: "#64748b" }}>{label}</span>
                  <span style={{ fontWeight: 600, color }}>{value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: "#e2e8f0", margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Tổng cộng</span>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: "#1d4ed8" }}>
                  {grandTotal.toLocaleString()}đ
                </span>
              </div>
            </div>
          </section>

          {/* Status update */}
          <section>
            <div style={sectionTitle}>Cập nhật trạng thái</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.keys(statusConfig).map(s => {
                const cfg = statusConfig[s];
                const Icon = cfg.icon;
                const isActive = order.status === s;
                return (
                  <button key={s} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    border: `1.5px solid ${isActive ? cfg.color : "#e2e8f0"}`,
                    background: isActive ? cfg.bg : "#fff",
                    color: isActive ? cfg.color : "#64748b",
                    transition: "all .2s",
                  }}>
                    <Icon size={12} /> {cfg.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingBottom: 8 }}>
            <button style={actionBtn("#1d4ed8", "#eff6ff", "#bfdbfe")}>
              <Printer size={14} /> In đơn hàng
            </button>
            <button style={actionBtn("#16a34a", "#f0fdf4", "#bbf7d0")}>
              <CheckCircle size={14} /> Xác nhận
            </button>
            <button style={actionBtn("#dc2626", "#fff5f5", "#fecaca")}>
              <XCircle size={14} /> Hủy đơn
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

// ── Shared styles ──
const sectionTitle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "#94a3b8",
  textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 10,
};
const infoCard: React.CSSProperties = {
  background: "#f8fafc", borderRadius: 12, padding: "14px 16px",
  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14,
  border: "1px solid #f1f5f9",
};
const iconWrap: React.CSSProperties = {
  width: 26, height: 26, borderRadius: 7,
  background: "#eff6ff", border: "1px solid #bfdbfe",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
const actionBtn = (color: string, bg: string, border: string): React.CSSProperties => ({
  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 700,
  background: bg, border: `1.5px solid ${border}`, color, cursor: "pointer",
  transition: "all .2s",
});

// ── Main Page ─────────────────────────────────────────────────────
export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const statuses = ["Tất cả", "Chờ xác nhận", "Đang giao", "Hoàn thành", "Hủy"];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "Tất cả" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Detail panel */}
      {detailOrder && <OrderDetailPanel order={detailOrder} onClose={() => setDetailOrder(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground mt-1">Xem và quản lý tất cả các đơn hàng</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã đơn hoặc tên khách hàng..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                  selectedStatus === status ? "bg-primary text-white" : "bg-input text-foreground hover:bg-secondary"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <button
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              className="w-full p-4 hover:bg-input/50 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold text-foreground">{order.id}</h3>
                    <StatusBadge status={order.status} />
                    <span className="text-sm text-muted-foreground">{order.date}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Khách hàng</p>
                      <p className="font-medium text-foreground">{order.customer}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sản phẩm</p>
                      <p className="font-medium text-foreground">{order.products} sản phẩm</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Thanh toán</p>
                      <p className="font-medium text-foreground">{order.payment}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tổng tiền</p>
                      <p className="font-semibold text-primary">{order.total}đ</p>
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ml-4 ${expandedOrder === order.id ? "rotate-180" : ""}`} />
              </div>
            </button>

            {/* Expanded summary */}
            {expandedOrder === order.id && (
              <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium text-foreground">{order.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Địa chỉ</p>
                    <p className="font-medium text-foreground">{order.address}</p>
                  </div>
                </div>

                <div className="bg-input rounded-lg p-4">
                  <p className="text-sm font-semibold text-foreground mb-3">Chi tiết giá</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span className="font-medium">{order.total}đ</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phí vận chuyển</span>
                      <span className="font-medium">30,000đ</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giảm giá</span>
                      <span className="font-medium text-green-600">-50,000đ</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between">
                      <span className="font-semibold">Tổng cộng</span>
                      <span className="font-bold text-primary text-lg">
                        {(parseInt(order.total.replace(/,/g, "")) + 30000 - 50000).toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDetailOrder(order)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Xem chi tiết
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Printer className="w-4 h-4 mr-2" />
                    In đơn hàng
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}

        {filteredOrders.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy đơn hàng</p>
          </Card>
        )}
      </div>

      {/* Summary */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tổng đơn hàng</p>
            <p className="text-2xl font-bold text-foreground">{filteredOrders.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-primary">
              {filteredOrders.reduce((sum, o) => sum + parseInt(o.total.replace(/,/g, "")), 0).toLocaleString()}đ
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Hoàn thành</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredOrders.filter((o) => o.status === "Hoàn thành").length}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}