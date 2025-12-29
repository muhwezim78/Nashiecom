import { useState } from "react";
import {
  Star,
  User,
  Calendar,
  CheckCircle,
  MessageSquare,
  Send,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  Button,
  Input,
  Rate,
  Form,
  message,
  Avatar,
  Progress,
  Empty,
  Typography,
} from "antd";
import { useProductReviews, useCreateReview } from "../hooks/useReviews";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const { Title, Text, Paragraph } = Typography;

const Reviews = ({ productId }) => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [isFormVisible, setIsFormVisible] = useState(false);

  const { data: reviewsData, isLoading } = useProductReviews(productId);
  const createReviewMutation = useCreateReview();

  const reviews = reviewsData?.data?.reviews || [];
  const distribution = reviewsData?.data?.ratingDistribution || {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  const totalReviews = reviews.length;

  const averageRating =
    totalReviews > 0
      ? (
          Object.entries(distribution).reduce(
            (acc, [rating, count]) => acc + rating * count,
            0
          ) / totalReviews
        ).toFixed(1)
      : 0;

  const onFinish = async (values) => {
    try {
      await createReviewMutation.mutateAsync({
        productId,
        ...values,
      });
      message.success("Review submitted for approval!");
      form.resetFields();
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
            <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase italic">
              User <span className="text-cyan-400">Intelligence</span>
            </h2>
            <p className="text-gray-500 mb-8 font-medium">
              Quantified performance feedback from the field.
            </p>

            <Card className="!bg-[#12121a] !border-0 !rounded-3xl shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] rounded-full -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors" />

              <div className="text-center py-8">
                <div className="text-6xl font-black text-white mb-2 tracking-tighter">
                  {averageRating}
                </div>
                <div className="flex justify-center mb-4">
                  <Rate
                    disabled
                    allowHalf
                    defaultValue={parseFloat(averageRating)}
                    className="custom-rate"
                  />
                </div>
                <Text className="text-gray-500 uppercase tracking-[0.2em] text-[10px] font-black">
                  Based on {totalReviews} verification audits
                </Text>
              </div>

              <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = distribution[rating] || 0;
                  const percentage =
                    totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div
                      key={rating}
                      className="flex items-center gap-4 group/item"
                    >
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

              <Button
                type="primary"
                block
                size="large"
                className="mt-10 !rounded-2xl !h-14 font-black uppercase tracking-widest text-xs border-0 bg-gradient-to-r from-cyan-600 to-blue-700 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                onClick={() => {
                  if (!user) {
                    message.info(
                      "Authentication required for audit submission"
                    );
                    return;
                  }
                  setIsFormVisible(!isFormVisible);
                }}
              >
                Submit Audit Report
              </Button>
            </Card>
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
                <Card className="!bg-[#12121a] !border-white/5 !rounded-3xl shadow-2xl mb-12 border">
                  <div className="flex justify-between items-center mb-8">
                    <Title
                      level={4}
                      className="!text-white !m-0 uppercase tracking-tighter"
                    >
                      Submit Your <span className="text-cyan-400">Audit</span>
                    </Title>
                    <Button
                      type="text"
                      className="!text-gray-500 hover:!text-white"
                      onClick={() => setIsFormVisible(false)}
                    >
                      Cancel
                    </Button>
                  </div>

                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark={false}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <Form.Item
                        name="rating"
                        label={
                          <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                            Efficiency Rating
                          </span>
                        }
                        rules={[{ required: true, message: "Rating required" }]}
                      >
                        <Rate className="text-cyan-400" />
                      </Form.Item>
                      <Form.Item
                        name="title"
                        label={
                          <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                            Audit Subject
                          </span>
                        }
                        rules={[
                          { required: true, message: "Subject required" },
                        ]}
                      >
                        <Input
                          className="dark-input"
                          placeholder="Summarize your experience..."
                        />
                      </Form.Item>
                    </div>
                    <Form.Item
                      name="comment"
                      label={
                        <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                          Detailed Observations
                        </span>
                      }
                      rules={[{ required: true, message: "Comment required" }]}
                    >
                      <Input.TextArea
                        rows={4}
                        className="dark-input"
                        placeholder="Provide technical feedback..."
                      />
                    </Form.Item>
                    <Form.Item className="mb-0">
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={createReviewMutation.isPending}
                        icon={<Send size={16} />}
                        className="!rounded-xl !h-12 font-black uppercase tracking-widest text-[10px] bg-cyan-600 border-0"
                      >
                        Transmit Final Report
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="space-y-6">
            {isLoading ? (
              <div className="py-20 text-center">
                <Text className="text-gray-500">Scanning frequency...</Text>
              </div>
            ) : reviews.length === 0 ? (
              <Card className="!bg-[#12121a] !border-white/5 !rounded-3xl border text-center py-20">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className="text-gray-500 font-medium">
                      No audit reports detected in this sector.
                    </span>
                  }
                />
              </Card>
            ) : (
              reviews.map((review, idx) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="!bg-[#12121a]/50 !border-white/5 !rounded-3xl hover:!border-cyan-500/20 transition-all group overflow-hidden border">
                    <div className="flex gap-6">
                      <div className="hidden sm:block">
                        <Avatar
                          size={56}
                          icon={<User />}
                          src={review.user?.avatar}
                          className="border-2 border-cyan-500/20"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <Text className="text-white font-black uppercase text-sm tracking-tighter">
                                {review.user?.firstName} {review.user?.lastName}
                              </Text>
                              {review.isVerified && (
                                <span className="flex items-center gap-1 text-[8px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-500/20">
                                  <CheckCircle size={8} /> Verified Auditor
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <Rate
                                disabled
                                defaultValue={review.rating}
                                size="small"
                                className="text-[10px]"
                              />
                              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                <Calendar size={10} />{" "}
                                {new Date(
                                  review.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Title
                          level={5}
                          className="!text-white !mb-2 tracking-tight group-hover:text-cyan-400 transition-colors uppercase italic"
                        >
                          {review.title}
                        </Title>
                        <Paragraph className="text-gray-400 leading-relaxed italic border-l-2 border-cyan-500/10 pl-6 py-2 bg-white/[0.01] rounded-r-xl">
                          "{review.comment}"
                        </Paragraph>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-rate .ant-rate-star-second {
          color: rgba(255, 255, 255, 0.05);
        }
        .custom-rate .ant-rate-star-full .ant-rate-star-second {
          color: #06b6d4;
        }
        .dark-input {
          background: rgba(255, 255, 255, 0.02) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          border-radius: 12px !important;
          color: white !important;
          padding: 12px 16px !important;
        }
        .dark-input:focus {
          border-color: #06b6d4 !important;
          box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.1) !important;
        }
        .dark-input::placeholder {
          color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Reviews;
