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

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUnreadCount();
      fetchNotifications();

      console.log(
        "Initializing Notification Socket...",
        SOCKET_ORIGIN,
        "Path:",
        SOCKET_PATH
      );
      const newSocket = io(SOCKET_ORIGIN, {
        path: SOCKET_PATH,
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("Notification Socket Connected:", newSocket.id);
        newSocket.emit("join_user_notifications", user.id);

        if (["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
          newSocket.emit("join_admin_notifications");
        }
      });

      // Handle real-time notifications
      newSocket.on("new_notification", (data) => {
        playNotificationSound();
        notification.info({
          message: data.title,
          description: data.message,
          placement: "topRight",
          duration: 5,
        });
        setUnreadCount((prev) => prev + 1);
        // Add to notifications list
        setNotifications((prev) => [
          {
            id: data.id,
            title: data.title,
            message: data.message,
            type: data.type,
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          ...prev.slice(0, 9), // Keep only 10
        ]);
      });

      newSocket.on("new_message_notification", (data) => {
        playNotificationSound();
        notification.info({
          message: `New Message from ${data.senderName}`,
          description: data.content || "Sent an image",
          placement: "topRight",
          duration: 4,
        });
        setUnreadCount((prev) => prev + 1);
      });

      newSocket.on("order_status_update", (data) => {
        playNotificationSound();
        notification.success({
          message: "Order Update",
          description: `Order #${data.orderNumber} is now ${data.status}`,
          placement: "topRight",
        });
        setUnreadCount((prev) => prev + 1);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user, fetchUnreadCount, fetchNotifications]);

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
