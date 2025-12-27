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
import { Space, Input, Button, Select, Form, Card, Row, Col } from "antd";
const { TextArea } = Input;

const Contact = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Form values:", values);
    // Handle form submission
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
      details: ["+1 (555) 123-4567", "Mon-Fri from 9am to 6pm PST"],
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Our Location",
      details: ["New Pioneer Mall near Mapeera House", "Kampala, Uganda"],
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
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5" />

        <div className="container mx-auto px-4 py-16 md:py-20">
          <Space
            direction="vertical"
            size={40}
            align="center"
            className="w-full"
          >
            <Space
              direction="vertical"
              size={16}
              align="center"
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                Contact{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Support
                </span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl">
                Have a question about a product, shipping, or need technical
                advice? Our team of experts is ready to help.
              </p>
            </Space>

            {/* Features Strip */}
            <div className="w-full max-w-4xl">
            <Space direction="vertical" size={16} className="w-full">
              <Row gutter={[35, 35]} justify="center">
                {supportFeatures.map((feature, index) => (
                  <Col xs={16} sm={12} key={index}>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-3">
                          <div className="text-cyan-400">{feature.icon}</div>
                        </div>
                        <h4 className="text-white font-semibold text-sm mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-gray-400 text-xs">{feature.desc}</p>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
              </Space>
            </div>
          </Space>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Space direction="vertical" size={48} className="w-full">
          {/* Contact Cards & Form */}
          <Row gutter={[32, 32]} className="w-full">
            {/* Contact Information Column */}
            <Col xs={24} lg={12}>
              <Space direction="vertical" size={24} className="w-full">
                {/* Contact Cards */}
                <Space direction="vertical" size={16} className="w-full">
                  {contactInfo.map((info, index) => (
                    <Card
                      key={index}
                      className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-white/10 backdrop-blur-sm hover:border-cyan-500/30 transition-all"
                      bodyStyle={{ padding: "12px" }}
                    >
                      <Space
                        direction="horizontal"
                        size={16}
                        align="start"
                        className="w-full"
                      >
                        <div
                          className={`w-12 h-12 rounded-xl ${info.bgColor} border ${info.borderColor} flex items-center justify-center`}
                        >
                          <div className={info.color}>{info.icon}</div>
                        </div>
                        <Space direction="vertical" size={4}>
                          <h4 className="text-white font-semibold">
                            {info.title}
                          </h4>
                          {info.details.map((detail, idx) => (
                            <p key={idx} className="text-gray-400 text-sm">
                              {detail}
                            </p>
                          ))}
                        </Space>
                      </Space>
                    </Card>
                  ))}
                </Space>

                {/* Map */}
                <div className="rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-500/30 transition-all duration-300">
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
                    className="hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              </Space>
            </Col>

            {/* Contact Form Column */}
            <Col xs={24} lg={12}>
              <Card
                className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-white/10 backdrop-blur-sm"
                bodyStyle={{ padding: "32px" }}
              >
                <Space direction="vertical" size={32} className="w-full">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Send us a Message
                    </h3>
                    <p className="text-gray-400">
                      We'll get back to you within 2 hours
                    </p>
                  </div>

                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className="w-full"
                  >
                    <Space direction="vertical" size={20} className="w-full">
                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="name"
                            rules={[
                              {
                                required: true,
                                message: "Please enter your name",
                              },
                            ]}
                          >
                            <Input
                              size="large"
                              placeholder="John Doe"
                              className="bg-white/5 border border-white/10 text-white placeholder-gray-500 hover:border-cyan-500/30 focus:border-cyan-500"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="email"
                            rules={[
                              {
                                required: true,
                                message: "Please enter your email",
                              },
                              {
                                type: "email",
                                message: "Please enter a valid email",
                              },
                            ]}
                          >
                            <Input
                              size="large"
                              placeholder="john@example.com"
                              className="bg-white/5 border border-white/10 text-white placeholder-gray-500 hover:border-cyan-500/30 focus:border-cyan-500"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        name="subject"
                        rules={[
                          {
                            required: true,
                            message: "Please select a subject",
                          },
                        ]}
                      >
                        <Select
                          size="large"
                          placeholder="Select inquiry type"
                          className="bg-white/5 border border-white/10 text-white hover:border-cyan-500/30 focus:border-cyan-500"
                          options={[
                            { value: "general", label: "General Inquiry" },
                            { value: "order", label: "Order Support" },
                            { value: "product", label: "Product Question" },
                            { value: "returns", label: "Returns/Warranty" },
                            { value: "technical", label: "Technical Support" },
                          ]}
                        />
                      </Form.Item>

                      <Form.Item
                        name="message"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your message",
                          },
                        ]}
                      >
                        <TextArea
                          rows={6}
                          placeholder="How can we help you?"
                          className="bg-white/5 border border-white/10 text-white placeholder-gray-500 hover:border-cyan-500/30 focus:border-cyan-500 resize-none"
                        />
                      </Form.Item>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          size="large"
                          icon={<Send className="w-4 h-4" />}
                          className="w-full h-12 bg-gradient-to-r from-cyan-600 to-blue-600 border-none hover:from-cyan-500 hover:to-blue-500"
                        >
                          Send Message
                        </Button>
                      </Form.Item>
                    </Space>
                  </Form>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* FAQ Preview */}
          <Space
            direction="vertical"
            size={24}
            align="center"
            className="w-full"
          >
            <h3 className="text-2xl font-bold text-white text-center">
              Frequently Asked Questions
            </h3>
            <Row gutter={[16, 16]} className="w-full max-w-4xl">
              <Col xs={24} md={12}>
                <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all">
                  <h4 className="text-white font-semibold mb-2">
                    What is your shipping time?
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Most orders ship within 24 hours and arrive within 3-5
                    business days.
                  </p>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all">
                  <h4 className="text-white font-semibold mb-2">
                    Do you offer warranties?
                  </h4>
                  <p className="text-gray-400 text-sm">
                    All products come with a 1-year manufacturer warranty,
                    extendable up to 3 years.
                  </p>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all">
                  <h4 className="text-white font-semibold mb-2">
                    Can I return a product?
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Yes, we offer a 30-day return policy for unused products in
                    original packaging.
                  </p>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all">
                  <h4 className="text-white font-semibold mb-2">
                    Do you ship internationally?
                  </h4>
                  <p className="text-gray-400 text-sm">
                    We ship to over 50 countries worldwide. Shipping rates vary
                    by location.
                  </p>
                </div>
              </Col>
            </Row>
          </Space>
        </Space>
      </div>
    </div>
  );
};

export default Contact;
