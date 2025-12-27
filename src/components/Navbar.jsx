import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu as MenuIcon, Search, Monitor } from "lucide-react";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { Drawer, Menu, Badge, Button } from "antd";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const menuItems = [
    { key: "/", label: <Link to="/">Home</Link> },
    { key: "/products", label: <Link to="/products">Products</Link> },
    { key: "/about", label: <Link to="/about">About</Link> },
    { key: "/contact", label: <Link to="/contact">Contact</Link> },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4 group">
          <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/20">
            <Monitor className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:from-cyan-400 group-hover:to-blue-500 transition-all duration-300">
            Nashiecom Technologies
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" isActive={location.pathname === "/"}>
            Home
          </NavLink>
          <NavLink to="/products" isActive={location.pathname === "/products"}>
            Products
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
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white">
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
