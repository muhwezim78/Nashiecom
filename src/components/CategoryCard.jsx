import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "antd";

const CategoryCard = ({ category, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
      whileHover={{ y: -12 }}
      className="group relative h-full"
    >
      <Link to={`/products?category=${category.id}`} className="block h-full">
        <Card
          hoverable
          variant="borderless"
          className="h-full !bg-[var(--bg-glass)] !border-[var(--border-subtle)] hover:!border-cyan-500/50 backdrop-blur-xl transition-all duration-700 overflow-hidden shadow-xl !rounded-3xl"
          styles={{
            body: {
              padding: "1.5rem",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
            },
          }}
        >
          {/* Animated Glow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Floating Ring Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-[var(--border-subtle)] rounded-full scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none" />

          <div className="relative w-16 h-16 rounded-2xl bg-[var(--bg-glass)] flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 filter drop-shadow-[0_0_15px_rgba(34,211,238,0.2)] border border-[var(--border-subtle)] group-hover:border-cyan-500/30">
            <span className="transform transition-transform duration-700 group-hover:scale-120">
              {category.icon || "📁"}
            </span>
          </div>

          <div className="relative text-center space-y-1">
            <h3 className="text-lg font-black text-[var(--text-primary)] group-hover:text-cyan-400 transition-colors tracking-tighter uppercase line-clamp-1">
              {category.name}
            </h3>
            <div className="flex items-center justify-center gap-2 text-cyan-500 opacity-60 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-700">
              <span className="text-[7px] font-black uppercase tracking-[0.2em]">
                Initialize
              </span>
              <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
