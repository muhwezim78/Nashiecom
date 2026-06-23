import { useState, useEffect } from "react";
import { ShoppingCart, DollarSign, Package, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
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

const StatCard = ({ title, value, prefix, colorClass, subtext, isPositive }) => (
  <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl h-full flex flex-col justify-between group hover:-translate-y-1 transition-transform">
    <div>
      <div className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider mb-2">{title}</div>
      <div className="flex items-center text-3xl font-black text-[var(--text-primary)] mb-2">
        {prefix && <span className={`mr-2 opacity-80 ${colorClass}`}>{prefix}</span>}
        <span className={colorClass}>{typeof value === "number" ? value.toLocaleString() : value}</span>
      </div>
    </div>
    {subtext && (
      <div className={`text-xs flex items-center gap-1 font-bold ${isPositive === true ? "text-green-400 bg-green-500/10 w-fit px-2 py-1 rounded" : isPositive === false ? "text-red-400 bg-red-500/10 w-fit px-2 py-1 rounded" : "text-[var(--text-muted)]"}`}>
        {isPositive === true && <TrendingUp size={12} />}
        {isPositive === false && <TrendingDown size={12} />}
        {subtext}
      </div>
    )}
  </div>
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

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
          <p className="text-sm text-[var(--text-muted)]">Performance overview & trends</p>
        </div>
        <select
          value={period}
          onChange={handlePeriodChange}
          className="px-4 py-2 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
        >
          <option value="7days" className="bg-[#1a1a24]">Last 7 Days</option>
          <option value="30days" className="bg-[#1a1a24]">Last 30 Days</option>
          <option value="90days" className="bg-[#1a1a24]">Last 3 Months</option>
          <option value="12months" className="bg-[#1a1a24]">Last Year</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={stats?.revenue?.total || 0}
          prefix={<span className="text-lg">UGX</span>}
          colorClass="text-green-500"
          subtext={`Growth: ${stats?.revenue?.growth || 0}% vs last month`}
          isPositive={(stats?.revenue?.growth || 0) >= 0}
        />
        <StatCard
          title="Total Orders"
          value={stats?.orders?.total || 0}
          prefix={<ShoppingCart size={24} />}
          colorClass="text-blue-500"
          subtext={`${stats?.orders?.today || 0} orders today`}
        />
        <StatCard
          title="Avg. Order Value"
          value={Math.round(
            stats?.orders?.total > 0
              ? stats?.revenue?.total / stats?.orders?.total
              : 0,
          )}
          prefix={<span className="text-lg">UGX</span>}
          colorClass="text-amber-500"
          subtext="Lifetime average"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl flex flex-col min-h-[400px]">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">Revenue Trend</h2>
          <div className="flex-1 w-full relative min-h-[300px]">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(str) => {
                      const date = new Date(str);
                      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
                    tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333", borderRadius: 8, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.5)" }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value) => [`UGX ${value.toLocaleString()}`, "Revenue"]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#00d4ff" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-muted)]">
                <DollarSign size={48} className="mb-4 opacity-50" />
                <p>No revenue data for this period</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl flex flex-col">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">Best Sellers</h2>
          <div className="flex flex-col flex-1 divide-y divide-[var(--border-subtle)]">
            {topProducts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[var(--text-muted)]">No data available</div>
            ) : (
              topProducts.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4 group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[var(--border-subtle)]" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                        <Package size={20} className="text-gray-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-[var(--text-primary)] font-bold truncate group-hover:text-cyan-400 transition-colors" title={item.name}>
                        {item.name}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        <span className="font-bold text-cyan-500">{item.soldCount}</span> sold · UGX {item.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black shrink-0 ${index < 3 ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-subtle)]"}`}>
                    #{index + 1}
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

export default AnalyticsPage;
