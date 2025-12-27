import { useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { CheckCircle, CreditCard, Truck, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Steps, Form, Input, Button, Radio, Divider, Card } from "antd";
import { formatCurrency } from "../utils/currency";

const { Step } = Steps;

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [current, setCurrent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [form] = Form.useForm();

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const onFinish = (values) => {
    console.log("Success:", values);
    setCurrent(2); // Move to review/complete
    setTimeout(() => {
      setIsCompleted(true);
      clearCart();
    }, 1500);
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card max-w-xl w-full p-12 text-center rounded-[3rem]"
        >
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Order Confirmed!
          </h2>
          <p className="text-gray-400 mb-8">
            Thank you for your purchase. We've sent a confirmation email with
            your order details.
          </p>
          <Link to="/" className="btn btn-primary w-full">
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0a0a0f] text-white">
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
    <div className="min-h-screen bg-[#0a0a0f] pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <Steps current={current} items={steps} />
            </div>

            <Card
              className="bg-[#12121a] border-white/5 rounded-[2.5rem] p-4 sm:p-6"
              bordered={false}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ paymentMethod: "credit" }}
              >
                {current === 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <MapPin className="text-cyan-400" /> Shipping Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                        name="firstName"
                        label="First Name"
                        rules={[{ required: true }]}
                      >
                        <Input size="large" />
                      </Form.Item>
                      <Form.Item
                        name="lastName"
                        label="Last Name"
                        rules={[{ required: true }]}
                      >
                        <Input size="large" />
                      </Form.Item>
                      <Form.Item
                        name="address"
                        label="Address"
                        className="md:col-span-2"
                        rules={[{ required: true }]}
                      >
                        <Input size="large" />
                      </Form.Item>
                      <Form.Item
                        name="city"
                        label="City"
                        rules={[{ required: true }]}
                      >
                        <Input size="large" />
                      </Form.Item>
                      <Form.Item
                        name="zip"
                        label="ZIP Code"
                        rules={[{ required: true }]}
                      >
                        <Input size="large" />
                      </Form.Item>
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => setCurrent(1)}
                      className="w-full mt-4 bg-cyan-500 hover:bg-cyan-400"
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
                      name="cardNumber"
                      label="Card Number"
                      rules={[{ required: true }]}
                    >
                      <Input size="large" placeholder="0000 0000 0000 0000" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                      <Form.Item
                        name="expiry"
                        label="Expiry Date"
                        rules={[{ required: true }]}
                      >
                        <Input size="large" placeholder="MM/YY" />
                      </Form.Item>
                      <Form.Item
                        name="cvc"
                        label="CVC"
                        rules={[{ required: true }]}
                      >
                        <Input size="large" placeholder="123" />
                      </Form.Item>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <Button
                        size="large"
                        onClick={() => setCurrent(0)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        className="flex-1 bg-cyan-500 hover:bg-cyan-400"
                      >
                        Place Order ({formatCurrency(total)})
                      </Button>
                    </div>
                  </motion.div>
                )}
              </Form>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#12121a] rounded-[2.5rem] border border-white/5 shadow-2xl sticky top-24 overflow-hidden">
              <div className="p-10">
                <h3 className="font-bold text-white mb-8 text-xl text-center md:text-left">
                  Order Items
                </h3>
                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-6 items-center">
                      <div className="w-20 h-20 bg-[#1a1a25] rounded-2xl border border-white/5 shrink-0 overflow-hidden shadow-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-cyan-400 font-black mt-1">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Divider className="bg-white/10 my-8" />

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span className="font-medium">Subtotal</span>
                    <span className="text-white">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span className="font-medium">Shipping</span>
                    <span className="text-cyan-400 font-bold uppercase tracking-widest text-xs">
                      Free
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span className="font-medium">Tax (8%)</span>
                    <span className="text-white">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-6 mt-6 border-t border-white/10">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-3xl font-black text-white tracking-tighter">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
