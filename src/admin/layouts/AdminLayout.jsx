// Admin Dashboard Layout
import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Button,
  Badge,
  message,
  Drawer,
  Typography,
  Space,
  Divider,
} from "antd";
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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Tooltip } from "antd";
import "./AdminLayout.css";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  {
    key: "dashboard",
    icon: <LayoutDashboard size={18} />,
    label: "Dashboard",
    path: "/admin",
  },
  {
    key: "products",
    icon: <Package size={18} />,
    label: "Products",
    path: "/admin/products",
  },
  {
    key: "categories",
    icon: <FolderTree size={18} />,
    label: "Categories",
    path: "/admin/categories",
  },
  {
    key: "orders",
    icon: <ShoppingCart size={18} />,
    label: "Orders",
    path: "/admin/orders",
  },
  {
    key: "customers",
    icon: <Users size={18} />,
    label: "Customers",
    path: "/admin/customers",
  },
  {
    key: "coupons",
    icon: <Tag size={18} />,
    label: "Coupons",
    path: "/admin/coupons",
  },
  {
    key: "messages",
    icon: <MessageSquare size={18} />,
    label: "Messages",
    path: "/admin/messages",
  },
  {
    key: "reviews",
    icon: <Star size={18} />,
    label: "Reviews",
    path: "/admin/reviews",
  },
  {
    key: "analytics",
    icon: <BarChart3 size={18} />,
    label: "Analytics",
    path: "/admin/analytics",
  },
  {
    key: "notifications",
    icon: <Bell size={18} />,
    label: "Notifications",
    path: "/admin/notifications",
  },
  {
    key: "settings",
    icon: <Settings size={18} />,
    label: "Settings",
    path: "/admin/settings",
  },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { theme: currentTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect non-admin users
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
      (item) =>
        path === item.path ||
        (item.path !== "/admin" && path.startsWith(item.path))
    );
    return item?.key || "dashboard";
  };

  const userMenuItems = [
    {
      key: "profile",
      label: "Profile Settings",
      onClick: () => navigate("/admin/settings"),
    },
    {
      key: "store",
      label: "View Store",
      onClick: () => window.open("/", "_blank"),
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  const renderMenu = () => (
    <Menu
      theme={currentTheme}
      mode="inline"
      selectedKeys={[getSelectedKey()]}
      className="admin-menu"
      items={menuItems.map((item) => ({
        key: item.key,
        icon: item.icon,
        label: (
          <NavLink to={item.path} onClick={() => setMobileOpen(false)}>
            {item.label}
          </NavLink>
        ),
      }))}
    />
  );

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout className="admin-layout">
      {/* Desktop Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        className="admin-sider desktop-sider"
        breakpoint="lg"
        collapsedWidth={80}
      >
        <div className="admin-logo">
          <img
            src="/nashiecom.jpeg"
            alt="Logo"
            style={{
              width: collapsed ? 32 : 40,
              height: collapsed ? 32 : 40,
              objectFit: "contain",
            }}
          />
          {!collapsed && <span>Nashiecom Admin</span>}
        </div>
        {renderMenu()}
        <div className="sider-footer">
          <Button
            type="text"
            icon={
              collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />
            }
            onClick={() => setCollapsed(!collapsed)}
            className="collapse-btn"
          />
        </div>
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        width={280}
        className="admin-mobile-drawer"
        styles={{ body: { padding: 0, background: "var(--bg-primary)" } }}
      >
        <div className="admin-logo mobile-logo">
          <img
            src="/nashiecom.jpeg"
            alt="Logo"
            style={{
              width: 40,
              height: 40,
              objectFit: "contain",
              marginRight: 12,
            }}
          />
          <span>Nashiecom Admin</span>
        </div>
        {renderMenu()}
      </Drawer>

      <Layout>
        <Header className="admin-header">
          <div className="header-left">
            <Button
              type="text"
              icon={<MenuIcon size={20} />}
              onClick={() => setMobileOpen(true)}
              className="mobile-menu-btn"
            />
            <div className="breadcrumb">
              <Text type="secondary">Admin</Text>
              <ChevronRight size={14} />
              <Text strong style={{ textTransform: "capitalize" }}>
                {getSelectedKey()}
              </Text>
            </div>
          </div>

          <div className="header-right">
            <Tooltip title={currentTheme === "dark" ? "Light Mode" : "Dark Mode"}>
              <Button
                type="text"
                icon={currentTheme === "dark" ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
                onClick={toggleTheme}
                className="theme-toggle-btn"
              />
            </Tooltip>

            <NavLink to="/admin/notifications">
              <Button
                type="text"
                icon={
                  <Badge count={0} size="small">
                    <Bell size={20} />
                  </Badge>
                }
                className="notification-btn"
              />
            </NavLink>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="user-profile">
                <Avatar
                  src={user?.avatar}
                  style={{ backgroundColor: "#00d4ff" }}
                >
                  {user?.firstName?.[0]}
                </Avatar>
                <div className="user-info">
                  <Text strong>
                    {user?.firstName} {user?.lastName}
                  </Text>
                  <Text type="secondary" className="user-role">
                    {user?.role}
                  </Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
