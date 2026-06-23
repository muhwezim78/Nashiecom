import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Input, PasswordInput } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { message } from "../../utils/toast";

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("admin@nashiecom.tech");
  const [password, setPassword] = useState("Admin@123456");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login(email, password);
      const user = response.data.user;
      if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
        message.error("Access denied. Admin privileges required.");
        return;
      }
      message.success("Welcome back, " + user.firstName + "!");
      navigate("/admin");
    } catch (error) {
      message.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden bg-[#08080e]">
      {/* Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[420px] h-[420px] bg-cyan-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[420px] h-[420px] bg-purple-700/15 rounded-full blur-[140px]" />
        <div className="absolute top-0 right-0 w-[240px] h-[240px] bg-blue-600/8 rounded-full blur-[80px]" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
            <img
              src="/nashiecom.jpeg"
              alt="Nashiecom Admin"
              className="w-11 h-11 object-contain rounded-xl"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <span style={{ display: "none" }} className="w-11 h-11 items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-cyan-400" />
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Portal
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            Sign in to Admin
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Manage your store with full control
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-600" />
                  </div>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@nashiecom.tech"
                    iconLeft
                    className="bg-black/20 border-white/10 text-white placeholder-gray-600"
                    id="admin-login-email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                    <Lock className="h-4 w-4 text-gray-600" />
                  </div>
                  <PasswordInput
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    iconLeft
                    className="bg-black/20 border-white/10 text-white placeholder-gray-600"
                    id="admin-login-password"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn w-full py-3 mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 font-bold shadow-lg shadow-cyan-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                id="admin-login-submit"
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-xs text-gray-600 px-1">or</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            <Link to="/" className="block">
              <button className="flex items-center justify-center gap-2 w-full text-gray-500 hover:text-gray-300 transition-colors py-2 text-sm">
                <ArrowLeft className="w-4 h-4" />
                Back to Store
              </button>
            </Link>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-gray-600">
          Demo credentials are pre-filled for testing.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
