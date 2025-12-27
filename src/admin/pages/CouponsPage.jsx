import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  message,
  Popconfirm,
  Tooltip,
  DatePicker,
  Select,
  InputNumber,
  Tag,
} from "antd";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { couponsAPI } from "../../services/api";
import "../layouts/AdminLayout.css";
import dayjs from "dayjs";

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form] = Form.useForm();

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await couponsAPI.getAll();
      setCoupons(data.coupons || []);
    } catch (error) {
      // console.error(error);
      // message.error("Failed to load coupons");
      // Silently fail or empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (values) => {
    try {
      const couponData = {
        ...values,
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
      };

      if (editingCoupon) {
        await couponsAPI.update(editingCoupon.id, couponData);
        message.success("Coupon updated");
      } else {
        await couponsAPI.create(couponData);
        message.success("Coupon created");
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (error) {
      message.error(error.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await couponsAPI.delete(id);
      message.success("Coupon deleted");
      fetchCoupons();
    } catch (error) {
      message.error("Failed to delete");
    }
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Discount",
      key: "discount",
      render: (_, record) => (
        <span>
          {record.discountValue}
          {record.discountType === "PERCENTAGE" ? "%" : " UGX"}
        </span>
      ),
    },
    {
      title: "Min Order",
      dataIndex: "minOrderAmount",
      key: "minOrder",
      render: (val) => (val ? `${val.toLocaleString()} UGX` : "-"),
    },
    {
      title: "Usage",
      key: "usage",
      render: (_, record) =>
        `${record.usedCount || 0} / ${record.usageLimit || "∞"}`,
    },
    {
      title: "Expires",
      dataIndex: "expiresAt",
      key: "expiresAt",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "Never"),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              icon={<Edit size={16} />}
              onClick={() => {
                setEditingCoupon(record);
                form.setFieldsValue({
                  ...record,
                  expiresAt: record.expiresAt ? dayjs(record.expiresAt) : null,
                });
                setModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete coupon?"
            onConfirm={() => handleDelete(record.id)}
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button danger icon={<Trash2 size={16} />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Coupons</h1>
          <p className="admin-page-subtitle">Manage discount codes</p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => {
            setEditingCoupon(null);
            form.resetFields();
            form.setFieldValue("isActive", true);
            setModalOpen(true);
          }}
        >
          Add Coupon
        </Button>
      </div>

      <Card className="admin-table-card">
        <Table
          dataSource={coupons}
          columns={columns}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingCoupon ? "Edit Coupon" : "Add Coupon"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={form.submit}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="code"
            label="Code"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input
              placeholder="e.g. SUMMER2024"
              style={{ textTransform: "uppercase" }}
            />
          </Form.Item>
          <Space style={{ display: "flex" }} align="baseline">
            <Form.Item
              name="discountType"
              label="Type"
              rules={[{ required: true }]}
              initialValue="PERCENTAGE"
              style={{ width: 120 }}
            >
              <Select>
                <Select.Option value="PERCENTAGE">Percentage</Select.Option>
                <Select.Option value="FIXED">Fixed Amount</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="discountValue"
              label="Value"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} />
            </Form.Item>
          </Space>
          <Form.Item name="minOrderAmount" label="Min Order Amount (UGX)">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          {/* Default Usage Limit? */}
          <Form.Item name="usageLimit" label="Usage Limit (Total)">
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              placeholder="Leave empty for unlimited"
            />
          </Form.Item>
          <Form.Item name="expiresAt" label="Expiry Date">
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="isActive" label="Status">
            <Select>
              <Select.Option value={true}>Active</Select.Option>
              <Select.Option value={false}>Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CouponsPage;
