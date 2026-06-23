import { useState, useEffect } from "react";
import { Eye, Mail, MessageSquare, RefreshCw, X, Loader2 } from "lucide-react";
import { contactAPI, chatAPI } from "../../services/api";
import ChatWindow from "../../components/chat/ChatWindow";
import { message } from "../../utils/toast";

const MessagesPage = () => {
  const [activeTab, setActiveTab] = useState("chats"); // "chats" | "contact"

  // Contact Messages State
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);

  // Order Chats State
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [selectedChatOrder, setSelectedChatOrder] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const fetchContactMessages = async () => {
    setLoadingMessages(true);
    try {
      const { data } = await contactAPI.getAll();
      setMessages(data.messages || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchOrderChats = async () => {
    setLoadingChats(true);
    try {
      const { data } = await chatAPI.getAllChats();
      setChats(data.chats || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    if (activeTab === "contact") fetchContactMessages();
    else fetchOrderChats();
  }, [activeTab]);

  const handleStatusChange = async (id, status) => {
    try {
      await contactAPI.updateStatus(id, status);
      message.success("Status updated");
      fetchContactMessages();
      if (currentMessage && currentMessage.id === id) {
        setCurrentMessage({ ...currentMessage, status });
      }
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Messages</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage customer communications</p>
        </div>
        <button
          onClick={activeTab === "contact" ? fetchContactMessages : fetchOrderChats}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-glass)] hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl transition-colors"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="flex border-b border-[var(--border-subtle)]">
        <button
          onClick={() => setActiveTab("chats")}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === "chats" ? "text-cyan-400" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <MessageSquare size={18} />
          Order Chats
          {chats.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">{chats.length}</span>}
          {activeTab === "chats" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === "contact" ? "text-cyan-400" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Mail size={18} />
          Inquiries
          {activeTab === "contact" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
        </button>
      </div>

      {activeTab === "chats" ? (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-glass)]">
                  <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Order #</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Last Message</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Last Updated</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {loadingChats ? (
                  <tr><td colSpan="5" className="p-8 text-center text-[var(--text-muted)]"><Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500 mb-2" /> Loading chats...</td></tr>
                ) : chats.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-[var(--text-muted)]">No active chats found.</td></tr>
                ) : (
                  chats.map((record) => (
                    <tr key={record.id} className="hover:bg-[var(--bg-glass)] transition-colors">
                      <td className="p-4 font-semibold text-cyan-400">{record.orderNumber}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {record.customer?.avatar ? (
                            <img src={record.customer.avatar} className="w-8 h-8 rounded-full object-cover border border-[var(--border-subtle)]" alt="" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-center text-xs font-bold text-[var(--text-primary)]">
                              {record.customer?.firstName?.[0] || "?"}
                            </div>
                          )}
                          <span className="font-medium text-[var(--text-primary)]">
                            {record.customer?.firstName} {record.customer?.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="max-w-xs truncate text-[var(--text-secondary)] text-sm">
                          {record.lastMessage?.isAdmin && <span className="text-cyan-500 mr-1 font-medium">You:</span>}
                          {record.lastMessage?.content || (record.lastMessage?.imageUrl ? "📷 Image" : "")}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-[var(--text-muted)]">
                        {new Date(record.updatedAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => { setSelectedChatOrder(record); setIsChatOpen(true); }}
                          className="px-4 py-2 bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/40 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ml-auto"
                        >
                          <MessageSquare size={16} /> Open Chat
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-glass)]">
                  <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Name</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Email</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Subject</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {loadingMessages ? (
                  <tr><td colSpan="6" className="p-8 text-center text-[var(--text-muted)]"><Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500 mb-2" /> Loading inquiries...</td></tr>
                ) : messages.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-[var(--text-muted)]">No inquiries found.</td></tr>
                ) : (
                  messages.map((record) => (
                    <tr key={record.id} className="hover:bg-[var(--bg-glass)] transition-colors">
                      <td className="p-4 font-medium text-[var(--text-primary)]">{record.name}</td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">{record.email}</td>
                      <td className="p-4 text-sm text-[var(--text-primary)] max-w-[200px] truncate">{record.subject}</td>
                      <td className="p-4 text-xs text-[var(--text-muted)]">{new Date(record.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <select
                          value={record.status}
                          onChange={(e) => handleStatusChange(record.id, e.target.value)}
                          className="px-2 py-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-xs font-medium text-[var(--text-primary)] outline-none"
                        >
                          <option value="NEW">New</option>
                          <option value="READ">Read</option>
                          <option value="REPLIED">Replied</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setCurrentMessage(record); setViewModalOpen(true); }} className="p-2 text-cyan-500 hover:bg-cyan-500/10 rounded-lg transition-colors" title="View"><Eye size={16} /></button>
                          <a href={`mailto:${record.email}`} className="p-2 text-purple-500 hover:bg-purple-500/10 rounded-lg transition-colors" title="Reply via Email"><Mail size={16} /></a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Contact Message Modal */}
      {viewModalOpen && currentMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-glass)]">
              <h3 className="font-bold text-lg text-[var(--text-primary)]">View Inquiry</h3>
              <button onClick={() => setViewModalOpen(false)} className="text-[var(--text-muted)] hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              <div className="bg-[var(--bg-glass)] p-4 rounded-xl border border-[var(--border-subtle)] flex flex-col gap-2 text-sm">
                <div><span className="text-[var(--text-muted)] inline-block w-20">From:</span> <span className="font-medium text-[var(--text-primary)]">{currentMessage.name}</span></div>
                <div><span className="text-[var(--text-muted)] inline-block w-20">Email:</span> <span className="font-medium text-[var(--text-primary)]">{currentMessage.email}</span></div>
                <div><span className="text-[var(--text-muted)] inline-block w-20">Date:</span> <span className="text-[var(--text-secondary)]">{new Date(currentMessage.createdAt).toLocaleString()}</span></div>
                <div><span className="text-[var(--text-muted)] inline-block w-20">Subject:</span> <span className="font-medium text-[var(--text-primary)]">{currentMessage.subject}</span></div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Message Content</h4>
                <div className="bg-[var(--bg-glass)] p-4 rounded-xl border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm whitespace-pre-wrap leading-relaxed">
                  {currentMessage.message}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-glass)] flex justify-end gap-3">
              <button onClick={() => setViewModalOpen(false)} className="px-5 py-2 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors">Close</button>
              <a href={`mailto:${currentMessage.email}`} className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-lg transition-colors flex items-center gap-2">
                <Mail size={16} /> Reply by Email
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Order Chat Window */}
      {isChatOpen && selectedChatOrder && (
        <ChatWindow
          orderId={selectedChatOrder.id}
          orderNumber={selectedChatOrder.orderNumber}
          onClose={() => setIsChatOpen(false)}
          isAdmin={true}
        />
      )}
    </div>
  );
};

export default MessagesPage;
