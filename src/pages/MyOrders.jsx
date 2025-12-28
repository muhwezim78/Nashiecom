import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { Table, Tag, Button, Card, Modal, App, Empty, Steps } from "antd";
import ChatWindow from "../components/chat/ChatWindow";
import "./MyOrders.css";

const MyOrders = () => {
  const { message } = App.useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatOrder, setActiveChatOrder] = useState(null);

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
        return "gold";
      case "CONFIRMED":
        return "blue";
      case "PROCESSING":
        return "cyan";
      case "SHIPPED":
        return "purple";
      case "DELIVERED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Order #",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text) => (
        <span className="font-semibold text-white">{text}</span>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total) => (
        <span className="text-cyan-400 font-bold">{formatCurrency(total)}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)} className="rounded-full px-3">
          {status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="text"
            className="text-gray-400 hover:text-white"
            icon={<Eye size={16} />}
            onClick={() => setSelectedOrder(record)}
          >
            Details
          </Button>

          {record.status !== "DELIVERED" && record.status !== "CANCELLED" && (
            <Button
              type="primary"
              className="bg-cyan-600 hover:bg-cyan-500 flex items-center gap-2"
              icon={<MessageSquare size={16} />}
              onClick={() => openChat(record)}
            >
              Chat
            </Button>
          )}

          {record.status === "SHIPPED" && !record.clientConfirmedDelivery && (
            <Button
              className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
              onClick={() => handleConfirmDelivery(record.id)}
            >
              Confirm Delivery
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            My <span className="text-cyan-400">Orders</span>
          </h1>
          <p className="mt-4 text-gray-400">
            Track your orders and communicate with our team.
          </p>
        </header>

        <Card className="order-table-card glass-card !rounded-2xl">
          <Table
            dataSource={orders}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8 }}
            className="custom-antd-table"
          />
        </Card>

        {/* Order Details Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2 text-xl font-bold !text-white">
              <Package className="text-cyan-400" />
              Order Details
            </div>
          }
          open={!!selectedOrder}
          onCancel={() => setSelectedOrder(null)}
          footer={null}
          width={800}
          className="order-details-modal"
          centered
        >
          {selectedOrder && (
            <div className="py-2 space-y-6">
              {/* Order Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  <p className="text-gray-400">
                    Placed on{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <Tag
                  color={getStatusColor(selectedOrder.status)}
                  className="px-4 py-1 rounded-full text-sm font-semibold uppercase border-none"
                >
                  {selectedOrder.status}
                </Tag>
              </div>

              {/* Progress Stepper - White icons/text for dark mode */}
              <Card
                size="small"
                className="!bg-white/5 !border-white/10 shadow-none !rounded-2xl"
              >
                <Steps
                  size="small"
                  className="dark-steps"
                  current={[
                    "PENDING",
                    "CONFIRMED",
                    "PROCESSING",
                    "SHIPPED",
                    "DELIVERED",
                  ].indexOf(selectedOrder.status)}
                  items={[
                    {
                      title: <span className="text-gray-300">Pending</span>,
                      icon: <Clock size={16} />,
                    },
                    {
                      title: <span className="text-gray-300">Confirmed</span>,
                      icon: <CheckCircle size={16} />,
                    },
                    {
                      title: <span className="text-gray-300">Shipped</span>,
                      icon: <Truck size={16} />,
                    },
                    {
                      title: <span className="text-gray-300">Delivered</span>,
                      icon: <Package size={16} />,
                    },
                  ]}
                />
              </Card>

              {/* Order Items */}
              <Card
                title={
                  <span className="font-bold flex items-center gap-2 text-white">
                    <Package size={18} className="text-cyan-400" /> Items
                    Purchased
                  </span>
                }
                size="small"
                className="!bg-white/5 !border-white/10 shadow-none !rounded-2xl"
                headStyle={{
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                }}
                styles={{ body: { padding: "12px" } }}
              >
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 items-center p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="w-14 h-14 bg-white/10 rounded-md border border-white/10 p-1 shrink-0 flex items-center justify-center">
                        <img
                          src={item.productImage || "https://placehold.co/150"}
                          alt={item.productName}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-200 text-sm">
                          {item.productName}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white text-sm">
                          {formatCurrency(item.price)}
                        </p>
                        <p className="text-cyan-400 font-bold text-xs">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Shipping Info */}
                <Card
                  size="small"
                  title={
                    <span className="font-bold flex items-center gap-2 text-white">
                      <Truck size={16} className="text-cyan-400" /> Shipping
                      Details
                    </span>
                  }
                  className="!bg-white/5 !border-white/10 shadow-none h-full !rounded-2xl"
                  headStyle={{
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                  }}
                >
                  <div className="text-sm text-gray-300 space-y-1">
                    <p className="font-semibold text-white">
                      {selectedOrder.address?.firstName}{" "}
                      {selectedOrder.address?.lastName}
                    </p>
                    <p>{selectedOrder.address?.addressLine1}</p>
                    <p>
                      {selectedOrder.address?.city}{" "}
                      {selectedOrder.address?.postalCode}
                    </p>
                    <p>{selectedOrder.address?.phone}</p>
                  </div>
                </Card>

                {/* Payment Info */}
                <Card
                  size="small"
                  title={
                    <span className="font-bold flex items-center gap-2 text-white">
                      <AlertCircle size={16} className="text-cyan-400" />{" "}
                      Payment Info
                    </span>
                  }
                  className="!bg-white/5 !border-white/10 shadow-none h-full !rounded-2xl"
                  headStyle={{
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Method:</span>
                      <span className="font-medium text-white">
                        {selectedOrder.paymentMethod || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-400">Status:</span>
                      <Tag
                        color={
                          selectedOrder.paymentStatus === "PAID"
                            ? "success"
                            : "warning"
                        }
                        className="border-none"
                      >
                        {selectedOrder.paymentStatus}
                      </Tag>
                    </div>
                    <div className="border-t border-dashed border-white/10 pt-2 mt-auto">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-300">
                          Total Paid
                        </span>
                        <span className="font-bold text-lg text-cyan-400">
                          {formatCurrency(selectedOrder.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {selectedOrder.status === "SHIPPED" &&
                !selectedOrder.clientConfirmedDelivery && (
                  <Card
                    className="!bg-cyan-950/30 !border-cyan-800/50 shadow-none !rounded-2xl"
                    styles={{ body: { padding: "16px" } }}
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 text-cyan-400">
                        <Truck className="animate-bounce" />
                        <div>
                          <p className="font-bold text-white">
                            Shipment on the way!
                          </p>
                          <p className="text-sm text-cyan-200/80">
                            Have you received this order?
                          </p>
                        </div>
                      </div>
                      <Button
                        type="primary"
                        onClick={() => handleConfirmDelivery(selectedOrder.id)}
                        className="bg-cyan-600 hover:bg-cyan-500 border-none"
                      >
                        Confirm Delivery
                      </Button>
                    </div>
                  </Card>
                )}
            </div>
          )}
        </Modal>

        {/* Floating Chat Window */}
        <AnimatePresence>
          {isChatOpen && activeChatOrder && (
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}
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
    </div>
  );
};

export default MyOrders;
