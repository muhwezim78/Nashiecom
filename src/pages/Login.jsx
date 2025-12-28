import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Form, Input, Button, message, Checkbox } from "antd";
import { User, Lock, ArrowRight, Loader } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
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
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#12121a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400">Sign in to continue your journey</p>
          </div>

          <Form
            name="login"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
            className="space-y-4"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input
                size="large"
                prefix={<User className="w-4 h-4 text-gray-400" />}
                placeholder="Email Address"
                className="bg-black/20 border-white/10 text-white placeholder-gray-500 rounded-xl hover:border-cyan-500/50 focus:border-cyan-500 h-12"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<Lock className="w-4 h-4 text-gray-400" />}
                placeholder="Password"
                className="bg-black/20 border-white/10 text-white placeholder-gray-500 rounded-xl hover:border-cyan-500/50 focus:border-cyan-500 h-12"
              />
            </Form.Item>

            <div className="flex items-center justify-between text-sm">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="text-gray-400 hover:text-cyan-400">
                  Remember me
                </Checkbox>
              </Form.Item>
              <a
                href="#"
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Forgot password?
              </a>
            </div>

            <Form.Item className="mb-0 pt-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 bg-gradient-to-r from-cyan-600 to-blue-600 border-none rounded-xl text-base font-bold shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-cyan-400 hover:text-cyan-300 font-bold ml-1"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
