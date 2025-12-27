import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/currency";
import { Space } from "antd";

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const images =
    product.images && product.images.length > 0
      ? product.images.map((img) => (typeof img === "object" ? img.url : img))
      : [product.image];
  const intervalRef = useRef(null);
  const isDiscounted = product.originalPrice > product.price;
  const discountPercentage = isDiscounted
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
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
    [images.length]
  );

  const goToPrevImage = useCallback(
    (e) => {
      e?.stopPropagation();
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
      restartAutoScroll();
    },
    [images.length]
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

      addToCart(product);
      setIsAdded(true);

      // Reset feedback after 2 seconds
      setTimeout(() => setIsAdded(false), 2000);
    },
    [addToCart, product]
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
          return <Star key={i} className="w-4 h-4 text-gray-700" />;
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => {
        setIsHovered(true);
        if (images.length > 1) stopAutoScroll();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (images.length > 1) startAutoScroll();
      }}
      className="group relative bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-gray-800 overflow-hidden hover:border-cyan-500/30 hover:shadow-[0_0_50px_rgba(6,182,212,0.15)] transition-all duration-500 h-full flex flex-col"
    >
      {/* Containerized Content Wrapper */}
      <div className="flex-1 flex flex-col p-6">
        {/* Image Carousel Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-900 to-black rounded-2xl mb-6 group/carousel">
          <Link to={`/products/${product.id}`} className="block w-full h-full">
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
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/80 transition-all opacity-0 group-hover/carousel:opacity-100 z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/80 transition-all opacity-0 group-hover/carousel:opacity-100 z-10"
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
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
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
          <button className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-xl text-white rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg border border-white/10 z-10">
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col gap-4 align-center justify-center">
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
            <h3 className="text-xl font-bold text-white text-center leading-tight group-hover/name:text-cyan-300 transition-colors duration-300 line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-relaxed text-center line-clamp-2 min-h-[40px]">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="flex items-center gap-1">
              {renderStars()}
              <span className="text-sm font-semibold text-white ml-2">
                {product.rating?.toFixed(1) || "0.0"}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviews?.length || product.reviews || 0})
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
              <span className="text-2xl font-bold text-white">
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
          <div className="mt-6 align-center pt-4 border-t border-gray-800">
            <div className="flex justify-center">
              <motion.button
                onClick={handleAddToCart}
                whileTap={{ scale: 0.95 }}
                disabled={isAdded}
                className={`w-[12.5rem] h-12 py-4 rounded-xl text-base font-semibold uppercase tracking-wider flex items-center justify-center align-center gap-3 relative overflow-hidden transition-all duration-300 ${
                  isAdded
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                }`}
              >
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />

                {isAdded ? (
                  <>
                    <Check className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Added to Cart</span>
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
    </motion.div>
  );
};

export default ProductCard;
