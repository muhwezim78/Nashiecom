// API Service for Nashiecom Technologies
// Connects React frontend to Express backend

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Token management
const getToken = () => localStorage.getItem("nashiecom_token");
const setToken = (token) => localStorage.setItem("nashiecom_token", token);
const removeToken = () => localStorage.removeItem("nashiecom_token");

// User data management
const getUser = () => {
  const user = localStorage.getItem("nashiecom_user");
  return user ? JSON.parse(user) : null;
};
const setUser = (user) =>
  localStorage.setItem("nashiecom_user", JSON.stringify(user));
const removeUser = () => localStorage.removeItem("nashiecom_user");

// Base fetch with auth
const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle token expiration
      if (response.status === 401) {
        removeToken();
        removeUser();
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
      const error = new Error(data.message || "Something went wrong");
      error.errors = data.errors; // Attach validation errors
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// ============== AUTH API ==============
export const authAPI = {
  register: async (userData) => {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    if (data.token) {
      setToken(data.token);
      setUser(data.data.user);
    }
    return data;
  },

  login: async (email, password) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setToken(data.token);
      setUser(data.data.user);
    }
    return data;
  },

  logout: async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      removeToken();
      removeUser();
    }
  },

  getMe: async () => {
    return apiFetch("/auth/me");
  },

  updateProfile: async (data) => {
    const result = await apiFetch("/auth/update-me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (result.data?.user) {
      setUser(result.data.user);
    }
    return result;
  },

  updatePassword: async (currentPassword, newPassword) => {
    return apiFetch("/auth/update-password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  isAuthenticated: () => !!getToken(),
  getUser,
  isAdmin: () => {
    const user = getUser();
    return user && ["ADMIN", "SUPER_ADMIN"].includes(user.role);
  },
};

// ============== PRODUCTS API ==============
export const productsAPI = {
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value);
      }
    });
    return apiFetch(`/products?${searchParams.toString()}`);
  },

  getFeatured: async (limit = 8) => {
    return apiFetch(`/products/featured?limit=${limit}`);
  },

  search: async (query) => {
    return apiFetch(`/products/search?q=${encodeURIComponent(query)}`);
  },

  getById: async (id) => {
    return apiFetch(`/products/${id}`);
  },

  getBySlug: async (slug) => {
    return apiFetch(`/products/slug/${slug}`);
  },

  // Admin endpoints
  create: async (productData) => {
    return apiFetch("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  },

  update: async (id, productData) => {
    return apiFetch(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  },

  delete: async (id) => {
    return apiFetch(`/products/${id}`, {
      method: "DELETE",
    });
  },

  toggleFeatured: async (id) => {
    return apiFetch(`/products/${id}/toggle-featured`, {
      method: "PATCH",
    });
  },

  toggleStatus: async (id) => {
    return apiFetch(`/products/${id}/toggle-status`, {
      method: "PATCH",
    });
  },
};

// ============== CATEGORIES API ==============
export const categoriesAPI = {
  getAll: async () => {
    return apiFetch("/categories");
  },

  getTree: async () => {
    return apiFetch("/categories/tree");
  },

  getById: async (id) => {
    return apiFetch(`/categories/${id}`);
  },

  getProducts: async (id, params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`/categories/${id}/products?${searchParams.toString()}`);
  },

  // Admin endpoints
  create: async (categoryData) => {
    return apiFetch("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  },

  update: async (id, categoryData) => {
    return apiFetch(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  },

  delete: async (id) => {
    return apiFetch(`/categories/${id}`, {
      method: "DELETE",
    });
  },
};

// ============== ORDERS API ==============
export const ordersAPI = {
  getMyOrders: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`/orders/my-orders?${searchParams.toString()}`);
  },

  getById: async (id) => {
    return apiFetch(`/orders/${id}`);
  },

  create: async (orderData) => {
    return apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  cancel: async (id, reason) => {
    return apiFetch(`/orders/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  // Admin endpoints
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`/orders?${searchParams.toString()}`);
  },

  updateStatus: async (id, status, note) => {
    return apiFetch(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, note }),
    });
  },

  updatePaymentStatus: async (id, paymentStatus) => {
    return apiFetch(`/orders/${id}/payment-status`, {
      method: "PATCH",
      body: JSON.stringify({ paymentStatus }),
    });
  },

  addTracking: async (id, trackingNumber, shippingMethod) => {
    return apiFetch(`/orders/${id}/tracking`, {
      method: "POST",
      body: JSON.stringify({ trackingNumber, shippingMethod }),
    });
  },

  getStats: async () => {
    return apiFetch("/orders/stats");
  },

  confirmDelivery: async (id) => {
    return apiFetch(`/orders/${id}/confirm-delivery`, {
      method: "PATCH",
    });
  },
};

// ============== CART API ==============
export const cartAPI = {
  get: async () => {
    return apiFetch("/cart");
  },

  add: async (productId, quantity = 1) => {
    return apiFetch("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  },

  update: async (productId, quantity) => {
    return apiFetch(`/cart/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  },

  remove: async (productId) => {
    return apiFetch(`/cart/${productId}`, {
      method: "DELETE",
    });
  },

  clear: async () => {
    return apiFetch("/cart", {
      method: "DELETE",
    });
  },

  sync: async (items) => {
    return apiFetch("/cart/sync", {
      method: "POST",
      body: JSON.stringify({ items }),
    });
  },
};

// ============== REVIEWS API ==============
export const reviewsAPI = {
  getProductReviews: async (productId, params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`/reviews/product/${productId}?${searchParams.toString()}`);
  },

  create: async (reviewData) => {
    return apiFetch("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  },

  update: async (id, reviewData) => {
    return apiFetch(`/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    });
  },

  delete: async (id) => {
    return apiFetch(`/reviews/${id}`, {
      method: "DELETE",
    });
  },

  // Admin
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`/reviews?${searchParams.toString()}`);
  },

  approve: async (id) => {
    return apiFetch(`/reviews/${id}/approve`, {
      method: "PATCH",
    });
  },

  reject: async (id) => {
    return apiFetch(`/reviews/${id}/reject`, {
      method: "PATCH",
    });
  },
};

// ============== COUPONS API ==============
export const couponsAPI = {
  validate: async (code, orderTotal) => {
    return apiFetch("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, orderTotal }),
    });
  },

  // Admin
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`/coupons?${searchParams.toString()}`);
  },

  getById: async (id) => {
    return apiFetch(`/coupons/${id}`);
  },

  create: async (couponData) => {
    return apiFetch("/coupons", {
      method: "POST",
      body: JSON.stringify(couponData),
    });
  },

  update: async (id, couponData) => {
    return apiFetch(`/coupons/${id}`, {
      method: "PUT",
      body: JSON.stringify(couponData),
    });
  },

  delete: async (id) => {
    return apiFetch(`/coupons/${id}`, {
      method: "DELETE",
    });
  },
};

// ============== CONTACT API ==============
export const contactAPI = {
  send: async (messageData) => {
    return apiFetch("/contact", {
      method: "POST",
      body: JSON.stringify(messageData),
    });
  },

  // Admin
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`/contact?${searchParams.toString()}`);
  },

  getById: async (id) => {
    return apiFetch(`/contact/${id}`);
  },

  updateStatus: async (id, status) => {
    return apiFetch(`/contact/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  respond: async (id, response) => {
    return apiFetch(`/contact/${id}/respond`, {
      method: "POST",
      body: JSON.stringify({ response }),
    });
  },

  getStats: async () => {
    return apiFetch("/contact/stats");
  },
};

// ============== USERS API (Admin) ==============
export const usersAPI = {
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiFetch(`/users?${searchParams.toString()}`);
  },

  getById: async (id) => {
    return apiFetch(`/users/${id}`);
  },

  update: async (id, userData) => {
    return apiFetch(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(userData),
    });
  },

  toggleStatus: async (id) => {
    return apiFetch(`/users/${id}/status`, {
      method: "PATCH",
    });
  },

  delete: async (id) => {
    return apiFetch(`/users/${id}`, {
      method: "DELETE",
    });
  },

  getStats: async () => {
    return apiFetch("/users/stats");
  },

  // Address management
  getAddresses: async () => {
    return apiFetch("/users/addresses");
  },

  addAddress: async (addressData) => {
    return apiFetch("/users/addresses", {
      method: "POST",
      body: JSON.stringify(addressData),
    });
  },

  updateAddress: async (id, addressData) => {
    return apiFetch(`/users/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(addressData),
    });
  },

  deleteAddress: async (id) => {
    return apiFetch(`/users/addresses/${id}`, {
      method: "DELETE",
    });
  },
};

// ============== DASHBOARD API (Admin) ==============
export const dashboardAPI = {
  getStats: async () => {
    return apiFetch("/dashboard/stats");
  },

  getRevenue: async (period = "7days") => {
    return apiFetch(`/dashboard/revenue?period=${period}`);
  },

  getOrderStats: async () => {
    return apiFetch("/dashboard/orders");
  },

  getTopProducts: async (limit = 10) => {
    return apiFetch(`/dashboard/products/top?limit=${limit}`);
  },

  getLowStockProducts: async (limit = 10) => {
    return apiFetch(`/dashboard/products/low-stock?limit=${limit}`);
  },

  getCustomerStats: async () => {
    return apiFetch("/dashboard/customers");
  },

  getRecentOrders: async (limit = 10) => {
    return apiFetch(`/dashboard/recent-orders?limit=${limit}`);
  },

  getActivity: async (limit = 20) => {
    return apiFetch(`/dashboard/activity?limit=${limit}`);
  },
};

// ============== SETTINGS API ==============
export const settingsAPI = {
  getPublic: async () => {
    return apiFetch("/settings/public");
  },

  // Admin
  getAll: async () => {
    return apiFetch("/settings");
  },

  update: async (key, value, type) => {
    return apiFetch(`/settings/${key}`, {
      method: "PUT",
      body: JSON.stringify({ value, type }),
    });
  },

  bulkUpdate: async (settings) => {
    return apiFetch("/settings/bulk", {
      method: "POST",
      body: JSON.stringify({ settings }),
    });
  },
};

// ============== UPLOAD API ==============
export const uploadAPI = {
  image: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }
    return data;
  },

  images: async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/upload/images`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }
    return data;
  },

  delete: async (filename) => {
    return apiFetch(`/upload/${filename}`, {
      method: "DELETE",
    });
  },
};

// ============== CHAT API ==============
export const chatAPI = {
  getMessages: async (orderId) => {
    return apiFetch(`/chat/${orderId}`);
  },

  sendMessage: async (orderId, messageData) => {
    return apiFetch(`/chat/${orderId}`, {
      method: "POST",
      body: JSON.stringify(messageData),
    });
  },

  getAllChats: async () => {
    return apiFetch("/chat");
  },
};

// ============== COMMON/SEARCH API ==============
export const commonAPI = {
  globalSearch: async (q, limit = 5) => {
    return apiFetch(`/search?q=${encodeURIComponent(q)}&limit=${limit}`);
  },
};

// Default export
export default {
  auth: authAPI,
  products: productsAPI,
  categories: categoriesAPI,
  orders: ordersAPI,
  cart: cartAPI,
  reviews: reviewsAPI,
  coupons: couponsAPI,
  contact: contactAPI,
  users: usersAPI,
  dashboard: dashboardAPI,
  settings: settingsAPI,
  upload: uploadAPI,
  search: commonAPI,
  chat: chatAPI,
};
