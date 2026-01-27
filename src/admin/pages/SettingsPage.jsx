import { useState, useEffect } from "react";
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  message,
  Divider,
  Row,
  Col,
  Space,
} from "antd";
import { useAuth } from "../../context/AuthContext";
import { authAPI, settingsAPI } from "../../services/api";
import "../layouts/AdminLayout.css";

const ProfileSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [passForm] = Form.useForm();

  useEffect(() => {
    if (user) form.setFieldsValue(user);
  }, [user]);

  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      await authAPI.updateProfile(values);
      message.success("Profile updated successfully");
      window.location.reload();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      await authAPI.updatePassword(values.currentPassword, values.newPassword);
      message.success("Password updated");
      passForm.resetFields();
    } catch (error) {
      message.error(error.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card title="Personal Information" variant="borderless">
        <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input disabled />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Changes
          </Button>
        </Form>
      </Card>

      <Card title="Security" variant="borderless">
        <Form form={passForm} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["newPassword"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Button type="primary" danger htmlType="submit" loading={loading}>
            Change Password
          </Button>
        </Form>
      </Card>
    </div>
  );
};

const SystemSettings = () => {
  const [settingsGroups, setSettingsGroups] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await settingsAPI.getAll();
        setSettingsGroups(data.settings || {});
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (key, value) => {
    try {
      await settingsAPI.update(key, value);
      message.success("Saved");
    } catch (e) {
      message.error("Failed");
    }
  };

  const hasSettings = Object.keys(settingsGroups).length > 0;

  return (
    <Card title="System Settings" loading={loading} variant="borderless">
      {!hasSettings ? (
        <p>No settings available.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(settingsGroups).map(([group, items]) => (
            <div key={group}>
              <Divider orientation="left" style={{ borderColor: "#333" }}>
                <span className="uppercase text-xs font-bold text-cyan-400 tracking-wider">
                  {group}
                </span>
              </Divider>
              <Form layout="vertical">
                <Row gutter={[24, 0]}>
                  {items.map((s) => (
                    <Col span={24} md={12} key={s.key}>
                      <Form.Item
                        label={
                          <span className="capitalize">
                            {s.key.replace(/_/g, " ")}
                          </span>
                        }
                      >
                        <Input
                          defaultValue={String(s.value)}
                          onBlur={(e) => handleSave(s.key, e.target.value)}
                        />
                      </Form.Item>
                    </Col>
                  ))}
                </Row>
              </Form>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

const SettingsPage = () => {
  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Settings</h1>
      </div>
      <Tabs
        defaultActiveKey="profile"
        items={[
          {
            key: "profile",
            label: "Profile Settings",
            children: <ProfileSettings />,
          },
          {
            key: "system",
            label: "System Settings",
            children: <SystemSettings />,
          },
        ]}
      />
    </div>
  );
};

export default SettingsPage;
