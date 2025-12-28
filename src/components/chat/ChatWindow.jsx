import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Image as ImageIcon,
  X,
  Loader2,
  User as UserIcon,
  MessageSquare,
  AlertCircle,
  MapPin,
  Map as MapIcon,
} from "lucide-react";
import { io } from "socket.io-client";
import { chatAPI, uploadAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./ChatWindow.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = API_URL.replace("/api", "");

const ChatWindow = ({ orderId, orderNumber, onClose, isAdmin = false }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user: currentUser } = useAuth();

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const response = await chatAPI.getMessages(orderId);
        // The API returns { success: true, data: { messages: [...] } }
        setMessages(response.data?.messages || []);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
        setTimeout(() => scrollToBottom("auto"), 100);
      }
    };

    fetchMessages();

    // Initialize Socket
    console.log("Connecting to Socket:", SOCKET_URL);
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to chat socket:", socketRef.current.id);
      setConnected(true);
      socketRef.current.emit("join_order_chat", orderId);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket Connection Error:", error);
      setConnected(false);
    });

    socketRef.current.on("receive_message", (message) => {
      console.log("Received message via socket:", message);
      setMessages((prev) => {
        // Prevent duplicate messages if the sender also receives their own emit
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      setTimeout(() => scrollToBottom("smooth"), 100);
    });

    return () => {
      if (socketRef.current) {
        console.log("Disconnecting socket");
        socketRef.current.off("receive_message");
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");
        socketRef.current.disconnect();
      }
    };
  }, [orderId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    setSending(true);
    const content = inputValue;
    setInputValue(""); // Clear input early for better UX

    try {
      const response = await chatAPI.sendMessage(orderId, {
        content,
        isAdmin,
      });

      // The response is { success: true, data: { message: {...} } }
      const newMsg = response.data?.message;

      if (newMsg) {
        // Emit via socket so other participants receive it
        socketRef.current.emit("send_message", {
          orderId,
          message: newMsg,
        });

        // Add to local state immediately if socket doesn't loop back to sender
        // (Server-side io.to(id).emit usually loops back, so we check for duplicates in receive_message)
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(() => scrollToBottom("smooth"), 100);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setInputValue(content); // Restore input on failure
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || uploading) return;

    // Basic file type check
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setUploading(true);
    try {
      const uploadRes = await uploadAPI.image(file);
      const imageUrl = uploadRes.data?.url;

      if (!imageUrl) {
        throw new Error("Failed to get image URL");
      }

      const response = await chatAPI.sendMessage(orderId, {
        content: null,
        imageUrl,
        isAdmin,
      });

      const newMsg = response.data?.message;

      if (newMsg) {
        socketRef.current.emit("send_message", {
          orderId,
          message: newMsg,
        });

        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(() => scrollToBottom("smooth"), 100);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleShareLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setSharingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${latitude},${longitude}`;

        try {
          const response = await chatAPI.sendMessage(orderId, {
            content: null,
            location: locationString,
            isAdmin,
          });

          const newMsg = response.data?.message;

          if (newMsg) {
            socketRef.current.emit("send_message", {
              orderId,
              message: newMsg,
            });

            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            setTimeout(() => scrollToBottom("smooth"), 100);
          }
        } catch (error) {
          console.error("Failed to share location:", error);
        } finally {
          setSharingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location");
        setSharingLocation(false);
      }
    );
  };

  return (
    <div className="chat-window-container glassmorphism">
      <div className="chat-header">
        <div className="chat-info">
          <div className="chat-avatar">
            <UserIcon size={22} className="text-white" />
          </div>
          <div>
            <h3>Chat: {orderNumber}</h3>
            <span className="chat-status flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  connected ? "bg-green-400" : "bg-red-400"
                }`}
              ></span>
              {isAdmin ? "Admin Support" : "Customer Chat"}
            </span>
          </div>
        </div>
        <button className="close-btn" onClick={onClose} title="Close Chat">
          <X size={20} />
        </button>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="chat-loader">
            <Loader2 className="animate-spin text-cyan-400" size={32} />
            <p>Loading conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-chat">
            <MessageSquare size={48} className="text-gray-600 mb-2" />
            <p>
              No messages yet.
              <br />
              Type below to start the conversation.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-bubble ${
                currentUser && msg.senderId === currentUser.id ? "me" : "them"
              } ${
                msg.isAdmin && msg.senderId !== currentUser?.id
                  ? "admin-msg"
                  : ""
              }`}
            >
              <div className="message-sender">
                {msg.sender?.firstName || "User"} {msg.sender?.lastName || ""}
                {msg.isAdmin && ` (Admin)`}
              </div>
              <div className="message-content">
                {msg.imageUrl && (
                  <a
                    href={msg.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={msg.imageUrl}
                      alt="Uploaded attachment"
                      className="chat-image"
                    />
                  </a>
                )}
                {msg.content && <p>{msg.content}</p>}
                {msg.location && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${msg.location}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-white/10 rounded-lg text-cyan-400 hover:text-cyan-300 transition-colors mt-1 border border-cyan-500/30 hover:bg-cyan-500/10"
                  >
                    <MapIcon size={16} />
                    <span className="text-sm underline">
                      View Live Location
                    </span>
                  </a>
                )}
              </div>
              <div className="message-time">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSendMessage}>
        <button
          type="button"
          className="icon-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Upload Image"
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <ImageIcon size={20} />
          )}
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={handleShareLocation}
          disabled={sharingLocation}
          title="Share Live Location"
        >
          {sharingLocation ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <MapPin size={20} />
          )}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept="image/*"
          onChange={handleImageUpload}
        />
        <input
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!inputValue.trim() || sending}
          title="Send Message"
        >
          {sending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
