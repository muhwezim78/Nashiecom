import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI, settingsAPI } from "../../services/api";
import { message } from "../../utils/toast";
import { User, Shield, Settings, Loader2, Save } from "lucide-react";

const ProfileSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName
      });
      message.success("Profile updated successfully");
      window.location.reload();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      message.error("New password must be at least 6 characters");
      return;
    }
    setPassLoading(true);
    try {
      await authAPI.updatePassword(passwordData.currentPassword, passwordData.newPassword);
      message.success("Password updated successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      message.error(error.message || "Failed to update password");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2"><User size={20} className="text-cyan-400" /> Personal Information</h2>
        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">First Name *</label>
              <input
                type="text"
                required
                value={profileData.firstName}
                onChange={e => setProfileData({...profileData, firstName: e.target.value})}
                className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Last Name *</label>
              <input
                type="text"
                required
                value={profileData.lastName}
                onChange={e => setProfileData({...profileData, lastName: e.target.value})}
                className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Email Address</label>
            <input
              type="email"
              disabled
              value={profileData.email}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-muted)] cursor-not-allowed opacity-70"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">Email address cannot be changed.</p>
          </div>
          <div className="pt-2">
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-cyan-500/20 flex items-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2"><Shield size={20} className="text-red-400" /> Security</h2>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-5 max-w-xl">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Current Password *</label>
            <input
              type="password"
              required
              value={passwordData.currentPassword}
              onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
              className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">New Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={passwordData.newPassword}
              onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
              className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Confirm New Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={passwordData.confirmPassword}
              onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-red-500 outline-none"
            />
          </div>
          <div className="pt-2">
            <button type="submit" disabled={passLoading} className="px-6 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl transition-colors font-medium flex items-center gap-2">
              {passLoading && <Loader2 size={16} className="animate-spin" />}
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SystemSettings = () => {
  const [settingsGroups, setSettingsGroups] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await settingsAPI.getAll();
        setSettingsGroups(data.settings || {});
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (key, value) => {
    try {
      await settingsAPI.update(key, value);
      message.success("Setting saved");
    } catch (e) {
      message.error("Failed to save setting");
    }
  };

  const hasSettings = Object.keys(settingsGroups).length > 0;

  if (loading) {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-12 shadow-xl flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl">
      <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2"><Settings size={20} className="text-cyan-400" /> General Configuration</h2>
      
      {!hasSettings ? (
        <div className="text-center py-12 text-[var(--text-muted)]">No system settings available.</div>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(settingsGroups).map(([group, items]) => (
            <div key={group} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 shrink-0">{group}</h3>
                <div className="h-px bg-[var(--border-subtle)] flex-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {items.map((s) => (
                  <div key={s.key} className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)] capitalize">
                      {s.key.replace(/_/g, " ")}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        defaultValue={String(s.value)}
                        onBlur={(e) => {
                          if (e.target.value !== String(s.value)) {
                            handleSave(s.key, e.target.value);
                          }
                        }}
                        className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none pr-10"
                      />
                      <Save size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)]">Changes are saved automatically on blur.</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-muted)]">Manage your account and system preferences</p>
      </div>

      <div className="flex border-b border-[var(--border-subtle)]">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === "profile" ? "text-cyan-400" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <User size={18} />
          Profile Settings
          {activeTab === "profile" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
        </button>
        <button
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === "system" ? "text-cyan-400" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Settings size={18} />
          System Settings
          {activeTab === "system" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
        </button>
      </div>

      <div className="mt-2">
        {activeTab === "profile" && <ProfileSettings />}
        {activeTab === "system" && <SystemSettings />}
      </div>
    </div>
  );
};

export default SettingsPage;
