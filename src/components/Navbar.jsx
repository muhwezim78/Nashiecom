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
import {
  Badge,
  Button,
  Avatar,
  Dropdown,
  message,
  Drawer,
  Menu,
  Tooltip,
  Input,
  Card,
} from "antd";
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

  // Close mobile menu and search when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  // Handle global keyboard shortcuts (ESC to close, Ctrl+K to open)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const menuItems = [
    { key: "/", label: <Link to="/">Home</Link> },
    { key: "/products", label: <Link to="/products">Products</Link> },
    {
      key: "/my-orders",
      label: <Link to="/my-orders">My Orders</Link>,
      icon: <ShoppingCart size={16} />,
    },
    { key: "/about", label: <Link to="/about">About</Link> },
    { key: "/contact", label: <Link to="/contact">Contact</Link> },
    ...(user
      ? [
          {
            key: "/profile",
            label: <Link to="/profile">My Profile</Link>,
            icon: <User size={16} />,
          },
          {
            key: "logout",
            label: "Sign Out",
            icon: <LogOut size={16} />,
            danger: true,
            onClick: logout,
          },
        ]
      : [
          {
            key: "/login",
            label: <Link to="/login">Sign In</Link>,
            icon: <User size={16} />,
          },
        ]),
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
            <Tooltip
              title={
                currentTheme === "dark"
                  ? "Switch to Light Mode"
                  : "Switch to Dark Mode"
              }
            >
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-white/10 dark:hover:bg-white/10 rounded-full transition-all duration-300 text-gray-300 hover:text-white"
              >
                {currentTheme === "dark" ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </Tooltip>

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
              <Badge count={getCartCount()} offset={[0, 0]} color="#00d4ff">
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Badge>
            </Link>

            <Link
              to="/notifications"
              className="relative p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white group"
            >
              <Badge
                count={unreadCount}
                offset={[0, 0]}
                color="#f5222d"
                size="small"
              >
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Badge>
            </Link>

            {user ? (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "profile",
                      label: "My Profile",
                      icon: <User size={16} />,
                      onClick: () => navigate("/profile"),
                    },
                    {
                      key: "orders",
                      label: "My Orders",
                      icon: <ShoppingCart size={16} />,
                      onClick: () => navigate("/my-orders"),
                    },
                    { type: "divider" },
                    {
                      key: "logout",
                      label: "Sign Out",
                      icon: <LogOut size={16} />,
                      danger: true,
                      onClick: logout,
                    },
                  ],
                }}
                placement="bottomRight"
                arrow={{ pointAtCenter: true }}
              >
                <button className="flex items-center gap-2 p-1 pr-3 hover:bg-white/10 rounded-full transition-all group">
                  <Avatar
                    src={user.avatar}
                    className="border border-white/20 group-hover:border-cyan-500 transition-colors"
                  >
                    {user.firstName?.[0]}
                  </Avatar>
                  <span className="hidden lg:block text-sm font-bold text-gray-300 group-hover:text-white">
                    {user.firstName}
                  </span>
                </button>
              </Dropdown>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
              >
                <User size={16} />
                Join
              </Link>
            )}

            <Button
              type="text"
              className="md:hidden text-white hover:text-cyan-400"
              icon={<MenuIcon className="w-6 h-6" />}
              onClick={() => setIsMobileMenuOpen(true)}
            />
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <Drawer
          title="Menu"
          placement="right"
          onClose={() => setIsMobileMenuOpen(false)}
          open={isMobileMenuOpen}
          size="default"
          styles={{
            body: { padding: 0, backgroundColor: "var(--bg-secondary)" },
            header: {
              backgroundColor: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border-subtle)",
            },
            wrapper: { width: 280 },
          }}
        >
          <Menu
            mode="vertical"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="premium-menu"
            theme={currentTheme}
          />
        </Drawer>
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
            className="w-full max-w-3xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-none shadow-2xl overflow-hidden"
          >
            {/* Search Input Area */}
            <div className="mt-10 mx-6 md:mx-10 mb-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-[2rem] blur opacity-0 group-within:opacity-100 transition duration-500" />
                <Input
                  ref={inputRef}
                  prefix={
                    <Search className="text-cyan-500/50 group-within:text-cyan-400 w-5 h-5 mr-3 transition-colors" />
                  }
                  suffix={
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white hover:rotate-90"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  }
                  placeholder="Search products, categories, specs..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-[var(--bg-glass)] border-2 border-white/5 group-within:border-cyan-500/30 rounded-none py-4 px-6 text-[var(--text-primary)] placeholder-gray-500 focus:ring-0 shadow-2xl h-16 text-lg transition-all"
                  variant="borderless"
                />
              </div>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-6 custom-scrollbar">
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
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
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
                            <Card
                              hoverable
                              onClick={() =>
                                handleResultClick("category", cat.slug)
                              }
                              className="!bg-white/[0.03] hover:!bg-white/[0.08] !border-white/5 hover:!border-cyan-500/30 !rounded-2xl transition-all group backdrop-blur-sm"
                              styles={{
                                body: {
                                  padding: "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "16px",
                                },
                              }}
                              variant="borderless"
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
                              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors shrink-0 translate-x-0 group-hover:translate-x-1 transition-transform" />
                            </Card>
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
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
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
                            <Card
                              hoverable
                              onClick={() =>
                                handleResultClick("product", product.slug)
                              }
                              className="!bg-white/[0.03] hover:!bg-white/[0.08] !border-white/5 hover:!border-cyan-500/30 !rounded-2xl transition-all group backdrop-blur-sm"
                              styles={{
                                body: {
                                  padding: "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "16px",
                                },
                              }}
                              variant="borderless"
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
                                  <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/5 font-medium">
                                    {typeof product.category === "object"
                                      ? product.category.name
                                      : product.category}
                                  </span>
                                  <span className="text-sm font-semibold text-cyan-400">
                                    UGX {product.price.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors shrink-0 translate-x-0 group-hover:translate-x-1 transition-transform" />
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest px-8">
              <div className="flex gap-4">
                <span>ESC to close</span>
                <span>↑↓ to navigate</span>
                <span>ENTER to select</span>
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
      isActive ? "text-white" : "text-gray-400"
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
