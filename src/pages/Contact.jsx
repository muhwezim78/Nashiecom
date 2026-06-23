import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Headphones,
  Clock,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Input, TextArea } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { message } from "../utils/toast";
import api from "../services/api";

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    inquiryType: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onFinish = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.contact.create(formData);
      message.success("Message sent successfully! We will get back to you soon.");
      setFormData({ name: "", email: "", inquiryType: "", subject: "", message: "" });
    } catch (error) {
      console.error("Contact Error:", error);
      message.error(error.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email Support",
      details: ["sales@nashiecom.tech", "support@nashiecom.tech"],
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Phone Support",
      details: ["+256 786 400 713", "Mon-Sat from 8am to 8pm"],
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Our Location",
      details: ["New Pioneer Mall shop PH-38", "Kampala, Uganda"],
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
  ];

  const supportFeatures = [
    {
      icon: <MessageSquare className="w-4 h-4" />,
      title: "Live Chat",
      desc: "24/7 real-time support",
    },
    {
      icon: <Headphones className="w-4 h-4" />,
      title: "Expert Advice",
      desc: "Technical specialists",
    },
    {
      icon: <Clock className="w-4 h-4" />,
      title: "Fast Response",
      desc: "Under 2 hours",
    },
    {
      icon: <Shield className="w-4 h-4" />,
      title: "Secure",
      desc: "Encrypted communication",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-[var(--border-subtle)]">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5" />

        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="w-full flex flex-col gap-10 items-center">
            <div className="text-center flex flex-col gap-4 items-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-primary)]">
                Contact{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Support
                </span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl">
                Have a question about a product, shipping, or need technical
                advice? Our team of experts is ready to help.
              </p>
            </div>

            {/* Features Strip */}
            <div className="w-full max-w-4xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {supportFeatures.map((feature, index) => (
                  <Card
                    key={index}
                    className="bg-[var(--bg-secondary)] rounded-2xl border-[var(--border-subtle)] hover:border-cyan-500/30 transition-all border p-4 text-center flex flex-col items-center"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-3">
                      <div className="text-cyan-400">{feature.icon}</div>
                    </div>
                    <h4 className="text-[var(--text-primary)] font-semibold text-sm mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-gray-400 text-xs">
                      {feature.desc}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="w-full flex flex-col gap-12">
          {/* Contact Cards & Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {/* Contact Information Column */}
            <div className="flex flex-col gap-6">
              {/* Contact Cards */}
              <div className="flex flex-col gap-4">
                {contactInfo.map((info, index) => (
                  <Card
                    key={index}
                    className="bg-[var(--bg-secondary)] border-[var(--border-subtle)] backdrop-blur-sm hover:border-cyan-500/30 transition-all rounded-2xl p-4 flex items-start gap-4"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${info.bgColor} border ${info.borderColor} flex items-center justify-center shrink-0`}
                    >
                      <div className={info.color}>{info.icon}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-[var(--text-primary)] font-semibold">
                        {info.title}
                      </h4>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-[var(--text-secondary)] text-sm">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Map */}
              <Card
                className="rounded-2xl overflow-hidden border-[var(--border-subtle)] hover:border-cyan-500/30 transition-all duration-300 p-0 border"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.758270670238!2d32.57511682349239!3d0.3143525140320503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbc819013388f%3A0x520e9a88a2d65633!2sPioneer%20Mall%2C%20Kampala!5e0!3m2!1sen!2sug!4v1766837295151!5m2!1sen!2sug"
                  width="100%"
                  height="300"
                  style={{
                    border: 0,
                    filter: "grayscale(0.7) contrast(1.2)",
                  }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="hover:grayscale-0 transition-all duration-500 block"
                />
              </Card>
            </div>

            {/* Contact Form Column */}
            <div>
              <Card
                className="bg-[var(--bg-secondary)] border-[var(--border-subtle)] backdrop-blur-sm rounded-2xl p-8"
              >
                <div className="flex flex-col gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                      Send us a Message
                    </h3>
                    <p className="text-[var(--text-muted)]">
                      We'll get back to you within 2 hours
                    </p>
                  </div>

                  <form onSubmit={onFinish} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Input
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Select
                        name="inquiryType"
                        required
                        value={formData.inquiryType}
                        onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                        options={[
                          { value: "", label: "Select inquiry type", disabled: true },
                          { value: "general", label: "General Inquiry" },
                          { value: "order", label: "Order Support" },
                          { value: "product", label: "Product Question" },
                          { value: "returns", label: "Returns/Warranty" },
                          { value: "technical", label: "Technical Support" },
                        ]}
                      />
                    </div>

                    <div>
                      <Input
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Subject"
                      />
                    </div>

                    <div>
                      <TextArea
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3"
                    >
                      {loading ? <span className="animate-spin">↻</span> : <Send className="w-4 h-4" />}
                      Send Message
                    </Button>
                  </form>
                </div>
              </Card>
            </div>
          </div>

          {/* FAQ Preview */}
          <div className="w-full flex flex-col gap-6 items-center">
            <h3 className="text-2xl font-bold text-[var(--text-primary)] text-center">
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
              <Card
                className="bg-[var(--bg-secondary)] rounded-2xl border-[var(--border-subtle)] hover:border-cyan-500/30 transition-all border p-6"
              >
                <h4 className="text-[var(--text-primary)] font-semibold mb-2">
                  What is your shipping time?
                </h4>
                <p className="text-[var(--text-secondary)] text-sm">
                  Most orders ship within 24 hours and arrive within 3-5
                  business days.
                </p>
              </Card>
              <Card
                className="bg-[var(--bg-secondary)] rounded-2xl border-[var(--border-subtle)] hover:border-cyan-500/30 transition-all border p-6"
              >
                <h4 className="text-[var(--text-primary)] font-semibold mb-2">
                  Do you offer warranties?
                </h4>
                <p className="text-[var(--text-secondary)] text-sm">
                  All products come with a 1-year manufacturer warranty,
                  extendable up to 3 years.
                </p>
              </Card>
              <Card
                className="bg-[var(--bg-secondary)] rounded-2xl border-[var(--border-subtle)] hover:border-cyan-500/30 transition-all border p-6"
              >
                <h4 className="text-[var(--text-primary)] font-semibold mb-2">
                  Can I return a product?
                </h4>
                <p className="text-[var(--text-secondary)] text-sm">
                  Yes, we offer a 30-day return policy for unused products in
                  original packaging.
                </p>
              </Card>
              <Card
                className="bg-[var(--bg-glass)] rounded-2xl border-[var(--border-subtle)] hover:border-cyan-500/30 transition-all border p-6"
              >
                <h4 className="text-[var(--text-primary)] font-semibold mb-2">
                  Do you ship internationally?
                </h4>
                <p className="text-[var(--text-secondary)] text-sm">
                  We ship to over 50 countries worldwide. Shipping rates vary
                  by location.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
