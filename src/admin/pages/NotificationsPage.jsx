import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Send, Bell, Globe, User, Clock, Loader2, X, Search } from "lucide-react";
import { notificationsAPI } from "../../services/api";
import { message } from "../../utils/toast";

const NotificationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ type: "", isGlobal: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "INFO",
    isGlobal: true,
    userId: "",
    scheduledAt: "",
    isActive: true,
  });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit, ...filters };
      Object.keys(params).forEach(key => {
        if (params[key] === "" || params[key] === undefined) delete params[key];
      });

      const response = await notificationsAPI.getAllAdmin(params);
      setNotifications(response.data.notifications);
      setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
    } catch (error) {
      message.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [pagination.page, filters]);

  const openModal = (notification = null) => {
    setEditingNotification(notification);
    if (notification) {
      let formattedDate = "";
      if (notification.scheduledAt) {
        const d = new Date(notification.scheduledAt);
        const pad = (n) => n.toString().padStart(2, '0');
        formattedDate = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
      setFormData({
        title: notification.title || "",
        message: notification.message || "",
        type: notification.type || "INFO",
        isGlobal: notification.isGlobal ?? true,
        userId: notification.userId || "",
        scheduledAt: formattedDate,
        isActive: notification.isActive ?? true,
      });
    } else {
      setFormData({
        title: "",
        message: "",
        type: "INFO",
        isGlobal: true,
        userId: "",
        scheduledAt: "",
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        ...formData,
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
      };

      if (editingNotification) {
        await notificationsAPI.update(editingNotification.id, data);
        message.success("Notification updated successfully");
      } else {
        await notificationsAPI.create(data);
        message.success("Notification created and sent successfully");
      }

      setModalOpen(false);
      fetchNotifications();
    } catch (error) {
      message.error(error.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete notification? This action cannot be undone.")) return;
    try {
      await notificationsAPI.delete(id);
      message.success("Notification deleted successfully");
      fetchNotifications();
    } catch (error) {
      message.error(error.message || "Delete failed");
    }
  };

  const handleSendNow = async (id) => {
    try {
      await notificationsAPI.sendNow(id);
      message.success("Notification sent successfully");
      fetchNotifications();
    } catch (error) {
      message.error(error.message || "Send failed");
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "ORDER_UPDATE": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "PROMO": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "SUCCESS": return "text-green-400 bg-green-500/10 border-green-500/20";
      case "WARNING": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "ERROR": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "SYSTEM": return "text-gray-400 bg-gray-500/10 border-gray-500/20";
      default: return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notifications</h1>
          <p className="text-sm text-[var(--text-muted)]">Send and manage notifications ({pagination.total} total)</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-cyan-500/20"
        >
          <Plus size={18} /> Create Notification
        </button>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-48">
            <select
              value={filters.type}
              onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPagination({ ...pagination, page: 1 }); }}
              className="w-full px-4 py-2 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
            >
              <option value="" className="bg-[#1a1a24]">All Types</option>
              <option value="INFO" className="bg-[#1a1a24]">Info</option>
              <option value="SUCCESS" className="bg-[#1a1a24]">Success</option>
              <option value="WARNING" className="bg-[#1a1a24]">Warning</option>
              <option value="ERROR" className="bg-[#1a1a24]">Error</option>
              <option value="ORDER_UPDATE" className="bg-[#1a1a24]">Order Update</option>
              <option value="PROMO" className="bg-[#1a1a24]">Promo</option>
              <option value="SYSTEM" className="bg-[#1a1a24]">System</option>
            </select>
          </div>
          <div className="w-full md:w-48">
            <select
              value={filters.isGlobal}
              onChange={(e) => { setFilters({ ...filters, isGlobal: e.target.value }); setPagination({ ...pagination, page: 1 }); }}
              className="w-full px-4 py-2 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
            >
              <option value="" className="bg-[#1a1a24]">All Targets</option>
              <option value="true" className="bg-[#1a1a24]">Global</option>
              <option value="false" className="bg-[#1a1a24]">Specific User</option>
            </select>
          </div>
          <button
            onClick={() => { setFilters({ type: "", isGlobal: "" }); setPagination({ ...pagination, page: 1 }); }}
            className="px-4 py-2 bg-[var(--bg-glass)] hover:bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] transition-colors whitespace-nowrap ml-auto"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-glass)]">
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider w-[400px]">Notification</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Target</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Created</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-[var(--text-muted)]"><Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500 mb-2" /> Loading notifications...</td></tr>
              ) : notifications.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-[var(--text-muted)]">No notifications found.</td></tr>
              ) : (
                notifications.map((record) => (
                  <tr key={record.id} className="hover:bg-[var(--bg-glass)] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Bell size={14} className="text-cyan-400 shrink-0" />
                        <span className="font-bold text-[var(--text-primary)]">{record.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border shrink-0 ${getTypeColor(record.type)}`}>
                          {record.type}
                        </span>
                      </div>
                      <div className="text-sm text-[var(--text-secondary)] leading-relaxed pl-6">{record.message}</div>
                    </td>
                    <td className="p-4">
                      {record.isGlobal ? (
                        <div className="flex items-center gap-1 text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded w-fit text-xs font-bold uppercase tracking-wider">
                          <Globe size={12} /> Global
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded w-fit text-xs font-bold uppercase tracking-wider">
                          <User size={12} /> Specific
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {record.scheduledAt && !record.sentAt ? (
                        <div className="flex items-center gap-1 text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded w-fit text-xs font-bold uppercase tracking-wider">
                          <Clock size={12} /> Scheduled
                        </div>
                      ) : (
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                          record.sentAt ? "text-green-400 bg-green-500/10 border-green-500/20" : record.isActive ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-[var(--text-muted)] bg-[var(--bg-primary)] border-[var(--border-subtle)]"
                        }`}>
                          {record.sentAt ? "Sent" : record.isActive ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-muted)]">{new Date(record.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {record.scheduledAt && !record.sentAt && (
                          <button onClick={() => handleSendNow(record.id)} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors" title="Send Now"><Send size={16} /></button>
                        )}
                        <button onClick={() => openModal(record)} className="p-2 text-cyan-500 hover:bg-cyan-500/10 rounded-lg transition-colors" title="Edit"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(record.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination.total > 0 && (
          <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)]">
            <span>Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries</span>
            <div className="flex gap-2">
              <button disabled={pagination.page === 1} onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))} className="px-3 py-1 rounded-lg bg-[var(--bg-glass)] hover:bg-[var(--bg-primary)] disabled:opacity-50 transition-colors">Previous</button>
              <button disabled={pagination.page * pagination.limit >= pagination.total} onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))} className="px-3 py-1 rounded-lg bg-[var(--bg-glass)] hover:bg-[var(--bg-primary)] disabled:opacity-50 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-glass)] shrink-0">
              <h3 className="font-bold text-lg text-[var(--text-primary)]">{editingNotification ? "Edit Notification" : "Create Notification"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-[var(--text-muted)] hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                    placeholder="Notification title"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Message *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none resize-none"
                    placeholder="Notification message"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                    >
                      <option value="INFO" className="bg-[#1a1a24]">Info</option>
                      <option value="SUCCESS" className="bg-[#1a1a24]">Success</option>
                      <option value="WARNING" className="bg-[#1a1a24]">Warning</option>
                      <option value="ERROR" className="bg-[#1a1a24]">Error</option>
                      <option value="ORDER_UPDATE" className="bg-[#1a1a24]">Order Update</option>
                      <option value="PROMO" className="bg-[#1a1a24]">Promo</option>
                      <option value="SYSTEM" className="bg-[#1a1a24]">System</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Send to All Users</label>
                    <div className="flex items-center h-[46px] px-4 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl">
                      <label className="flex items-center gap-3 cursor-pointer w-full">
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.isGlobal ? "bg-cyan-500" : "bg-gray-600"}`}>
                          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${formData.isGlobal ? "translate-x-5" : "translate-x-0"}`} />
                        </div>
                        <span className="text-sm text-[var(--text-primary)]">{formData.isGlobal ? "Global" : "Specific User"}</span>
                        <input
                          type="checkbox"
                          checked={formData.isGlobal}
                          onChange={(e) => setFormData({...formData, isGlobal: e.target.checked})}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {!formData.isGlobal && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">User ID *</label>
                    <input
                      type="text"
                      required={!formData.isGlobal}
                      value={formData.userId}
                      onChange={(e) => setFormData({...formData, userId: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                      placeholder="Enter specific user ID"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Schedule For (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none [color-scheme:dark]"
                  />
                  <p className="text-xs text-[var(--text-muted)]">Leave empty to send immediately</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Status</label>
                  <div className="flex items-center h-[46px] px-4 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl w-fit">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.isActive ? "bg-green-500" : "bg-gray-600"}`}>
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${formData.isActive ? "translate-x-5" : "translate-x-0"}`} />
                      </div>
                      <span className="text-sm text-[var(--text-primary)]">{formData.isActive ? "Active" : "Inactive"}</span>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-lg transition-colors flex items-center gap-2">
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    {editingNotification ? "Update" : "Create & Send"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
