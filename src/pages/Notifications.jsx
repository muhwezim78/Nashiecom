import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Package,
  Tag as TagIcon,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Loader2,
  Inbox
} from "lucide-react";
import { notificationsAPI } from "../services/api";
import { useNotification } from "../context/NotificationContext";
import { formatDistanceToNow } from "date-fns";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { message } from "../utils/toast";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { clearNotifications } = useNotification();

  const fetchNotifications = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll({
        page: pageNum,
        limit: 20,
      });
      const data = response.data;

      if (append) {
        setNotifications((prev) => [...prev, ...data.notifications]);
      } else {
        setNotifications(data.notifications);
      }

      setHasMore(data.pagination.page < data.pagination.pages);
    } catch (error) {
      message.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      message.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      clearNotifications();
      message.success("All notifications marked as read");
    } catch (error) {
      message.error("Failed to mark all as read");
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "ORDER_UPDATE":
        return <Package className="w-5 h-5 text-blue-400" />;
      case "PROMO":
        return <TagIcon className="w-5 h-5 text-purple-400" />;
      case "SUCCESS":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "WARNING":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case "ERROR":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "SYSTEM":
        return <Settings className="w-5 h-5 text-[var(--text-muted)]" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "ORDER_UPDATE":
        return "bg-blue-500/10 text-blue-400";
      case "PROMO":
        return "bg-purple-500/10 text-purple-400";
      case "SUCCESS":
        return "bg-green-500/10 text-green-400";
      case "WARNING":
        return "bg-yellow-500/10 text-yellow-400";
      case "ERROR":
        return "bg-red-500/10 text-red-400";
      case "SYSTEM":
        return "bg-gray-500/10 text-gray-400";
      default:
        return "bg-cyan-500/10 text-cyan-400";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 pt-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center border border-[var(--border-subtle)]">
                <Bell className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-[var(--text-primary)] m-0 tracking-tight">
                  Notifications
                </h1>
                <span className="text-[var(--text-muted)] font-medium">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                    : "You're all caught up!"}
                </span>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                className="bg-cyan-600 hover:bg-cyan-500 text-white border-none flex items-center gap-2 px-6 h-12 shadow-lg"
              >
                <CheckCheck size={18} /> Mark All as Read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <Card className="bg-[var(--bg-secondary)] border-[var(--border-subtle)] rounded-[2rem] p-0 overflow-hidden shadow-2xl">
            {loading && notifications.length === 0 ? (
              <div className="flex justify-center items-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-[var(--bg-glass)] rounded-full flex items-center justify-center mb-6">
                  <Inbox className="w-10 h-10 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No notifications yet</h3>
                <p className="text-[var(--text-muted)]">When you get notifications, they'll show up here.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                <AnimatePresence>
                  {notifications.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`flex items-start gap-4 p-6 border-b border-[var(--border-subtle)] cursor-pointer transition-all hover:bg-[var(--bg-glass)] ${
                        !item.isRead ? "bg-cyan-500/5" : ""
                      }`}
                      onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          !item.isRead
                            ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30"
                            : "bg-[var(--bg-glass)] border border-[var(--border-subtle)]"
                        }`}
                      >
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          <h4 className={`text-base m-0 font-bold ${!item.isRead ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                            {item.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${getTypeColor(item.type)}`}>
                            {item.type}
                          </span>
                          {!item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-cyan-500 ml-auto animate-pulse" />
                          )}
                        </div>
                        <p className="text-[var(--text-muted)] text-sm m-0 leading-relaxed">
                          {item.message}
                        </p>
                        <span className="text-[var(--text-muted)] text-xs mt-1 font-medium">
                          {formatDistanceToNow(new Date(item.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {hasMore && (
                  <div className="text-center p-6 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)]">
                    <Button onClick={loadMore} disabled={loading} variant="outline" className="min-w-[150px]">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Load More"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;
