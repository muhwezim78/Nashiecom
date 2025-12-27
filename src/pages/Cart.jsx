import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  ShoppingBag, 
  Shield, 
  Truck, 
  CreditCard,
  Lock,
  Gift
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/currency";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const subtotal = getCartTotal();
  const FREE_SHIPPING_THRESHOLD = 500000;
  const shippingFee = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : 25000;
  const tax = subtotal * 0.08;
  const total = subtotal + tax + shippingFee;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const EmptyCart = () => (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-gray-900 to-black">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 15 }}
        className="relative mb-12"
      >
        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-[60px] animate-pulse" />
        <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center border border-white/10 shadow-3xl">
          <ShoppingBag className="w-24 h-24 text-gray-500" />
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 border border-white/20"
          >
            <Plus className="w-8 h-8 text-white" />
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-md mx-auto space-y-6"
      >
        <h2 className="text-5xl font-black text-white tracking-tight">
          Your Cart is <span className="text-cyan-400">Empty</span>
        </h2>
        <p className="text-gray-400 text-xl leading-relaxed">
          Looks like you haven't discovered your next tech companion yet. Our latest collections are waiting for you.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 flex flex-col sm:flex-row gap-6"
      >
        <Link
          to="/products"
          className="group relative px-10 py-5 bg-cyan-600 text-white font-black rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 flex items-center gap-3">
            Start Exploring <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
        <Link
          to="/products?featured=true"
          className="px-10 py-5 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all duration-300"
        >
          View Trending
        </Link>
      </motion.div>
    </div>
  );

  const CartItem = ({ item }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      className="group relative bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-md rounded-[2.5rem] border border-white/5 hover:border-cyan-500/30 transition-all duration-500 overflow-hidden"
    >
      <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/[0.02] transition-colors duration-500" />
      
      <div className="p-8 flex flex-col md:flex-row gap-8 relative z-10">
        {/* Product Image */}
        <Link to={`/products/${item.id}`} className="shrink-0">
          <div className="relative w-40 h-40 rounded-3xl overflow-hidden bg-black/40 border border-white/5 group-hover:border-cyan-500/20 transition-colors">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black rounded-full uppercase tracking-[0.2em] border border-cyan-500/20">
                  {item.category}
                </span>
                {item.inStock && (
                  <span className="flex items-center gap-1.5 text-green-400/80 text-[10px] font-bold uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Ready to Ship
                  </span>
                )}
              </div>
              <Link to={`/products/${item.id}`}>
                <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2 tracking-tight">
                  {item.name}
                </h3>
              </Link>

              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-sm">
                      {i < Math.floor(item.rating) ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-bold tracking-widest">({item.rating})</span>
              </div>
            </div>

            <button
              onClick={() => removeFromCart(item.id)}
              className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all duration-300 border border-transparent hover:border-red-500/20"
              aria-label="Remove item"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mt-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1 bg-white/5 rounded-2xl border border-white/10 p-1.5 shadow-inner">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed group/btn"
                  disabled={item.quantity <= 1}
                >
                  <Minus className="w-5 h-5 group-active/btn:scale-75 transition-transform" />
                </button>
                <div className="w-12 text-center">
                  <span className="text-xl font-black text-white">
                    {item.quantity}
                  </span>
                </div>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all group/btn"
                >
                  <Plus className="w-5 h-5 group-active/btn:scale-125 transition-transform" />
                </button>
              </div>
              {item.quantity > 1 && (
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                  {formatCurrency(item.price)} <span className="text-gray-600 font-medium">ea.</span>
                </p>
              )}
            </div>

            <div className="text-right">
              <div className="space-y-1">
                {item.originalPrice > item.price && (
                  <p className="text-sm text-gray-500 line-through font-bold">
                    {formatCurrency(item.originalPrice * item.quantity)}
                  </p>
                )}
                <p className="text-3xl font-black text-white tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/5 border border-cyan-500/10 rounded-full"
            >
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">
                Secured Session
              </span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
              Shopping <span className="text-cyan-400">Bag</span>
            </h1>
            <div className="flex items-center gap-6 text-gray-400">
              <p className="text-lg">
                <span className="text-white font-black">{totalItems}</span> {totalItems === 1 ? 'item' : 'items'} selected
              </p>
              <div className="w-1 h-1 bg-gray-800 rounded-full" />
              <button
                onClick={clearCart}
                className="text-sm font-bold hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Empty Bag
              </button>
            </div>
          </div>

          <Link
            to="/products"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Keep Browsing
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content - Items */}
          <div className="lg:col-span-8 space-y-8">
            {/* Free Shipping Progress */}
            <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${shippingFee === 0 ? 'bg-green-500/10 text-green-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                      <Truck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white uppercase tracking-widest text-sm">
                      {shippingFee === 0 ? 'Free Shipping Unlocked!' : 'Free Shipping Goal'}
                    </h3>
                  </div>
                  <span className="text-sm font-black text-cyan-400">
                    {shippingFee === 0 ? '100%' : `${Math.round(shippingProgress)}%`}
                  </span>
                </div>
                
                <div className="h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgress}%` }}
                    className={`h-full rounded-full ${
                      shippingFee === 0 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    } shadow-[0_0_15px_rgba(6,182,212,0.4)]`}
                  />
                </div>
                
                {shippingFee > 0 ? (
                  <p className="text-sm text-gray-400">
                    Add <span className="text-white font-bold">{formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)}</span> more to qualify for free shipping.
                  </p>
                ) : (
                  <p className="text-sm text-green-400 font-bold uppercase tracking-wider">
                    🎉 Your order qualifies for premium free delivery!
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </AnimatePresence>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
              {[
                { icon: Shield, label: "Secure Payment", desc: "256-bit AES" },
                { icon: Truck, label: "Global Shipping", desc: "Express delivery" },
                { icon: Lock, label: "Privacy Policy", desc: "Data encrypted" },
                { icon: Gift, label: "Exclusive Offers", desc: "Members only" }
              ].map((badge, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-4 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all duration-300">
                  <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                    <badge.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1">{badge.label}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-24 space-y-6">
              <div className="relative group">
                {/* Glow Background */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000" />
                
                <div className="relative bg-[#12121a]/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                  <div className="p-10 space-y-8">
                    <h3 className="text-3xl font-black text-white tracking-tight pb-6 border-b border-white/5">
                      Order Overview
                    </h3>

                    <div className="space-y-6 text-lg">
                      <div className="flex justify-between items-center text-gray-400">
                        <span className="font-medium">Subtotal</span>
                        <span className="text-white font-bold">{formatCurrency(subtotal)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-gray-400">
                        <span className="font-medium">Shipping</span>
                        <span className={shippingFee === 0 ? "text-green-400 font-black uppercase tracking-widest text-sm" : "text-white font-bold"}>
                          {shippingFee === 0 ? "Complimentary" : formatCurrency(shippingFee)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-gray-400">
                        <span className="font-medium">GST (8%)</span>
                        <span className="text-white font-bold">{formatCurrency(tax)}</span>
                      </div>

                      {/* Promo Code */}
                      <div className="pt-4">
                        <div className="relative group/input">
                          <input
                            type="text"
                            placeholder="Promo Code"
                            className="w-full pl-6 pr-24 py-5 bg-white/5 border border-white/10 rounded-[1.5rem] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all"
                          />
                          <button className="absolute right-2 top-2 bottom-2 px-6 bg-white/5 text-cyan-400 font-black text-[10px] uppercase tracking-widest rounded-xl border border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all">
                            Apply
                          </button>
                        </div>
                      </div>

                      <div className="h-px bg-white/5 my-8" />
                      
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Final Total</span>
                          <p className="text-xl text-gray-500 font-medium">USD Equivalent: {(total / 3800).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                        </div>
                        <p className="text-5xl font-black text-white tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                          {formatCurrency(total)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6">
                      <Link
                        to="/checkout"
                        className="group relative w-full h-20 bg-cyan-600 rounded-[2rem] flex items-center justify-center gap-4 overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-2xl hover:shadow-cyan-500/25"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative z-10 text-xl font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                          Complete Checkout 
                          <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </span>
                      </Link>
                      
                      <div className="flex items-center justify-center gap-3 text-gray-500">
                        <Lock className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">SSL Encrypted Checkout</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Payments Badge */}
              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex flex-col gap-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] text-center mb-2">Partnered With</p>
                <div className="flex flex-wrap justify-center gap-6 opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                  {/* Mock Payment Logo Placeholders */}
                  {['Visa', 'Master', 'Paypal', 'MTN', 'Airtel'].map((p) => (
                    <span key={p} className="text-xs font-black text-white">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;