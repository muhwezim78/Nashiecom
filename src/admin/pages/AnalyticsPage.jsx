import { useState, useEffect } from "react";
import { Card, Row, Col, Spin, Select, Avatar, Typography } from "antd";
import { ShoppingCart, DollarSign, Package } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { dashboardAPI } from "../../services/api";
import "../layouts/AdminLayout.css";

const { Text } = Typography;

const StatCard = ({ title, value, prefix, color, subtext, subtextColor }) => (
  <Card
    className="dashboard-stat-card"
    style={{ height: "100%" }}
    variant="borderless"
  >
    <div className="text-gray-400 text-sm mb-2 font-medium">{title}</div>
    <div className="flex items-center text-2xl font-bold text-white mb-2">
      {prefix && (
        <span className="mr-2 opacity-80" style={{ color: color || "#fff" }}>
          {prefix}
        </span>
      )}
      <span style={{ color: color || "#fff" }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
    {subtext && (
      <div
        className="text-xs"
        style={{ color: subtextColor || "rgba(255,255,255,0.45)" }}
      >
        {subtext}
      </div>
    )}
  </Card>
);

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [period, setPeriod] = useState("30days");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, revRes, prodRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRevenue(period),
        dashboardAPI.getTopProducts(5),
      ]);

      setStats(statsRes.data.stats);
      setRevenueData(revRes.data.chartData || []);
      setTopProducts(prodRes.data.products);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const handlePeriodChange = (value) => {
    setPeriod(value);
  };

  if (loading) {
    return (
      <div
        style={{
          height: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Analytics</h1>
          <p className="admin-page-subtitle">Performance overview & trends</p>
        </div>
        <Select
          defaultValue="30days"
          onChange={handlePeriodChange}
          style={{ width: 140 }}
          options={[
            { value: "7days", label: "Last 7 Days" },
            { value: "30days", label: "Last 30 Days" },
            { value: "90days", label: "Last 3 Months" },
            { value: "12months", label: "Last Year" },
          ]}
        />
      </div>

      {/* Summary Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <StatCard
            title="Total Revenue"
            value={stats?.revenue?.total || 0}
            prefix={<span className="text-sm">UGX</span>}
            color="#22c55e"
            subtext={`Growth: ${stats?.revenue?.growth || 0}% vs last month`}
            subtextColor={
              (stats?.revenue?.growth || 0) >= 0 ? "#22c55e" : "#ef4444"
            }
          />
        </Col>
        <Col xs={24} md={8}>
          <StatCard
            title="Total Orders"
            value={stats?.orders?.total || 0}
            prefix={<ShoppingCart size={20} />}
            color="#3b82f6"
            subtext={`${stats?.orders?.today || 0} orders today`}
          />
        </Col>
        <Col xs={24} md={8}>
          <StatCard
            title="Avg. Order Value"
            value={Math.round(
              stats?.orders?.total > 0
                ? stats?.revenue?.total / stats?.orders?.total
                : 0,
            )}
            prefix={<span className="text-sm">UGX</span>}
            color="#f59e0b"
            subtext="Lifetime average"
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Revenue Chart */}
        <Col xs={24} lg={16}>
          <Card
            title="Revenue Trend"
            className="admin-table-card"
            style={{ height: "100%" }}
            variant="borderless"
          >
            <div style={{ height: 350, marginTop: 16 }}>
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenueData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#00d4ff"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#00d4ff"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#333"
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(str) => {
                        const date = new Date(str);
                        return date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                      }}
                      stroke="#666"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#666"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) =>
                        value >= 1000 ? `${value / 1000}k` : value
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f1f1f",
                        border: "1px solid #333",
                        borderRadius: 8,
                      }}
                      itemStyle={{ color: "#fff" }}
                      formatter={(value) => [
                        `UGX ${value.toLocaleString()}`,
                        "Revenue",
                      ]}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleDateString()
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#00d4ff"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  <DollarSign size={48} style={{ marginBottom: 16 }} />
                  <p>No revenue data for this period</p>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Top Products */}
        <Col xs={24} lg={8}>
          <Card
            title="Best Sellers"
            className="admin-table-card"
            style={{ height: "100%" }}
            variant="borderless"
          >
            <div className="flex flex-col">
              {topProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No data available
                </p>
              ) : (
                topProducts.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Avatar
                        src={item.image}
                        shape="square"
                        size={40}
                        icon={<Package size={20} />}
                        style={{ backgroundColor: "#1f1f1f", flexShrink: 0 }}
                      />
                      <div className="min-w-0">
                        <div
                          className="text-white font-medium truncate"
                          title={item.name}
                        >
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.soldCount} sold · UGX{" "}
                          {item.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`
                             flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0
                             ${
                               index < 3
                                 ? "bg-cyan-500/10 text-cyan-400"
                                 : "text-gray-600"
                             }
                         `}
                    >
                      #{index + 1}
                    </div>
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

export default AnalyticsPage;
