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
} from "antd";
import { Eye, Mail, MessageSquare } from "lucide-react";
import { contactAPI } from "../../services/api";
import "../layouts/AdminLayout.css";

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await contactAPI.getAll();
      setMessages(data.messages || []);
    } catch (error) {
      console.error(error);
      // message.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await contactAPI.updateStatus(id, status);
      message.success("Status updated");
      fetchMessages();
      if (currentMessage && currentMessage.id === id) {
        setCurrentMessage({ ...currentMessage, status });
      }
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
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

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Messages</h1>
          <p className="admin-page-subtitle">Contact from users</p>
        </div>
      </div>

      <Card className="admin-table-card">
        <Table
          dataSource={messages}
          columns={columns}
          rowKey="id"
          loading={loading}
        />
      </Card>

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
    </div>
  );
};

export default MessagesPage;
