import { useState } from "react";
import { motion } from "framer-motion";
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
import { Steps, Form, Input, Radio, Divider, Card, Button, App } from "antd";
import { formatCurrency } from "../utils/currency";
import { ordersAPI } from "../services/api";

const { Step } = Steps;

const Checkout = () => {
  const { message } = App.useApp();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [current, setCurrent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  // Generate a unique key for this checkout session to prevent duplicate orders
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [form] = Form.useForm();

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const onFinish = async () => {
    setLoading(true);
    try {
      // Get all values from the form, including those from previous steps (unmounted)
      const values = form.getFieldsValue(true);

      // Prepare order data for the backend
      const orderData = {
        idempotencyKey,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          firstName: values.firstName,
          lastName: values.lastName,
          addressLine1: values.address,
          city: values.city,
          postalCode: values.zip || "0000",
          phone: values.phone,
        },
        paymentMethod: values.paymentMethod || "CREDIT_CARD",
        // Extra payment details if applicable
        paymentDetails:
          values.paymentMethod === "MOBILE_MONEY"
            ? {
                network: values.momoNetwork,
                phoneNumber: values.momoNumber,
              }
            : undefined,
      };

      // Call the API to create the order
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
    {
      title: "Shipping",
      icon: <Truck className="w-5 h-5" />,
    },
    {
      title: "Payment",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      title: "Confirm",
      icon: <CheckCircle className="w-5 h-5" />,
    },
  ];

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-xl"
        >
          <Card
            className="glass-card w-full text-center !rounded-2xl"
            styles={{ body: { padding: "3rem" } }}
            variant="borderless"
          >
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
              <Link to="/my-orders" className="btn btn-primary flex-1">
                View My Orders
              </Link>
              <Link
                to="/"
                className="btn bg-[var(--bg-glass)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] flex-1"
              >
                Back to Home
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
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-12 pt-24">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <Steps current={current} items={steps} />
            </div>

            <Card
              className="bg-[var(--bg-secondary)] border-[var(--border-subtle)] rounded-2xl p-4 sm:p-6 !border"
              variant="borderless"
              styles={{ body: { padding: 0 } }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ paymentMethod: "CREDIT_CARD" }}
                requiredMark={false}
              >
                {current === 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                      <MapPin className="text-cyan-400" /> Shipping Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                        name="firstName"
                        label="First Name"
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input size="large" placeholder="John" />
                      </Form.Item>
                      <Form.Item
                        name="lastName"
                        label="Last Name"
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input size="large" placeholder="Doe" />
                      </Form.Item>
                      <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input size="large" placeholder="+256..." />
                      </Form.Item>
                      <Form.Item
                        name="city"
                        label="City"
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input size="large" placeholder="Kampala" />
                      </Form.Item>
                      <Form.Item
                        name="address"
                        label="Address"
                        className="md:col-span-2"
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input
                          size="large"
                          placeholder="Street, Plot, House #"
                        />
                      </Form.Item>
                      <Form.Item
                        name="zip"
                        label="ZIP Code / Landmark"
                        className="md:col-span-2"
                      >
                        <Input size="large" placeholder="Optional" />
                      </Form.Item>
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      onClick={async () => {
                        try {
                          await form.validateFields([
                            "firstName",
                            "lastName",
                            "phone",
                            "city",
                            "address",
                          ]);
                          setCurrent(1);
                        } catch (e) {
                          // Validation failed
                        }
                      }}
                      className="w-full mt-4 bg-cyan-500 hover:bg-cyan-400 h-12 rounded-xl text-base font-bold shadow-lg shadow-cyan-500/20"
                    >
                      Continue to Payment
                    </Button>
                  </motion.div>
                )}

                {current === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <CreditCard className="text-cyan-400" /> Payment Details
                    </h3>

                    <Form.Item
                      name="paymentMethod"
                      label="Payment Method"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Radio.Group
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full grid grid-cols-1 gap-4"
                      >
                        <Radio.Button
                          value="CREDIT_CARD"
                          className="h-14 flex items-center justify-center rounded-xl bg-white/5 border-white/10 hover:border-cyan-500/50 hover:bg-white/10"
                        >
                          <span className="flex items-center gap-2 text-white font-semibold">
                            <CreditCard size={18} /> Credit / Debit Card
                          </span>
                        </Radio.Button>
                        <Radio.Button
                          value="COD"
                          className="h-14 flex items-center justify-center rounded-xl bg-white/5 border-white/10 hover:border-cyan-500/50 hover:bg-white/10"
                        >
                          <span className="flex items-center gap-2 text-white font-semibold">
                            <Truck size={18} /> Payment on Delivery
                          </span>
                        </Radio.Button>
                        <Radio.Button
                          value="MOBILE_MONEY"
                          className="h-14 flex items-center justify-center rounded-xl bg-white/5 border-white/10 hover:border-cyan-500/50 hover:bg-white/10"
                        >
                          <span className="flex items-center gap-2 text-white font-semibold">
                            <Smartphone size={18} /> Mobile Money
                          </span>
                        </Radio.Button>
                      </Radio.Group>
                    </Form.Item>

                    {paymentMethod === "CREDIT_CARD" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Form.Item
                          name="cardNumber"
                          label="Card Number"
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <Input
                            size="large"
                            placeholder="0000 0000 0000 0000"
                          />
                        </Form.Item>

                        <div className="grid grid-cols-2 gap-4">
                          <Form.Item
                            name="expiry"
                            label="Expiry Date"
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <Input size="large" placeholder="MM/YY" />
                          </Form.Item>
                          <Form.Item
                            name="cvc"
                            label="CVC"
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <Input size="large" placeholder="123" />
                          </Form.Item>
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === "MOBILE_MONEY" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6 flex gap-3 text-yellow-200">
                          <AlertCircle className="shrink-0 w-5 h-5" />
                          <p className="text-sm">
                            You will receive a prompt on your phone to approve
                            the payment. Please ensure your phone is on and
                            unlocked.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Form.Item
                            name="momoNetwork"
                            label="Network"
                            rules={[
                              { required: true, message: "Select Network" },
                            ]}
                          >
                            <Radio.Group className="w-full grid grid-cols-2 gap-2">
                              <Radio.Button
                                value="MTN"
                                className="text-center font-bold"
                              >
                                MTN
                              </Radio.Button>
                              <Radio.Button
                                value="AIRTEL"
                                className="text-center font-bold"
                              >
                                Airtel
                              </Radio.Button>
                            </Radio.Group>
                          </Form.Item>
                          <Form.Item
                            name="momoNumber"
                            label="Phone Number"
                            rules={[
                              { required: true, message: "Required" },
                              {
                                pattern: /^(07|2567)\d{8}$/,
                                message: "Invalid Phone Number",
                              },
                            ]}
                          >
                            <Input size="large" placeholder="07XX XXXXXX" />
                          </Form.Item>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                      <Button
                        size="large"
                        onClick={() => setCurrent(0)}
                        className="flex-1 h-12 rounded-xl bg-white/5 border-white/10 text-white"
                      >
                        Back
                      </Button>
                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={loading}
                        className="flex-1 bg-cyan-500 hover:bg-cyan-400 h-12 rounded-xl text-base font-bold shadow-lg shadow-cyan-500/20"
                      >
                        {loading
                          ? "Processing..."
                          : paymentMethod === "COD"
                            ? `Place Order - Pay on Delivery`
                            : paymentMethod === "MOBILE_MONEY"
                              ? `Pay with Mobile Money`
                              : `Place Order (${formatCurrency(total)})`}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </Form>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card
              className="!bg-[var(--bg-secondary)] !rounded-2xl !border-[var(--border-subtle)] !border shadow-2xl sticky top-24 overflow-hidden"
              styles={{ body: { padding: "2.5rem" } }}
            >
              <h3 className="font-bold text-[var(--text-primary)] mb-8 text-xl text-center md:text-left">
                Order Summary
              </h3>
              <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-6 items-center">
                    <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-subtle)] shrink-0 overflow-hidden shadow-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--text-primary)] font-bold line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider mt-1">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-cyan-400 font-bold text-sm">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <Divider className="bg-white/10 my-8" />

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

                <div className="pt-6 mt-6 border-t border-[var(--border-main)] flex flex-col">
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
