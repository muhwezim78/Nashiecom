import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Descriptions,
  Select,
  message,
  Tabs,
  Badge,
} from "antd";
import { Eye, Mail, MessageSquare, RefreshCw } from "lucide-react";
import { contactAPI, chatAPI } from "../../services/api";
import ChatWindow from "../../components/chat/ChatWindow";
import "../layouts/AdminLayout.css";

const MessagesPage = () => {
  const [activeTab, setActiveTab] = useState("chats");

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
      // message.error("Failed to load active chats");
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    if (activeTab === "contact") fetchContactMessages();
    else fetchOrderChats();
  }, [activeTab]);

  // --- Contact Messages Logic ---

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

  const contactColumns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Subject", dataIndex: "subject", key: "subject" },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          defaultValue={status}
          size="small"
          onChange={(val) => handleStatusChange(record.id, val)}
          style={{ width: 120 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Select.Option value="NEW">New</Select.Option>
          <Select.Option value="READ">Read</Select.Option>
          <Select.Option value="REPLIED">Replied</Select.Option>
          <Select.Option value="ARCHIVED">Archived</Select.Option>
        </Select>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<Eye size={16} />}
            onClick={() => {
              setCurrentMessage(record);
              setViewModalOpen(true);
            }}
          />
          <Button icon={<Mail size={16} />} href={`mailto:${record.email}`} />
        </Space>
      ),
    },
  ];

  // --- Order Chats Logic ---

  const chatColumns = [
    {
      title: "Order #",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text) => (
        <span className="font-semibold text-cyan-400">{text}</span>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.customer?.avatar ? (
            <img
              src={record.customer.avatar}
              className="w-6 h-6 rounded-full"
              alt=""
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">
              {record.customer?.firstName?.[0]}
            </div>
          )}
          <span>
            {record.customer?.firstName} {record.customer?.lastName}
          </span>
        </div>
      ),
    },
    {
      title: "Last Message",
      dataIndex: "lastMessage",
      key: "lastMessage",
      render: (msg) => (
        <div className="max-w-xs truncate text-gray-400">
          {msg?.isAdmin && <span className="text-cyan-500 mr-1">You:</span>}
          {msg?.content || (msg?.imageUrl ? "📷 Image" : "")}
        </div>
      ),
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => (
        <span className="text-xs text-gray-500">
          {new Date(date).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<MessageSquare size={16} />}
          onClick={() => {
            setSelectedChatOrder(record);
            setIsChatOpen(true);
          }}
        >
          Open Chat
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Messages</h1>
          <p className="admin-page-subtitle">Manage customer communications</p>
        </div>
        <Button
          icon={<RefreshCw size={16} />}
          onClick={
            activeTab === "contact" ? fetchContactMessages : fetchOrderChats
          }
        >
          Refresh
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        items={[
          {
            key: "chats",
            label: (
              <span className="flex items-center gap-2">
                <MessageSquare size={16} />
                Order Chats
                <Badge count={chats.length} offset={[10, 0]} color="#00d4ff" />
              </span>
            ),
            children: (
              <Card className="admin-table-card">
                <Table
                  dataSource={chats}
                  columns={chatColumns}
                  rowKey="id"
                  loading={loadingChats}
                  scroll={{ x: 800 }}
                  pagination={{ pageSize: 8 }}
                />
              </Card>
            ),
          },
          {
            key: "contact",
            label: (
              <span className="flex items-center gap-2">
                <Mail size={16} />
                Inquiries
              </span>
            ),
            children: (
              <Card className="admin-table-card">
                <Table
                  dataSource={messages}
                  columns={contactColumns}
                  rowKey="id"
                  loading={loadingMessages}
                  scroll={{ x: 800 }}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Contact Message Modal */}
      <Modal
        title="View Message"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="reply"
            type="primary"
            onClick={() => {
              window.location.href = `mailto:${currentMessage?.email}`;
            }}
          >
            Reply by Email
          </Button>,
        ]}
      >
        {currentMessage && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Name">
              {currentMessage.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {currentMessage.email}
            </Descriptions.Item>
            <Descriptions.Item label="Subject">
              {currentMessage.subject}
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {new Date(currentMessage.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Message">
              <div style={{ whiteSpace: "pre-wrap" }}>
                {currentMessage.message}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

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
