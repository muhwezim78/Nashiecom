import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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
      <Link
        to={`/products?category=${category.id}`}
        className="flex flex-col items-center justify-center gap-8 p-12 h-full min-h-[22rem] rounded-[3rem] bg-white/[0.02] border border-white/5 hover:border-cyan-500/50 backdrop-blur-xl transition-all duration-700 overflow-hidden shadow-2xl"
      >
        {/* Animated Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Floating Ring Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/5 rounded-full scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none" />

        <div className="relative w-32 h-32 rounded-[2rem] bg-white/5 flex items-center justify-center text-6xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 filter drop-shadow-[0_0_30px_rgba(34,211,238,0.2)] border border-white/10 group-hover:border-cyan-500/30">
          <span className="transform transition-transform duration-700 group-hover:scale-125">
            {category.icon}
          </span>
        </div>

        <div className="relative text-center space-y-4">
          <h3 className="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tighter uppercase">
            {category.name}
          </h3>
          <div className="flex items-center justify-center gap-3 text-cyan-500 opacity-60 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-700">
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
              Initialize Explorer
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
