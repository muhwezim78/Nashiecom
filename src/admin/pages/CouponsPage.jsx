import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Loader2, Calendar } from "lucide-react";
import { couponsAPI } from "../../services/api";
import { message } from "../../utils/toast";

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderAmount: "",
    usageLimit: "",
    expiresAt: "",
    isActive: true,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await couponsAPI.getAll();
      setCoupons(data.coupons || []);
    } catch (error) {
      // Handle error silently as before
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openModal = (coupon = null) => {
    setEditingCoupon(coupon);
    if (coupon) {
      // Format date for datetime-local input
      let formattedDate = "";
      if (coupon.expiresAt) {
        const d = new Date(coupon.expiresAt);
        const pad = (n) => n.toString().padStart(2, '0');
        formattedDate = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
      
      setFormData({
        code: coupon.code || "",
        discountType: coupon.discountType || "PERCENTAGE",
        discountValue: coupon.discountValue || "",
        minOrderAmount: coupon.minOrderAmount || "",
        usageLimit: coupon.usageLimit || "",
        expiresAt: formattedDate,
        isActive: coupon.isActive ?? true,
      });
    } else {
      setFormData({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        minOrderAmount: "",
        usageLimit: "",
        expiresAt: "",
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const couponData = {
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      };

      if (editingCoupon) {
        await couponsAPI.update(editingCoupon.id, couponData);
        message.success("Coupon updated");
      } else {
        await couponsAPI.create(couponData);
        message.success("Coupon created");
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (error) {
      message.error(error.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete coupon?")) return;
    try {
      await couponsAPI.delete(id);
      message.success("Coupon deleted");
      fetchCoupons();
    } catch (error) {
      message.error("Failed to delete");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Coupons</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage discount codes</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-cyan-500/20"
        >
          <Plus size={18} /> Add Coupon
        </button>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-glass)]">
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Code</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Discount</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Min Order</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Usage</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Expires</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-[var(--text-muted)]"><Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500 mb-2" /> Loading coupons...</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-[var(--text-muted)]">No coupons found.</td></tr>
              ) : (
                coupons.map((record) => (
                  <tr key={record.id} className="hover:bg-[var(--bg-glass)] transition-colors">
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-400 font-mono font-bold rounded border border-blue-500/20">{record.code}</span>
                    </td>
                    <td className="p-4 font-bold text-[var(--text-primary)]">
                      {record.discountValue}{record.discountType === "PERCENTAGE" ? "%" : " UGX"}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {record.minOrderAmount ? `${record.minOrderAmount.toLocaleString()} UGX` : "-"}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {record.usedCount || 0} / {record.usageLimit || "∞"}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {record.expiresAt ? new Date(record.expiresAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                        record.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {record.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(record)} className="p-2 text-cyan-500 hover:bg-cyan-500/10 rounded-lg transition-colors" title="Edit Coupon"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(record.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Coupon"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-glass)]">
              <h3 className="font-bold text-lg text-[var(--text-primary)]">{editingCoupon ? "Edit Coupon" : "Add Coupon"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-[var(--text-muted)] hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER2024"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] font-mono uppercase focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col gap-2 w-1/3">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Type *</label>
                  <select
                    required
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                  >
                    <option value="PERCENTAGE" className="bg-[#1a1a24]">Percentage</option>
                    <option value="FIXED" className="bg-[#1a1a24]">Fixed Amount</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Value *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Min Order Amount (UGX)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Usage Limit (Total)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Leave empty for unlimited"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">Expiry Date <Calendar size={14} /></label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none [color-scheme:dark]"
                />
              </div>

              <div className="flex items-center gap-4 p-4 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Status:</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isActive"
                      checked={formData.isActive === true}
                      onChange={() => setFormData({...formData, isActive: true})}
                      className="text-cyan-500 focus:ring-cyan-500 bg-[var(--bg-primary)] border-[var(--border-subtle)]"
                    />
                    <span className="text-sm text-[var(--text-primary)]">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isActive"
                      checked={formData.isActive === false}
                      onChange={() => setFormData({...formData, isActive: false})}
                      className="text-cyan-500 focus:ring-cyan-500 bg-[var(--bg-primary)] border-[var(--border-subtle)]"
                    />
                    <span className="text-sm text-[var(--text-primary)]">Inactive</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-lg transition-colors flex items-center gap-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {editingCoupon ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsPage;
