import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ordersAPI } from "../services/api";
import { formatCurrency } from "../utils/currency";
import {
  Package,
  MessageSquare,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  Eye,
  ChevronRight,
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  Box,
  MapPin,
  CreditCard,
  History,
  X,
} from "lucide-react";
import ChatWindow from "../components/chat/ChatWindow";
import SEO from "../components/SEO";

import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Steps } from "../components/ui/Steps";
import { message } from "../utils/toast";

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatOrder, setActiveChatOrder] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await ordersAPI.getMyOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
      message.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirmDelivery = async (orderId) => {
    try {
      await ordersAPI.confirmDelivery(orderId);
      message.success("Delivery confirmed!");
      fetchOrders();
    } catch (error) {
      message.error("Failed to confirm delivery");
    }
  };

  const openChat = (order) => {
    setActiveChatOrder(order);
    setIsChatOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-500";
      case "CONFIRMED":
        return "bg-blue-500/10 text-blue-500";
      case "PROCESSING":
        return "bg-cyan-500/10 text-cyan-500";
      case "SHIPPED":
        return "bg-purple-500/10 text-purple-500";
      case "DELIVERED":
        return "bg-green-500/10 text-green-500";
      case "CANCELLED":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: Box,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Active Orders",
      value: orders.filter((o) =>
        ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(o.status),
      ).length,
      icon: History,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Delivered Orders",
      value: orders.filter((o) => o.status === "DELIVERED").length,
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-32 pb-20 overflow-hidden relative transition-colors duration-500">
      <SEO
        title="My Orders"
        description="Track your Nashiecom orders and communicate with our support team."
      />

      {/* Decorative Aura */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-[-10%] w-[800px] h-[800px] bg-cyan-600/[0.02] blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-600/[0.02] blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-7xl flex flex-col gap-12">
        {/* Hero Hub */}
        <Card className="bg-[var(--bg-secondary)]/50 backdrop-blur-2xl border-[var(--border-subtle)] rounded-[3rem] shadow-3xl overflow-hidden relative border-0 p-0">
          <div className="h-32 bg-gradient-to-r from-cyan-600/10 via-blue-600/10 to-purple-600/10 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
          </div>
          <div className="px-8 md:px-16 py-10 flex flex-col md:flex-row items-end justify-between gap-8 -mt-12 relative z-10">
            <div className="flex items-end gap-6">
              <div className="p-1 bg-[var(--bg-secondary)] rounded-[2rem] shadow-2xl">
                <div className="w-24 h-24 rounded-[1.5rem] bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                  <History size={40} className="text-white" />
                </div>
              </div>
              <div className="pb-2">
                <h1 className="text-[var(--text-primary)] font-black m-0 tracking-tighter text-5xl">
                  Tracking <span className="text-cyan-400">Hub</span>
                </h1>
                <span className="text-[var(--text-muted)] font-medium uppercase tracking-[0.3em] text-[10px] block mt-1">
                  Products Delivery System
                </span>
              </div>
            </div>

            <div className="hidden lg:flex gap-4">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-[var(--bg-primary)]/50 border border-[var(--border-subtle)] rounded-2xl p-3 px-6 flex items-center gap-4"
                >
                  <div className={`p-2 ${stat.bg} ${stat.color} rounded-lg`}>
                    <stat.icon size={16} />
                  </div>
                  <div className="leading-tight">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase font-black tracking-widest">
                      {stat.label}
                    </span>
                    <span className="text-xl text-[var(--text-primary)] font-black">
                      {stat.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Interaction Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="w-full md:w-96 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search
                size={18}
                className="text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors"
              />
            </div>
            <Input
              placeholder="Search orders by ID..."
              className="pl-12 h-14 text-base rounded-2xl"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40 h-14 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-2xl px-4 text-[var(--text-primary)] focus:border-cyan-500 outline-none transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <Button
              onClick={fetchOrders}
              variant="outline"
              className="h-14 px-6 font-bold rounded-2xl border-[var(--border-subtle)] bg-transparent"
            >
              Refresh Log
            </Button>
          </div>
        </div>

        {/* Grid View / Table replacement */}
        <Card className="bg-[var(--bg-secondary)]/50 backdrop-blur-2xl border-[var(--border-subtle)] rounded-[3rem] shadow-3xl overflow-hidden border-0 p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-[var(--text-muted)]">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <Box size={48} className="text-[var(--text-muted)] mb-4" />
                <p className="text-[var(--text-muted)] mb-6">No active order flows found in the grid.</p>
                <Button onClick={() => navigate("/products")} className="px-8">
                  Initialize New Flow
                </Button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] px-6 py-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Order ID</th>
                    <th className="bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] px-6 py-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Date</th>
                    <th className="bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] px-6 py-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Total</th>
                    <th className="bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] px-6 py-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Status</th>
                    <th className="bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] px-6 py-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-right">Control Panel</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[var(--bg-glass)] transition-colors border-b border-[var(--border-subtle)]">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-[var(--text-primary)] font-black">#{order.orderNumber}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">Order Module</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-cyan-500/50" />
                          <span className="text-[var(--text-secondary)]">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-cyan-400 font-black">{formatCurrency(order.total)}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full font-bold uppercase tracking-widest text-[9px] ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end items-center gap-3">
                          <button
                            title="View Detailed Logs"
                            className="bg-[var(--bg-glass)] hover:bg-cyan-500/10 text-cyan-400 border border-[var(--border-subtle)] rounded-xl px-4 py-2 flex items-center gap-2 font-bold text-xs transition-colors"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye size={16} /> Details
                          </button>

                          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                            <button
                              title="Secure Comm Link"
                              className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl px-4 py-2 flex items-center gap-2 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20"
                              onClick={() => openChat(order)}
                            >
                              <MessageSquare size={16} /> Chat
                            </button>
                          )}

                          {order.status === "SHIPPED" && !order.clientConfirmedDelivery && (
                            <button
                              className="bg-green-600 hover:bg-green-500 text-white rounded-xl px-4 py-2 flex items-center gap-2 font-bold text-xs transition-colors"
                              onClick={() => handleConfirmDelivery(order.id)}
                            >
                              Confirm
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* DETAILED TRACKING DRAWER OVERLAY */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-[var(--bg-secondary)] border-l border-[var(--border-subtle)] flex flex-col shadow-2xl z-10"
            >
              <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-glass)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl">
                    <Box size={24} />
                  </div>
                  <div>
                    <h4 className="text-[var(--text-primary)] text-xl font-black m-0 tracking-tight">
                      Order Insight
                    </h4>
                    <span className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">
                      #{selectedOrder.orderNumber}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 bg-[var(--bg-primary)] rounded-xl text-[var(--text-secondary)] hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Real-time Status */}
                <Card className="bg-[var(--bg-secondary)] border-[var(--border-subtle)] rounded-3xl shadow-inner p-6">
                  <Steps
                    current={["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].indexOf(selectedOrder.status)}
                    items={[
                      { title: "Pending" },
                      { title: "Confirmed" },
                      { title: "Transit" },
                      { title: "Finalized" },
                    ]}
                  />
                </Card>

                {/* Inventory Map */}
                <div className="space-y-4">
                  <h5 className="text-[var(--text-primary)] font-black uppercase tracking-[0.2em] text-[10px]">
                    Order Details
                  </h5>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item) => (
                      <Card
                        key={item.id}
                        className="bg-[var(--bg-glass)] border-[var(--border-subtle)] rounded-2xl hover:bg-[var(--bg-secondary)] transition-all p-4 border"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="w-16 h-16 bg-white/[0.03] rounded-xl border border-[var(--border-subtle)] p-2 flex items-center justify-center">
                            <img
                              src={item.productImage || "https://placehold.co/150"}
                              alt={item.productName}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <span className="text-[var(--text-primary)] block text-sm font-bold">
                              {item.productName}
                            </span>
                            <span className="text-[var(--text-muted)] text-xs">
                              Qty: {item.quantity} × {formatCurrency(item.price)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-cyan-400 block font-bold">
                              {formatCurrency(item.subtotal)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Logistics Grid */}
                <div className="flex flex-col gap-6">
                  <Card className="bg-[var(--bg-glass)] border-[var(--border-subtle)] rounded-3xl p-6 border">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin size={16} className="text-cyan-500" />
                      <span className="text-[var(--text-primary)] font-bold text-xs uppercase tracking-widest">
                        Delivery Type
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[var(--text-secondary)]">
                        {selectedOrder.address?.firstName} {selectedOrder.address?.lastName}
                      </span>
                      <span className="text-[var(--text-muted)] text-sm">
                        {selectedOrder.address?.addressLine1}, {selectedOrder.address?.city}
                      </span>
                      <span className="text-[var(--text-muted)] text-sm">
                        {selectedOrder.address?.phone}
                      </span>
                    </div>
                  </Card>
                  
                  <Card className="bg-[var(--bg-glass)] border-[var(--border-subtle)] rounded-3xl p-6 border">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard size={16} className="text-purple-500" />
                      <span className="text-[var(--text-primary)] font-bold text-xs uppercase tracking-widest">
                        Payment Method
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[var(--text-muted)]">
                        Method: {selectedOrder.paymentMethod || "MM Sync"}
                      </span>
                      <span className={`px-2 py-1 rounded font-bold uppercase tracking-widest text-[9px] ${
                        selectedOrder.paymentStatus === "PAID" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                      }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    <div className="h-px w-full bg-[var(--border-subtle)] my-4" />
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-primary)] font-bold uppercase tracking-[0.2em] text-[10px]">
                        Total Amount
                      </span>
                      <span className="text-xl text-cyan-400 font-black">
                        {formatCurrency(selectedOrder.total)}
                      </span>
                    </div>
                  </Card>
                </div>

                {/* Control Actions */}
                <div className="flex flex-col gap-4 mt-8">
                  {selectedOrder.status === "SHIPPED" && !selectedOrder.clientConfirmedDelivery && (
                    <Button
                      onClick={() => handleConfirmDelivery(selectedOrder.id)}
                      className="h-14 rounded-2xl bg-green-600 hover:bg-green-500 w-full text-lg shadow-lg"
                    >
                      Finalize Receipt
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="h-14 rounded-2xl border-[var(--border-subtle)] bg-[var(--bg-glass)] text-[var(--text-primary)] w-full flex items-center justify-center gap-2 shadow-sm"
                    onClick={() => {
                      openChat(selectedOrder);
                      setSelectedOrder(null);
                    }}
                  >
                    <MessageSquare size={18} /> Chat with Seller
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOAT CHAT - Persisted */}
      <AnimatePresence>
        {isChatOpen && activeChatOrder && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-6 right-6 z-[1000] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)]"
          >
            <ChatWindow
              orderId={activeChatOrder.id}
              orderNumber={activeChatOrder.orderNumber}
              onClose={() => setIsChatOpen(false)}
              isAdmin={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyOrders;
