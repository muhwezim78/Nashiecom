import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Image as ImageIcon,
  X,
  Loader2,
  MessageSquare,
  MapPin,
  Map as MapIcon,
  Smile,
  Phone,
  Video,
  MoreHorizontal,
  Check,
  CheckCheck,
} from "lucide-react";
import {
  Button,
  Input,
  Avatar,
  Badge,
  Tooltip,
  Typography,
  Space,
  Spin,
  App,
  Dropdown,
} from "antd";
import { io } from "socket.io-client";
import { chatAPI, uploadAPI, API_BASE_URL } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import "./ChatWindow.css";

const { Text, Paragraph } = Typography;
const socketUrl = new URL(API_BASE_URL);
const SOCKET_ORIGIN = socketUrl.origin;
const SOCKET_PATH = socketUrl.pathname + "/socket.io";

const ChatWindow = ({ orderId, orderNumber, onClose, isAdmin = false }) => {
  const { message: antdMessage } = App.useApp();
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
    const fetchMessages = async () => {
      try {
        const response = await chatAPI.getMessages(orderId);
        setMessages(response.data?.messages || []);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        antdMessage.error("Failed to load chat history");
      } finally {
        setLoading(false);
        setTimeout(() => scrollToBottom("auto"), 100);
      }
    };

    fetchMessages();

    socketRef.current = io(SOCKET_ORIGIN, {
      path: SOCKET_PATH,
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    socketRef.current.on("connect", () => {
      setConnected(true);
      socketRef.current.emit("join_order_chat", orderId);
    });

    socketRef.current.on("connect_error", () => setConnected(false));

    socketRef.current.on("receive_message", (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      setTimeout(() => scrollToBottom("smooth"), 100);
    });

    return () => socketRef.current?.disconnect();
  }, [orderId]);

  const handleSendMessage = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!inputValue.trim() || sending) return;

    setSending(true);
    const content = inputValue;
    setInputValue("");

    try {
      const response = await chatAPI.sendMessage(orderId, { content, isAdmin });
      const newMsg = response.data?.message;
      if (newMsg) {
        socketRef.current.emit("send_message", { orderId, message: newMsg });
        setMessages((prev) => prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]);
        setTimeout(() => scrollToBottom("smooth"), 100);
      }
    } catch {
      antdMessage.error("Message delivery failed");
      setInputValue(content);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || uploading) return;
    if (!file.type.startsWith("image/")) {
      antdMessage.warning("Only images allowed");
      return;
    }
    setUploading(true);
    try {
      const uploadRes = await uploadAPI.image(file);
      const imageUrl = uploadRes.data?.url;
      if (!imageUrl) throw new Error("Upload failed");
      const response = await chatAPI.sendMessage(orderId, { content: null, imageUrl, isAdmin });
      const newMsg = response.data?.message;
      if (newMsg) {
        socketRef.current.emit("send_message", { orderId, message: newMsg });
        setMessages((prev) => prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]);
        setTimeout(() => scrollToBottom("smooth"), 100);
      }
    } catch {
      antdMessage.error("Image upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      antdMessage.error("Geolocation not available");
      return;
    }
    setSharingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await chatAPI.sendMessage(orderId, {
            content: null,
            location: `${latitude},${longitude}`,
            isAdmin
          });
          const newMsg = response.data?.message;
          if (newMsg) {
            socketRef.current.emit("send_message", { orderId, message: newMsg });
            setMessages((prev) => prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]);
            setTimeout(() => scrollToBottom("smooth"), 100);
          }
        } catch {
          antdMessage.error("Location share failed");
        } finally {
          setSharingLocation(false);
        }
      },
      () => {
        antdMessage.error("Location access denied");
        setSharingLocation(false);
      }
    );
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const moreMenuItems = [
    { key: 'call', label: 'Voice Call', icon: <Phone size={14} /> },
    { key: 'video', label: 'Video Call', icon: <Video size={14} /> },
    { type: 'divider' },
    { key: 'close', label: 'End Chat', icon: <X size={14} />, danger: true },
  ];

  return (
    <div className="chat-container">
      {/* Sleek Header */}
      <header className="chat-header">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar
              size={42}
              className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold"
            >
              {isAdmin ? 'N' : orderNumber?.slice(-2)}
            </Avatar>
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--bg-secondary)] ${connected ? 'bg-green-500' : 'bg-gray-500'}`} />
          </div>
          <div className="leading-tight">
            <Text strong className="text-[var(--text-primary)] block text-sm">
              {isAdmin ? 'Customer Support' : `Order #${orderNumber}`}
            </Text>
            <Text className="text-[var(--text-muted)] text-xs">
              {connected ? 'Online · Typically replies instantly' : 'Connecting...'}
            </Text>
          </div>
        </div>
        <Space size={4}>
          <Dropdown menu={{ items: moreMenuItems, onClick: ({ key }) => key === 'close' && onClose() }} trigger={['click']} placement="bottomRight">
            <Button type="text" className="chat-header-btn" icon={<MoreHorizontal size={18} />} />
          </Dropdown>
          <Button type="text" className="chat-header-btn hover:!bg-red-500/10 hover:!text-red-400" icon={<X size={18} />} onClick={onClose} />
        </Space>
      </header>

      {/* Conversation Area */}
      <main className="chat-body">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Spin indicator={<Loader2 className="animate-spin text-cyan-500" size={28} />} />
            <Text className="text-[var(--text-muted)] text-xs uppercase tracking-widest">Loading messages...</Text>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4">
              <MessageSquare size={32} className="text-cyan-500" />
            </div>
            <Text strong className="text-[var(--text-primary)] text-lg mb-1">Start Conversation</Text>
            <Text className="text-[var(--text-muted)] text-sm">
              Send a message to connect with {isAdmin ? 'the customer' : 'our support team'}.
            </Text>
          </div>
        ) : (
          <div className="flex flex-col gap-1 px-4 py-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => {
                const isMe = currentUser && msg.senderId === currentUser.id;
                const showAvatar = idx === messages.length - 1 || messages[idx + 1]?.senderId !== msg.senderId;
                const isFirstInGroup = idx === 0 || messages[idx - 1]?.senderId !== msg.senderId;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''} ${isFirstInGroup ? 'mt-3' : ''}`}
                  >
                    {/* Avatar placeholder for alignment */}
                    <div className="w-7 shrink-0">
                      {showAvatar && !isMe && (
                        <Avatar size={28} className="bg-gray-700 text-xs font-bold">
                          {msg.sender?.firstName?.[0] || 'S'}
                        </Avatar>
                      )}
                    </div>

                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`message-bubble ${isMe ? 'sent' : 'received'} ${msg.isAdmin && !isMe ? 'admin' : ''}`}>
                        {msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt="Attachment"
                            className="message-image"
                            onClick={() => window.open(msg.imageUrl)}
                          />
                        )}
                        {msg.content && (
                          <Paragraph className="!m-0 text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </Paragraph>
                        )}
                        {msg.location && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${msg.location}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="location-link"
                          >
                            <MapIcon size={14} />
                            <span>View Location</span>
                          </a>
                        )}
                        <span className="message-time">
                          {formatTime(msg.createdAt)}
                          {isMe && <CheckCheck size={12} className="ml-1 text-cyan-400" />}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Modern Input Bar */}
      <footer className="chat-footer">
        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />

        <div className="input-container">
          <div className="input-actions-left">
            <Tooltip title="Attach Image">
              <button
                className="input-action-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
              </button>
            </Tooltip>
            <Tooltip title="Share Location">
              <button
                className="input-action-btn"
                onClick={handleShareLocation}
                disabled={sharingLocation}
              >
                {sharingLocation ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
              </button>
            </Tooltip>
          </div>

          <Input
            placeholder="Type a message..."
            variant="borderless"
            className="message-input"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onPressEnter={handleSendMessage}
            disabled={sending}
          />

          <button
            className={`send-button ${inputValue.trim() ? 'active' : ''}`}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || sending}
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatWindow;
