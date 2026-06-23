import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  MessageSquare,
  Settings,
  LogOut,
  Menu as MenuIcon,
  ChevronRight,
  Bell,
  Store,
  FolderTree,
  ChevronLeft,
  BarChart3,
  Star,
  Sun,
  Moon,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { message } from "../../utils/toast";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { key: "dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard", path: "/admin" },
  { key: "products", icon: <Package size={18} />, label: "Products", path: "/admin/products" },
  { key: "categories", icon: <FolderTree size={18} />, label: "Categories", path: "/admin/categories" },
  { key: "orders", icon: <ShoppingCart size={18} />, label: "Orders", path: "/admin/orders" },
  { key: "customers", icon: <Users size={18} />, label: "Customers", path: "/admin/customers" },
  { key: "coupons", icon: <Tag size={18} />, label: "Coupons", path: "/admin/coupons" },
  { key: "messages", icon: <MessageSquare size={18} />, label: "Messages", path: "/admin/messages" },
  { key: "reviews", icon: <Star size={18} />, label: "Reviews", path: "/admin/reviews" },
  { key: "analytics", icon: <BarChart3 size={18} />, label: "Analytics", path: "/admin/analytics" },
  { key: "notifications", icon: <Bell size={18} />, label: "Notifications", path: "/admin/notifications" },
  { key: "settings", icon: <Settings size={18} />, label: "Settings", path: "/admin/settings" },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { theme: currentTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAdmin) {
      message.error("Access denied. Admin privileges required.");
      navigate("/");
    }
  }, [isAdmin, navigate]);

  const handleLogout = async () => {
    await logout();
    message.success("Logged out successfully");
    navigate("/");
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    const item = menuItems.find(
      (item) => path === item.path || (item.path !== "/admin" && path.startsWith(item.path))
    );
    return item?.key || "dashboard";
  };

  const renderMenu = (isMobile = false) => (
    <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 scrollbar-hide">
      {menuItems.map((item) => {
        const isActive = getSelectedKey() === item.key;
        return (
          <NavLink
            key={item.key}
            to={item.path}
            onClick={() => isMobile && setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
              isActive
                ? "bg-cyan-500/10 text-cyan-500 font-medium"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            } ${collapsed && !isMobile ? "justify-center" : ""}`}
            title={collapsed && !isMobile ? item.label : undefined}
          >
            <div className={isActive ? "text-cyan-500" : ""}>{item.icon}</div>
            {(!collapsed || isMobile) && <span>{item.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );

  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden text-[var(--text-primary)]">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-[var(--bg-glass)] border-r border-[var(--border-subtle)] transition-all duration-300 z-20 backdrop-blur-xl ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className={`h-16 flex items-center border-b border-[var(--border-subtle)] px-4 shrink-0 ${collapsed ? "justify-center" : "gap-3"}`}>
          <img src="/nashiecom.jpeg" alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
          {!collapsed && <span className="font-bold text-lg whitespace-nowrap">Admin Portal</span>}
        </div>
        {renderMenu()}
        <div className="p-3 border-t border-[var(--border-subtle)]">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-gray-500 hover:bg-[var(--bg-secondary)] hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-[var(--bg-primary)] border-r border-[var(--border-subtle)] z-50 flex flex-col shadow-2xl lg:hidden"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <img src="/nashiecom.jpeg" alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
                  <span className="font-bold text-lg">Admin Portal</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-xl">
                  <X size={20} />
                </button>
              </div>
              {renderMenu(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[var(--bg-glass)] backdrop-blur-xl border-b border-[var(--border-subtle)] flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] lg:hidden"
            >
              <MenuIcon size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
              <span>Admin</span>
              <ChevronRight size={14} className="opacity-50" />
              <span className="text-[var(--text-primary)] capitalize">{getSelectedKey()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {currentTheme === "dark" ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
            </button>

            <NavLink
              to="/admin/notifications"
              className="relative p-2 rounded-full hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full" />
            </NavLink>

            <div className="relative ml-2">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {user?.firstName?.[0] || "A"}
                </div>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-sm font-bold text-[var(--text-primary)] leading-none">{user?.firstName}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider mt-1">{user?.role}</span>
                </div>
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-56 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                      <p className="text-sm font-bold text-[var(--text-primary)]">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button onClick={() => { setProfileDropdownOpen(false); navigate("/admin/settings"); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-glass)] hover:text-[var(--text-primary)] transition-colors">
                        <Settings size={16} /> Profile Settings
                      </button>
                      <button onClick={() => { setProfileDropdownOpen(false); window.open("/", "_blank"); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-glass)] hover:text-[var(--text-primary)] transition-colors">
                        <Store size={16} /> View Store
                      </button>
                    </div>
                    <div className="p-2 border-t border-[var(--border-subtle)]">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-colors">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-[var(--bg-primary)] p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
