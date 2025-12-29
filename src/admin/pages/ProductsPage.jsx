// Admin Products Management Page
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
  InputNumber,
  Switch,
  Upload,
  message,
  Popconfirm,
  Row,
  Col,
  Typography,
  Image,
  Tooltip,
  Drawer,
} from "antd";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Star,
  Package,
  Filter,
  Upload as UploadIcon,
  X,
} from "lucide-react";
import { productsAPI, categoriesAPI, uploadAPI } from "../../services/api";
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

const ProductsPage = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    featured: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  // Fetch products
  const fetchProducts = async () => {
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

      const response = await productsAPI.getAll(params);
      setProducts(response.data.products);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
      }));
    } catch (error) {
      message.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [pagination.page, filters]);

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleUpload = async ({ file, onSuccess, onError }) => {
    try {
      const response = await uploadAPI.image(file);
      onSuccess(response, file);
      message.success(`${file.name} uploaded successfully`);
    } catch (error) {
      onError(error);
      message.error(`${file.name} upload failed.`);
    }
  };

  const openModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      const fileList =
        product.images?.map((img, index) => ({
          uid: `-${index}`,
          name: `Image ${index + 1}`,
          status: "done",
          url: img.url,
        })) || [];
      form.setFieldsValue({
        ...product,
        images: fileList,
      });
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      // Extract URLs from fileList
      const imageUrls =
        values.images
          ?.map((file) => {
            // For newly uploaded files, URL is in response.data.url
            if (file.response?.data?.url) {
              return file.response.data.url;
            }
            // For existing images (when editing), URL is directly on file.url
            return file.url;
          })
          .filter(Boolean) || [];

      const productData = {
        ...values,
        images: imageUrls.map((url, index) => ({
          url,
          isPrimary: index === 0,
        })),
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, productData);
        message.success("Product updated successfully");
      } else {
        await productsAPI.create(productData);
        message.success("Product created successfully");
      }

      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      message.error(error.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await productsAPI.delete(id);
      message.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      message.error(error.message || "Delete failed");
    }
  };

  const toggleFeatured = async (id) => {
    try {
      await productsAPI.toggleFeatured(id);
      message.success("Product updated");
      fetchProducts();
    } catch (error) {
      message.error("Update failed");
    }
  };

  const toggleStatus = async (id) => {
    try {
      await productsAPI.toggleStatus(id);
      message.success("Status updated");
      fetchProducts();
    } catch (error) {
      message.error("Update failed");
    }
  };

  const columns = [
    {
      title: "Product",
      key: "product",
      width: 300,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Image
            src={record.image || record.images?.[0]?.url}
            alt={record.name}
            width={50}
            height={50}
            style={{ borderRadius: 8, objectFit: "cover" }}
            fallback="https://placehold.co/50"
          />
          <div>
            <div
              style={{
                fontWeight: 500,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {record.name}
              {record.featured && (
                <Tooltip title="Featured Product">
                  <Star size={14} fill="#fbbf24" color="#fbbf24" />
                </Tooltip>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.category?.name}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (text) => text || "-",
    },
    {
      title: "Price",
      key: "price",
      render: (_, record) => (
        <div>
          <div>{formatCurrency(record.price)}</div>
          {record.originalPrice && (
            <Text type="secondary" delete style={{ fontSize: 12 }}>
              {formatCurrency(record.originalPrice)}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Stock",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty) => (
        <Tag color={qty <= 5 ? "red" : qty <= 20 ? "orange" : "green"}>
          {qty} in stock
        </Tag>
      ),
    },
    {
      title: "Rating",
      key: "rating",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Star size={14} fill="#fbbf24" color="#fbbf24" />
          <span>{record.rating}</span>
          <Text type="secondary" style={{ fontSize: 12 }}>
            ({record.reviewCount})
          </Text>
        </div>
      ),
    },
    {
      title: "Featured",
      dataIndex: "featured",
      key: "featured",
      render: (featured, record) => (
        <Switch
          checked={featured}
          onChange={() => toggleFeatured(record.id)}
          size="small"
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (active, record) => (
        <Tag
          color={active ? "green" : "default"}
          style={{ cursor: "pointer" }}
          onClick={() => toggleStatus(record.id)}
        >
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<Edit size={16} />}
              onClick={() => openModal(record)}
              className="action-btn"
            />
          </Tooltip>
          <Popconfirm
            title="Delete product?"
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
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">
            Manage your product inventory ({pagination.total} products)
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => openModal()}
        >
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="form-card" style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Search products..."
              prefix={<Search size={16} />}
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={6}>
            <Select
              placeholder="Category"
              value={filters.category || undefined}
              onChange={(value) => handleFilterChange("category", value)}
              allowClear
              style={{ width: "100%" }}
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.slug}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Featured"
              value={filters.featured || undefined}
              onChange={(value) => handleFilterChange("featured", value)}
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="true">Featured</Option>
              <Option value="false">Not Featured</Option>
            </Select>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: "right" }}>
            <Button
              onClick={() => {
                setFilters({ search: "", category: "", featured: "" });
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Products Table */}
      <Card className="admin-table-card">
        <Table
          className="admin-table"
          columns={columns}
          dataSource={products}
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

      {/* Add/Edit Modal */}
      <Drawer
        title={editingProduct ? "Edit Product" : "Add New Product"}
        placement="right"
        size="large"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={() => form.submit()}>
              {editingProduct ? "Update" : "Create"}
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            quantity: 0,
            featured: false,
            isActive: true,
          }}
        >
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: "Please enter product name" }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Price (UGX)"
                rules={[{ required: true, message: "Please enter price" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/,/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="originalPrice" label="Original Price (UGX)">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/,/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="Category"
                rules={[{ required: true, message: "Please select category" }]}
              >
                <Select placeholder="Select category">
                  {categories.map((cat) => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="quantity" label="Stock Quantity">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sku" label="SKU">
                <Input placeholder="Product SKU" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="barcode" label="Barcode">
                <Input placeholder="Product barcode" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Product description" />
          </Form.Item>

          <Form.Item name="shortDescription" label="Short Description">
            <TextArea
              rows={2}
              placeholder="Brief description for product cards"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="isActive" valuePropName="checked" label="Active">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="inStock"
                valuePropName="checked"
                label="In Stock"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="featured"
                valuePropName="checked"
                label="Featured"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="images"
            label="Product Images"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              name="image"
              listType="picture-card"
              customRequest={handleUpload}
              multiple={true}
              maxCount={10}
              accept="image/*"
            >
              <div>
                <UploadIcon size={20} />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ProductsPage;
