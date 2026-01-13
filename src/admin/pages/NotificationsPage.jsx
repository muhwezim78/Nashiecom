// Admin Notifications Management Page
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
  Form,
  Switch,
  message,
  Popconfirm,
  Row,
  Col,
  Typography,
  DatePicker,
  Tooltip,
} from "antd";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Send,
  Bell,
  Globe,
  User,
  Clock,
} from "lucide-react";
import { notificationsAPI, usersAPI } from "../../services/api";
import "../layouts/AdminLayout.css";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const NotificationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    type: "",
    isGlobal: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [form] = Form.useForm();

  const fetchNotifications = async () => {
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

      const response = await notificationsAPI.getAllAdmin(params);
      setNotifications(response.data.notifications);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
      }));
    } catch (error) {
      message.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [pagination.page, filters]);

  const openModal = (notification = null) => {
    setEditingNotification(notification);
    if (notification) {
      form.setFieldsValue({
        ...notification,
        scheduledAt: notification.scheduledAt
          ? dayjs(notification.scheduledAt)
          : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isGlobal: true, type: "INFO", isActive: true });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        scheduledAt: values.scheduledAt
          ? values.scheduledAt.toISOString()
          : null,
      };

      if (editingNotification) {
        await notificationsAPI.update(editingNotification.id, data);
        message.success("Notification updated successfully");
      } else {
        await notificationsAPI.create(data);
        message.success("Notification created and sent successfully");
      }

      setModalOpen(false);
      fetchNotifications();
    } catch (error) {
      message.error(error.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.delete(id);
      message.success("Notification deleted successfully");
      fetchNotifications();
    } catch (error) {
      message.error(error.message || "Delete failed");
    }
  };

  const handleSendNow = async (id) => {
    try {
      await notificationsAPI.sendNow(id);
      message.success("Notification sent successfully");
      fetchNotifications();
    } catch (error) {
      message.error(error.message || "Send failed");
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "ORDER_UPDATE":
        return "blue";
      case "PROMO":
        return "purple";
      case "SUCCESS":
        return "green";
      case "WARNING":
        return "orange";
      case "ERROR":
        return "red";
      case "SYSTEM":
        return "default";
      default:
        return "cyan";
    }
  };

  const columns = [
    {
      title: "Notification",
      key: "notification",
      width: 400,
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell size={14} className="text-cyan-400" />
            <Text strong className="text-white">
              {record.title}
            </Text>
            <Tag color={getTypeColor(record.type)}>{record.type}</Tag>
          </div>
          <Text className="text-gray-400 text-sm">{record.message}</Text>
        </div>
      ),
    },
    {
      title: "Target",
      key: "target",
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.isGlobal ? (
            <>
              <Globe size={14} className="text-green-400" />
              <Tag color="green">Global</Tag>
            </>
          ) : (
            <>
              <User size={14} className="text-blue-400" />
              <Tag color="blue">Specific</Tag>
            </>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, record) => {
        if (record.scheduledAt && !record.sentAt) {
          return (
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-yellow-400" />
              <Tag color="warning">Scheduled</Tag>
            </div>
          );
        }
        return (
          <Tag color={record.isActive ? "success" : "default"}>
            {record.sentAt ? "Sent" : record.isActive ? "Active" : "Inactive"}
          </Tag>
        );
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          {record.scheduledAt && !record.sentAt && (
            <Tooltip title="Send Now">
              <Button
                type="text"
                icon={<Send size={16} />}
                onClick={() => handleSendNow(record.id)}
                className="action-btn text-green-400"
              />
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<Edit size={16} />}
              onClick={() => openModal(record)}
              className="action-btn"
            />
          </Tooltip>
          <Popconfirm
            title="Delete notification?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<Trash2 size={16} />}
                className="action-btn"
              />
            </Tooltip>
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
          <h1 className="admin-page-title">Notifications</h1>
          <p className="admin-page-subtitle">
            Send and manage notifications ({pagination.total} total)
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => openModal()}
        >
          Create Notification
        </Button>
      </div>

      {/* Filters */}
      <Card className="form-card" style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={8}>
            <Select
              placeholder="Type"
              value={filters.type || undefined}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, type: value }))
              }
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="INFO">Info</Option>
              <Option value="SUCCESS">Success</Option>
              <Option value="WARNING">Warning</Option>
              <Option value="ERROR">Error</Option>
              <Option value="ORDER_UPDATE">Order Update</Option>
              <Option value="PROMO">Promo</Option>
              <Option value="SYSTEM">System</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder="Target"
              value={filters.isGlobal || undefined}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, isGlobal: value }))
              }
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="true">Global</Option>
              <Option value="false">Specific User</Option>
            </Select>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <Button
              onClick={() => {
                setFilters({ type: "", isGlobal: "" });
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Notifications Table */}
      <Card className="admin-table-card">
        <Table
          className="admin-table"
          columns={columns}
          dataSource={notifications}
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

      {/* Create/Edit Modal */}
      <Modal
        title={
          editingNotification ? "Edit Notification" : "Create Notification"
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isGlobal: true,
            type: "INFO",
            isActive: true,
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input placeholder="Notification title" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: "Please enter message" }]}
          >
            <TextArea rows={3} placeholder="Notification message" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Type">
                <Select>
                  <Option value="INFO">Info</Option>
                  <Option value="SUCCESS">Success</Option>
                  <Option value="WARNING">Warning</Option>
                  <Option value="ERROR">Error</Option>
                  <Option value="ORDER_UPDATE">Order Update</Option>
                  <Option value="PROMO">Promo</Option>
                  <Option value="SYSTEM">System</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isGlobal"
                label="Send to All Users"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.isGlobal !== currentValues.isGlobal
            }
          >
            {({ getFieldValue }) =>
              !getFieldValue("isGlobal") && (
                <Form.Item name="userId" label="User ID">
                  <Input placeholder="Enter specific user ID" />
                </Form.Item>
              )
            }
          </Form.Item>

          <Form.Item name="scheduledAt" label="Schedule For (Optional)">
            <DatePicker
              showTime
              style={{ width: "100%" }}
              placeholder="Leave empty to send immediately"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isActive" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {editingNotification ? "Update" : "Create & Send"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default NotificationsPage;
