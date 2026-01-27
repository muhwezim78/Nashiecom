import { motion } from "framer-motion";
import { Target, Users, Globe, Shield } from "lucide-react";
import { Card } from "antd";
import SEO from "../components/SEO";

const About = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <SEO
        title="Our Story"
        description="Learn about Nashiecom Technologies - Uganda's premier electronic store. Our mission is to provide high-performance tech for creators and gamers."
        url="/about"
      />
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-primary)]" />

        <div className="container mx-auto px-4 relative z-10 text-left">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-cyan-500 mb-6"
          >
            We Are Nashiecom
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl"
          >
            Empowering creators, gamers, and professionals with forward-thinking
            technology.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="section bg-[var(--bg-secondary)]">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-xl)] items-center">
            <div>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6">
                Our Mission
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                At Nashiecom Technologies, we believe that technology should not
                just be a tool, but an extension of your potential. We curate
                the finest selection of high-performance hardware to ensure that
                whether you're compiling code, rendering 3D worlds, or climbing
                the competitive ladder, your gear never holds you back.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed">
                Founded in 2024, our goal has always been simple: bring premium
                tech to those who demand excellence.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card
                className="!bg-[var(--bg-glass)] !rounded-2xl !border-[var(--border-subtle)] backdrop-blur-sm !border"
                bodyStyle={{ padding: "1.5rem", textAlign: "left" }}
              >
                <Target className="w-8 h-8 text-cyan-400 mb-4" />
                <h3 className="font-bold text-[var(--text-primary)] mb-2">Innovation</h3>
                <p className="text-sm text-gray-500">
                  Always ahead of the curve
                </p>
              </Card>
              <Card
                className="!bg-[var(--bg-glass)] !rounded-2xl !border-[var(--border-subtle)] backdrop-blur-sm !border"
                bodyStyle={{ padding: "1.5rem", textAlign: "left" }}
              >
                <Users className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="font-bold text-[var(--text-primary)] mb-2">Community</h3>
                <p className="text-sm text-gray-500">Built for enthusiasts</p>
              </Card>
              <Card
                className="!bg-[var(--bg-glass)] !rounded-2xl !border-[var(--border-subtle)] backdrop-blur-sm !border"
                bodyStyle={{ padding: "1.5rem", textAlign: "left" }}
              >
                <Shield className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="font-bold text-[var(--text-primary)] mb-2">Trust</h3>
                <p className="text-sm text-gray-500">Reliable & secure</p>
              </Card>
              <Card
                className="!bg-[var(--bg-glass)] !rounded-2xl !border-[var(--border-subtle)] backdrop-blur-sm !border"
                bodyStyle={{ padding: "1.5rem", textAlign: "left" }}
              >
                <Globe className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="font-bold text-[var(--text-primary)] mb-2">Global</h3>
                <p className="text-sm text-gray-500">Shipping worldwide</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <Stat number="10k+" label="Happy Customers" />
            <Stat number="1500+" label="Products Available" />
            <Stat number="50+" label="Tech Partners" />
            <Stat number="24/7" label="Expert Support" />
          </div>
        </div>
      </section>
    </div>
  );
};

const Stat = ({ number, label }) => (
  <div>
    <h4 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
      {number}
    </h4>
    <p className="text-gray-400 uppercase tracking-wider text-sm">{label}</p>
  </div>
);

export default About;
