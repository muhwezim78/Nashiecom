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
} from "lucide-react";
import {
  Table,
  Tag,
  Button,
  Card,
  Drawer,
  App,
  Empty,
  Steps,
  Typography,
  Space,
  Row,
  Col,
  Input,
  Select,
  Divider,
  Badge,
  Tooltip,
  Result,
} from "antd";
import ChatWindow from "../components/chat/ChatWindow";
import SEO from "../components/SEO";

const { Title, Text, Paragraph } = Typography;

const MyOrders = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatOrder, setActiveChatOrder] = useState(null);
  const [searchText, setSearchText] = useState("");

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

  const [statusFilter, setStatusFilter] = useState(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: (
        <Text className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
          Order ID
        </Text>
      ),
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text) => (
        <Space direction="vertical" size={0}>
          <Text strong className="text-[var(--text-primary)] font-black">
            #{text}
          </Text>
          <Text className="text-[10px] text-[var(--text-muted)]">
            Order Module
          </Text>
        </Space>
      ),
    },
    {
      title: (
        <Text className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
          Order Placement Date
        </Text>
      ),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <Space size="small">
          <Calendar size={14} className="text-cyan-500/50" />
          <Text className="text-[var(--text-secondary)]">
            {new Date(date).toLocaleDateString()}
          </Text>
        </Space>
      ),
    },
    {
      title: (
        <Text className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
          Total Amount
        </Text>
      ),
      dataIndex: "total",
      key: "total",
      render: (total) => (
        <Text strong className="text-cyan-400 font-black">
          {formatCurrency(total)}
        </Text>
      ),
    },
    {
      title: (
        <Text className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
          Order Status
        </Text>
      ),
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={
            status === "DELIVERED"
              ? "success"
              : status === "CANCELLED"
                ? "error"
                : "processing"
          }
          text={
            <Tag
              color={getStatusColor(status)}
              className="rounded-full px-3 border-none font-bold uppercase tracking-widest text-[9px]"
            >
              {status}
            </Tag>
          }
        />
      ),
    },
    {
      title: (
        <Text className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
          Control Panel
        </Text>
      ),
      key: "actions",
      fixed: "right",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Detailed Logs">
            <Button
              type="text"
              className="!bg-[var(--bg-glass)] hover:!bg-cyan-500/10 text-cyan-400 border border-[var(--border-subtle)] rounded-xl"
              icon={<Eye size={16} />}
              onClick={() => setSelectedOrder(record)}
            >
              Details
            </Button>
          </Tooltip>

          {record.status !== "DELIVERED" && record.status !== "CANCELLED" && (
            <Tooltip title="Secure Comm Link">
              <Button
                type="primary"
                className="bg-cyan-600 hover:bg-cyan-500 border-none rounded-xl"
                icon={<MessageSquare size={16} />}
                onClick={() => openChat(record)}
              >
                Chat
              </Button>
            </Tooltip>
          )}

          {record.status === "SHIPPED" && !record.clientConfirmedDelivery && (
            <Button
              className="bg-green-600 hover:bg-green-500 border-none text-white rounded-xl"
              onClick={() => handleConfirmDelivery(record.id)}
            >
              Confirm Delivery
            </Button>
          )}
        </Space>
      ),
    },
  ];

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

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <Space direction="vertical" size={48} className="w-full">
          {/* Hero Hub */}
          <Card
            className="!bg-[var(--bg-secondary)]/50 backdrop-blur-2xl !border-[var(--border-subtle)] !rounded-[3rem] shadow-3xl overflow-hidden relative !border-0"
            styles={{ body: { padding: 0 } }}
          >
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
                  <Title
                    level={1}
                    className="!text-[var(--text-primary)] !font-black !m-0 !tracking-tighter !text-5xl"
                  >
                    Tracking <span className="text-cyan-400">Hub</span>
                  </Title>
                  <Text className="text-[var(--text-muted)] font-medium uppercase tracking-[0.3em] text-[10px] block mt-1">
                    Products Delivery System
                  </Text>
                </div>
              </div>

              <div className="hidden lg:flex gap-4">
                {stats.map((stat, i) => (
                  <Card
                    key={i}
                    className="!bg-[var(--bg-primary)]/50 !border-[var(--border-subtle)] !rounded-2xl"
                    styles={{ body: { padding: "12px 24px" } }}
                    variant="borderless"
                  >
                    <Space>
                      <div
                        className={`p-2 ${stat.bg} ${stat.color} rounded-lg`}
                      >
                        <stat.icon size={16} />
                      </div>
                      <div className="leading-tight">
                        <Text className="text-[10px] text-[var(--text-muted)] block uppercase font-black tracking-widest">
                          {stat.label}
                        </Text>
                        <Title
                          level={4}
                          className="!m-0 !text-[var(--text-primary)] !font-black"
                        >
                          {stat.value}
                        </Title>
                      </div>
                    </Space>
                  </Card>
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
                className="theme-input !pl-12 !h-14 !text-base !rounded-2xl"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <Space>
              <Select
                placeholder="Filter Status"
                className="w-40 h-14 custom-glass-select"
                variant="borderless"
                allowClear
                onChange={(val) => setStatusFilter(val)}
                styles={{
                  popup: {
                    root: {
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "1rem",
                      padding: "0.5rem",
                    },
                  },
                }}
                options={[
                  { value: "PENDING", label: "Pending" },
                  { value: "CONFIRMED", label: "Confirmed" },
                  { value: "SHIPPED", label: "Shipped" },
                  { value: "DELIVERED", label: "Delivered" },
                  { value: "CANCELLED", label: "Cancelled" },
                ]}
              />
              <Button
                onClick={fetchOrders}
                className="theme-input !h-14 !px-6 !border-[var(--border-subtle)] !bg-transparent text-[var(--text-primary)] font-bold rounded-2xl"
              >
                Refresh Log
              </Button>
            </Space>
          </div>

          {/* Grid View */}
          <Card
            className="!bg-[var(--bg-secondary)]/50 backdrop-blur-2xl !border-[var(--border-subtle)] !rounded-[3rem] shadow-3xl overflow-hidden !border-0"
            styles={{ body: { padding: 0 } }}
          >
            <Table
              dataSource={filteredOrders}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 8,
                className: "custom-pagination px-8 py-6",
              }}
              className="custom-antd-table"
              scroll={{ x: 1000 }}
              locale={{
                emptyText: (
                  <div className="py-20">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <Text className="text-[var(--text-muted)]">
                          No active order flows found in the grid.
                        </Text>
                      }
                    >
                      <Button
                        type="primary"
                        className="bg-cyan-600 border-none rounded-xl h-11 px-8"
                        onClick={() => navigate("/products")}
                      >
                        Initialize New Flow
                      </Button>
                    </Empty>
                  </div>
                ),
              }}
            />
          </Card>
        </Space>
      </div>

      {/* DETAILED TRACKING DRAWER */}
      <Drawer
        title={
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl">
              <Box size={24} />
            </div>
            <div>
              <Title
                level={4}
                className="!text-[var(--text-primary)] !m-0 !font-black !tracking-tight"
              >
                Order Insight
              </Title>
              <Text className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">
                #{selectedOrder?.orderNumber}
              </Text>
            </div>
          </div>
        }
        placement="right"
        width={window.innerWidth > 768 ? 600 : "100%"}
        onClose={() => setSelectedOrder(null)}
        open={!!selectedOrder}
        className="premium-drawer"
        closeIcon={
          <div className="p-2 bg-[var(--bg-glass)] rounded-xl text-white">
            <ArrowLeft size={18} />
          </div>
        }
      >
        {selectedOrder && (
          <div className="space-y-8 animate-fade-in pb-10">
            {/* Real-time Status */}
            <Card className="!bg-[var(--bg-secondary)] !border-[var(--border-subtle)] !rounded-3xl shadow-inner">
              <Steps
                current={[
                  "PENDING",
                  "CONFIRMED",
                  "PROCESSING",
                  "SHIPPED",
                  "DELIVERED",
                ].indexOf(selectedOrder.status)}
                className="custom-steps"
                items={[
                  { title: "Pending", icon: <Clock size={16} /> },
                  { title: "Confirmed", icon: <CheckCircle size={16} /> },
                  { title: "Transit", icon: <Truck size={16} /> },
                  { title: "Finalized", icon: <Package size={16} /> },
                ]}
              />
            </Card>

            {/* Inventory Map */}
            <div className="space-y-4">
              <Title
                level={5}
                className="!text-[var(--text-primary)] !font-black uppercase tracking-[0.2em] text-[10px]"
              >
                Order Details
              </Title>
              <div className="space-y-3">
                {selectedOrder.items?.map((item) => (
                  <Card
                    key={item.id}
                    className="!bg-[var(--bg-glass)] !border-[var(--border-subtle)] !rounded-2xl hover:bg-[var(--bg-secondary)] transition-all"
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
                        <Text
                          strong
                          className="text-[var(--text-primary)] block text-sm"
                        >
                          {item.productName}
                        </Text>
                        <Text className="text-[var(--text-muted)] text-xs">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </Text>
                      </div>
                      <div className="text-right">
                        <Text strong className="text-cyan-400 block">
                          {formatCurrency(item.subtotal)}
                        </Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Logistics Grid */}
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card
                  title={
                    <Space size="small">
                      <MapPin size={16} className="text-cyan-500" />
                      <Text className="text-[var(--text-primary)] font-bold text-xs uppercase tracking-widest">
                        Delivery Type
                      </Text>
                    </Space>
                  }
                  className="!bg-[var(--bg-glass)] !border-[var(--border-subtle)] !rounded-3xl"
                >
                  <Text className="text-[var(--text-secondary)] block">
                    {selectedOrder.address?.firstName}{" "}
                    {selectedOrder.address?.lastName}
                  </Text>
                  <Text className="text-[var(--text-muted)] text-sm block mt-1">
                    {selectedOrder.address?.addressLine1},{" "}
                    {selectedOrder.address?.city}
                  </Text>
                  <Text className="text-[var(--text-muted)] text-sm block">
                    {selectedOrder.address?.phone}
                  </Text>
                </Card>
              </Col>
              <Col span={24}>
                <Card
                  title={
                    <Space size="small">
                      <CreditCard size={16} className="text-purple-500" />
                      <Text className="text-[var(--text-primary)] font-bold text-xs uppercase tracking-widest">
                        Payment Method
                      </Text>
                    </Space>
                  }
                  className="!bg-[var(--bg-glass)] !border-[var(--border-subtle)] !rounded-3xl"
                >
                  <div className="flex justify-between items-center">
                    <Text className="text-[var(--text-muted)]">
                      Method: {selectedOrder.paymentMethod || "MM Sync"}
                    </Text>
                    <Tag
                      color={
                        selectedOrder.paymentStatus === "PAID"
                          ? "success"
                          : "warning"
                      }
                      className="border-none font-bold uppercase tracking-widest text-[9px]"
                    >
                      {selectedOrder.paymentStatus}
                    </Tag>
                  </div>
                  <Divider className="!border-[var(--border-subtle)] !my-4" />
                  <div className="flex justify-between items-center">
                    <Text
                      strong
                      className="text-[var(--text-primary)] uppercase tracking-[0.2em] text-[10px]"
                    >
                      Total Amount
                    </Text>
                    <Text strong className="text-xl text-cyan-400 font-black">
                      {formatCurrency(selectedOrder.total)}
                    </Text>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Control Actions */}
            <div className="flex flex-col gap-4">
              {selectedOrder.status === "SHIPPED" &&
                !selectedOrder.clientConfirmedDelivery && (
                  <Button
                    type="primary"
                    block
                    className="h-14 rounded-2xl bg-green-600 hover:bg-green-500 border-none font-bold text-lg"
                    onClick={() => handleConfirmDelivery(selectedOrder.id)}
                  >
                    Finalize Receipt
                  </Button>
                )}
              <Button
                block
                icon={<MessageSquare size={18} />}
                className="h-14 rounded-2xl bg-[var(--bg-glass)] border-[var(--border-subtle)] text-[var(--text-primary)] font-bold hover:border-cyan-400"
                onClick={() => openChat(selectedOrder)}
              >
                Chat with Seller
              </Button>
            </div>
          </div>
        )}
      </Drawer>

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

      <style>{`
        .custom-antd-table .ant-table-wrapper {
          background: transparent !important;
        }
        .custom-antd-table .ant-table {
          background: transparent !important;
        }
        .custom-antd-table .ant-table-thead > tr > th {
          background: var(--bg-primary) !important;
          border-bottom: 1px solid var(--border-subtle) !important;
          padding: 24px 16px !important;
        }
        .custom-antd-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid var(--border-subtle) !important;
          padding: 20px 16px !important;
          background: transparent !important;
        }
        .custom-antd-table .ant-table-tbody > tr:hover > td {
          background: var(--bg-glass) !important;
        }
        .premium-drawer .ant-drawer-content {
          background: var(--bg-secondary) !important;
          backdrop-filter: blur(40px);
          border-left: 1px solid var(--border-subtle);
        }
        .premium-drawer .ant-drawer-header {
          background: var(--bg-glass) !important;
          border-bottom: 1px solid var(--border-subtle);
          padding: 24px 32px;
        }
        .premium-drawer .ant-drawer-body {
          padding: 32px;
        }
        .custom-steps .ant-steps-item-icon {
          background: var(--bg-glass) !important;
          border-color: var(--border-subtle) !important;
        }
        .custom-steps .ant-steps-item-title {
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          color: var(--text-muted) !important;
        }
        .custom-pagination .ant-pagination-item {
          background: var(--bg-glass) !important;
          border: 1px solid var(--border-subtle) !important;
          border-radius: 12px !important;
        }
        .custom-pagination .ant-pagination-item-active {
          border-color: var(--accent-primary) !important;
        }
        .custom-pagination .ant-pagination-item-active a {
          color: var(--accent-primary) !important;
        }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MyOrders;
