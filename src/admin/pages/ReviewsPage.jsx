import { useState, useEffect } from "react";
import { Trash2, CheckCircle, XCircle, User, Package, Star } from "lucide-react";
import { reviewsAPI } from "../../services/api";
import { message } from "../../utils/toast";

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchReviews = async (page = 1, stat = status) => {
    setLoading(true);
    try {
      const { data } = await reviewsAPI.getAll({
        page,
        limit: pagination.pageSize,
        status: stat,
      });
      setReviews(data.reviews);
      setPagination({
        ...pagination,
        current: data.pagination.page,
        total: data.pagination.total,
      });
    } catch (error) {
      console.error(error);
      message.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, status);
  }, [status]);

  const handleApprove = async (id) => {
    try {
      await reviewsAPI.approve(id);
      message.success("Review approved");
      fetchReviews(pagination.current);
    } catch (error) {
      message.error("Failed to approve review");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject and delete this audit report?")) return;
    try {
      await reviewsAPI.reject(id);
      message.success("Review rejected and removed");
      fetchReviews(pagination.current);
    } catch (error) {
      message.error("Failed to reject review");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Intelligence Audits</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Moderate and verify user intelligence reports
          </p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-[var(--bg-glass)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl px-4 py-2 outline-none focus:border-cyan-500"
        >
          <option value="all" className="bg-[#1a1a24]">All Logs</option>
          <option value="pending" className="bg-[#1a1a24]">Pending Validation</option>
          <option value="approved" className="bg-[#1a1a24]">Verified Data</option>
        </select>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-glass)]">
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Auditor</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Module</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider w-1/3">Audit Detail</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Deployment Date</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[var(--text-muted)]">Loading reviews...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[var(--text-muted)]">No reviews found.</td>
                </tr>
              ) : (
                reviews.map((record) => (
                  <tr key={record.id} className="hover:bg-[var(--bg-glass)] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {record.user?.avatar ? (
                          <img src={record.user.avatar} alt="User" className="w-8 h-8 rounded-full border border-cyan-500/20 object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[var(--bg-primary)] border border-cyan-500/20 flex items-center justify-center">
                            <User size={14} className="text-cyan-500" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-xs uppercase tracking-tighter text-[var(--text-primary)]">
                            {record.user?.firstName} {record.user?.lastName}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)]">
                            {record.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-cyan-400" />
                        <span className="font-bold text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
                          {record.product?.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} className={i < record.rating ? "fill-cyan-500 text-cyan-500" : "text-gray-600"} />
                          ))}
                        </div>
                        {record.isVerified && (
                          <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-[var(--text-primary)] text-[11px] uppercase italic mb-1">
                        {record.title}
                      </div>
                      <div className="text-[var(--text-secondary)] text-xs italic line-clamp-2">
                        "{record.comment}"
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                        record.isApproved ? "bg-cyan-500/20 text-cyan-400" : "bg-yellow-500/20 text-yellow-500"
                      }`}>
                        {record.isApproved ? "Approved" : "Pending Audit"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {!record.isApproved && (
                          <button
                            onClick={() => handleApprove(record.id)}
                            title="Approve Audit"
                            className="p-1.5 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleReject(record.id)}
                          title="Reject Audit"
                          className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination placeholder */}
        {pagination.total > pagination.pageSize && (
          <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-sm text-[var(--text-secondary)]">
            <span>Showing {((pagination.current - 1) * pagination.pageSize) + 1} to {Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total} entries</span>
            <div className="flex gap-2">
              <button 
                disabled={pagination.current === 1}
                onClick={() => fetchReviews(pagination.current - 1)}
                className="px-3 py-1 rounded-lg bg-[var(--bg-glass)] hover:bg-[var(--bg-primary)] disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                disabled={pagination.current * pagination.pageSize >= pagination.total}
                onClick={() => fetchReviews(pagination.current + 1)}
                className="px-3 py-1 rounded-lg bg-[var(--bg-glass)] hover:bg-[var(--bg-primary)] disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
