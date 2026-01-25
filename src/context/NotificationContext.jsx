import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { notification, message as antMessage } from "antd";
import { useAuth } from "./AuthContext";
import { notificationsAPI, API_BASE_URL } from "../services/api";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const audioRef = useRef(
    new Audio(
      "https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3"
    )
  );

  const socketUrl = new URL(API_BASE_URL);
  const SOCKET_ORIGIN = socketUrl.origin;
  const SOCKET_PATH = socketUrl.pathname + "/socket.io";

  // Fetch unread count from API
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [isAuthenticated]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await notificationsAPI.getAll({ limit: 10 });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [isAuthenticated]);

  // Fetch initial data on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      fetchNotifications();
    }
  }, [isAuthenticated, fetchUnreadCount, fetchNotifications]);

  // Handle Socket Connection
  const socketRef = useRef(null);

  useEffect(() => {
    // Cleanup function to safely disconnect
    const cleanup = () => {
      if (socketRef.current) {
        console.log("Disconnecting Notification Socket...");
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    };

    if (!isAuthenticated || !user?.id) {
      cleanup();
      return;
    }

    // Only initialize if not already connected/connecting
    if (socketRef.current?.connected) return;

    console.log("Initializing Notification Socket...", SOCKET_ORIGIN, "Path:", SOCKET_PATH);

    const newSocket = io(SOCKET_ORIGIN, {
      path: SOCKET_PATH,
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 20000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      console.log("Notification Socket Connected:", newSocket.id);
      newSocket.emit("join_user_notifications", user.id);

      if (["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
        newSocket.emit("join_admin_notifications");
      }
    });

    newSocket.on("connect_error", (error) => {
      console.warn("Notification Socket Connection Error:", error.message);
    });

    // Handle real-time notifications
    newSocket.on("new_notification", (data) => {
      playNotificationSound();

      const config = {
        message: data.title,
        description: data.message,
        placement: "topRight",
        duration: 10,
        style: {
          borderRadius: "16px",
          background: "rgba(10, 15, 30, 0.95)",
          border: "1px solid rgba(0, 242, 254, 0.2)",
          backdropFilter: "blur(10px)",
          color: "#fff",
        },
        className: "premium-notification",
      };

      switch (data.type) {
        case "SUCCESS": notification.success(config); break;
        case "WARNING": notification.warning(config); break;
        case "ERROR": notification.error(config); break;
        default: notification.info(config);
      }

      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [
        {
          id: data.id,
          title: data.title,
          message: data.message,
          type: data.type,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev.slice(0, 9),
      ]);
    });

    newSocket.on("new_message_notification", (data) => {
      playNotificationSound();
      notification.info({
        message: `New Message from ${data.senderName}`,
        description: data.content || "Sent an image",
        placement: "topRight",
        duration: 4,
        style: { borderRadius: "12px", background: "rgba(10, 15, 30, 0.9)" },
      });
      setUnreadCount((prev) => prev + 1);
    });

    newSocket.on("order_status_update", (data) => {
      playNotificationSound();
      notification.success({
        message: "Order Update",
        description: `Order #${data.orderNumber} is now ${data.status}`,
        placement: "topRight",
        style: { borderRadius: "12px", background: "rgba(10, 15, 30, 0.9)" },
      });
      setUnreadCount((prev) => prev + 1);
    });

    setSocket(newSocket);

    return cleanup;
  }, [isAuthenticated, user?.id, user?.role, SOCKET_ORIGIN, SOCKET_PATH]);

  const playNotificationSound = () => {
    try {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((e) => console.log("Audio play failed (interaction needed)", e));
    } catch (e) {
      console.error(e);
    }
  };

  const clearNotifications = () => {
    setUnreadCount(0);
  };

  const refreshNotifications = () => {
    fetchUnreadCount();
    fetchNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        socket,
        unreadCount,
        notifications,
        clearNotifications,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
