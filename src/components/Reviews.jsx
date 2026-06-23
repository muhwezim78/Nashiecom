import { useState } from "react";
import {
  Star,
  User,
  Calendar,
  CheckCircle,
  MessageSquare,
  Send,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useProductReviews, useCreateReview } from "../hooks/useReviews";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { message } from "../utils/toast";

// Simple custom Rate component to replace antd's Rate
const Rate = ({ value, onChange, disabled }) => {
  const [hoverValue, setHoverValue] = useState(null);
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverValue || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange && onChange(star)}
            onMouseEnter={() => !disabled && setHoverValue(star)}
            onMouseLeave={() => !disabled && setHoverValue(null)}
            className={`transition-colors ${disabled ? 'cursor-default' : 'cursor-pointer'} ${isFilled ? 'text-cyan-400' : 'text-gray-600'}`}
          >
            <Star size={disabled ? 14 : 20} className={isFilled ? 'fill-current' : ''} />
          </button>
        );
      })}
    </div>
  );
};

const Reviews = ({ productId }) => {
  const { user } = useAuth();
  const [isFormVisible, setIsFormVisible] = useState(false);
  
  const [formData, setFormData] = useState({
    rating: 0,
    title: "",
    comment: ""
  });

  const { data: reviewsData, isLoading } = useProductReviews(productId);
  const createReviewMutation = useCreateReview();

  const reviews = reviewsData?.data?.reviews || [];
  const distribution = reviewsData?.data?.ratingDistribution || {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
  };
  const totalReviews = reviews.length;

  const averageRating =
    totalReviews > 0
      ? (
        Object.entries(distribution).reduce(
          (acc, [rating, count]) => acc + Number(rating) * count,
          0
        ) / totalReviews
      ).toFixed(1)
      : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rating) {
      message.error("Rating is required");
      return;
    }
    if (!formData.title.trim()) {
      message.error("Subject is required");
      return;
    }
    if (!formData.comment.trim()) {
      message.error("Detailed observations are required");
      return;
    }

    try {
      await createReviewMutation.mutateAsync({
        productId,
        ...formData,
      });
      message.success("Review submitted for approval!");
      setFormData({ rating: 0, title: "", comment: "" });
      setIsFormVisible(false);
    } catch (error) {
      message.error(error.message || "Failed to submit review");
    }
  };

  return (
    <div className="mt-20 border-t border-white/5 pt-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Summary & Stats */}
        <div className="lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black text-[var(--text-primary)] mb-2 tracking-tighter uppercase italic">
              User <span className="text-cyan-400">Intelligence</span>
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 font-medium">
              Quantified performance feedback from the field.
            </p>

            <div className="bg-[#12121a] border border-white/5 rounded-3xl shadow-2xl overflow-hidden relative group p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] rounded-full -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors" />

              <div className="text-center py-4">
                <div className="text-6xl font-black text-white mb-2 tracking-tighter">
                  {averageRating}
                </div>
                <div className="flex justify-center mb-4">
                  <Rate value={Math.round(averageRating)} disabled />
                </div>
                <div className="text-[var(--text-muted)] uppercase tracking-[0.2em] text-[10px] font-black">
                  Based on {totalReviews} verification audits
                </div>
              </div>

              <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = distribution[rating] || 0;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-4 group/item">
                      <span className="text-gray-500 text-xs font-black min-w-[24px] group-hover/item:text-cyan-400 transition-colors">
                        {rating}★
                      </span>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                        />
                      </div>
                      <span className="text-gray-500 text-[10px] font-black min-w-[32px]">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                className="w-full mt-10 rounded-2xl h-14 font-black uppercase tracking-widest text-xs text-white border-0 bg-gradient-to-r from-cyan-600 to-blue-700 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2"
                onClick={() => {
                  if (!user) {
                    message.error("Authentication required for audit submission");
                    return;
                  }
                  setIsFormVisible(!isFormVisible);
                }}
              >
                Submit Audit Report
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right: Review List & Form */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {isFormVisible ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-[#12121a] border border-white/5 rounded-3xl shadow-2xl mb-12 p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl text-white m-0 uppercase tracking-tighter font-bold">
                      Submit Your <span className="text-cyan-400">Audit</span>
                    </h3>
                    <button
                      type="button"
                      className="text-gray-500 hover:text-white transition-colors"
                      onClick={() => setIsFormVisible(false)}
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                          Efficiency Rating
                        </label>
                        <div className="pt-2">
                          <Rate value={formData.rating} onChange={(val) => setFormData({...formData, rating: val})} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                          Audit Subject
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="w-full px-4 py-3 bg-[var(--bg-glass)] border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none"
                          placeholder="Summarize your experience..."
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                        Detailed Observations
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.comment}
                        onChange={(e) => setFormData({...formData, comment: e.target.value})}
                        className="w-full px-4 py-3 bg-[var(--bg-glass)] border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none resize-none"
                        placeholder="Provide technical feedback..."
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        disabled={createReviewMutation.isPending}
                        className="rounded-xl h-12 px-6 font-black uppercase tracking-widest text-[10px] text-white bg-cyan-600 hover:bg-cyan-500 transition-colors flex items-center gap-2 justify-center"
                      >
                        {createReviewMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        Transmit Final Report
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="space-y-6">
            {isLoading ? (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                <span className="text-gray-500">Scanning frequency...</span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-[#12121a] border border-white/5 rounded-3xl text-center py-20 px-4">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-700 mb-4" />
                <span className="text-gray-500 font-medium">
                  No audit reports detected in this sector.
                </span>
              </div>
            ) : (
              reviews.map((review, idx) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="bg-[#12121a]/50 border border-white/5 rounded-3xl hover:border-cyan-500/20 transition-all group overflow-hidden p-6">
                    <div className="flex gap-6">
                      <div className="hidden sm:block">
                        {review.user?.avatar ? (
                          <img src={review.user.avatar} className="w-14 h-14 rounded-full border-2 border-cyan-500/20 object-cover" alt="" />
                        ) : (
                          <div className="w-14 h-14 rounded-full border-2 border-cyan-500/20 bg-white/5 flex items-center justify-center text-gray-500">
                            <User size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-white font-black uppercase text-sm tracking-tighter">
                                {review.user?.firstName} {review.user?.lastName}
                              </span>
                              {review.isVerified && (
                                <span className="flex items-center gap-1 text-[8px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-500/20">
                                  <CheckCircle size={8} /> Verified Auditor
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <Rate value={review.rating} disabled />
                              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                <Calendar size={10} />{" "}
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <h5 className="text-white mb-2 tracking-tight group-hover:text-cyan-400 transition-colors uppercase italic font-bold">
                          {review.title}
                        </h5>
                        <p className="text-gray-400 leading-relaxed italic border-l-2 border-cyan-500/10 pl-6 py-2 bg-white/[0.01] rounded-r-xl">
                          "{review.comment}"
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
