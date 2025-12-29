import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Star,
  Sparkles,
  Zap,
  Shield,
  Users,
  Globe,
  Trophy,
  ChevronRight,
  Play,
  Monitor,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Space, Spin, Card } from "antd";
import HeroSection from "../components/HeroSection";
import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard";
import Newsletter from "../components/Newsletter";
import { useFeaturedProducts, useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { categories as staticCategories } from "../data/products";

const Home = () => {
  const { scrollYProgress } = useScroll();

  // Fetch Data using Hooks
  const { data: featuredData, isLoading: featuredLoading } =
    useFeaturedProducts(6);
  const { data: gamingData, isLoading: gamingLoading } = useProducts({
    search: "gaming",
    limit: 3,
  });

  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();

  const featuredProducts = featuredData?.data?.products || [];
  const gamingProducts = gamingData?.data?.products || [];
  const loading = featuredLoading || gamingLoading || categoriesLoading;

  const categories = categoriesData?.data?.categories || [];

  // Get featured categories from DB or fallback to defaults
  const highlightCategories =
    categories.length > 0
      ? categories.filter((cat) => cat.featured).slice(0, 4)
      : staticCategories
          .filter(
            (cat) =>
              cat.id !== "all" &&
              ["laptops", "desktops", "accessories", "gaming"].includes(cat.id)
          )
          .slice(0, 4);

  // If we have categories from DB but none are featured, just take the first 4
  const finalCategories =
    highlightCategories.length > 0
      ? highlightCategories
      : categories.slice(0, 4);

  const partners = [
    "HP",
    "Dell",
    "Lenovo",
    "NVIDIA",
    "Intel",
    "AMD",
    "ASUS",
    "MSI",
    "Razer",
    "Logitech",
    "Corsair",
    "SteelSeries",
  ];

  const stats = [
    {
      icon: Users,
      value: "50k+",
      label: "Visionaries Served",
      color: "text-cyan-400",
    },
    {
      icon: Globe,
      value: "120+",
      label: "Global Partners",
      color: "text-blue-400",
    },
    {
      icon: Trophy,
      value: "15+",
      label: "Industry Awards",
      color: "text-purple-400",
    },
    {
      icon: Shield,
      value: "100%",
      label: "Secure Systems",
      color: "text-emerald-400",
    },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.8, ease: "easeOut" },
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Immersive Background Layers */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05)_0%,rgba(0,0,0,0)_50%)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      {/* Main content wrapped in Space with large gaps */}
      <Space direction="vertical" size={120} className="w-full">
        {/* Hero Section */}
        <div className="w-full">
          <HeroSection />
        </div>

        {/* Brand Marquee */}
        <div className="w-full">
          <section className="relative py-12 border-y border-white/5 bg-white/[0.01] backdrop-blur-sm overflow-hidden">
            <div className="flex whitespace-nowrap overflow-hidden">
              <motion.div
                animate={{ x: [0, -1035] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="flex gap-20 items-center px-10"
              >
                {[...partners, ...partners].map((partner, i) => (
                  <span
                    key={i}
                    className="text-2xl font-black text-gray-700 tracking-[0.3em] uppercase hover:text-white transition-colors cursor-default"
                  >
                    {partner}
                  </span>
                ))}
              </motion.div>
            </div>
          </section>
        </div>

        {/* Services Section */}
        <div className="w-full">
          <section className="py-24 bg-white/[0.02] border-y border-white/5">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">
                  Our Expertise
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white mt-4 tracking-tighter">
                  COMPREHENSIVE <span className="text-blue-500">SOLUTIONS</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    title: "Accessories",
                    subtitle: "Computer & Laptop",
                    icon: Monitor,
                    color: "text-cyan-400",
                  },
                  {
                    title: "IT Services",
                    subtitle: "Delivered at your comfort",
                    icon: Globe,
                    color: "text-blue-400",
                  },
                  {
                    title: "Repair & Maintenance",
                    subtitle: "Expert Diagnostics",
                    icon: Wrench,
                    color: "text-purple-400",
                  },
                  {
                    title: "Installations",
                    subtitle: "Software & Systems",
                    icon: Zap,
                    color: "text-yellow-400",
                  },
                ].map((service, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="h-full"
                  >
                    <Card
                      className="h-full !bg-black/20 !border-white/5 hover:!border-cyan-500/30 !rounded-2xl transition-all group !border-0 text-center"
                      styles={{ body: { padding: "2rem" } }}
                    >
                      <div
                        className={`w-14 h-14 mx-auto mb-6 bg-white/5 rounded-2xl flex items-center justify-center ${service.color} group-hover:scale-110 transition-transform`}
                      >
                        <service.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-white font-bold text-lg mb-1">
                        {service.title}
                      </h3>
                      <p className="text-gray-500 text-sm font-medium">
                        {service.subtitle}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Category Grid - Redesigned */}
        <div className="w-full">
          <section className="relative py-20 lg:py-32">
            <div className="container mx-auto px-4 relative z-10">
              <motion.div className="max-w-3xl mb-16" {...fadeInUp}>
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/20 mb-6">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">
                    System Architecture
                  </span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                  CHOOSE YOUR <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 font-outline-2">
                    INFRASTRUCTURE
                  </span>
                </h2>
                <p className="text-gray-400 text-xl font-medium max-w-xl">
                  From enterprise workstations to high-performance gaming cores,
                  select the engine for your digital ambition.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {finalCategories.map((category, index) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Impact Stats */}
        <div className="w-full">
          <section className="relative py-20 bg-white/[0.02] border-y border-white/5">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center group"
                  >
                    <div
                      className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform ${stat.color}`}
                    >
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-2">
                      {stat.value}
                    </div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Trending Now - Staggered Grid */}
        <div className="w-full">
          <section className="py-20 lg:py-32 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-cyan-600/5 blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-4">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-16">
                <motion.div className="max-w-2xl" {...fadeInUp}>
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full border border-blue-500/20 mb-6 font-black uppercase tracking-[0.3em] text-[10px] text-blue-400">
                    <Zap className="w-3 h-3" /> Peak Performance
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                    TRENDING <span className="text-blue-500">CORE</span>
                  </h2>
                </motion.div>

                <Link
                  to="/products"
                  className="group relative px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:border-blue-500/50 transition-all overflow-hidden"
                >
                  <div className="relative z-10 flex items-center gap-3">
                    Access All Modules{" "}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <Spin size="large" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {featuredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.8 }}
                      className={index === 1 ? "lg:-mt-12 lg:mb-12" : ""}
                    >
                      <div className="relative group p-1 rounded-2xl bg-gradient-to-b from-white/10 to-white/0 hover:from-blue-500/30 transition-all duration-500">
                        <div className="relative bg-[#0a0a0f] rounded-2xl overflow-hidden">
                          <ProductCard product={product} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Gaming Pulse Section */}
        <div className="w-full">
          <section className="py-20 lg:py-32 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <motion.div {...fadeInUp}>
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20 mb-8">
                    <Play className="w-4 h-4 text-purple-400 fill-current" />
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">
                      Gaming Spectrum
                    </span>
                  </div>
                  <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-10 leading-[0.85]">
                    LIMITLESS <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                      PLAY
                    </span>
                  </h2>
                  <div className="space-y-6">
                    {gamingProducts.map((product, i) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.id}`}
                        className="block group"
                      >
                        <Card
                          className="!bg-white/[0.02] !border-white/5 hover:!bg-white/[0.05] hover:!border-purple-500/30 !rounded-2xl transition-all !border-0"
                          styles={{
                            body: {
                              padding: "1.5rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "1.5rem",
                            },
                          }}
                        >
                          <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                            {/* Use image instead of icon if available */}
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 object-contain"
                              />
                            ) : (
                              "🎮"
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-bold text-lg">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-purple-400 font-bold">
                                {product.price.toLocaleString()} UGX
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative lg:h-[600px] flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-purple-600/20 blur-[100px] animate-pulse rounded-full" />
                  <Card
                    className="relative w-full max-w-lg aspect-square !bg-[#0a0a0f] !border-white/5 !rounded-2xl overflow-hidden group shadow-2xl !border-0"
                    styles={{
                      body: {
                        padding: "3rem",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      },
                    }}
                  >
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                      <Play className="w-64 h-64 text-purple-500" />
                    </div>

                    <div className="relative h-full flex flex-col justify-between z-10">
                      <div className="space-y-4">
                        <h3 className="text-4xl font-black text-white tracking-tight uppercase">
                          Special Edition <br />{" "}
                          <span className="text-purple-500">Bundle</span>
                        </h3>
                        <p className="text-gray-400 font-medium">
                          Elevate your baseline with our curated performance
                          package.
                        </p>
                      </div>

                      <Card
                        className="!bg-white/5 !rounded-2xl backdrop-blur-md !border-white/5 !border"
                        styles={{ body: { padding: "1.5rem" } }}
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-center pb-4 border-b border-white/10 uppercase tracking-widest text-[10px] font-black">
                            <span className="text-gray-500">
                              Tier 1 Essentials
                            </span>
                            <span className="text-green-400">In Stock</span>
                          </div>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs text-gray-500 font-black uppercase mb-1">
                                Standard Price
                              </p>
                              <p className="text-gray-600 line-through font-bold">
                                1,850,000
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-purple-400 font-black uppercase mb-1">
                                Bundle Value
                              </p>
                              <p className="text-4xl font-black text-white">
                                1.29M
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>

                      <button className="w-full py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-all transform hover:-translate-y-1">
                        Acquire Bundle
                      </button>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>
        </div>

        {/* CTA Layer */}
        <div className="w-full">
          <section className="pt-32 pb-40 lg:pt-40 lg:pb-48 relative bg-black overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />
            {/* ... CTA Content ... */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(6,182,212,0.15),transparent)] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="max-w-5xl mx-auto"
              >
                <h2 className="text-7xl md:text-[9rem] font-black text-white tracking-tighter leading-[0.8] mb-12">
                  BUILD YOUR <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/10">
                    FUTURE
                  </span>
                </h2>
                <p className="text-gray-500 text-xl font-medium mb-16 max-w-2xl mx-auto">
                  Join the vanguard of tech excellence. Experience technology
                  without compromise.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    to="/products"
                    className="px-12 py-6 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-cyan-400 transition-colors shadow-xl"
                  >
                    Launch Store
                  </Link>
                  <Link
                    to="/contact"
                    className="px-12 py-6 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-white/10 transition-colors"
                  >
                    Consult Sales
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        </div>

        {/* Newsletter Section */}
        <div className="w-full">
          <Newsletter />
        </div>
      </Space>
    </div>
  );
};

export default Home;
