// Admin Customers Management Page
import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  message,
  Row,
  Col,
  Typography,
  Avatar,
  Drawer,
  Descriptions,
  Divider,
  Popconfirm,
  Statistic,
} from "antd";
import {
  Search,
  Eye,
  UserX,
  UserCheck,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { usersAPI } from "../../services/api";
import "../layouts/AdminLayout.css";

const { Text } = Typography;
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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch customers
  const fetchCustomers = async () => {
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

      const response = await usersAPI.getAll(params);
      setCustomers(response.data.users);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
      }));
    } catch (error) {
      message.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
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

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

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
    try {
      await usersAPI.toggleStatus(id);
      message.success("Status updated");
      fetchCustomers();
    } catch (error) {
      message.error("Update failed");
    }
  };

  const columns = [
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Avatar
            size={40}
            src={record.avatar}
            style={{ backgroundColor: "#00d4ff" }}
          >
            {record.firstName?.[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500, color: "#fff" }}>
              {record.firstName} {record.lastName}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => phone || "-",
    },
    {
      title: "Orders",
      key: "orders",
      render: (_, record) => record._count?.orders || 0,
    },
    {
      title: "Last Login",
      dataIndex: "lastLoginAt",
      key: "lastLogin",
      render: (date) => formatDate(date),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      render: (active) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<Eye size={16} />}
            onClick={() => viewCustomer(record)}
            className="action-btn"
          />
          <Popconfirm
            title={record.isActive ? "Deactivate user?" : "Activate user?"}
            onConfirm={() => toggleStatus(record.id)}
            okText="Yes"
          >
            <Button
              type="text"
              icon={
                record.isActive ? <UserX size={16} /> : <UserCheck size={16} />
              }
              className="action-btn"
              danger={record.isActive}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customers</h1>
          <p className="admin-page-subtitle">
            Manage customer accounts ({pagination.total} customers)
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card className="form-card">
              <Statistic
                title="Total Customers"
                value={stats.total}
                valueStyle={{ color: "#00d4ff" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="form-card">
              <Statistic
                title="Active"
                value={stats.active}
                valueStyle={{ color: "#22c55e" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="form-card">
              <Statistic
                title="Inactive"
                value={stats.inactive}
                valueStyle={{ color: "#ef4444" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="form-card">
              <Statistic
                title="New This Month"
                value={stats.newThisMonth}
                valueStyle={{ color: "#8b5cf6" }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="form-card" style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={10}>
            <Input
              placeholder="Search by name or email..."
              prefix={<Search size={16} />}
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={6}>
            <Select
              placeholder="Status"
              value={filters.status || undefined}
              onChange={(value) => {
                setFilters((prev) => ({ ...prev, status: value }));
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          <Col xs={12} md={8} style={{ textAlign: "right" }}>
            <Button
              onClick={() => {
                setFilters({ search: "", status: "" });
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Customers Table */}
      <Card className="admin-table-card">
        <Table
          className="admin-table"
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
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

      {/* Customer Details Drawer */}
      <Drawer
        title="Customer Details"
        placement="right"
        width={500}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {selectedCustomer && (
          <div>
            {/* Customer Profile */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Avatar
                size={80}
                src={selectedCustomer.avatar}
                style={{ backgroundColor: "#00d4ff" }}
              >
                {selectedCustomer.firstName?.[0]}
              </Avatar>
              <h3 style={{ marginTop: 12, marginBottom: 4 }}>
                {selectedCustomer.firstName} {selectedCustomer.lastName}
              </h3>
              <Tag color={selectedCustomer.isActive ? "green" : "red"}>
                {selectedCustomer.isActive ? "Active" : "Inactive"}
              </Tag>
            </div>

            {/* Contact Info */}
            <Descriptions title="Contact Information" column={1} size="small">
              <Descriptions.Item
                label={
                  <>
                    <Mail size={14} /> Email
                  </>
                }
              >
                {selectedCustomer.email}
                {selectedCustomer.emailVerified && (
                  <Tag color="green" style={{ marginLeft: 8 }}>
                    Verified
                  </Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <Phone size={14} /> Phone
                  </>
                }
              >
                {selectedCustomer.phone || "Not provided"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <Calendar size={14} /> Member Since
                  </>
                }
              >
                {formatDate(selectedCustomer.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Last Login">
                {formatDate(selectedCustomer.lastLoginAt)}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Stats */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Card className="form-card" style={{ textAlign: "center" }}>
                  <Statistic
                    title="Total Orders"
                    value={selectedCustomer._count?.orders || 0}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card className="form-card" style={{ textAlign: "center" }}>
                  <Statistic
                    title="Reviews"
                    value={selectedCustomer._count?.reviews || 0}
                  />
                </Card>
              </Col>
            </Row>

            {/* Recent Orders */}
            {selectedCustomer.orders?.length > 0 && (
              <>
                <Divider />
                <h4>Recent Orders</h4>
                {selectedCustomer.orders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div>
                      <Text strong>{order.orderNumber}</Text>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatDate(order.createdAt)}
                        </Text>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div>{formatCurrency(order.total)}</div>
                      <Tag
                        color={order.status === "DELIVERED" ? "green" : "blue"}
                        style={{ marginTop: 4 }}
                      >
                        {order.status}
                      </Tag>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Addresses */}
            {selectedCustomer.addresses?.length > 0 && (
              <>
                <Divider />
                <h4>Saved Addresses</h4>
                {selectedCustomer.addresses.map((address, index) => (
                  <Card
                    key={address.id}
                    size="small"
                    style={{ marginBottom: 12 }}
                  >
                    {address.isDefault && <Tag color="blue">Default</Tag>}
                    <div style={{ marginTop: 8 }}>
                      {address.firstName} {address.lastName}
                      <br />
                      {address.addressLine1}
                      <br />
                      {address.city}, {address.state} {address.postalCode}
                    </div>
                  </Card>
                ))}
              </>
            )}

            <Divider />

            {/* Actions */}
            <Space>
              <Popconfirm
                title={
                  selectedCustomer.isActive
                    ? "Deactivate this customer?"
                    : "Activate this customer?"
                }
                onConfirm={async () => {
                  await toggleStatus(selectedCustomer.id);
                  setDrawerOpen(false);
                }}
              >
                <Button danger={selectedCustomer.isActive}>
                  {selectedCustomer.isActive
                    ? "Deactivate Account"
                    : "Activate Account"}
                </Button>
              </Popconfirm>
            </Space>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CustomersPage;
