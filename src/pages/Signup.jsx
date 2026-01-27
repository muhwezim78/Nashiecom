import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Form, Input, Button, Card, Typography, App, Divider } from "antd";
import {
  User,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Monitor,
  Smartphone,
} from "lucide-react";
import { motion } from "framer-motion";
import "./Login.css";

const { Title, Text } = Typography;

const Signup = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phone: values.phone,
      });
      message.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Signup failed:", error);

      if (error.errors && Array.isArray(error.errors)) {
        // Map backend errors to form fields
        const formErrors = error.errors.map((err) => ({
          name: err.field,
          errors: [err.message],
        }));
        form.setFields(formErrors);
        message.error("Please fix the validation errors.");
      } else {
        message.error(
          error.message || "Registration failed. Please try again."
        );
      }
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

      <Card className="login-card" style={{ maxWidth: 500 }}>
        <div className="login-header">
          <div className="login-logo">
            <img
              src="/nashiecom.jpeg"
              alt="Logo"
              style={{ width: 60, height: 60, objectFit: "contain" }}
            />
          </div>
          <Title level={3} style={{ margin: 0, color: "#fff" }}>
            Join Nashiecom
          </Title>
          <Text type="secondary">Create your account to start shopping</Text>
        </div>

        <Form
          form={form}
          name="signup"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[
                { required: true, message: "Please input your first name!" },
              ]}
            >
              <Input
                prefix={<User size={16} />}
                placeholder="First Name"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[
                { required: true, message: "Please input your last name!" },
              ]}
            >
              <Input
                prefix={<User size={16} />}
                placeholder="Last Name"
                size="large"
              />
            </Form.Item>
          </div>

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
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: "Please input your phone number!" },
            ]}
          >
            <Input
              prefix={<Smartphone size={16} />}
              placeholder="Phone Number"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 8, message: "Password must be at least 8 characters" },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message:
                  "Password must contain uppercase, lowercase, and a number",
              },
            ]}
          >
            <Input.Password
              prefix={<Lock size={16} />}
              placeholder="Create a password"
              size="large"
            />
          </Form.Item>

          <Form.Item className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <span className="text-gray-500 text-sm">or</span>
        </Divider>

        <div className="space-y-3">
          <Link to="/login">
            <Button
              block
              className="bg-[var(--bg-glass)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] hover:border-cyan-500/50 h-10 rounded-xl"
            >
              Sign In Instead
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
            By joining, you agree to our Terms and Conditions.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Signup;
