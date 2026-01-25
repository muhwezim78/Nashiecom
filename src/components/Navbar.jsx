import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Menu as MenuIcon,
  Search,
  Monitor,
  X,
  Loader2,
  ExternalLink,
  ChevronRight,
  Package,
  Layers,
  Bell,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useNotification } from "../context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import { Drawer, Menu, Badge, Button, Input } from "antd";
import api from "../services/api";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { getCartCount } = useCart();
  const { unreadCount, clearNotifications } = useNotification();
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

  // Handle ESC key to close search
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const menuItems = [
    { key: "/", label: <Link to="/">Home</Link> },
    { key: "/products", label: <Link to="/products">Products</Link> },
    { key: "/my-orders", label: <Link to="/my-orders">My Orders</Link> },
    { key: "/about", label: <Link to="/about">About</Link> },
    { key: "/contact", label: <Link to="/contact">Contact</Link> },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
          ? "bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10 shadow-lg"
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
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white"
            >
              <Search className="w-5 h-5" />
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
            body: { padding: 0, backgroundColor: "#12121a" },
            header: {
              backgroundColor: "#12121a",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            },
            wrapper: { width: 280 },
          }}
        >
          <Menu
            mode="vertical"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ backgroundColor: "transparent", border: "none" }}
            theme="dark"
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
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-[#0a0a0f]/80 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            className="w-full max-w-3xl bg-[#12121a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Search Input Area */}
            <div className="mt-10 ms-10 me-10 mb-6">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products, categories, specs..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-14 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-lg shadow-inner"
                />
                <button
                  onClick={onClose}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
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
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                        <Layers className="w-3 h-3" /> Categories
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {results.categories.map((cat) => (
                          <div
                            key={cat.id}
                            onClick={() =>
                              handleResultClick("category", cat.slug)
                            }
                            className="group flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 cursor-pointer transition-all"
                          >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
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
                            <div className="flex-1">
                              <h4 className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                                {cat.name}
                              </h4>
                              <p className="text-xs text-gray-400">
                                {cat.productCount} Products
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products Results */}
                  {results.products.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                        <Package className="w-3 h-3" /> Products
                      </h3>
                      <div className="space-y-3">
                        {results.products.map((product) => (
                          <div
                            key={product.id}
                            onClick={() =>
                              handleResultClick("product", product.slug)
                            }
                            className="group flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 cursor-pointer transition-all"
                          >
                            <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
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
                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
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
    className={`relative text-sm font-medium transition-colors hover:text-cyan-400 ${isActive ? "text-white" : "text-gray-400"
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
