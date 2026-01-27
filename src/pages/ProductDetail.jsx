import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useProduct } from "../hooks/useProducts";
import {
  Star,
  Truck,
  Shield,
  RotateCcw,
  ShoppingCart,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { message, Spin, Card, Rate } from "antd";
import { formatCurrency } from "../utils/currency";
import Reviews from "../components/Reviews";
import SEO from "../components/SEO";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const { data: productData, isLoading: loading, isError } = useProduct(id);
  const product = productData?.data?.product;
  const error = isError ? "Product not found or failed to load." : null;

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen grid place-items-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        {error || "Product not found"}
      </div>
    );
  }

  // Handle images - if product has images array use it, else fallback to single image repeated or formatted
  // The API response might normalize this, but let's assume standard object
  const images =
    product.images && product.images.length > 0
      ? product.images.map((img) => (typeof img === "object" ? img.url : img))
      : [product.image];
  // Ensure we have 4 images for the grid if possible, or repeat
  const displayImages =
    images.length >= 4
      ? images.slice(0, 4)
      : [...images, ...Array(4 - images.length).fill(images[0])];
  const mainImage = images[activeImage] || product.image;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-20">
      <SEO
        title={product.name}
        description={product.description?.substring(0, 160)}
        image={mainImage}
        url={`/products/${id}`}
        schema={{
          "@context": "https://schema.org/",
          "@type": "Product",
          name: product.name,
          image: images,
          description: product.description,
          brand: {
            "@type": "Brand",
            name: "Nashiecom",
          },
          offers: {
            "@type": "Offer",
            url: `https://nashiecom-technologies.web.app/products/${id}`,
            priceCurrency: "UGX",
            price: product.price,
            availability: product.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
          aggregateRating:
            product.reviewCount > 0
              ? {
                  "@type": "AggregateRating",
                  ratingValue: product.rating,
                  reviewCount: product.reviewCount,
                }
              : undefined,
        }}
      />
      {contextHolder}
      <div className="container mx-auto px-4 pt-[var(--navbar-clearance)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-xl)] mb-[var(--space-2xl)]">
          {/* Images */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)] relative group shadow-2xl"
            >
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>

            <div className="grid grid-cols-4 gap-4">
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === idx
                      ? "border-cyan-500"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-4"
              >
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-sm font-medium border border-cyan-500/20">
                  {product.category?.name || product.category || "Product"}
                </span>
                {product.featured && (
                  <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 rounded-full text-sm font-bold border border-amber-500/30">
                    FEATURED
                  </span>
                )}
                {product.inStock && product.quantity > 0 ? (
                  <span className="flex items-center gap-1 text-green-400 text-sm font-medium">
                    <Check className="w-4 h-4" /> In Stock ({product.quantity})
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400 text-sm font-medium">
                    Out of Stock
                  </span>
                )}
              </motion.div>

              <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Rate
                    disabled
                    allowHalf
                    defaultValue={parseFloat(product.rating || 0)}
                    className="custom-rate-small"
                  />
                  <span className="text-gray-400 font-bold ml-2">
                    {product.reviewCount || 0} reviews
                  </span>
                </div>
              </div>

              <div className="flex items-end gap-4 mb-8">
                <span className="text-5xl font-bold text-cyan-400 tracking-tight">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-2xl text-gray-500 line-through mb-1.5">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>

              <p className="text-gray-300 leading-loose text-lg mb-8">
                {product.description}
              </p>
            </div>

            <div className="h-px bg-white/10" />

            {/* Specs */}
            {product.specs && (
              <div className="py-2">
                <h3 className="font-semibold text-[var(--text-primary)] mb-6 text-lg">
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Array.isArray(product.specs)
                    ? product.specs.map((spec, index) => (
                        <Card
                          key={spec.id || index}
                          className="!bg-[var(--bg-secondary)] !rounded-2xl !border-[var(--border-subtle)] hover:!border-cyan-500/30 transition-all duration-500 shadow-lg !border"
                          styles={{ body: { padding: "1.5rem" } }}
                        >
                          <span className="block text-[10px] text-gray-400 uppercase mb-2 tracking-[0.2em] font-bold">
                            {spec.name}
                          </span>
                          <span className="block text-[var(--text-primary)] font-bold text-lg">
                            {spec.value}
                          </span>
                        </Card>
                      ))
                    : typeof product.specs === "object"
                      ? Object.entries(product.specs).map(([key, value]) => (
                          <Card
                            key={key}
                            variant="borderless"
                            className="!bg-[var(--bg-glass)] !border-[var(--border-subtle)] !rounded-2xl !border-[var(--border-subtle)] hover:!border-cyan-500/30 transition-all duration-500 shadow-lg !border"
                            styles={{ body: { padding: "1.5rem" } }}
                          >
                            <span className="block text-[10px] text-gray-400 uppercase mb-2 tracking-[0.2em] font-bold">
                              {key}
                            </span>
                            <span className="block text-[var(--text-primary)] font-bold text-lg">
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : value}
                            </span>
                          </Card>
                        ))
                      : null}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <div className="flex items-center bg-[var(--bg-glass)] rounded-xl border border-[var(--border-subtle)] w-fit p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-glass)] rounded-lg"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-16 text-center text-[var(--text-primary)] font-medium text-xl">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(q + 1, product.quantity || 100))
                  }
                  className="p-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-glass)] rounded-lg"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => {
                  if (!user) {
                    messageApi.info("Please login to add to cart");
                    navigate("/login", { state: { from: location.pathname } });
                    return;
                  }
                  addToCart(product, quantity);
                  messageApi.success(
                    `Added ${quantity} x ${product.name} to cart`,
                  );
                }}
                disabled={!product.inStock || product.quantity <= 0}
                className={`btn btn-primary flex-1 text-lg font-semibold tracking-wide py-4 rounded-xl ${
                  !product.inStock || product.quantity <= 0
                    ? "opacity-50 cursor-not-allowed grayscale bg-gray-800"
                    : ""
                }`}
              >
                <ShoppingCart className="w-6 h-6 mr-2" />
                {!product.inStock || product.quantity <= 0
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6">
              {[
                { icon: Truck, label: "Free Shipping" },
                { icon: Shield, label: "2 Year Warranty" },
                { icon: RotateCcw, label: "30 Day Returns" },
              ].map((badge, i) => (
                <Card
                  key={i}
                  variant="borderless"
                  className="!bg-[var(--bg-glass)] !border-[var(--border-subtle)] !rounded-3xl shadow-xl overflow-hidden"
                  styles={{
                    body: {
                      padding: "1.5rem",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: "0.75rem",
                    },
                  }}
                >
                  <div className="p-3 bg-cyan-500/10 rounded-xl">
                    <badge.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {badge.label}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <Reviews productId={product.id} />
      </div>
    </div>
  );
};

export default ProductDetail;
