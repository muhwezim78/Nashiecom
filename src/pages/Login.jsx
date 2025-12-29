import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  App,
  Divider,
  Checkbox,
} from "antd";
import {
  Mail,
  Lock,
  Store,
  ArrowLeft,
  ArrowRight,
  Monitor,
} from "lucide-react";
import { motion } from "framer-motion";
import "./Login.css";

const { Title, Text } = Typography;

const Login = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
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
            Customer Login
          </Title>
          <Text type="secondary">Sign in to your Nashiecom account</Text>
        </div>

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              prefix={<Mail size={16} />}
              placeholder="Enter your email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<Lock size={16} />}
              placeholder="Enter your password"
              size="large"
            />
          </Form.Item>

          <div className="flex items-center justify-between mb-6">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="text-gray-400 hover:text-cyan-400">
                Remember me
              </Checkbox>
            </Form.Item>
            <a
              href="#"
              className="text-cyan-400 hover:text-cyan-300 font-medium text-sm"
            >
              Forgot password?
            </a>
          </div>

          <Form.Item>
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

        <div className="space-y-3">
          <Link to="/signup">
            <Button
              block
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-cyan-500/50 h-10 rounded-xl"
            >
              Create Account
            </Button>
          </Link>

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
        </div>

        <div className="login-footer">
          <Text type="secondary" style={{ fontSize: 12 }}>
            Welcome to the future of shopping.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
