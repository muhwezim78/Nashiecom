import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Rate,
  message,
  Popconfirm,
  Tooltip,
  Avatar,
  Select,
} from "antd";
import { Trash2, CheckCircle, XCircle, User, Package } from "lucide-react";
import { reviewsAPI } from "../../services/api";
import "../layouts/AdminLayout.css";

const { Option } = Select;

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchReviews = async (page = 1, stat = status) => {
    setLoading(true);
    try {
      const { data } = await reviewsAPI.getAll({
        page,
        limit: pagination.pageSize,
        status: stat,
      });
      setReviews(data.reviews);
      setPagination({
        ...pagination,
        current: data.pagination.page,
        total: data.pagination.total,
      });
    } catch (error) {
      console.error(error);
      message.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [status]);

  const handleApprove = async (id) => {
    try {
      await reviewsAPI.approve(id);
      message.success("Review approved");
      fetchReviews(pagination.current);
    } catch (error) {
      message.error("Failed to approve review");
    }
  };

  const handleReject = async (id) => {
    try {
      await reviewsAPI.reject(id);
      message.success("Review rejected and removed");
      fetchReviews(pagination.current);
    } catch (error) {
      message.error("Failed to reject review");
    }
  };

  const columns = [
    {
      title: "Auditor",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar
            size="small"
            src={record.user?.avatar}
            icon={<User size={12} />}
            className="border border-cyan-500/20"
          />
          <div>
            <div className="font-bold text-xs uppercase tracking-tighter text-white">
              {record.user?.firstName} {record.user?.lastName}
            </div>
            <div className="text-[10px] text-gray-500">
              {record.user?.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Module",
      key: "product",
      render: (_, record) => (
        <Space>
          <Package size={14} className="text-cyan-400" />
          <span className="font-bold text-[10px] uppercase tracking-widest text-gray-300">
            {record.product?.name}
          </span>
        </Space>
      ),
    },
    {
      title: "Audit Detail",
      key: "detail",
      width: "30%",
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Rate
              disabled
              defaultValue={record.rating}
              className="text-[10px] custom-rate-mini"
            />
            {record.isVerified && (
              <Tag
                color="green"
                className="text-[8px] font-black uppercase tracking-widest py-0 px-1 border-0"
              >
                Verified
              </Tag>
            )}
          </div>
          <div className="font-bold text-white text-[11px] uppercase italic mb-1">
            {record.title}
          </div>
          <div className="text-gray-400 text-xs italic line-clamp-2">
            "{record.comment}"
          </div>
        </div>
      ),
    },
    {
      title: "Deployment Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "isApproved",
      key: "isApproved",
      render: (approved) => (
        <Tag
          color={approved ? "cyan" : "gold"}
          className="text-[10px] font-black uppercase tracking-widest border-0"
        >
          {approved ? "Approved" : "Pending Audit"}
        </Tag>
      ),
    },
    {
      title: "Protocol",
      key: "actions",
      render: (_, record) => (
        <Space>
          {!record.isApproved && (
            <Tooltip title="Approve Audit">
              <Button
                type="text"
                className="text-emerald-500 hover:text-emerald-400"
                icon={<CheckCircle size={18} />}
                onClick={() => handleApprove(record.id)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Reject and delete this audit report?"
            onConfirm={() => handleReject(record.id)}
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Reject Audit">
              <Button type="text" danger icon={<XCircle size={18} />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Intelligence Audits</h1>
          <p className="admin-page-subtitle">
            Moderate and verify user intelligence reports
          </p>
        </div>
        <Select
          defaultValue="pending"
          style={{ width: 200 }}
          onChange={(value) => setStatus(value)}
          className="admin-select"
        >
          <Option value="all">All Logs</Option>
          <Option value="pending">Pending Validation</Option>
          <Option value="approved">Verified Data</Option>
        </Select>
      </div>

      <Card className="admin-table-card !border-0 shadow-2xl">
        <Table
          dataSource={reviews}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page) => fetchReviews(page),
          }}
          className="admin-table"
        />
      </Card>

      <style jsx global>{`
        .custom-rate-mini .ant-rate-star {
          margin-inline-end: 2px !important;
        }
        .custom-rate-mini .ant-rate-star-second {
          color: rgba(255, 255, 255, 0.05);
        }
        .custom-rate-mini .ant-rate-star-full .ant-rate-star-second {
          color: #06b6d4;
        }
      `}</style>
    </div>
  );
};

export default ReviewsPage;
