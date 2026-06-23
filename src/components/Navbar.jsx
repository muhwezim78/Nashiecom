import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Menu as MenuIcon,
  Search,
  Monitor,
  X,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  Bell,
  Loader2,
  Package,
  Layers,
  ChevronRight,
} from "lucide-react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const { user, logout, isAdmin } = useAuth();
  const { cartItems, getCartCount } = useCart();
  const { unreadCount } = useNotification();
  const { theme: currentTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  // Handle global keyboard shortcuts (ESC to close, Ctrl+K to open)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsUserMenuOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isUserMenuOpen && !e.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  const menuItems = [
    { key: "/", label: "Home" },
    { key: "/products", label: "Products" },
    { key: "/my-orders", label: "My Orders", icon: <ShoppingCart size={16} /> },
    { key: "/about", label: "About" },
    { key: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo with Magnetic Effect */}
          <Link to="/" className="flex items-center gap-4 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-12 h-12 flex items-center justify-center transition-all duration-300 shadow-lg shadow-cyan-500/20"
            >
              <img
                src="/nashiecom.jpeg"
                alt="Nashiecom Logo"
                className="w-full h-full object-contain"
              />
            </motion.div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400 group-hover:from-cyan-400 group-hover:to-blue-500 transition-all duration-300 tracking-tight">
              Nashiecom Technologies
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" isActive={location.pathname === "/"}>
              Home
            </NavLink>
            <NavLink
              to="/products"
              isActive={location.pathname === "/products"}
            >
              Products
            </NavLink>
            <NavLink
              to="/my-orders"
              isActive={location.pathname === "/my-orders"}
            >
              My Orders
            </NavLink>
            <NavLink to="/about" isActive={location.pathname === "/about"}>
              About
            </NavLink>
            <NavLink to="/contact" isActive={location.pathname === "/contact"}>
              Contact
            </NavLink>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-white/10 dark:hover:bg-white/10 rounded-full transition-all duration-300 text-gray-300 hover:text-white"
              title={currentTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {currentTheme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-400" />
              )}
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="group p-2 hover:bg-white/10 rounded-full transition-all text-gray-300 hover:text-white relative"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-40 transition-opacity">
                Ctrl K
              </span>
            </button>

            <Link
              to="/cart"
              className="relative p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white group"
            >
              {getCartCount() > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full transform translate-x-1/4 -translate-y-1/4 z-10 border border-[var(--bg-primary)]">
                  {getCartCount()}
                </span>
              )}
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>

            <Link
              to="/notifications"
              className="relative p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white group"
            >
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full transform translate-x-1/4 -translate-y-1/4 z-10 border border-[var(--bg-primary)]">
                  {unreadCount}
                </span>
              )}
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>

            {user ? (
              <div className="relative user-menu-container">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pr-3 hover:bg-white/10 rounded-full transition-all group"
                >
                  {user.avatar ? (
                    <img src={user.avatar} className="w-8 h-8 rounded-full object-cover border border-white/20 group-hover:border-cyan-500 transition-colors" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-sm font-bold border border-white/20 group-hover:border-cyan-500 transition-colors">
                      {user.firstName?.[0]}
                    </div>
                  )}
                  <span className="hidden lg:block text-sm font-bold text-gray-300 group-hover:text-white">
                    {user.firstName}
                  </span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl shadow-2xl py-2 z-50 origin-top-right"
                    >
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-glass)] transition-colors">
                        <User size={16} className="text-[var(--text-muted)]" /> My Profile
                      </Link>
                      <Link to="/my-orders" className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-glass)] transition-colors">
                        <ShoppingCart size={16} className="text-[var(--text-muted)]" /> My Orders
                      </Link>
                      <div className="my-2 h-px bg-[var(--border-subtle)]" />
                      <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left">
                        <LogOut size={16} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
              >
                <User size={16} />
                Join
              </Link>
            )}

            <button
              className="md:hidden text-white hover:text-cyan-400 p-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed inset-y-0 right-0 w-72 bg-[var(--bg-secondary)] border-l border-[var(--border-subtle)] shadow-2xl z-50 md:hidden flex flex-col"
              >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-glass)]">
                  <span className="font-bold text-[var(--text-primary)] text-lg">Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[var(--text-muted)] hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                  <div className="flex flex-col px-4 gap-2">
                    {menuItems.map(item => (
                      <Link
                        key={item.key}
                        to={item.key}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                          location.pathname === item.key 
                            ? "bg-cyan-500/10 text-cyan-400 font-medium border border-cyan-500/20" 
                            : "text-[var(--text-primary)] hover:bg-[var(--bg-glass)]"
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ))}
                    
                    {!user && (
                      <Link
                        to="/login"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-[var(--text-primary)] hover:bg-[var(--bg-glass)] mt-2"
                      >
                        <User size={16} /> Sign In
                      </Link>
                    )}
                  </div>
                </div>
                {user && (
                  <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-glass)]">
                    <div className="flex items-center gap-3 mb-4">
                      {user.avatar ? (
                        <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border border-white/20" alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold">
                          {user.firstName?.[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[var(--text-primary)] truncate">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-[var(--text-muted)] truncate">{user.email}</div>
                      </div>
                    </div>
                    <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors font-medium text-sm">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ products: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      setQuery("");
      setResults({ products: [], categories: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const res = await api.search.globalSearch(query);
          if (res.success) {
            setResults(res.data);
          }
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults({ products: [], categories: [] });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (type, slugOrId) => {
    onClose();
    if (type === "product") {
      navigate(`/products/${slugOrId}`);
    } else if (type === "category") {
      navigate(`/products?category=${slugOrId}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-[var(--bg-primary)]/80 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            className="w-full max-w-3xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Search Input Area */}
            <div className="p-6 border-b border-[var(--border-subtle)] shrink-0">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-[2rem] blur opacity-0 group-within:opacity-100 transition duration-500" />
                <div className="relative flex items-center w-full bg-[var(--bg-glass)] border-2 border-white/5 group-within:border-cyan-500/30 rounded-2xl px-4 text-[var(--text-primary)] shadow-inner transition-all h-16">
                  <Search className="text-cyan-500/50 group-within:text-cyan-400 w-6 h-6 mr-3 shrink-0 transition-colors" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search products, categories, specs..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder-gray-500 h-full w-full"
                  />
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white hover:rotate-90 shrink-0 ml-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Area */}
            <div className="overflow-y-auto p-6 flex-1 scrollbar-hide">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                  <p>Searching Nashiecom global index...</p>
                </div>
              ) : query.length < 2 ? (
                <div className="text-center py-20 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">Start typing to search everything</p>
                  <p className="text-sm">
                    Quickly find products and categories
                  </p>
                </div>
              ) : results.products.length === 0 &&
                results.categories.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">No results found for "{query}"</p>
                  <p className="text-sm">Try searching for something else</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Categories Results */}
                  {results.categories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4 flex items-center gap-2">
                        <Layers className="w-3 h-3" /> Categories
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {results.categories.map((cat, idx) => (
                          <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <div
                              onClick={() => handleResultClick("category", cat.slug)}
                              className="bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-cyan-500/30 rounded-2xl transition-all group backdrop-blur-sm p-3 flex items-center gap-4 cursor-pointer"
                            >
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-white/10 shrink-0">
                                {cat.image ? (
                                  <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-full h-full object-cover rounded-xl"
                                  />
                                ) : (
                                  <Layers className="w-6 h-6 text-cyan-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium group-hover:text-cyan-400 transition-colors truncate">
                                  {cat.name}
                                </h4>
                                <p className="text-xs text-gray-400">
                                  {cat.productCount} Products
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors shrink-0 translate-x-0 group-hover:translate-x-1" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Products Results */}
                  {results.products.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4 flex items-center gap-2">
                        <Package className="w-3 h-3" /> Products
                      </h3>
                      <div className="space-y-3">
                        {results.products.map((product, idx) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 + 0.1 }}
                          >
                            <div
                              onClick={() => handleResultClick("product", product.slug)}
                              className="bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-cyan-500/30 rounded-2xl transition-all group backdrop-blur-sm p-3 flex items-center gap-4 cursor-pointer"
                            >
                              <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                ) : (
                                  <Package className="w-8 h-8 text-gray-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium truncate group-hover:text-cyan-400 transition-colors">
                                  {product.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-[var(--text-secondary)] border border-white/5 font-medium">
                                    {typeof product.category === "object"
                                      ? product.category.name
                                      : product.category}
                                  </span>
                                  <span className="text-sm font-semibold text-cyan-400">
                                    UGX {product.price.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors shrink-0 translate-x-0 group-hover:translate-x-1" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[var(--bg-glass)] border-t border-[var(--border-subtle)] flex justify-between items-center text-[10px] text-[var(--text-muted)] uppercase tracking-widest shrink-0 hidden sm:flex">
              <div className="flex gap-4">
                <span>ESC to close</span>
                <span>Type to search</span>
              </div>
              <div className="flex items-center gap-1">
                Powered by Nashiecom Core
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const NavLink = ({ to, children, isActive }) => (
  <Link
    to={to}
    className={`relative text-sm font-medium transition-colors hover:text-cyan-400 ${
      isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
    }`}
  >
    {children}
    {isActive && (
      <motion.div
        layoutId="activeNav"
        className="absolute -bottom-8 left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] rounded-t-full"
      />
    )}
  </Link>
);

export default Navbar;
