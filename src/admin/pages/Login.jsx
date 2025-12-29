// Admin Login Page
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, Typography, message, Divider } from "antd";
import { Mail, Lock, Store, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await login(values.email, values.password);
      const user = response.data.user;

      if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
        message.error("Access denied. Admin privileges required.");
        return;
      }

      message.success("Welcome back, " + user.firstName + "!");
      navigate("/admin");
    } catch (error) {
      message.error(
        error.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-glow login-glow-1" />
        <div className="login-glow login-glow-2" />
      </div>

      <Card className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img
              src="/nashiecom.jpeg"
              alt="Logo"
              style={{ width: 60, height: 60, objectFit: "contain" }}
            />
          </div>
          <Title level={3} style={{ margin: 0, color: "#fff" }}>
            Admin Portal
          </Title>
          <Text type="secondary">Sign in to manage your store</Text>
        </div>

        <Form
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark={false}
          initialValues={{
            email: "admin@nashiecom.tech",
            password: "Admin@123456",
          }}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              prefix={<Mail size={16} />}
              placeholder="admin@nashiecom.tech"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<Lock size={16} />}
              placeholder="Enter your password"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <Text type="secondary">or</Text>
        </Divider>

        <Link to="/">
          <Button
            type="text"
            block
            icon={<ArrowLeft size={16} />}
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Back to Store
          </Button>
        </Link>

        <div className="login-footer">
          <Text type="secondary" style={{ fontSize: 12 }}>
            Demo credentials are pre-filled for testing.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
