import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  UserX,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  X,
  Loader2,
} from "lucide-react";
import { usersAPI } from "../../services/api";
import { message } from "../../utils/toast";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date) => {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const CustomersPage = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit, ...filters };
      Object.keys(params).forEach((key) => { if (params[key] === "" || params[key] === undefined) delete params[key]; });
      const response = await usersAPI.getAll(params);
      setCustomers(response.data.users);
      setPagination((prev) => ({ ...prev, total: response.data.pagination.total }));
    } catch (error) {
      message.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await usersAPI.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error("Failed to fetch stats");
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [pagination.page, filters]);

  const viewCustomer = async (customer) => {
    try {
      const response = await usersAPI.getById(customer.id);
      setSelectedCustomer(response.data.user);
      setDrawerOpen(true);
    } catch (error) {
      message.error("Failed to fetch customer details");
    }
  };

  const toggleStatus = async (id) => {
    if (!window.confirm("Are you sure you want to toggle this user's status?")) return;
    try {
      await usersAPI.toggleStatus(id);
      message.success("Status updated");
      fetchCustomers();
      if (selectedCustomer && selectedCustomer.id === id) {
        setDrawerOpen(false);
      }
    } catch (error) {
      message.error("Update failed");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Customers</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage customer accounts ({pagination.total} customers)</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">Total Customers</h3>
            <p className="text-3xl font-black text-cyan-400">{stats.total}</p>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">Active</h3>
            <p className="text-3xl font-black text-green-500">{stats.active}</p>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">Inactive</h3>
            <p className="text-3xl font-black text-red-500">{stats.inactive}</p>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">New This Month</h3>
            <p className="text-3xl font-black text-purple-400">{stats.newThisMonth}</p>
          </div>
        </div>
      )}

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPagination({ ...pagination, page: 1 }); }}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={filters.status}
              onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPagination({ ...pagination, page: 1 }); }}
              className="w-full px-4 py-2 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
            >
              <option value="" className="bg-[#1a1a24]">All Statuses</option>
              <option value="active" className="bg-[#1a1a24]">Active</option>
              <option value="inactive" className="bg-[#1a1a24]">Inactive</option>
            </select>
          </div>
          <button
            onClick={() => { setFilters({ search: "", status: "" }); setPagination({ ...pagination, page: 1 }); }}
            className="px-4 py-2 bg-[var(--bg-glass)] hover:bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] transition-colors whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-glass)]">
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Customer</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Phone</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Orders</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Last Login</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Joined</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-[var(--text-muted)]"><Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500 mb-2" /> Loading customers...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-[var(--text-muted)]">No customers found.</td></tr>
              ) : (
                customers.map((record) => (
                  <tr key={record.id} className="hover:bg-[var(--bg-glass)] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {record.avatar ? (
                          <img src={record.avatar} alt={record.firstName} className="w-10 h-10 rounded-full object-cover border border-[var(--border-subtle)]" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-500 font-bold flex items-center justify-center border border-cyan-500/30">
                            {record.firstName?.[0] || "?"}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-[var(--text-primary)]">{record.firstName} {record.lastName}</div>
                          <div className="text-xs text-[var(--text-secondary)]">{record.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{record.phone || "-"}</td>
                    <td className="p-4 font-bold text-[var(--text-primary)]">{record._count?.orders || 0}</td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{formatDate(record.lastLoginAt)}</td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{formatDate(record.createdAt)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                        record.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {record.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => viewCustomer(record)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="View Details"><Eye size={16} /></button>
                        <button onClick={() => toggleStatus(record.id)} className={`p-2 rounded-lg transition-colors ${record.isActive ? "text-red-500 hover:bg-red-500/10" : "text-green-500 hover:bg-green-500/10"}`} title={record.isActive ? "Deactivate" : "Activate"}>
                          {record.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.total > 0 && (
          <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)]">
            <span>Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries</span>
            <div className="flex gap-2">
              <button disabled={pagination.page === 1} onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))} className="px-3 py-1 rounded-lg bg-[var(--bg-glass)] hover:bg-[var(--bg-primary)] disabled:opacity-50 transition-colors">Previous</button>
              <button disabled={pagination.page * pagination.limit >= pagination.total} onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))} className="px-3 py-1 rounded-lg bg-[var(--bg-glass)] hover:bg-[var(--bg-primary)] disabled:opacity-50 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Details Drawer */}
      {drawerOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-[var(--bg-secondary)] shadow-2xl flex flex-col border-l border-[var(--border-subtle)] transform transition-transform">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-glass)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Customer Details</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-white/10 rounded-xl text-[var(--text-secondary)] transition-colors"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide flex flex-col gap-8">
              <div className="text-center flex flex-col items-center">
                {selectedCustomer.avatar ? (
                  <img src={selectedCustomer.avatar} alt={selectedCustomer.firstName} className="w-24 h-24 rounded-full object-cover border-4 border-[var(--bg-glass)] shadow-lg" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-cyan-500/20 text-cyan-500 text-3xl font-bold flex items-center justify-center border-4 border-cyan-500/30 shadow-lg">
                    {selectedCustomer.firstName?.[0] || "?"}
                  </div>
                )}
                <h3 className="mt-4 text-xl font-bold text-[var(--text-primary)]">{selectedCustomer.firstName} {selectedCustomer.lastName}</h3>
                <span className={`mt-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${selectedCustomer.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {selectedCustomer.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4">Contact Information</h4>
                <div className="bg-[var(--bg-glass)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col gap-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Mail size={16} className="text-[var(--text-muted)] mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-[var(--text-secondary)] mb-0.5">Email</span>
                      <span className="text-[var(--text-primary)] font-medium">{selectedCustomer.email}</span>
                      {selectedCustomer.emailVerified && <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-[10px] font-bold uppercase tracking-wider">Verified</span>}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={16} className="text-[var(--text-muted)] mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-[var(--text-secondary)] mb-0.5">Phone</span>
                      <span className="text-[var(--text-primary)] font-medium">{selectedCustomer.phone || "Not provided"}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar size={16} className="text-[var(--text-muted)] mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-[var(--text-secondary)] mb-0.5">Member Since</span>
                      <span className="text-[var(--text-primary)] font-medium">{formatDate(selectedCustomer.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <UserCheck size={16} className="text-[var(--text-muted)] mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-[var(--text-secondary)] mb-0.5">Last Login</span>
                      <span className="text-[var(--text-primary)] font-medium">{formatDate(selectedCustomer.lastLoginAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--bg-glass)] rounded-xl border border-[var(--border-subtle)] p-4 text-center">
                  <h4 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Total Orders</h4>
                  <p className="text-2xl font-black text-cyan-400">{selectedCustomer._count?.orders || 0}</p>
                </div>
                <div className="bg-[var(--bg-glass)] rounded-xl border border-[var(--border-subtle)] p-4 text-center">
                  <h4 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Reviews</h4>
                  <p className="text-2xl font-black text-purple-400">{selectedCustomer._count?.reviews || 0}</p>
                </div>
              </div>

              {selectedCustomer.orders?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4">Recent Orders</h4>
                  <div className="bg-[var(--bg-glass)] rounded-xl border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
                    {selectedCustomer.orders.map(order => (
                      <div key={order.id} className="p-4 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-[var(--text-primary)]">{order.orderNumber}</div>
                          <div className="text-xs text-[var(--text-secondary)] mt-1">{formatDate(order.createdAt)}</div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <div className="font-bold text-[var(--text-primary)]">{formatCurrency(order.total)}</div>
                          <span className={`mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${order.status === "DELIVERED" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCustomer.addresses?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4">Saved Addresses</h4>
                  <div className="space-y-3">
                    {selectedCustomer.addresses.map(address => (
                      <div key={address.id} className="bg-[var(--bg-glass)] rounded-xl border border-[var(--border-subtle)] p-4 relative">
                        {address.isDefault && <span className="absolute top-4 right-4 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-bold uppercase tracking-wider">Default</span>}
                        <div className="font-medium text-[var(--text-primary)] mb-1">{address.firstName} {address.lastName}</div>
                        <div className="text-sm text-[var(--text-secondary)] leading-relaxed">
                          {address.addressLine1}<br />
                          {address.city}, {address.state} {address.postalCode}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => toggleStatus(selectedCustomer.id)}
                  className={`w-full py-3 rounded-xl font-medium shadow-lg transition-colors ${
                    selectedCustomer.isActive 
                      ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" 
                      : "bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white"
                  }`}
                >
                  {selectedCustomer.isActive ? "Deactivate Account" : "Activate Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
