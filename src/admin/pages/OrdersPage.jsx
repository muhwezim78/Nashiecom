// Admin Orders Management Page
import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Descriptions,
  Timeline,
  message,
  Row,
  Col,
  Typography,
  Drawer,
  Form,
  Divider,
  Badge,
  Tooltip,
} from "antd";
import {
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import ChatWindow from "../../components/chat/ChatWindow";
import { ordersAPI } from "../../services/api";
import "../layouts/AdminLayout.css";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format date
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
  {
    value: "PENDING",
    label: "Pending",
    color: "gold",
    icon: <Clock size={14} />,
  },
  {
    value: "CONFIRMED",
    label: "Confirmed",
    color: "blue",
    icon: <CheckCircle size={14} />,
  },
  {
    value: "PROCESSING",
    label: "Processing",
    color: "cyan",
    icon: <Package size={14} />,
  },
  {
    value: "SHIPPED",
    label: "Shipped",
    color: "purple",
    icon: <Truck size={14} />,
  },
  {
    value: "DELIVERED",
    label: "Delivered",
    color: "green",
    icon: <CheckCircle size={14} />,
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    color: "red",
    icon: <XCircle size={14} />,
  },
];

const paymentStatuses = [
  { value: "PENDING", label: "Pending", color: "gold" },
  { value: "PAID", label: "Paid", color: "green" },
  { value: "FAILED", label: "Failed", color: "red" },
  { value: "REFUNDED", label: "Refunded", color: "purple" },
];

