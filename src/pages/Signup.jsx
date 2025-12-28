import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Form, Input, Button, message } from "antd";
import { User, Lock, Mail, ArrowRight, Loader, Smartphone } from "lucide-react"; // Import Smartphone
import { motion } from "framer-motion";

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
      });
      message.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Signup failed:", error);
      message.error(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 blur-[120px] rounded-full" />
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
              Join the Future
            </h1>
            <p className="text-gray-400">
              Create your account to start shopping
            </p>
          </div>

          <Form
            name="signup"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            className="space-y-4"
          >
            <Form.Item
              name="name"
              rules={[
                { required: true, message: "Please input your full name!" },
                { min: 2, message: "Name must be at least 2 characters" },
              ]}
            >
              <Input
                size="large"
                prefix={<User className="w-4 h-4 text-gray-400" />}
                placeholder="Full Name"
                className="bg-black/20 border-white/10 text-white placeholder-gray-500 rounded-xl hover:border-cyan-500/50 focus:border-cyan-500 h-12"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input
                size="large"
                prefix={<Mail className="w-4 h-4 text-gray-400" />}
                placeholder="Email Address"
                className="bg-black/20 border-white/10 text-white placeholder-gray-500 rounded-xl hover:border-cyan-500/50 focus:border-cyan-500 h-12"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: "Please input your phone number!" },
              ]}
            >
              <Input
                size="large"
                prefix={<Smartphone className="w-4 h-4 text-gray-400" />}
                placeholder="Phone Number"
                className="bg-black/20 border-white/10 text-white placeholder-gray-500 rounded-xl hover:border-cyan-500/50 focus:border-cyan-500 h-12"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<Lock className="w-4 h-4 text-gray-400" />}
                placeholder="Password"
                className="bg-black/20 border-white/10 text-white placeholder-gray-500 rounded-xl hover:border-cyan-500/50 focus:border-cyan-500 h-12"
              />
            </Form.Item>

            <Form.Item className="mb-0 pt-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 border-none rounded-xl text-base font-bold shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-cyan-400 hover:text-cyan-300 font-bold ml-1"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
