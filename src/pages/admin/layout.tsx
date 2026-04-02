import { useState } from "react";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  TicketPercent,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Tag,
  Award,
} from "lucide-react";
import { Button } from "../../components/ui/button";

const menuItems = [
  { section: "dashboard", icon: BarChart3, label: "Dashboard" },
  { section: "products", icon: Package, label: "Sản phẩm" },
  { section: "categories", icon: Tag, label: "Danh mục" },
  { section: "brands", icon: Award, label: "Thương hiệu" },
  { section: "orders", icon: ShoppingCart, label: "Đơn hàng" },
  { section: "customers", icon: Users, label: "Khách hàng" },
  { section: "vouchers", icon: TicketPercent, label: "Voucher" },
];

type AdminLayoutProps = {
  activeSection: string;
  onSectionChange: (section: string) => void;
  children: React.ReactNode;
};

export default function AdminLayout({
  activeSection,
  onSectionChange,
  children,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col border-r border-sidebar-border`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <div
            className={`flex items-center gap-3 ${!sidebarOpen && "justify-center w-full"}`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white">
              T
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg">TechAdmin</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.section;
            return (
              <button
                key={item.section}
                onClick={() => onSectionChange(item.section)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                } ${!sidebarOpen && "justify-center"}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors ${
                !sidebarOpen && "justify-center"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                A
              </div>
              {sidebarOpen && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">Admin</p>
                    <p className="text-xs text-sidebar-accent">
                      admin@tech.com
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>

            {userMenuOpen && sidebarOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white text-foreground rounded-lg shadow-lg border border-border z-50">
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-input rounded-t-lg border-b border-border">
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-input rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>

          {/* <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("vi-VN")}
            </div>
            <Button variant="outline" size="sm">
              Trợ giúp
            </Button>
          </div> */}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
