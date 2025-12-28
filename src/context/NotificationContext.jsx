import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { notification, message as antMessage } from "antd";
import { useAuth } from "./AuthContext";
// import notificationSound from "../assets/notification.mp3";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = useRef(
    new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
    )
  );

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const SOCKET_URL = API_URL.replace("/api", "");

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Initializing Notification Socket...");
      const newSocket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("Notification Socket Connected:", newSocket.id);
        // Join a room specific to this user
        newSocket.emit("join_user_notifications", user.id);

        // If Admin, join admin channel
        if (["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
          newSocket.emit("join_admin_notifications");
        }
      });

      newSocket.on("new_message_notification", (data) => {
        // data = { orderId, senderName, content }
        playNotificationSound();
        notification.info({
          message: `New Message from ${data.senderName}`,
          description: data.content || "Sent an image",
          placement: "topRight",
          duration: 4,
          onClick: () => {
            // Logic to navigate to chat if needed,
            // or just let the user know.
            // Ideally navigate to /my-orders or /admin/messages
          },
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
  }, [isAuthenticated, user]);

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

  return (
    <NotificationContext.Provider
      value={{ socket, unreadCount, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
