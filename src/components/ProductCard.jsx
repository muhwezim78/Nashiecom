import { useRef, useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ShoppingCart,
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/currency";
import { Space, message, Card } from "antd";

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const cardRef = useRef(null);

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (images.length > 1) startAutoScroll();
    x.set(0);
    y.set(0);
  };
  const images =
    product.images && product.images.length > 0
      ? product.images.map((img) => (typeof img === "object" ? img.url : img))
      : [product.image];
  const intervalRef = useRef(null);
  const isDiscounted = product.originalPrice > product.price;
  const discountPercentage = isDiscounted
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  // Auto-scroll with pause on hover
  const startAutoScroll = useCallback(() => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
  }, [images.length]);

  const stopAutoScroll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [startAutoScroll, stopAutoScroll]);

  // Handle image navigation
  const goToNextImage = useCallback(
    (e) => {
      e?.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
      restartAutoScroll();
    },
    [images.length],
  );

  const goToPrevImage = useCallback(
    (e) => {
      e?.stopPropagation();
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length,
      );
      restartAutoScroll();
    },
    [images.length],
  );

  const restartAutoScroll = useCallback(() => {
    stopAutoScroll();
    startAutoScroll();
  }, [startAutoScroll, stopAutoScroll]);

  // Handle add to cart with feedback
  const handleAddToCart = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        messageApi.info("Please login or sign up to add items to your cart");
        navigate("/login", { state: { from: location.pathname } });
        return;
      }

      addToCart(product);
      setIsAdded(true);

      // Reset feedback after 2 seconds
      setTimeout(() => setIsAdded(false), 2000);
    },
    [addToCart, product, user, navigate, location],
  );

  // Handle image click for mobile
  const handleImageClick = useCallback(() => {
    if (images.length > 1) {
      goToNextImage();
    }
  }, [goToNextImage, images.length]);

  // Star rating component
  const renderStars = () => {
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            );
          } else if (i === fullStars && hasHalfStar) {
            return (
              <div key={i} className="relative">
                <Star className="w-4 h-4 text-gray-700" />
                <Star
                  className="w-4 h-4 fill-amber-400 text-amber-400 absolute inset-0 overflow-hidden"
                  style={{ clipPath: "inset(0 50% 0 0)" }}
                />
              </div>
            );
          }
          return (
            <Star
              key={i}
              className="w-4 h-4 text-[var(--text-muted)] opacity-20"
            />
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovered(true);
        if (images.length > 1) stopAutoScroll();
      }}
      onMouseLeave={handleMouseLeave}
      className="h-full"
    >
      {contextHolder}

      <Card
        variant="borderless"
        className="group relative h-full !bg-[var(--bg-card-gradient)] !border-[var(--border-main)] hover:!border-cyan-500/30 transition-all duration-500 overflow-hidden rounded-3xl"
        styles={{
          body: {
            padding: "1rem",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Reactive Glow Effect */}
        <motion.div
          style={{
            background: useTransform(
              [mouseXSpring, mouseYSpring],
              ([x, y]) =>
                `radial-gradient(600px circle at ${50 + x * 100}% ${50 + y * 100}%, rgba(0, 212, 255, 0.08), transparent)`,
            ),
          }}
          className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        />

        {/* Content */}
        <div
          className="relative z-10 flex-1 flex flex-col"
          style={{ transform: "translateZ(20px)" }}
        >
          {/* Image Carousel Container */}
          <div
            className="relative aspect-square overflow-hidden bg-[var(--bg-secondary)] rounded-2xl mb-4 group/carousel shadow-2xl"
            style={{ transform: "translateZ(30px)" }}
          >
            <Link
              to={`/products/${product.id}`}
              className="block w-full h-full"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={`${product.name} - ${currentImageIndex + 1}`}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={handleImageClick}
                />
              </AnimatePresence>
            </Link>

            {/* Image Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/80 transition-all opacity-0 group-hover/carousel:opacity-100 z-10 border-0 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goToNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/80 transition-all opacity-0 group-hover/carousel:opacity-100 z-10 border-0 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Carousel Indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                      restartAutoScroll();
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer border-0 p-0 ${
                      currentImageIndex === idx
                        ? "w-6 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                        : "w-1.5 bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {product.featured && (
                <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-lg">
                  Featured
                </span>
              )}
              {isDiscounted && (
                <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-full shadow-lg">
                  -{discountPercentage}%
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-xl text-[var(--text-primary)] rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg border border-[var(--border-subtle)] z-10 cursor-pointer">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Product Info */}
          <div className="flex-1 flex flex-col gap-3 align-center justify-center">
            {/* Category */}
            <div className="flex justify-center align-center">
              <span className="inline-block text-xs font-bold tracking-wider text-cyan-400 uppercase px-3 py-1.5 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                {product.category?.name ||
                  (typeof product.category === "string"
                    ? product.category
                    : "Product")}
              </span>
            </div>

            {/* Product Name */}
            <Link to={`/products/${product.id}`} className="block group/name">
              <h3 className="text-xl font-bold text-[var(--text-primary)] text-center leading-tight group-hover/name:text-cyan-300 transition-colors duration-300 line-clamp-2">
                {product.name}
              </h3>
            </Link>

            {/* Description */}
            <p className="text-gray-400 text-sm leading-relaxed text-center line-clamp-2 min-h-[40px] mb-0">
              {product.description}
            </p>

            {/* Rating */}
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="flex items-center gap-1">
                {renderStars()}
                <span className="text-sm font-semibold text-[var(--text-primary)] ml-2">
                  {product.rating?.toFixed(1) || "0.0"}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                ({product.reviewCount || 0})
              </span>
            </div>

            {/* Price */}
            <div className="flex flex-col items-center gap-1 mt-2">
              {isDiscounted && (
                <span className="text-sm text-gray-500 line-through font-medium">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[var(--text-primary)]">
                  {formatCurrency(product.price)}
                </span>
                {isDiscounted && (
                  <span className="text-sm font-bold text-green-400">
                    Save {formatCurrency(product.originalPrice - product.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="mt-4 align-center pt-3 border-t border-[var(--border-subtle)]">
              <div className="flex justify-center">
                <motion.button
                  onClick={handleAddToCart}
                  whileTap={{ scale: 0.95 }}
                  disabled={
                    isAdded || !product.inStock || product.quantity <= 0
                  }
                  className={`w-[12.5rem] h-12 py-4 rounded-xl text-base font-semibold uppercase tracking-wider flex items-center justify-center align-center gap-3 relative overflow-hidden transition-all duration-300 border-0 cursor-pointer ${
                    isAdded
                      ? "bg-green-600 hover:bg-green-700"
                      : !product.inStock || product.quantity <= 0
                        ? "bg-gray-700 cursor-not-allowed opacity-60"
                        : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                  }`}
                >
                  <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />

                  {isAdded ? (
                    <>
                      <Check className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Added to Cart</span>
                    </>
                  ) : !product.inStock || product.quantity <= 0 ? (
                    <>
                      <ShoppingCart className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Out of Stock</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">
                        {isInCart?.(product.id) ? "Add More" : "Add to Cart"}
                      </span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Quick View */}
              <Link
                to={`/products/${product.id}`}
                className="block w-full h-8 mt-3 py-3 text-center text-lg font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Quick View
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
