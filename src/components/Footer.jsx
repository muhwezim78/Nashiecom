import { memo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Monitor,
  ArrowUp,
  Shield,
  Truck,
  Headphones,
  CreditCard,
  Send,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const Footer = () => {
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };

  const trustBadges = [
    { icon: Truck, label: "Global Logistics", desc: "Express Worldwide" },
    { icon: Shield, label: "Quantum Security", desc: "AES-256 Encrypted" },
    { icon: Headphones, label: "Tech Concierge", desc: "Expert 24/7 Care" },
    { icon: Sparkles, label: "Premium Quality", desc: "Curated Selection" },
  ];

  const linkSections = [
    {
      title: "Navigation",
      links: [
        { to: "/products", label: "Store Explorer" },
        { to: "/products?featured=true", label: "Featured Picks" },
        { to: "/products?new=true", label: "New Arrivals" },
        { to: "/about", label: "Our Story" },
      ],
    },
    {
      title: "Client Care",
      links: [
        { to: "/support", label: "Help Center" },
        { to: "/shipping", label: "Delivery Tracking" },
        { to: "/returns", label: "Returns Center" },
        { to: "/warranty", label: "Protection Plan" },
      ],
    },
    {
      title: "Legal",
      links: [
        { to: "/privacy", label: "Privacy Core" },
        { to: "/terms", label: "Term of Service" },
        { to: "/cookies", label: "Cookie Policy" },
        { to: "/security", label: "Security Hub" },
      ],
    },
  ];

  return (
    <footer className="relative bg-black pt-20 overflow-hidden">
      {/* Visual Accents */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Top Section: Trust Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-40">
          {trustBadges.map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative p-8 bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-3xl transition-all duration-500 group-hover:bg-white/[0.04]">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <badge.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-2">
                  {badge.label}
                </h4>
                <p className="text-gray-500 text-xs uppercase font-medium">
                  {badge.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-10">
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-4 group">
                <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-all duration-500">
                  <Monitor className="w-8 h-8 text-white" />
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter">
                    NASHIECOM
                  </h2>
                  <p className="text-xs font-black text-cyan-500 uppercase tracking-[0.3em]">
                    Technologies
                  </p>
                </div>
              </Link>
              <p className="text-gray-400 text-lg leading-relaxed font-medium">
                Pioneering the next generation of digital infrastructure. We
                provide state-of-the-art computing solutions for the modern
                visionary.
              </p>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                Global Presence
              </span>
              <div className="flex gap-4">
                {[
                  { Icon: Facebook, url: "#" },
                  { Icon: Twitter, url: "#" },
                  {
                    Icon: Instagram,
                    url: "https://www.instagram.com/nashiecom_tecnologies_store?igsh=Nnd2a2owd2FuZndh",
                  },
                  { Icon: Linkedin, url: "#" },
                ].map(({ Icon, url }, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-500/30 transition-all duration-300 group"
                  >
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Links Col */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {linkSections.map((section, i) => (
              <div key={i} className="space-y-8">
                <h5 className="text-white font-black uppercase tracking-[0.2em] text-[10px]">
                  {section.title}
                </h5>
                <ul className="space-y-4">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link
                        to={link.to}
                        className="text-gray-500 hover:text-cyan-400 text-sm font-bold flex items-center gap-2 group transition-colors"
                      >
                        <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all font-black" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter Col */}
          <div className="lg:col-span-3">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Mail className="w-16 h-16 text-cyan-500" />
              </div>

              <div className="relative z-10">
                <h4 className="text-lg font-black text-white uppercase tracking-wider mb-2">
                  The Dispatch
                </h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Join 10k+ visionaries getting exclusive tech insights and
                  early-access offers.
                </p>
              </div>

              <form
                onSubmit={handleSubscribe}
                className="relative z-10 space-y-4"
              >
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="visionary@email.com"
                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-6 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all group/btn shadow-lg"
                  >
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
                <AnimatePresence>
                  {isSubscribed && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[10px] text-green-400 font-bold uppercase tracking-widest text-center"
                    >
                      Transmission Received. Welcome.
                    </motion.p>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 bg-white/[0.01] border border-white/5 rounded-[2.5rem] mb-20">
          <div className="flex items-center gap-6 group">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-cyan-400 border border-white/5 group-hover:border-cyan-500/30 transition-all shadow-inner">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                HQ Distribution
              </p>
              <p className="text-sm font-bold text-white">
                New Pioneer Mall shop PH-38
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 group">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-cyan-400 border border-white/5 group-hover:border-cyan-500/30 transition-all shadow-inner">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                Direct Line
              </p>
              <p className="text-sm font-bold text-white">+256 786 400 713</p>
            </div>
          </div>
          <div className="flex items-center gap-6 group">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-cyan-400 border border-white/5 group-hover:border-cyan-500/30 transition-all shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                System Status
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-sm font-bold text-white">
                  All Systems Operational
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="py-12 border-t border-white/5">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
            <div className="space-y-4 text-center lg:text-left">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                © {currentYear} NASHIECOM TECHNOLOGIES. ENGINEERED FOR
                EXCELLENCE.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  Privacy Infrastructure
                </a>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  Legal Framework
                </a>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  Transparency Report
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-end gap-6">
              <div className="flex gap-4 grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all">
                {["Visa", "Master", "Paypal", "MTN", "Airtel"].map((p) => (
                  <span
                    key={p}
                    className="text-[10px] font-black text-white px-3 py-1 bg-white/5 rounded-lg border border-white/5"
                  >
                    {p}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.3em]">
                Built by Visionaries for the Modern World
              </p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-10 right-10 z-50 group"
          >
            <div className="absolute inset-0 bg-cyan-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-100 transition duration-500" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-2xl flex items-center justify-center shadow-2xl transform active:scale-95 transition-all">
              <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default memo(Footer);
