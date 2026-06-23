import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { dashboardAPI } from "../../services/api";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

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
      icon: <DollarSign size={24} className="text-white" />,
      color: "from-green-500 to-green-600",
      shadow: "shadow-green-500/20",
    },
    {
      title: "Total Orders",
      value: stats?.orders?.total || 0,
      subValue: `${stats?.orders?.today || 0} today`,
      icon: <ShoppingCart size={24} className="text-white" />,
      color: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/20",
    },
    {
      title: "Products",
      value: stats?.products?.total || 0,
      subValue: `${stats?.products?.active || 0} active`,
      icon: <Package size={24} className="text-white" />,
      color: "from-purple-500 to-purple-600",
      shadow: "shadow-purple-500/20",
    },
    {
      title: "Customers",
      value: stats?.users || 0,
      icon: <Users size={24} className="text-white" />,
      color: "from-amber-500 to-amber-600",
      shadow: "shadow-amber-500/20",
    },
  ];

  const getActivityIcon = (type) => {
    const icons = {
      order: <ShoppingCart size={16} className="text-blue-500" />,
      review: <Eye size={16} className="text-purple-500" />,
      message: <Clock size={16} className="text-amber-500" />,
      user: <Users size={16} className="text-green-500" />,
    };
    return icons[type] || <CheckCircle size={16} className="text-white" />;
  };

  const getActivityBg = (type) => {
    const bgs = {
      order: "bg-blue-500/10 border-blue-500/20",
      review: "bg-purple-500/10 border-purple-500/20",
      message: "bg-amber-500/10 border-amber-500/20",
      user: "bg-green-500/10 border-green-500/20",
    };
    return bgs[type] || "bg-white/5 border-white/10";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Welcome back! Here's what's happening.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-glass)] hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl transition-colors"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:opacity-20 transition-opacity`} />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.shadow}`}>
                {stat.icon}
              </div>
              {stat.change !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                  stat.change >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {stat.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(stat.change).toFixed(1)}%
                </div>
              )}
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-black text-[var(--text-primary)] mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">{stat.title}</p>
              {stat.subValue && (
                <p className="text-xs text-[var(--text-muted)] mt-2">{stat.subValue}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-glass)]">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-cyan-500 hover:text-cyan-400 flex items-center gap-1 font-medium transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Order</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Total</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {recentOrders.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-[var(--text-muted)]">No recent orders</td></tr>
                ) : (
                  recentOrders.map(record => (
                    <tr key={record.id} className="hover:bg-[var(--bg-glass)] transition-colors">
                      <td className="p-4">
                        <Link to={`/admin/orders/${record.id}`} className="font-medium text-cyan-400 hover:underline">
                          {record.orderNumber}
                        </Link>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-primary)]">{record.customer}</td>
                      <td className="p-4 font-bold text-[var(--text-primary)]">{formatCurrency(record.total)}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                          record.status.toLowerCase() === 'delivered' ? 'bg-green-500/20 text-green-400' :
                          record.status.toLowerCase() === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                          record.status.toLowerCase() === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-muted)]">{formatDate(record.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden flex flex-col h-full min-h-[400px]">
          <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-glass)]">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Recent Activity</h2>
          </div>
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            {activity.length === 0 ? (
              <div className="text-center text-[var(--text-muted)] py-8">No recent activity</div>
            ) : (
              activity.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getActivityBg(item.type)}`}>
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] mb-1 leading-snug">{item.message}</p>
                    <p className="text-xs text-[var(--text-muted)]">{formatDate(item.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-glass)]">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Top Selling Products</h2>
            <Link to="/admin/products" className="text-sm text-cyan-500 hover:text-cyan-400 flex items-center gap-1 font-medium transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-0">
            {topProducts.length === 0 ? (
              <div className="text-center text-[var(--text-muted)] py-8">No products found</div>
            ) : (
              topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-[var(--bg-glass)] transition-colors border-b border-[var(--border-subtle)] last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                      <Package size={20} className="text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[var(--text-primary)] truncate">{product.name}</h4>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      <span className="text-cyan-400 font-medium">{product.soldCount} sold</span> • {formatCurrency(product.price)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[var(--border-subtle)] flex items-center gap-2 bg-[var(--bg-glass)]">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Low Stock Alert</h2>
          </div>
          <div className="p-0">
            {lowStockProducts.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <p className="text-[var(--text-muted)] font-medium">All products are well stocked!</p>
              </div>
            ) : (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-[var(--bg-glass)] transition-colors border-b border-[var(--border-subtle)] last:border-0">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                      <Package size={20} className="text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[var(--text-primary)] truncate">{product.name}</h4>
                    <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
                      {typeof product.category === "object" ? product.category.name : product.category}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shrink-0 ${
                    product.quantity <= 0 ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-500"
                  }`}>
                    {product.quantity} left
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
