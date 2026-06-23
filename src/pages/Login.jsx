import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input, PasswordInput } from "../components/ui/Input";
import { message } from "../utils/toast";
import { Mail, Lock, ArrowLeft, ShoppingBag } from "lucide-react";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const onFinish = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
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
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden bg-[var(--bg-primary)]">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[480px] h-[480px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[480px] h-[480px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-[var(--bg-glass)] border border-[var(--border-main)] backdrop-blur-md shadow-[var(--shadow-md)]">
            <img
              src="/nashiecom.jpeg"
              alt="Nashiecom"
              className="w-11 h-11 object-contain rounded-xl"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <span style={{ display: 'none' }} className="w-11 h-11 items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-cyan-400" />
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            Sign in to your Nashiecom account
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-[var(--shadow-lg)] backdrop-blur-md">
          <div className="p-8">
            <form onSubmit={onFinish} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    iconLeft
                    placeholder="you@example.com"
                    autoComplete="email"
                    id="login-email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                    <Lock className="h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                  <PasswordInput
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    iconLeft
                    placeholder="••••••••"
                    autoComplete="current-password"
                    id="login-password"
                  />
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[var(--border-main)] bg-[var(--bg-glass)] accent-cyan-500"
                />
                <label htmlFor="remember-me" className="text-sm text-[var(--text-secondary)]">
                  Remember me
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                loading={loading}
                className="w-full py-3 mt-2"
                id="login-submit"
              >
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-[var(--border-subtle)]" />
              <span className="text-xs text-[var(--text-muted)] px-1">or</span>
              <div className="flex-1 h-px bg-[var(--border-subtle)]" />
            </div>

            {/* Create account */}
            <Link to="/signup" className="block w-full">
              <Button variant="secondary" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </div>

        <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
          Welcome to the future of shopping.
        </p>
      </div>
    </div>
  );
};

export default Login;
