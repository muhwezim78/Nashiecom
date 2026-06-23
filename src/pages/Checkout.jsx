import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import {
  CheckCircle,
  CreditCard,
  Truck,
  MapPin,
  Loader2,
  Smartphone,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/currency";
import { ordersAPI } from "../services/api";

import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Steps } from "../components/ui/Steps";
import { message } from "../utils/toast";

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [current, setCurrent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
    address: "",
    zip: "",
    paymentMethod: "CREDIT_CARD",
    cardNumber: "",
    expiry: "",
    cvc: "",
    momoNetwork: "",
    momoNumber: ""
  });

  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setCurrent(1);
  };

  const onFinish = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderData = {
        idempotencyKey,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          addressLine1: formData.address,
          city: formData.city,
          postalCode: formData.zip || "0000",
          phone: formData.phone,
        },
        paymentMethod: formData.paymentMethod || "CREDIT_CARD",
        paymentDetails:
          formData.paymentMethod === "MOBILE_MONEY"
            ? {
                network: formData.momoNetwork,
                phoneNumber: formData.momoNumber,
              }
            : undefined,
      };

      await ordersAPI.create(orderData);

      setIsCompleted(true);
      clearCart();
      message.success("Order placed successfully!");
    } catch (error) {
      console.error("Checkout failed:", error);
      message.error(error.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: "Shipping", icon: <Truck className="w-5 h-5" /> },
    { title: "Payment", icon: <CreditCard className="w-5 h-5" /> },
    { title: "Confirm", icon: <CheckCircle className="w-5 h-5" /> },
  ];

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-xl"
        >
          <Card className="bg-[var(--bg-glass)] text-center rounded-2xl p-12 border-0 shadow-2xl">
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              Order Confirmed!
            </h2>
            <p className="text-[var(--text-muted)] mb-8">
              Thank you for your purchase. We've received your order and are
              processing it. You can track your order in the "My Orders"
              section.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/my-orders" className="flex-1">
                <Button className="w-full py-3">View My Orders</Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full py-3">
                  Back to Home
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen grid place-items-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Link to="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-12 pt-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <Steps current={current} items={steps} />
            </div>

            <Card className="bg-[var(--bg-secondary)] border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {current === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                      <MapPin className="text-cyan-400" /> Shipping Information
                    </h3>
                    <form onSubmit={handleShippingSubmit} className="flex flex-col gap-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-[var(--text-primary)] font-medium">First Name</label>
                          <Input
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="John"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-[var(--text-primary)] font-medium">Last Name</label>
                          <Input
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Doe"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-[var(--text-primary)] font-medium">Phone Number</label>
                          <Input
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+256..."
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-[var(--text-primary)] font-medium">City</label>
                          <Input
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Kampala"
                          />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                          <label className="text-sm text-[var(--text-primary)] font-medium">Address</label>
                          <Input
                            name="address"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Street, Plot, House #"
                          />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                          <label className="text-sm text-[var(--text-primary)] font-medium">ZIP Code / Landmark (Optional)</label>
                          <Input
                            name="zip"
                            value={formData.zip}
                            onChange={handleChange}
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 py-4 rounded-xl text-base font-bold shadow-lg shadow-cyan-500/20"
                      >
                        Continue to Payment
                      </Button>
                    </form>
                  </motion.div>
                )}

                {current === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                      <CreditCard className="text-cyan-400" /> Payment Details
                    </h3>

                    <form onSubmit={onFinish} className="flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm text-[var(--text-primary)] font-medium mb-2">Payment Method</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { value: "CREDIT_CARD", label: "Credit Card", icon: CreditCard },
                            { value: "COD", label: "Pay on Delivery", icon: Truck },
                            { value: "MOBILE_MONEY", label: "Mobile Money", icon: Smartphone }
                          ].map((method) => {
                            const Icon = method.icon;
                            return (
                              <button
                                key={method.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, paymentMethod: method.value })}
                                className={`h-14 flex items-center justify-center gap-2 rounded-xl border transition-all ${
                                  formData.paymentMethod === method.value
                                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                                    : "bg-[var(--bg-glass)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-main)] hover:text-[var(--text-primary)]"
                                }`}
                              >
                                <Icon size={18} />
                                <span className="font-semibold text-sm">{method.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <AnimatePresence mode="popLayout">
                        {formData.paymentMethod === "CREDIT_CARD" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-col gap-4 overflow-hidden"
                          >
                            <div className="flex flex-col gap-2">
                              <label className="text-sm text-[var(--text-primary)] font-medium">Card Number</label>
                              <Input
                                name="cardNumber"
                                required
                                value={formData.cardNumber}
                                onChange={handleChange}
                                placeholder="0000 0000 0000 0000"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col gap-2">
                                <label className="text-sm text-[var(--text-primary)] font-medium">Expiry Date</label>
                                <Input
                                  name="expiry"
                                  required
                                  value={formData.expiry}
                                  onChange={handleChange}
                                  placeholder="MM/YY"
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="text-sm text-[var(--text-primary)] font-medium">CVC</label>
                                <Input
                                  name="cvc"
                                  required
                                  value={formData.cvc}
                                  onChange={handleChange}
                                  placeholder="123"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {formData.paymentMethod === "MOBILE_MONEY" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-col gap-4 overflow-hidden"
                          >
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-3 text-yellow-200">
                              <AlertCircle className="shrink-0 w-5 h-5 text-yellow-400" />
                              <p className="text-sm">
                                You will receive a prompt on your phone to approve
                                the payment. Please ensure your phone is on and
                                unlocked.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-2">
                                <label className="text-sm text-[var(--text-primary)] font-medium">Network</label>
                                <div className="grid grid-cols-2 gap-2">
                                  {["MTN", "AIRTEL"].map((network) => (
                                    <button
                                      key={network}
                                      type="button"
                                      onClick={() => setFormData({ ...formData, momoNetwork: network })}
                                      className={`h-12 rounded-lg border font-bold transition-all ${
                                        formData.momoNetwork === network
                                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                                          : "bg-[var(--bg-glass)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-main)] hover:text-[var(--text-primary)]"
                                      }`}
                                    >
                                      {network}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <label className="text-sm text-[var(--text-primary)] font-medium">Phone Number</label>
                                <Input
                                  name="momoNumber"
                                  required={formData.paymentMethod === "MOBILE_MONEY"}
                                  value={formData.momoNumber}
                                  onChange={handleChange}
                                  placeholder="07XX XXXXXX"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrent(0)}
                          className="flex-1 py-4"
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading || (formData.paymentMethod === "MOBILE_MONEY" && !formData.momoNetwork)}
                          className="flex-1 bg-cyan-600 hover:bg-cyan-500 py-4 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                        >
                          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                          {loading
                            ? "Processing..."
                            : formData.paymentMethod === "COD"
                              ? `Place Order - Pay on Delivery`
                              : formData.paymentMethod === "MOBILE_MONEY"
                                ? `Pay with Mobile Money`
                                : `Place Order (${formatCurrency(total)})`}
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card
              className="bg-[var(--bg-secondary)] rounded-2xl border-[var(--border-subtle)] border shadow-2xl sticky top-24 overflow-hidden p-8"
            >
              <h3 className="font-bold text-[var(--text-primary)] mb-8 text-xl text-center md:text-left">
                Order Summary
              </h3>
              <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-6 items-center">
                    <div className="w-16 h-16 bg-[var(--bg-glass)] rounded-2xl border border-[var(--border-subtle)] shrink-0 overflow-hidden shadow-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--text-primary)] font-bold line-clamp-1 text-sm">
                        {item.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider mt-1">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-cyan-400 font-bold text-sm whitespace-nowrap">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="h-px bg-[var(--border-subtle)] my-8" />

              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-[var(--text-muted)] font-medium">
                  <span>Subtotal</span>
                  <span className="text-[var(--text-primary)] font-bold">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)] font-medium">
                  <span>Shipping</span>
                  <span className="text-cyan-400 font-bold uppercase tracking-widest text-xs">
                    Free
                  </span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)] font-medium">
                  <span>Tax (8%)</span>
                  <span className="text-[var(--text-primary)] font-bold">
                    {formatCurrency(tax)}
                  </span>
                </div>

                <div className="pt-6 mt-6 border-t border-[var(--border-subtle)] flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[var(--text-muted)] font-medium">
                      Total
                    </span>
                    <span className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">
                      {formatCurrency(total)}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest text-right">
                    Inclusive of all taxes
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
