import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Shield,
  Edit2,
  Camera,
  Check,
  X,
  CreditCard,
  ShoppingBag,
  Bell,
  ChevronRight,
  AtSign,
  Layout as LayoutIcon,
  Settings,
  MapPin,
  Calendar,
  Award,
} from "lucide-react";
import {
  Form,
  Input,
  Button,
  Avatar,
  Card,
  App,
  Tag,
  Tabs,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  Tooltip,
  Descriptions,
  Layout,
  Menu,
  Badge,
  Result,
} from "antd";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";
import { formatCurrency } from "../utils/currency";

const { Title, Text, Paragraph } = Typography;
const { Content, Sider } = Layout;

const UserProfile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [form] = Form.useForm();

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-[var(--bg-primary)]">
        <Result
          status="403"
          title="Access Denied"
          subTitle="Please login to view your profile."
          extra={
            <Button type="primary" onClick={() => navigate("/login")}>
              Login Now
            </Button>
          }
        />
      </div>
    );
  }

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      await updateProfile(values);
      message.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      message.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const sideMenuItems = [
    {
      key: "info",
      icon: <User size={18} />,
      label: "Personal Profile",
    },
    {
      key: "activity",
      icon: <ShoppingBag size={18} />,
      label: "Activity Hub",
    },
    {
      key: "security",
      icon: <Shield size={18} />,
      label: "Security & Safety",
    },
    {
      key: "notifications",
      icon: (
        <Badge dot offset={[2, 0]}>
          <Bell size={18} />
        </Badge>
      ),
      label: "Dispatches",
      onClick: () => navigate("/notifications"),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-500 pb-20">
      <SEO
        title="My Profile"
        description="Manage your Nashiecom account details and preferences."
      />

      {/* Premium Background Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[800px] h-[800px] bg-cyan-600/[0.03] blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-600/[0.03] blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 pt-32 relative z-10">
        <Layout className="!bg-transparent gap-8 flex-col lg:flex-row">
          {/* LEFT SIDER - Compact Identity Card */}
          <div className="w-full lg:w-[300px] flex-shrink-0 lg:sticky lg:top-32 h-fit">
            <Card
              className="!bg-[var(--bg-secondary)]/50 backdrop-blur-2xl !border-[var(--border-subtle)] !rounded-[2rem] shadow-2xl overflow-hidden"
              styles={{ body: { padding: "2.5rem 1.5rem" } }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative group mb-6">
                  <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-1000" />
                  <Avatar
                    size={120}
                    src={user.avatar}
                    className="border-4 border-[var(--bg-secondary)] shadow-xl relative z-10"
                    icon={<User size={48} />}
                  >
                    {user.firstName?.[0]}
                  </Avatar>
                  <Tooltip title="Update Photo">
                    <button className="absolute bottom-0 right-0 p-2.5 bg-cyan-600 text-white rounded-xl hover:scale-110 transition-all shadow-lg border-2 border-[var(--bg-secondary)] z-20">
                      <Camera size={16} />
                    </button>
                  </Tooltip>
                </div>

                <div className="space-y-1 mb-6">
                  <Title
                    level={4}
                    className="!text-[var(--text-primary)] !font-black !m-0 !tracking-tight"
                  >
                    {user.firstName} {user.lastName}
                  </Title>
                  <Tag
                    color="cyan"
                    className="rounded-full border-none bg-cyan-500/10 text-cyan-400 font-bold uppercase tracking-widest text-[9px]"
                  >
                    {user.role} Module
                  </Tag>
                </div>

                <Menu
                  mode="inline"
                  selectedKeys={[activeTab]}
                  onClick={({ key }) => {
                    if (key === "notifications") return;
                    setActiveTab(key);
                  }}
                  items={sideMenuItems}
                  className="w-full !border-none !bg-transparent premium-menu"
                />

                <Divider className="!border-[var(--border-subtle)]/50 !my-6" />

                <Button
                  block
                  type="text"
                  danger
                  className="h-12 rounded-xl hover:bg-red-500/10 font-bold uppercase tracking-widest text-[10px]"
                  onClick={logout}
                >
                  Terminate Session
                </Button>
              </div>
            </Card>
          </div>

          {/* MAIN CONTENT AREA */}
          <Content className="flex-1">
            <div className="space-y-8">
              {/* Hero Banner Area */}
              <Card
                className="!bg-[var(--bg-secondary)]/50 backdrop-blur-2xl !border-[var(--border-subtle)] !rounded-[2.5rem] shadow-xl overflow-hidden relative"
                styles={{ body: { padding: 0 } }}
              >
                <div className="h-32 bg-gradient-to-r from-cyan-600/20 via-purple-600/20 to-blue-600/20 relative">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                </div>
                <div className="px-8 md:px-12 py-8 flex flex-col md:flex-row items-end justify-between gap-6 -mt-12 relative z-10">
                  <div className="flex items-end gap-6">
                    <div className="p-1 bg-[var(--bg-secondary)] rounded-3xl shadow-2xl">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-4xl font-black">
                        {user.firstName?.[0]}
                      </div>
                    </div>
                    <div className="pb-2">
                      <Title
                        level={2}
                        className="!text-[var(--text-primary)] !font-black !m-0 !tracking-tighter"
                      >
                        Control <span className="text-cyan-400">Center</span>
                      </Title>
                      <div className="flex gap-4 mt-2">
                        <Space className="text-[var(--text-muted)] text-xs">
                          <Calendar size={14} className="text-cyan-500" />
                          Joined 2024
                        </Space>
                        <Space className="text-[var(--text-muted)] text-xs">
                          <Award size={14} className="text-purple-500" />
                          Verified Node
                        </Space>
                      </div>
                    </div>
                  </div>

                  {activeTab === "info" && (
                    <div className="pb-2">
                      {!isEditing ? (
                        <Button
                          type="primary"
                          icon={<Edit2 size={16} />}
                          onClick={() => setIsEditing(true)}
                          className="bg-cyan-600 hover:bg-cyan-500 border-none h-11 px-8 rounded-xl font-bold transition-all shadow-lg hover:shadow-cyan-500/25"
                        >
                          Edit Module
                        </Button>
                      ) : (
                        <Space>
                          <Button
                            className="h-11 px-6 rounded-xl border-[var(--border-subtle)] text-[var(--text-primary)]"
                            onClick={() => {
                              setIsEditing(false);
                              form.resetFields();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="primary"
                            loading={loading}
                            className="bg-green-600 hover:bg-green-500 border-none h-11 px-8 rounded-xl font-bold"
                            onClick={() => form.submit()}
                          >
                            Save Changes
                          </Button>
                        </Space>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* Section Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === "info" && (
                    <Card className="!bg-[var(--bg-secondary)]/50 backdrop-blur-2xl !border-[var(--border-subtle)] !rounded-[2.5rem] shadow-xl">
                      {isEditing ? (
                        <Form
                          form={form}
                          layout="vertical"
                          initialValues={user}
                          onFinish={handleUpdate}
                          className="max-w-3xl"
                        >
                          <Row gutter={24}>
                            <Col xs={24} md={12}>
                              <Form.Item
                                name="firstName"
                                label={
                                  <Text
                                    strong
                                    className="text-[var(--text-secondary)] uppercase tracking-widest text-[10px]"
                                  >
                                    First Name
                                  </Text>
                                }
                                rules={[{ required: true }]}
                              >
                                <Input className="theme-input" />
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                              <Form.Item
                                name="lastName"
                                label={
                                  <Text
                                    strong
                                    className="text-[var(--text-secondary)] uppercase tracking-widest text-[10px]"
                                  >
                                    Last Name
                                  </Text>
                                }
                                rules={[{ required: true }]}
                              >
                                <Input className="theme-input" />
                              </Form.Item>
                            </Col>
                            <Col xs={24}>
                              <Form.Item
                                name="email"
                                label={
                                  <Text
                                    strong
                                    className="text-[var(--text-secondary)] uppercase tracking-widest text-[10px]"
                                  >
                                    Email Identity
                                  </Text>
                                }
                              >
                                <Input
                                  disabled
                                  className="theme-input opacity-50"
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24}>
                              <Form.Item
                                name="phone"
                                label={
                                  <Text
                                    strong
                                    className="text-[var(--text-secondary)] uppercase tracking-widest text-[10px]"
                                  >
                                    Contact Sync
                                  </Text>
                                }
                              >
                                <Input
                                  className="theme-input"
                                  placeholder="+256..."
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form>
                      ) : (
                        <Descriptions
                          column={{ xxl: 2, xl: 2, lg: 1, md: 2, sm: 1, xs: 1 }}
                          className="custom-descriptions"
                          size="large"
                        >
                          <Descriptions.Item label="Identity Path">
                            <Text strong className="text-[var(--text-primary)]">
                              {user.firstName} {user.lastName}
                            </Text>
                          </Descriptions.Item>
                          <Descriptions.Item label="Email Node">
                            <Text className="text-[var(--text-primary)]">
                              {user.email}
                            </Text>
                          </Descriptions.Item>
                          <Descriptions.Item label="Contact Link">
                            <Text className="text-[var(--text-primary)]">
                              {user.phone || "Not Logged"}
                            </Text>
                          </Descriptions.Item>
                          <Descriptions.Item label="Current Role">
                            <Tag
                              color="blue"
                              className="border-none bg-blue-500/10 text-blue-400 capitalize"
                            >
                              {user.role}
                            </Tag>
                          </Descriptions.Item>
                        </Descriptions>
                      )}
                    </Card>
                  )}

                  {activeTab === "activity" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Link to="/my-orders">
                        <Card className="!bg-[var(--bg-secondary)]/50 backdrop-blur-2xl !border-[var(--border-subtle)] !rounded-[2rem] hover:scale-[1.02] transition-all group overflow-hidden">
                          <div className="p-2">
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
                                <ShoppingBag size={24} />
                              </div>
                              <div className="flex -space-x-2">
                                {[1, 2].map((i) => (
                                  <div
                                    key={i}
                                    className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[#12121a] flex items-center justify-center text-[10px]"
                                  >
                                    📦
                                  </div>
                                ))}
                              </div>
                            </div>
                            <Title
                              level={4}
                              className="!text-[var(--text-primary)] !m-0"
                            >
                              Order History
                            </Title>
                            <Paragraph className="text-[var(--text-muted)] text-sm mb-4">
                              Track your hardware modules.
                            </Paragraph>
                            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
                              View Log{" "}
                              <ChevronRight
                                size={14}
                                className="group-hover:translate-x-1 transition-transform"
                              />
                            </div>
                          </div>
                        </Card>
                      </Link>
                      <Link to="/notifications">
                        <Card className="!bg-[var(--bg-secondary)]/50 backdrop-blur-2xl !border-[var(--border-subtle)] !rounded-[2rem] hover:scale-[1.02] transition-all group overflow-hidden">
                          <div className="p-2">
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
                                <Bell size={24} />
                              </div>
                              <Badge
                                status="processing"
                                text={
                                  <Text className="text-xs text-amber-500">
                                    Live Sync
                                  </Text>
                                }
                              />
                            </div>
                            <Title
                              level={4}
                              className="!text-[var(--text-primary)] !m-0"
                            >
                              System Alerts
                            </Title>
                            <Paragraph className="text-[var(--text-muted)] text-sm mb-4">
                              Stay updated on grid status.
                            </Paragraph>
                            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
                              Enter Dispatches{" "}
                              <ChevronRight
                                size={14}
                                className="group-hover:translate-x-1 transition-transform"
                              />
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </div>
                  )}

                  {activeTab === "security" && (
                    <Card className="!bg-[var(--bg-secondary)]/50 backdrop-blur-2xl !border-[var(--border-subtle)] !rounded-[2.5rem] shadow-xl">
                      <div className="max-w-2xl space-y-10">
                        <div className="flex items-start gap-6">
                          <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-3xl">
                            <Shield size={32} />
                          </div>
                          <div>
                            <Title
                              level={4}
                              className="!text-[var(--text-primary)] !mb-1"
                            >
                              Authentication Layer
                            </Title>
                            <Paragraph className="text-[var(--text-muted)]">
                              Enhance your security module with dual-factor
                              encryption.
                            </Paragraph>
                            <Button className="mt-2 rounded-xl border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 h-10 px-6 font-bold uppercase tracking-widest text-[9px]">
                              Initialize Encryption
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-start gap-6">
                          <div className="p-4 bg-purple-500/10 text-purple-400 rounded-3xl">
                            <CreditCard size={32} />
                          </div>
                          <div>
                            <Title
                              level={4}
                              className="!text-[var(--text-primary)] !mb-1"
                            >
                              Payment Protocol
                            </Title>
                            <Paragraph className="text-[var(--text-muted)]">
                              Securely manage your financial nodes and wallet
                              credits.
                            </Paragraph>
                            <div className="flex items-center gap-4 mt-4">
                              <div className="flex items-center gap-2 bg-[var(--bg-primary)] px-4 py-2 rounded-full border border-[var(--border-subtle)]">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <Text className="text-xs font-bold">
                                  Standard MM Active
                                </Text>
                              </div>
                              <Button
                                type="text"
                                className="text-purple-400 font-bold text-xs uppercase tracking-widest p-0 h-auto"
                              >
                                Update Wallet
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </Content>
        </Layout>
      </div>
    </div>
  );
};

export default UserProfile;
