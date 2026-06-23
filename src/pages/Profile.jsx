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

import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";
import { formatCurrency } from "../utils/currency";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { message } from "../utils/toast";

const UserProfile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Access Denied</h2>
          <p className="text-[var(--text-muted)] mb-6">Please login to view your profile.</p>
          <Button onClick={() => navigate("/login")}>
            Login Now
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      message.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      message.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const sideMenuItems = [
    { key: "info", icon: User, label: "Personal Profile" },
    { key: "activity", icon: ShoppingBag, label: "Activity Hub" },
    { key: "security", icon: Shield, label: "Security & Safety" },
    { key: "notifications", icon: Bell, label: "Dispatches", badge: true, onClick: () => navigate("/notifications") },
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDER - Compact Identity Card */}
          <div className="w-full lg:w-[300px] flex-shrink-0 lg:sticky lg:top-32 h-fit">
            <Card className="bg-[var(--bg-secondary)]/50 backdrop-blur-2xl border-[var(--border-subtle)] rounded-[2rem] shadow-2xl overflow-hidden p-10 border-0">
              <div className="flex flex-col items-center text-center">
                <div className="relative group mb-6">
                  <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-1000" />
                  <div className="w-32 h-32 rounded-full border-4 border-[var(--bg-secondary)] shadow-xl relative z-10 flex items-center justify-center bg-[var(--bg-tertiary)] overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-[var(--text-muted)]" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2.5 bg-cyan-600 text-white rounded-xl hover:scale-110 transition-all shadow-lg border-2 border-[var(--bg-secondary)] z-20" title="Update Photo">
                    <Camera size={16} />
                  </button>
                </div>

                <div className="space-y-1 mb-6">
                  <h4 className="text-[var(--text-primary)] text-xl font-black m-0 tracking-tight">
                    {user.firstName} {user.lastName}
                  </h4>
                  <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-bold uppercase tracking-widest text-[9px] mt-2">
                    {user.role} Module
                  </span>
                </div>

                <div className="w-full flex flex-col gap-2 mb-6">
                  {sideMenuItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => item.onClick ? item.onClick() : setActiveTab(item.key)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold text-sm ${
                        activeTab === item.key && !item.onClick
                          ? "bg-cyan-500/10 text-cyan-400"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-glass)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <item.icon size={18} />
                      {item.label}
                      {item.badge && (
                        <span className="w-2 h-2 rounded-full bg-red-500 ml-auto animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="w-full h-px bg-[var(--border-subtle)]/50 my-6" />

                <button
                  className="w-full h-12 rounded-xl text-red-400 hover:bg-red-500/10 font-bold uppercase tracking-widest text-[10px] transition-colors"
                  onClick={logout}
                >
                  Terminate Session
                </button>
              </div>
            </Card>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1">
            <div className="space-y-8">
              {/* Hero Banner Area */}
              <Card className="bg-[var(--bg-secondary)]/50 backdrop-blur-2xl border-[var(--border-subtle)] rounded-[2.5rem] shadow-xl overflow-hidden relative border-0 p-0">
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
                      <h2 className="text-3xl text-[var(--text-primary)] font-black m-0 tracking-tighter">
                        Control <span className="text-cyan-400">Center</span>
                      </h2>
                      <div className="flex gap-4 mt-2">
                        <span className="flex items-center gap-1 text-[var(--text-muted)] text-xs">
                          <Calendar size={14} className="text-cyan-500" />
                          Joined 2024
                        </span>
                        <span className="flex items-center gap-1 text-[var(--text-muted)] text-xs">
                          <Award size={14} className="text-purple-500" />
                          Verified Node
                        </span>
                      </div>
                    </div>
                  </div>

                  {activeTab === "info" && (
                    <div className="pb-2">
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white h-11 px-8 rounded-xl font-bold transition-all shadow-lg hover:shadow-cyan-500/25"
                        >
                          <Edit2 size={16} /> Edit Module
                        </button>
                      ) : (
                        <div className="flex gap-4">
                          <button
                            className="h-11 px-6 rounded-xl border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-glass)]"
                            onClick={() => {
                              setIsEditing(false);
                              setFormData({
                                firstName: user?.firstName || "",
                                lastName: user?.lastName || "",
                                phone: user?.phone || "",
                              });
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            disabled={loading}
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white h-11 px-8 rounded-xl font-bold shadow-lg"
                            onClick={handleUpdate}
                          >
                            Save Changes
                          </button>
                        </div>
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
                    <Card className="bg-[var(--bg-secondary)]/50 backdrop-blur-2xl border-[var(--border-subtle)] rounded-[2.5rem] shadow-xl border-0 p-8">
                      {isEditing ? (
                        <form onSubmit={handleUpdate} className="max-w-3xl flex flex-col gap-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                              <label className="font-bold text-[var(--text-secondary)] uppercase tracking-widest text-[10px]">
                                First Name
                              </label>
                              <Input
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="font-bold text-[var(--text-secondary)] uppercase tracking-widest text-[10px]">
                                Last Name
                              </label>
                              <Input
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              />
                            </div>
                            <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                              <label className="font-bold text-[var(--text-secondary)] uppercase tracking-widest text-[10px]">
                                Email Identity
                              </label>
                              <Input disabled value={user.email} className="opacity-50 cursor-not-allowed" />
                            </div>
                            <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                              <label className="font-bold text-[var(--text-secondary)] uppercase tracking-widest text-[10px]">
                                Contact Sync
                              </label>
                              <Input
                                placeholder="+256..."
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              />
                            </div>
                          </div>
                        </form>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="flex flex-col gap-2">
                            <span className="text-[var(--text-muted)] text-sm">Identity Path</span>
                            <span className="text-[var(--text-primary)] font-bold text-lg">{user.firstName} {user.lastName}</span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className="text-[var(--text-muted)] text-sm">Email Node</span>
                            <span className="text-[var(--text-primary)] text-lg">{user.email}</span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className="text-[var(--text-muted)] text-sm">Contact Link</span>
                            <span className="text-[var(--text-primary)] text-lg">{user.phone || "Not Logged"}</span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className="text-[var(--text-muted)] text-sm">Current Role</span>
                            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 capitalize w-max font-bold text-sm">
                              {user.role}
                            </span>
                          </div>
                        </div>
                      )}
                    </Card>
                  )}

                  {activeTab === "activity" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Link to="/my-orders">
                        <Card className="bg-[var(--bg-secondary)]/50 backdrop-blur-2xl border-[var(--border-subtle)] rounded-[2rem] hover:scale-[1.02] transition-all group overflow-hidden border-0 p-8">
                          <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
                              <ShoppingBag size={24} />
                            </div>
                            <div className="flex -space-x-2">
                              {[1, 2].map((i) => (
                                <div
                                  key={i}
                                  className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[var(--bg-primary)] flex items-center justify-center text-[10px]"
                                >
                                  📦
                                </div>
                              ))}
                            </div>
                          </div>
                          <h4 className="text-[var(--text-primary)] text-xl font-bold m-0 mb-2">
                            Order History
                          </h4>
                          <p className="text-[var(--text-muted)] text-sm mb-6">
                            Track your hardware modules.
                          </p>
                          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
                            View Log{" "}
                            <ChevronRight
                              size={14}
                              className="group-hover:translate-x-1 transition-transform"
                            />
                          </div>
                        </Card>
                      </Link>
                      <Link to="/notifications">
                        <Card className="bg-[var(--bg-secondary)]/50 backdrop-blur-2xl border-[var(--border-subtle)] rounded-[2rem] hover:scale-[1.02] transition-all group overflow-hidden border-0 p-8">
                          <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
                              <Bell size={24} />
                            </div>
                            <span className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full font-bold">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Live Sync
                            </span>
                          </div>
                          <h4 className="text-[var(--text-primary)] text-xl font-bold m-0 mb-2">
                            System Alerts
                          </h4>
                          <p className="text-[var(--text-muted)] text-sm mb-6">
                            Stay updated on grid status.
                          </p>
                          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
                            Enter Dispatches{" "}
                            <ChevronRight
                              size={14}
                              className="group-hover:translate-x-1 transition-transform"
                            />
                          </div>
                        </Card>
                      </Link>
                    </div>
                  )}

                  {activeTab === "security" && (
                    <Card className="bg-[var(--bg-secondary)]/50 backdrop-blur-2xl border-[var(--border-subtle)] rounded-[2.5rem] shadow-xl border-0 p-8">
                      <div className="max-w-2xl space-y-10">
                        <div className="flex items-start gap-6">
                          <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-3xl">
                            <Shield size={32} />
                          </div>
                          <div>
                            <h4 className="text-[var(--text-primary)] text-xl font-bold mb-2">
                              Authentication Layer
                            </h4>
                            <p className="text-[var(--text-muted)] mb-4">
                              Enhance your security module with dual-factor
                              encryption.
                            </p>
                            <button className="rounded-xl border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 h-10 px-6 font-bold uppercase tracking-widest text-[9px] transition-colors">
                              Initialize Encryption
                            </button>
                          </div>
                        </div>

                        <div className="flex items-start gap-6">
                          <div className="p-4 bg-purple-500/10 text-purple-400 rounded-3xl">
                            <CreditCard size={32} />
                          </div>
                          <div>
                            <h4 className="text-[var(--text-primary)] text-xl font-bold mb-2">
                              Payment Protocol
                            </h4>
                            <p className="text-[var(--text-muted)]">
                              Securely manage your financial nodes and wallet
                              credits.
                            </p>
                            <div className="flex items-center gap-4 mt-6">
                              <div className="flex items-center gap-2 bg-[var(--bg-primary)] px-4 py-2 rounded-full border border-[var(--border-subtle)]">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-xs font-bold text-[var(--text-primary)]">
                                  Standard MM Active
                                </span>
                              </div>
                              <button className="text-purple-400 font-bold text-xs uppercase tracking-widest hover:text-purple-300 transition-colors">
                                Update Wallet
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
