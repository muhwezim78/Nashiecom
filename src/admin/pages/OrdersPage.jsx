import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  MessageSquare,
  X,
  Loader2,
} from "lucide-react";
import ChatWindow from "../../components/chat/ChatWindow";
import { ordersAPI } from "../../services/api";
import { message } from "../../utils/toast";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const orderStatuses = [
  { value: "PENDING", label: "Pending", color: "text-yellow-500 bg-yellow-500/20", icon: <Clock size={14} /> },
  { value: "CONFIRMED", label: "Confirmed", color: "text-blue-400 bg-blue-500/20", icon: <CheckCircle size={14} /> },
  { value: "PROCESSING", label: "Processing", color: "text-cyan-400 bg-cyan-500/20", icon: <Package size={14} /> },
  { value: "SHIPPED", label: "Shipped", color: "text-purple-400 bg-purple-500/20", icon: <Truck size={14} /> },
  { value: "DELIVERED", label: "Delivered", color: "text-green-400 bg-green-500/20", icon: <CheckCircle size={14} /> },
  { value: "CANCELLED", label: "Cancelled", color: "text-red-400 bg-red-500/20", icon: <XCircle size={14} /> },
];

const paymentStatuses = [
  { value: "PENDING", label: "Pending", color: "text-yellow-500 bg-yellow-500/20" },
  { value: "PAID", label: "Paid", color: "text-green-400 bg-green-500/20" },
  { value: "FAILED", label: "Failed", color: "text-red-400 bg-red-500/20" },
  { value: "REFUNDED", label: "Refunded", color: "text-purple-400 bg-purple-500/20" },
];

