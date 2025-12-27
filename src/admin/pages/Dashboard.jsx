// Admin Dashboard Home Page
import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Button,
  Table,
  Tag,
  Space,
  Select,
} from "antd";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { dashboardAPI } from "../../services/api";
import "../layouts/AdminLayout.css";

const { Title, Text } = Typography;

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [activity, setActivity] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, activityRes, topRes, lowStockRes] =
        await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getRecentOrders(5),
          dashboardAPI.getActivity(10),
          dashboardAPI.getTopProducts(5),
          dashboardAPI.getLowStockProducts(5),
        ]);

      setStats(statsRes.data.stats);
      setRecentOrders(ordersRes.data.orders);
      setActivity(activityRes.data.activities);
      setTopProducts(topRes.data.products);
      setLowStockProducts(lowStockRes.data.products);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statsCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.revenue?.total || 0),
      change: stats?.revenue?.growth || 0,
      icon: <DollarSign size={24} color="#fff" />,
      color: "#22c55e",
      colorRgb: "34, 197, 94",
    },
    {
      title: "Total Orders",
      value: stats?.orders?.total || 0,
      subValue: `${stats?.orders?.today || 0} today`,
      icon: <ShoppingCart size={24} color="#fff" />,
      color: "#3b82f6",
      colorRgb: "59, 130, 246",
    },
    {
      title: "Products",
      value: stats?.products?.total || 0,
      subValue: `${stats?.products?.active || 0} active`,
      icon: <Package size={24} color="#fff" />,
      color: "#8b5cf6",
      colorRgb: "139, 92, 246",
    },
    {
      title: "Customers",
      value: stats?.users || 0,
      icon: <Users size={24} color="#fff" />,
      color: "#f59e0b",
      colorRgb: "245, 158, 11",
    },
  ];

  const orderColumns = [
    {
      title: "Order",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text, record) => (
        <Link
          to={`/admin/orders/${record.id}`}
          className="text-cyan-400 hover:underline"
        >
          {text}
        </Link>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (value) => formatCurrency(value),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span className={`status-badge status-${status.toLowerCase()}`}>
          {status}
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date),
    },
  ];

  const getActivityIcon = (type) => {
    const icons = {
      order: <ShoppingCart size={16} />,
      review: <Eye size={16} />,
      message: <Clock size={16} />,
      user: <Users size={16} />,
    };
    return icons[type] || <CheckCircle size={16} />;
  };

  const getActivityColor = (type) => {
    const colors = {
      order: "rgba(59, 130, 246, 0.2)",
      review: "rgba(139, 92, 246, 0.2)",
      message: "rgba(251, 191, 36, 0.2)",
      user: "rgba(34, 197, 94, 0.2)",
    };
    return colors[type] || "rgba(255, 255, 255, 0.1)";
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "60vh" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">
            Welcome back! Here's what's happening.
          </p>
        </div>
        <Button icon={<RefreshCw size={16} />} onClick={fetchDashboardData}>
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="stat-card"
            style={{
              "--stat-color": stat.color,
              "--stat-color-rgb": stat.colorRgb,
            }}
          >
            <div className="stat-card-header">
              <div className="stat-icon" style={{ background: stat.color }}>
                {stat.icon}
              </div>
              {stat.change !== undefined && (
                <span
                  className={`stat-change ${
                    stat.change >= 0 ? "positive" : "negative"
                  }`}
                >
                  {stat.change >= 0 ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {Math.abs(stat.change).toFixed(1)}%
                </span>
              )}
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.title}</div>
            {stat.subValue && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {stat.subValue}
              </Text>
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        {/* Recent Orders */}
        <Col xs={24} lg={16}>
          <Card
            className="admin-table-card"
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Recent Orders</span>
                <Link to="/admin/orders">
                  <Button type="link" size="small">
                    View All <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            }
          >
            <Table
              className="admin-table"
              columns={orderColumns}
              dataSource={recentOrders}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Activity Feed */}
        <Col xs={24} lg={8}>
          <Card
            className="admin-table-card"
            title="Recent Activity"
            style={{ height: "100%" }}
          >
            <div style={{ padding: "0 16px" }}>
              {activity.map((item, index) => (
                <div key={index} className="activity-item">
                  <div
                    className="activity-icon"
                    style={{ background: getActivityColor(item.type) }}
                  >
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-message">{item.message}</div>
                    <div className="activity-time">
                      {formatDate(item.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Top Products */}
        <Col xs={24} lg={12}>
          <Card
            className="admin-table-card"
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Top Selling Products</span>
                <Link to="/admin/products">
                  <Button type="link" size="small">
                    View All <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            }
          >
            <div style={{ padding: "0 16px" }}>
              {topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="activity-item"
                  style={{ alignItems: "center" }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: "rgba(0, 212, 255, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#00d4ff",
                    }}
                  >
                    {index + 1}
                  </div>
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div className="activity-content">
                    <div className="activity-message">{product.name}</div>
                    <div className="activity-time">
                      {product.soldCount} sold • {formatCurrency(product.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Low Stock Alert */}
        <Col xs={24} lg={12}>
          <Card
            className="admin-table-card"
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={18} color="#f59e0b" />
                <span>Low Stock Alert</span>
              </div>
            }
          >
            <div style={{ padding: "0 16px" }}>
              {lowStockProducts.length === 0 ? (
                <div className="empty-state" style={{ padding: "40px 20px" }}>
                  <CheckCircle size={40} color="#22c55e" />
                  <p style={{ marginTop: 12, color: "rgba(255,255,255,0.6)" }}>
                    All products are well stocked!
                  </p>
                </div>
              ) : (
                lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="activity-item"
                    style={{ alignItems: "center" }}
                  >
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <div className="activity-content">
                      <div className="activity-message">{product.name}</div>
                      <div className="activity-time">{product.category}</div>
                    </div>
                    <Tag color={product.quantity <= 0 ? "red" : "orange"}>
                      {product.quantity} left
                    </Tag>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
