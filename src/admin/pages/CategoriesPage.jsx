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
} from "antd";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { categoriesAPI } from "../../services/api";
import "../layouts/AdminLayout.css";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await categoriesAPI.getAll();
      setCategories(data.categories);
    } catch (error) {
      console.error(error);
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, values);
        message.success("Category updated");
      } else {
        await categoriesAPI.create(values);
        message.success("Category created");
      }
      setModalOpen(false);
      fetchCategories();
    } catch (error) {
      message.error(error.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await categoriesAPI.delete(id);
      message.success("Category deleted");
      fetchCategories();
    } catch (error) {
      message.error("Failed to delete");
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      render: (icon) => <span style={{ fontSize: 24 }}>{icon || "📁"}</span>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
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
                setEditingCategory(record);
                form.setFieldsValue(record);
                setModalOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete category?"
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
          <h1 className="admin-page-title">Categories</h1>
          <p className="admin-page-subtitle">Manage product categories</p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => {
            setEditingCategory(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Add Category
        </Button>
      </div>

      <Card className="admin-table-card">
        <Input
          prefix={<Search size={16} />}
          placeholder="Search categories..."
          style={{ marginBottom: 16, maxWidth: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Table
          dataSource={filteredCategories}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingCategory ? "Edit Category" : "Add Category"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={form.submit}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Slug (optional)">
            <Input placeholder="Auto-generated if empty" />
          </Form.Item>
          <Form.Item name="icon" label="Icon (Emoji)">
            <Input placeholder="e.g. 💻" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
