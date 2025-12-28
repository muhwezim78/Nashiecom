import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  List,
  Badge,
  Button,
  Empty,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
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
} from "lucide-react";
import { notificationsAPI } from "../services/api";
import { useNotification } from "../context/NotificationContext";
import { formatDistanceToNow } from "date-fns";

const { Title, Text } = Typography;

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
        return <Settings className="w-5 h-5 text-gray-400" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "ORDER_UPDATE":
        return "blue";
      case "PROMO":
        return "purple";
      case "SUCCESS":
        return "green";
      case "WARNING":
        return "orange";
      case "ERROR":
        return "red";
      case "SYSTEM":
        return "default";
      default:
        return "cyan";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <Bell className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <Title level={2} className="!text-white !mb-0">
                  Notifications
                </Title>
                <Text className="text-gray-400">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${
                        unreadCount > 1 ? "s" : ""
                      }`
                    : "You're all caught up!"}
                </Text>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                type="primary"
                icon={<CheckCheck className="w-4 h-4" />}
                onClick={handleMarkAllAsRead}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 border-none"
              >
                Mark All as Read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <Card className="!bg-white/5 !border-white/10 !rounded-2xl">
            {loading && notifications.length === 0 ? (
              <div className="flex justify-center py-12">
                <Spin size="large" />
              </div>
            ) : notifications.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text className="text-gray-400">No notifications yet</Text>
                }
              />
            ) : (
              <List
                dataSource={notifications}
                renderItem={(item) => (
                  <List.Item
                    className={`!border-b !border-white/5 cursor-pointer transition-all hover:bg-white/5 !px-4 !py-4 ${
                      !item.isRead ? "bg-cyan-500/5" : ""
                    }`}
                    onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                  >
                    <div className="flex items-start gap-4 w-full">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          !item.isRead
                            ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
                            : "bg-white/5"
                        }`}
                      >
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Text
                            className={`font-semibold ${
                              !item.isRead ? "text-white" : "text-gray-300"
                            }`}
                          >
                            {item.title}
                          </Text>
                          <Tag
                            color={getTypeColor(item.type)}
                            className="text-xs"
                          >
                            {item.type}
                          </Tag>
                          {!item.isRead && (
                            <Badge status="processing" className="ml-auto" />
                          )}
                        </div>
                        <Text className="text-gray-400 text-sm block">
                          {item.message}
                        </Text>
                        <Text className="text-gray-500 text-xs mt-2 block">
                          {formatDistanceToNow(new Date(item.createdAt), {
                            addSuffix: true,
                          })}
                        </Text>
                      </div>
                    </div>
                  </List.Item>
                )}
                loadMore={
                  hasMore && (
                    <div className="text-center py-4">
                      <Button onClick={loadMore} loading={loading}>
                        Load More
                      </Button>
                    </div>
                  )
                }
              />
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;
