import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, Sparkles } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("loading");

    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 5000);
    }, 1500);
  };

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gray-900 to-black border border-white/5 p-8 md:p-16 shadow-2xl">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-[80px] -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] -ml-32 -mb-32" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full mb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
              Weekly Updates
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter uppercase">
            Join the <span className="text-cyan-400">Future</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
            Subscribe to the dispatch. Exclusive updates, early access nodes,
            and technical insights.
          </p>
        </div>

        <div className="relative max-w-md mx-auto lg:max-w-none w-full">
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center p-8 bg-green-500/10 border border-green-500/30 rounded-3xl"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 text-center">
                  Successfully Subscribed!
                </h3>
                <p className="text-gray-400 text-center">
                  Welcome to the Nashiecom community. Check your email for your
                  welcome discount.
                </p>
              </motion.div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4"
              >
                <div className="relative group">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all text-lg"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-cyan-500/0 group-hover:bg-cyan-500/5 pointer-events-none transition-colors" />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className={`w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                    status === "loading" ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {status === "loading" ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Keep Me Posted
                    </>
                  )}
                </button>
                <p className="text-center text-sm text-gray-500">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
