import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  Package,
  Upload as UploadIcon,
  X,
  Loader2,
} from "lucide-react";
import { productsAPI, categoriesAPI, uploadAPI } from "../../services/api";
import { message } from "../../utils/toast";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
  }).format(amount);
};

const ProductsPage = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    featured: "",
  });
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    categoryId: "",
    quantity: 0,
    sku: "",
    barcode: "",
    description: "",
    shortDescription: "",
    isActive: true,
    inStock: true,
    featured: false,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await productsAPI.getAll(params);
      setProducts(response.data.products);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
      }));
    } catch (error) {
      message.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [pagination.page, filters]);

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const response = await uploadAPI.image(file);
      setUploadedImages((prev) => [...prev, { url: response.data.url, isPrimary: prev.length === 0 }]);
      message.success(`${file.name} uploaded successfully`);
    } catch (error) {
      message.error(`${file.name} upload failed.`);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const removeImage = (index) => {
    setUploadedImages((prev) => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      if (newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
        newImages[0].isPrimary = true;
      }
      return newImages;
    });
  };

  const openModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      setFormData({
        name: product.name || "",
        price: product.price || "",
        originalPrice: product.originalPrice || "",
        categoryId: product.categoryId || product.category?.id || "",
        quantity: product.quantity || 0,
        sku: product.sku || "",
        barcode: product.barcode || "",
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        isActive: product.isActive ?? true,
        inStock: product.inStock ?? true,
        featured: product.featured ?? false,
      });
      setUploadedImages(product.images || []);
    } else {
      setFormData({
        name: "",
        price: "",
        originalPrice: "",
        categoryId: "",
        quantity: 0,
        sku: "",
        barcode: "",
        description: "",
        shortDescription: "",
        isActive: true,
        inStock: true,
        featured: false,
      });
      setUploadedImages([]);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const productData = {
        ...formData,
        images: uploadedImages,
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, productData);
        message.success("Product updated successfully");
      } else {
        await productsAPI.create(productData);
        message.success("Product created successfully");
      }

      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      message.error(error.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete product? This action cannot be undone.")) return;
    try {
      await productsAPI.delete(id);
      message.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      message.error(error.message || "Delete failed");
    }
  };

  const toggleFeatured = async (id) => {
    try {
      await productsAPI.toggleFeatured(id);
      message.success("Product updated");
      fetchProducts();
    } catch (error) {
      message.error("Update failed");
    }
  };

  const toggleStatus = async (id) => {
    try {
      await productsAPI.toggleStatus(id);
      message.success("Status updated");
      fetchProducts();
    } catch (error) {
      message.error("Update failed");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Products</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Manage your product inventory ({pagination.total} products)
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-cyan-500/20"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full px-4 py-2 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
            >
              <option value="" className="bg-[#1a1a24]">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug} className="bg-[#1a1a24]">{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-48">
            <select
              value={filters.featured}
              onChange={(e) => handleFilterChange("featured", e.target.value)}
              className="w-full px-4 py-2 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
            >
              <option value="" className="bg-[#1a1a24]">Featured Filter</option>
              <option value="true" className="bg-[#1a1a24]">Featured</option>
              <option value="false" className="bg-[#1a1a24]">Not Featured</option>
            </select>
          </div>
          <button
            onClick={() => {
              setFilters({ search: "", category: "", featured: "" });
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 bg-[var(--bg-glass)] hover:bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] transition-colors whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-glass)]">
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Product</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">SKU</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Price</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Stock</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Rating</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Featured</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-[var(--text-muted)]">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500 mb-2" />
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-[var(--text-muted)]">No products found.</td>
                </tr>
              ) : (
                products.map((record) => (
                  <tr key={record.id} className="hover:bg-[var(--bg-glass)] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={record.image || record.images?.[0]?.url || "https://placehold.co/50"}
                          alt={record.name}
                          className="w-12 h-12 rounded-lg object-cover bg-[var(--bg-primary)] border border-[var(--border-subtle)]"
                        />
                        <div>
                          <div className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                            {record.name}
                            {record.featured && <Star size={12} fill="#fbbf24" className="text-amber-400" />}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            {record.category?.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{record.sku || "-"}</td>
                    <td className="p-4">
                      <div className="font-bold text-[var(--text-primary)]">{formatCurrency(record.price)}</div>
                      {record.originalPrice && (
                        <div className="text-xs text-[var(--text-muted)] line-through">
                          {formatCurrency(record.originalPrice)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                        record.quantity <= 5 ? "bg-red-500/20 text-red-400" :
                        record.quantity <= 20 ? "bg-orange-500/20 text-orange-400" :
                        "bg-green-500/20 text-green-400"
                      }`}>
                        {record.quantity} in stock
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-[var(--text-primary)] font-bold">
                        <Star size={14} fill="#fbbf24" className="text-amber-400" />
                        {record.rating}
                        <span className="text-[var(--text-muted)] text-xs font-normal">({record.reviewCount})</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleFeatured(record.id)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${record.featured ? "bg-cyan-500" : "bg-gray-600"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${record.featured ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleStatus(record.id)}
                        className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-colors ${
                          record.isActive ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]"
                        }`}
                      >
                        {record.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(record)}
                          className="p-2 text-cyan-500 hover:bg-cyan-500/10 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        {pagination.total > 0 && (
          <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)]">
            <span>Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries</span>
            <div className="flex gap-2">
              <button 
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
                className="px-3 py-1 rounded-lg bg-[var(--bg-glass)] hover:bg-[var(--bg-primary)] disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button 
                disabled={pagination.page * pagination.limit >= pagination.total}
                onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                className="px-3 py-1 rounded-lg bg-[var(--bg-glass)] hover:bg-[var(--bg-primary)] disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Form Drawer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-[var(--bg-secondary)] shadow-2xl flex flex-col border-l border-[var(--border-subtle)] transform transition-transform">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-glass)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl text-[var(--text-secondary)] transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <form id="productForm" onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter product name"
                    className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Price (UGX) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Original Price (UGX)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.originalPrice}
                      onChange={e => setFormData({...formData, originalPrice: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Category *</label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={e => setFormData({...formData, categoryId: e.target.value})}
                      className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                    >
                      <option value="" className="bg-[#1a1a24]">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-[#1a1a24]">{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={e => setFormData({...formData, sku: e.target.value})}
                      placeholder="Product SKU"
                      className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Barcode</label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={e => setFormData({...formData, barcode: e.target.value})}
                      placeholder="Product barcode"
                      className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Full product description..."
                    className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Short Description</label>
                  <textarea
                    rows={2}
                    value={formData.shortDescription}
                    onChange={e => setFormData({...formData, shortDescription: e.target.value})}
                    placeholder="Brief description for product cards..."
                    className="w-full px-4 py-2.5 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4 rounded bg-[var(--bg-primary)] border-[var(--border-subtle)] text-cyan-500 focus:ring-cyan-500 focus:ring-offset-[var(--bg-secondary)]"
                    />
                    <span className="text-sm text-[var(--text-primary)] font-medium">Active</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={e => setFormData({...formData, inStock: e.target.checked})}
                      className="w-4 h-4 rounded bg-[var(--bg-primary)] border-[var(--border-subtle)] text-cyan-500 focus:ring-cyan-500 focus:ring-offset-[var(--bg-secondary)]"
                    />
                    <span className="text-sm text-[var(--text-primary)] font-medium">In Stock</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={e => setFormData({...formData, featured: e.target.checked})}
                      className="w-4 h-4 rounded bg-[var(--bg-primary)] border-[var(--border-subtle)] text-cyan-500 focus:ring-cyan-500 focus:ring-offset-[var(--bg-secondary)]"
                    />
                    <span className="text-sm text-[var(--text-primary)] font-medium">Featured</span>
                  </label>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Product Images</label>
                  <div className="flex flex-wrap gap-4">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] overflow-hidden group">
                        <img src={img.url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {uploadedImages.length < 10 && (
                      <label className="w-24 h-24 rounded-xl border border-dashed border-[var(--border-subtle)] hover:border-cyan-500 bg-[var(--bg-glass)] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
                        {uploadingImage ? (
                          <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                        ) : (
                          <>
                            <UploadIcon size={24} className="text-[var(--text-muted)]" />
                            <span className="text-xs text-[var(--text-muted)]">Upload</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploadingImage} />
                      </label>
                    )}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-glass)] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-glass)] text-[var(--text-primary)] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                form="productForm"
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-lg shadow-cyan-500/20 transition-colors flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                {editingProduct ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