const OrdersPage = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentStatus: "",
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusForm] = Form.useForm();
  const [activeChatOrder, setActiveChatOrder] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await ordersAPI.getAll(params);
      setOrders(response.data.orders);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
      }));
    } catch (error) {
      message.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, filters]);

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

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
    statusForm.setFieldsValue({
      status: order.status,
      note: "",
    });
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = async (values) => {
    try {
      await ordersAPI.updateStatus(
        selectedOrder.id,
        values.status,
        values.note
      );
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

  const openChat = (order) => {
    setActiveChatOrder(order);
    setIsChatOpen(true);
  };

  const getStatusInfo = (status) => {
    return (
      orderStatuses.find((s) => s.value === status) || {
        label: status,
        color: "default",
      }
    );
  };

  const getPaymentStatusInfo = (status) => {
    return (
      paymentStatuses.find((s) => s.value === status) || {
        label: status,
        color: "default",
      }
    );
  };

  const columns = [
    {
      title: "Order",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text, record) => (
        <div>
          <Text
            strong
            style={{ color: "#00d4ff", cursor: "pointer" }}
            onClick={() => viewOrder(record)}
          >
            {text}
          </Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatDate(record.createdAt)}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <div>
          <div>
            {record.user?.firstName} {record.user?.lastName}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.user?.email}
          </Text>
        </div>
      ),
    },
    {
      title: "Items",
      dataIndex: "_count",
      key: "items",
      render: (count) => count?.items || 0,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (value) => <Text strong>{formatCurrency(value)}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        const statusInfo = getStatusInfo(status);
        return (
          <Tag
            color={statusInfo.color}
            style={{ cursor: "pointer" }}
            onClick={() => openStatusModal(record)}
          >
            {statusInfo.icon} {statusInfo.label}
          </Tag>
        );
      },
    },
    {
      title: "Payment",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status, record) => {
        const statusInfo = getPaymentStatusInfo(status);
        return (
          <Select
            value={status}
            size="small"
            style={{ width: 110 }}
            onChange={(value) => handlePaymentStatusUpdate(record.id, value)}
          >
            {paymentStatuses.map((ps) => (
              <Option key={ps.value} value={ps.value}>
                <Tag color={ps.color} style={{ margin: 0 }}>
                  {ps.label}
                </Tag>
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<Eye size={16} />}
              onClick={() => viewOrder(record)}
              className="action-btn"
            />
          </Tooltip>
          <Tooltip title="Chat with Client">
            <Button
              type="primary"
              size="small"
              icon={<MessageSquare size={14} />}
              onClick={() => openChat(record)}
              className="bg-cyan-600 border-none flex items-center justify-center"
            />
          </Tooltip>
          {record.status === "SHIPPED" && !record.adminConfirmedDelivery && (
            <Tooltip title="Confirm Delivery">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircle size={14} />}
                onClick={() => handleConfirmDelivery(record.id)}
                className="bg-green-600 border-none flex items-center justify-center"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-subtitle">
            Manage customer orders ({pagination.total} orders)
          </p>
        </div>
        <Button icon={<RefreshCw size={16} />} onClick={fetchOrders}>
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="form-card" style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Search by order # or customer..."
              prefix={<Search size={16} />}
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              placeholder="Order Status"
              value={filters.status || undefined}
              onChange={(value) => handleFilterChange("status", value)}
              allowClear
              style={{ width: "100%" }}
            >
              {orderStatuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  <Tag color={status.color}>{status.label}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} md={5}>
            <Select
              placeholder="Payment Status"
              value={filters.paymentStatus || undefined}
              onChange={(value) => handleFilterChange("paymentStatus", value)}
              allowClear
              style={{ width: "100%" }}
            >
              {paymentStatuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  <Tag color={status.color}>{status.label}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: "right" }}>
            <Button
              onClick={() => {
                setFilters({ search: "", status: "", paymentStatus: "" });
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card className="admin-table-card">
        <Table
          className="admin-table"
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({ ...prev, page, limit: pageSize }));
            },
          }}
        />
      </Card>

      {/* Order Details Drawer */}
      <Drawer
        title={`Order ${selectedOrder?.orderNumber}`}
        placement="right"
        width={640}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {selectedOrder && (
          <div>
            {/* Order Status */}
            <div style={{ marginBottom: 24 }}>
              <Space size="middle">
                <Tag
                  color={getStatusInfo(selectedOrder.status).color}
                  style={{ fontSize: 14, padding: "4px 12px" }}
                >
                  {getStatusInfo(selectedOrder.status).label}
                </Tag>
                <Tag
                  color={
                    getPaymentStatusInfo(selectedOrder.paymentStatus).color
                  }
                >
                  Payment:{" "}
                  {getPaymentStatusInfo(selectedOrder.paymentStatus).label}
                </Tag>
              </Space>
            </div>

            {/* Order Details */}
            <Descriptions
              title="Order Details"
              column={2}
              size="small"
              bordered
            >
              <Descriptions.Item label="Order Date">
                {formatDate(selectedOrder.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {selectedOrder.paymentMethod}
              </Descriptions.Item>
              <Descriptions.Item label="Subtotal">
                {formatCurrency(selectedOrder.subtotal)}
              </Descriptions.Item>
              <Descriptions.Item label="Shipping">
                {formatCurrency(selectedOrder.shippingCost)}
              </Descriptions.Item>
              <Descriptions.Item label="Tax">
                {formatCurrency(selectedOrder.tax)}
              </Descriptions.Item>
              <Descriptions.Item label="Discount">
                {formatCurrency(selectedOrder.discount)}
              </Descriptions.Item>
              <Descriptions.Item label="Total" span={2}>
                <Text strong style={{ fontSize: 18, color: "#00d4ff" }}>
                  {formatCurrency(selectedOrder.total)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Customer Info */}
            <Descriptions title="Customer" column={1} size="small">
              <Descriptions.Item label="Name">
                {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.user?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedOrder.user?.phone || "-"}
              </Descriptions.Item>
            </Descriptions>

            {/* Shipping Address */}
            {selectedOrder.address && (
              <>
                <Divider />
                <Descriptions title="Shipping Address" column={1} size="small">
                  <Descriptions.Item>
                    {selectedOrder.address.firstName}{" "}
                    {selectedOrder.address.lastName}
                    <br />
                    {selectedOrder.address.addressLine1}
                    <br />
                    {selectedOrder.address.addressLine2 && (
                      <>
                        {selectedOrder.address.addressLine2}
                        <br />
                      </>
                    )}
                    {selectedOrder.address.city}, {selectedOrder.address.state}{" "}
                    {selectedOrder.address.postalCode}
                    <br />
                    {selectedOrder.address.country}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            <Divider />

            {/* Order Items */}
            <Title level={5}>Items ({selectedOrder.items?.length})</Title>
            <div style={{ marginBottom: 24 }}>
              {selectedOrder.items?.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {item.productImage && (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div>{item.productName}</div>
                    <Text type="secondary">
                      {formatCurrency(item.price)} × {item.quantity}
                    </Text>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Text strong>{formatCurrency(item.subtotal)}</Text>
                  </div>
                </div>
              ))}
            </div>

            {/* Status History */}
            {selectedOrder.statusHistory?.length > 0 && (
              <>
                <Title level={5}>Status History</Title>
                <Timeline
                  items={selectedOrder.statusHistory.map((history) => ({
                    color: getStatusInfo(history.status).color,
                    children: (
                      <div>
                        <Tag color={getStatusInfo(history.status).color}>
                          {getStatusInfo(history.status).label}
                        </Tag>
                        {history.note && (
                          <div style={{ marginTop: 4 }}>{history.note}</div>
                        )}
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatDate(history.createdAt)}
                        </Text>
                      </div>
                    ),
                  }))}
                />
              </>
            )}

            {/* Action Buttons */}
            <Divider />
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  setDrawerOpen(false);
                  openStatusModal(selectedOrder);
                }}
              >
                Update Status
              </Button>
            </Space>
          </div>
        )}
      </Drawer>

      {/* Status Update Modal */}
      <Modal
        title="Update Order Status"
        open={statusModalOpen}
        onCancel={() => setStatusModalOpen(false)}
        onOk={() => statusForm.submit()}
        okText="Update"
      >
        <Form form={statusForm} layout="vertical" onFinish={handleStatusUpdate}>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              {orderStatuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  <Space>
                    {status.icon}
                    <span>{status.label}</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="note" label="Note (optional)">
            <TextArea
              rows={3}
              placeholder="Add a note about this status change"
            />
          </Form.Item>
        </Form>
      </Modal>

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
