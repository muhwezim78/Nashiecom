import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, X, Loader2 } from "lucide-react";
import { categoriesAPI } from "../../services/api";
import { message } from "../../utils/toast";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    icon: "",
    description: "",
    featured: false,
    isActive: true,
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await categoriesAPI.getAll({
        includeInactive: true,
        _t: Date.now(), // Bypass cache
      });
      setCategories(data.categories);
    } catch (error) {
      console.error(error);
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      setFormData({
        name: category.name || "",
        slug: category.slug || "",
        icon: category.icon || "",
        description: category.description || "",
        featured: category.featured ?? false,
        isActive: category.isActive ?? true,
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        icon: "",
        description: "",
        featured: false,
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, formData);
        message.success("Category updated");
      } else {
        await categoriesAPI.create(formData);
        message.success("Category created");
      }
      setModalOpen(false);
      fetchCategories();
    } catch (error) {
      message.error(error.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete category?")) return;
    try {
      await categoriesAPI.delete(id);
      message.success("Category deleted");
      fetchCategories();
    } catch (error) {
      message.error("Failed to delete");
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await categoriesAPI.toggleFeatured(id);
      message.success("Category updated");
      fetchCategories();
    } catch (error) {
      message.error("Update failed");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await categoriesAPI.toggleStatus(id);
      message.success("Category updated");
      fetchCategories();
    } catch (error) {
      message.error("Update failed");
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Categories</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage product categories</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-cyan-500/20"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-xl mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-glass)]">
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Icon</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Slug</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Featured</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-[var(--text-muted)]"><Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500 mb-2" /> Loading categories...</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-[var(--text-muted)]">No categories found.</td></tr>
              ) : (
                filteredCategories.map((record) => (
                  <tr key={record.id} className="hover:bg-[var(--bg-glass)] transition-colors">
                    <td className="p-4 text-2xl">{record.icon || "📁"}</td>
                    <td className="p-4 font-bold text-[var(--text-primary)]">{record.name}</td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{record.slug}</td>
                    <td className="p-4 text-sm text-[var(--text-muted)] max-w-xs truncate">{record.description || "-"}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleFeatured(record.id)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${record.featured ? "bg-cyan-500" : "bg-gray-600"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${record.featured ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(record.id)}
                        className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-colors ${
                          record.isActive ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]"
                        }`}
                      >
                        {record.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(record)} className="p-2 text-cyan-500 hover:bg-cyan-500/10 rounded-lg transition-colors" title="Edit Category"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(record.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Category"><Trash2 size={16} /></button>
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
              <h3 className="font-bold text-lg text-[var(--text-primary)]">{editingCategory ? "Edit Category" : "Add Category"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-[var(--text-muted)] hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Slug (optional)</label>
                <input
                  type="text"
                  placeholder="Auto-generated if empty"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Icon (Emoji)</label>
                <input
                  type="text"
                  placeholder="e.g. 💻"
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none resize-none"
                />
              </div>
              
              <div className="flex items-center gap-6 p-4 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={e => setFormData({...formData, featured: e.target.checked})}
                    className="w-4 h-4 rounded bg-[var(--bg-primary)] border-[var(--border-subtle)] text-cyan-500 focus:ring-cyan-500 focus:ring-offset-[var(--bg-secondary)]"
                  />
                  <span className="text-sm text-[var(--text-primary)] font-medium">Featured</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    className="w-4 h-4 rounded bg-[var(--bg-primary)] border-[var(--border-subtle)] text-cyan-500 focus:ring-cyan-500 focus:ring-offset-[var(--bg-secondary)]"
                  />
                  <span className="text-sm text-[var(--text-primary)] font-medium">Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-lg transition-colors flex items-center gap-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
