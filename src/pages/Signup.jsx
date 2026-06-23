import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input, PasswordInput } from "../components/ui/Input";
import { message } from "../utils/toast";
import { User, Lock, Mail, Smartphone, ArrowLeft, ShoppingBag } from "lucide-react";

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onFinish = async (e) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      message.error("Password must be at least 8 characters");
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      message.error("Password must contain uppercase, lowercase, and a number");
      return;
    }
    setLoading(true);
    try {
      await register(formData);
      message.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Signup failed:", error);
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach((err) => message.error(`${err.field}: ${err.message}`));
      } else {
        message.error(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden bg-[var(--bg-primary)]">
      {/* Ambient blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[480px] h-[480px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[480px] h-[480px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 w-[280px] h-[280px] bg-blue-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-[500px]">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-[var(--bg-glass)] border border-[var(--border-main)] backdrop-blur-md shadow-[var(--shadow-md)]">
            <img
              src="/nashiecom.jpeg"
              alt="Nashiecom"
              className="w-11 h-11 object-contain rounded-xl"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <span style={{ display: "none" }} className="w-11 h-11 items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-cyan-400" />
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Create an account
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            Join Nashiecom and start shopping
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-[var(--shadow-lg)] backdrop-blur-md">
          <div className="p-8">
            <form onSubmit={onFinish} className="space-y-5">
              {/* Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-[var(--text-muted)]" />
                    </div>
                    <Input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      iconLeft
                      placeholder="John"
                      id="signup-firstname"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-[var(--text-muted)]" />
                    </div>
                    <Input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      iconLeft
                      placeholder="Doe"
                      id="signup-lastname"
                    />
                  </div>
                </div>
              </div>

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
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    iconLeft
                    placeholder="you@example.com"
                    autoComplete="email"
                    id="signup-email"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Smartphone className="h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                  <Input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    iconLeft
                    placeholder="+256 700 000 000"
                    id="signup-phone"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                    <Lock className="h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                  <PasswordInput
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    iconLeft
                    placeholder="Min 8 chars, A–Z, 0–9"
                    autoComplete="new-password"
                    id="signup-password"
                  />
                </div>
                <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                  Must contain uppercase, lowercase, and at least one number.
                </p>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                loading={loading}
                className="w-full py-3 mt-2"
                id="signup-submit"
              >
                {loading ? "Creating account…" : "Create Account"}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-[var(--border-subtle)]" />
              <span className="text-xs text-[var(--text-muted)] px-1">or</span>
              <div className="flex-1 h-px bg-[var(--border-subtle)]" />
            </div>

            <Link to="/login" className="block w-full">
              <Button variant="secondary" className="w-full">
                Sign In Instead
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
          By joining, you agree to our Terms &amp; Conditions.
        </p>
      </div>
    </div>
  );
};

export default Signup;
