import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Image as ImageIcon,
  X,
  Loader2,
  MessageSquare,
  MapPin,
  Map as MapIcon,
  MoreHorizontal,
  CheckCheck,
} from "lucide-react";
import { io } from "socket.io-client";
import { chatAPI, uploadAPI, API_BASE_URL } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { message } from "../../utils/toast";

const socketUrl = new URL(API_BASE_URL);
const SOCKET_ORIGIN = socketUrl.origin;
const SOCKET_PATH = socketUrl.pathname + "/socket.io";

const ChatWindow = ({ orderId, orderNumber, onClose, isAdmin = false }) => {
  const { user: currentUser } = useAuth();
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
        message.error("Failed to load chat history");
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

    socketRef.current.on("receive_message", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
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
      message.error("Message delivery failed");
      setInputValue(content);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || uploading) return;
    if (!file.type.startsWith("image/")) {
      message.warning("Only images allowed");
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
      message.error("Image upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      message.error("Geolocation not available");
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
          message.error("Location share failed");
        } finally {
          setSharingLocation(false);
        }
      },
      () => {
        message.error("Location access denied");
        setSharingLocation(false);
      }
    );
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-[400px] h-[580px] max-w-full max-h-full flex flex-col bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] relative z-[1001] mt-4 sm:w-full sm:h-full sm:rounded-none">
      {/* Sleek Header */}
      <header className="px-4 py-3.5 flex justify-between items-center bg-gradient-to-b from-[var(--bg-tertiary)] to-[var(--bg-secondary)] border-b border-[var(--border-main)] relative z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-lg">
              {isAdmin ? 'N' : orderNumber?.slice(-2)}
            </div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--bg-secondary)] ${connected ? 'bg-green-500' : 'bg-gray-500'}`} />
          </div>
          <div className="leading-tight">
            <span className="text-[var(--text-primary)] block text-sm font-semibold">
              {isAdmin ? 'Customer Support' : `Order #${orderNumber}`}
            </span>
            <span className="text-[var(--text-muted)] text-xs">
              {connected ? 'Online · Typically replies instantly' : 'Connecting...'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-glass)] hover:text-[var(--text-primary)] transition-all" onClick={onClose} title="More">
            <MoreHorizontal size={18} />
          </button>
          <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-all" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Conversation Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[var(--bg-primary)] flex flex-col custom-scrollbar">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-cyan-500 w-7 h-7" />
            <span className="text-[var(--text-muted)] text-xs uppercase tracking-widest">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4">
              <MessageSquare size={32} className="text-cyan-500" />
            </div>
            <span className="text-[var(--text-primary)] text-lg font-bold block mb-1">Start Conversation</span>
            <span className="text-[var(--text-muted)] text-sm">
              Send a message to connect with {isAdmin ? 'the customer' : 'our support team'}.
            </span>
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
                    <div className="w-7 shrink-0">
                      {showAvatar && !isMe && (
                        <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                          {msg.sender?.firstName?.[0] || 'S'}
                        </div>
                      )}
                    </div>

                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`px-3.5 py-2.5 rounded-[18px] relative max-w-full break-words text-sm ${
                        isMe 
                          ? 'bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] text-white rounded-br-md ml-auto' 
                          : msg.isAdmin 
                            ? 'bg-[rgba(14,165,233,0.08)] text-[var(--text-primary)] border border-[var(--border-subtle)] border-l-[3px] border-l-[var(--accent-primary)] rounded-bl-md'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-bl-md'
                      }`}>
                        {msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt="Attachment"
                            className="max-w-[220px] rounded-xl mb-1.5 cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                            onClick={() => window.open(msg.imageUrl)}
                          />
                        )}
                        {msg.content && (
                          <p className="m-0 leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        )}
                        {msg.location && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${msg.location}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 mt-1.5 rounded-lg text-xs font-medium no-underline transition-all ${
                              isMe 
                                ? 'bg-white/15 text-white hover:bg-white/25' 
                                : 'bg-[var(--bg-glass)] text-cyan-400 hover:bg-cyan-500/15'
                            }`}
                          >
                            <MapIcon size={14} />
                            <span>View Location</span>
                          </a>
                        )}
                        <span className={`flex items-center justify-end text-[10px] opacity-60 mt-1 gap-0.5 ${
                          isMe ? 'text-white/70' : 'text-[var(--text-muted)]'
                        }`}>
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
      <footer className="px-4 py-3 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] shrink-0">
        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />

        <div className="flex items-center gap-2 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-full p-1.5 pl-3 transition-colors focus-within:border-[var(--accent-primary)]">
          <div className="flex gap-0.5">
            <button
              className="w-8 h-8 flex items-center justify-center border-none bg-transparent text-[var(--text-muted)] rounded-full cursor-pointer hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Attach Image"
            >
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center border-none bg-transparent text-[var(--text-muted)] rounded-full cursor-pointer hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              onClick={handleShareLocation}
              disabled={sharingLocation}
              title="Share Location"
            >
              {sharingLocation ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
            </button>
          </div>

          <input
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage(e)}
            disabled={sending}
          />

          <button
            className={`w-9 h-9 flex items-center justify-center border-none rounded-full cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              inputValue.trim() 
                ? 'bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-105 shadow-[0_2px_8px_rgba(14,165,233,0.4)]' 
                : 'bg-[var(--bg-glass)] text-[var(--text-muted)]'
            }`}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || sending}
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className={inputValue.trim() ? "translate-x-[1px] translate-y-[-1px]" : ""} />}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatWindow;