const OrdersPage = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ search: "", status: "", paymentStatus: "" });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusFormData, setStatusFormData] = useState({ status: "", note: "" });
  const [activeChatOrder, setActiveChatOrder] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit, ...filters };
      Object.keys(params).forEach(key => { if (params[key] === "" || params[key] === undefined) delete params[key]; });
      const response = await ordersAPI.getAll(params);
      setOrders(response.data.orders);
      setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
    } catch (error) {
      message.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, filters]);

  const viewOrder = async (order) => {
    try {
      const response = await ordersAPI.getById(order.id);
      setSelectedOrder(response.data.order);
      setDrawerOpen(true);
    } catch (error) {
      message.error("Failed to fetch order details");
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setStatusFormData({ status: order.status, note: "" });
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await ordersAPI.updateStatus(selectedOrder.id, statusFormData.status, statusFormData.note);
      message.success("Order status updated");
      setStatusModalOpen(false);
      fetchOrders();
    } catch (error) {
      message.error(error.message || "Update failed");
    }
  };

  const handlePaymentStatusUpdate = async (orderId, paymentStatus) => {
    try {
      await ordersAPI.updatePaymentStatus(orderId, paymentStatus);
      message.success("Payment status updated");
      fetchOrders();
    } catch (error) {
      message.error("Update failed");
    }
  };

  const handleConfirmDelivery = async (orderId) => {
    try {
      await ordersAPI.confirmDelivery(orderId);
      message.success("Delivery confirmed");
      fetchOrders();
    } catch (error) {
      message.error("Action failed");
    }
  };

  const getStatusInfo = (status) => orderStatuses.find(s => s.value === status) || { label: status, color: "text-gray-400 bg-gray-500/20" };
  const getPaymentStatusInfo = (status) => paymentStatuses.find(s => s.value === status) || { label: status, color: "text-gray-400 bg-gray-500/20" };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Orders</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage customer orders ({pagination.total} orders)</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-glass)] hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl transition-colors">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input
              type="text"
              placeholder="Search by order # or customer..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-2 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
            >
              <option value="" className="bg-[#1a1a24]">All Statuses</option>
              {orderStatuses.map(s => <option key={s.value} value={s.value} className="bg-[#1a1a24]">{s.label}</option>)}
            </select>
          </div>
          <div className="w-full md:w-48">
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
              className="w-full px-4 py-2 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
            >
              <option value="" className="bg-[#1a1a24]">All Payments</option>
              {paymentStatuses.map(s => <option key={s.value} value={s.value} className="bg-[#1a1a24]">{s.label}</option>)}
            </select>
          </div>
          <button
            onClick={() => { setFilters({ search: "", status: "", paymentStatus: "" }); setPagination(prev => ({ ...prev, page: 1 })); }}
            className="px-4 py-2 bg-[var(--bg-glass)] hover:bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] transition-colors whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-glass)]">
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Order</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Customer</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Products</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-center">Qty</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Total</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Payment</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-[var(--text-muted)]"><Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500 mb-2" /> Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-[var(--text-muted)]">No orders found.</td></tr>
              ) : (
                orders.map((record) => (
                  <tr key={record.id} className="hover:bg-[var(--bg-glass)] transition-colors">
                    <td className="p-4">
                      <button onClick={() => viewOrder(record)} className="font-bold text-cyan-400 hover:underline">{record.orderNumber}</button>
                      <div className="text-xs text-[var(--text-muted)] mt-1">{formatDate(record.createdAt)}</div>
                    </td>
                    <td className="p-4 text-[var(--text-primary)] text-sm">
                      <div className="font-medium">{record.user?.firstName} {record.user?.lastName}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">{record.user?.email}</div>
                    </td>
                    <td className="p-4 text-xs text-[var(--text-secondary)]">
                      {record.items?.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="truncate max-w-[200px] mb-0.5">{item.productName}</div>
                      ))}
                      {record.items?.length > 2 && <div className="text-[var(--text-muted)] mt-1">+ {record.items.length - 2} more...</div>}
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded font-bold text-xs">
                        {record.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-[var(--text-primary)]">{formatCurrency(record.total)}</td>
                    <td className="p-4">
                      <button onClick={() => openStatusModal(record)} className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${getStatusInfo(record.status).color}`}>
                        {getStatusInfo(record.status).icon} {getStatusInfo(record.status).label}
                      </button>
                    </td>
                    <td className="p-4">
                      <select
                        value={record.paymentStatus}
                        onChange={(e) => handlePaymentStatusUpdate(record.id, e.target.value)}
                        className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest outline-none ${getPaymentStatusInfo(record.paymentStatus).color} cursor-pointer`}
                      >
                        {paymentStatuses.map(ps => <option key={ps.value} value={ps.value} className="bg-[#1a1a24] text-white font-medium">{ps.label}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => viewOrder(record)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="View Details"><Eye size={16} /></button>
                        <button onClick={() => { setActiveChatOrder(record); setIsChatOpen(true); }} className="p-1.5 bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/40 rounded transition-colors" title="Chat"><MessageSquare size={16} /></button>
                        {record.status === "SHIPPED" && !record.adminConfirmedDelivery && (
                          <button onClick={() => handleConfirmDelivery(record.id)} className="p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/40 rounded transition-colors" title="Confirm Delivery"><CheckCircle size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
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

      {/* Order Details Drawer */}
      {drawerOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-[var(--bg-secondary)] shadow-2xl flex flex-col border-l border-[var(--border-subtle)] transform transition-transform">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-glass)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Order {selectedOrder.orderNumber}</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-white/10 rounded-xl text-[var(--text-secondary)] transition-colors"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide flex flex-col gap-8">
              <div className="flex gap-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${getStatusInfo(selectedOrder.status).color}`}>
                  {getStatusInfo(selectedOrder.status).label}
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${getPaymentStatusInfo(selectedOrder.paymentStatus).color}`}>
                  Payment: {getPaymentStatusInfo(selectedOrder.paymentStatus).label}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4">Order Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm bg-[var(--bg-glass)] p-4 rounded-xl border border-[var(--border-subtle)]">
                  <div><span className="text-[var(--text-muted)] block mb-1">Date</span> <span className="text-[var(--text-primary)] font-medium">{formatDate(selectedOrder.createdAt)}</span></div>
                  <div><span className="text-[var(--text-muted)] block mb-1">Payment Method</span> <span className="text-[var(--text-primary)] font-medium">{selectedOrder.paymentMethod}</span></div>
                  <div><span className="text-[var(--text-muted)] block mb-1">Subtotal</span> <span className="text-[var(--text-primary)] font-medium">{formatCurrency(selectedOrder.subtotal)}</span></div>
                  <div><span className="text-[var(--text-muted)] block mb-1">Shipping</span> <span className="text-[var(--text-primary)] font-medium">{formatCurrency(selectedOrder.shippingCost)}</span></div>
                  <div><span className="text-[var(--text-muted)] block mb-1">Tax</span> <span className="text-[var(--text-primary)] font-medium">{formatCurrency(selectedOrder.tax)}</span></div>
                  <div><span className="text-[var(--text-muted)] block mb-1">Discount</span> <span className="text-[var(--text-primary)] font-medium">{formatCurrency(selectedOrder.discount)}</span></div>
                  <div className="col-span-2 pt-2 border-t border-[var(--border-subtle)] flex justify-between items-center mt-2">
                    <span className="font-bold text-[var(--text-primary)]">Total</span>
                    <span className="text-xl font-black text-cyan-400">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4">Customer Info</h3>
                <div className="bg-[var(--bg-glass)] p-4 rounded-xl border border-[var(--border-subtle)] text-sm space-y-2">
                  <div><span className="text-[var(--text-muted)] inline-block w-20">Name:</span> <span className="text-[var(--text-primary)] font-medium">{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</span></div>
                  <div><span className="text-[var(--text-muted)] inline-block w-20">Email:</span> <span className="text-[var(--text-primary)] font-medium">{selectedOrder.user?.email}</span></div>
                  <div><span className="text-[var(--text-muted)] inline-block w-20">Phone:</span> <span className="text-[var(--text-primary)] font-medium">{selectedOrder.user?.phone || "-"}</span></div>
                </div>
              </div>

              {selectedOrder.address && (
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4">Shipping Address</h3>
                  <div className="bg-[var(--bg-glass)] p-4 rounded-xl border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] leading-relaxed">
                    <span className="font-medium text-[var(--text-primary)] block mb-1">{selectedOrder.address.firstName} {selectedOrder.address.lastName}</span>
                    {selectedOrder.address.addressLine1}<br />
                    {selectedOrder.address.addressLine2 && <>{selectedOrder.address.addressLine2}<br /></>}
                    {selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.postalCode}<br />
                    {selectedOrder.address.country}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4">Items ({selectedOrder.items?.length})</h3>
                <div className="bg-[var(--bg-glass)] rounded-xl border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="p-4 flex gap-4 items-center">
                      <img src={item.productImage || "https://placehold.co/60"} alt={item.productName} className="w-16 h-16 rounded-xl object-cover bg-[var(--bg-primary)] border border-[var(--border-subtle)]" />
                      <div className="flex-1">
                        <h4 className="font-bold text-[var(--text-primary)]">{item.productName}</h4>
                        {item.sku && <p className="text-xs text-[var(--text-muted)] mt-1">SKU: {item.sku}</p>}
                        <p className="text-sm text-[var(--text-secondary)] mt-1">{formatCurrency(item.price)} × {item.quantity}</p>
                      </div>
                      <div className="font-bold text-[var(--text-primary)] text-right">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.statusHistory?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4">Status History</h3>
                  <div className="space-y-6 ml-2 border-l-2 border-[var(--border-subtle)] pl-6 relative">
                    {selectedOrder.statusHistory.map((history, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-[var(--bg-secondary)]" />
                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest mb-2 ${getStatusInfo(history.status).color}`}>
                          {getStatusInfo(history.status).label}
                        </span>
                        {history.note && <p className="text-sm text-[var(--text-primary)] mb-1 bg-[var(--bg-glass)] p-3 rounded-lg border border-[var(--border-subtle)]">{history.note}</p>}
                        <p className="text-xs text-[var(--text-muted)]">{formatDate(history.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-glass)] flex justify-end gap-3">
              <button onClick={() => { setDrawerOpen(false); openStatusModal(selectedOrder); }} className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-lg shadow-cyan-500/20 transition-colors">
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-glass)]">
              <h3 className="font-bold text-lg text-[var(--text-primary)]">Update Order Status</h3>
              <button onClick={() => setStatusModalOpen(false)} className="text-[var(--text-muted)] hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleStatusUpdate} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Status</label>
                <select
                  required
                  value={statusFormData.status}
                  onChange={(e) => setStatusFormData({...statusFormData, status: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                >
                  <option value="" disabled className="bg-[#1a1a24]">Select Status</option>
                  {orderStatuses.map(s => <option key={s.value} value={s.value} className="bg-[#1a1a24]">{s.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Note (optional)</label>
                <textarea
                  rows={3}
                  value={statusFormData.note}
                  onChange={(e) => setStatusFormData({...statusFormData, note: e.target.value})}
                  placeholder="Add a note about this status change"
                  className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setStatusModalOpen(false)} className="px-5 py-2 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-lg transition-colors">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Chat Window */}
      {isChatOpen && activeChatOrder && (
        <ChatWindow
          orderId={activeChatOrder.id}
          orderNumber={activeChatOrder.orderNumber}
          onClose={() => setIsChatOpen(false)}
          isAdmin={true}
        />
      )}
    </div>
  );
};

export default OrdersPage;
