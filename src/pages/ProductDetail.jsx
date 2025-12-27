import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { products } from "../data/products";
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
import { message } from "antd";
import { formatCurrency } from "../utils/currency";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === parseInt(id));
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen grid place-items-center text-white">
        Product not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#12121a] relative group shadow-2xl"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>

            <div className="grid grid-cols-4 gap-4">
              {[product.image, product.image, product.image, product.image].map(
                (img, idx) => (
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
                )
              )}
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
                  {product.category}
                </span>
                {product.inStock ? (
                  <span className="flex items-center gap-1 text-green-400 text-sm font-medium">
                    <Check className="w-4 h-4" /> In Stock
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400 text-sm font-medium">
                    Out of Stock
                  </span>
                )}
              </motion.div>

              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-current"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-400">{product.reviews} reviews</span>
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
            <div className="py-2">
              <h3 className="font-semibold text-white mb-6 text-lg">
                Technical Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {product.specs &&
                  Object.entries(product.specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-[#12121a] rounded-[2rem] p-6 border border-white/5 hover:border-cyan-500/30 transition-all duration-500 shadow-lg"
                    >
                      <span className="block text-[10px] text-gray-400 uppercase mb-2 tracking-[0.2em] font-bold">
                        {key}
                      </span>
                      <span className="block text-white font-bold text-lg">
                        {value}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <div className="flex items-center bg-white/5 rounded-xl border border-white/10 w-fit p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-4 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-16 text-center text-white font-medium text-xl">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-4 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => {
                  addToCart(product, quantity);
                  message.success(
                    `Added ${quantity} x ${product.name} to cart`
                  );
                }}
                className="btn btn-primary flex-1 text-lg font-semibold tracking-wide py-4 rounded-xl"
              >
                <ShoppingCart className="w-6 h-6 mr-2" />
                Add to Cart
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6">
              <div className="flex flex-col items-center text-center gap-3 p-6 rounded-[2rem] bg-[#12121a] border border-white/5 shadow-xl">
                <div className="p-3 bg-cyan-500/10 rounded-xl">
                  <Truck className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Free Shipping
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-3 p-6 rounded-[2rem] bg-[#12121a] border border-white/5 shadow-xl">
                <div className="p-3 bg-cyan-500/10 rounded-xl">
                  <Shield className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  2 Year Warranty
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-3 p-6 rounded-[2rem] bg-[#12121a] border border-white/5 shadow-xl">
                <div className="p-3 bg-cyan-500/10 rounded-xl">
                  <RotateCcw className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  30 Day Returns
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
