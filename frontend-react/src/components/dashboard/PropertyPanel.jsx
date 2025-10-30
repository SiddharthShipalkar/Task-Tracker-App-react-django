import React, { useEffect } from "react";
import { Card, Spin, Form, Input, Select, Button, message, TimePicker, Modal } from "antd";
import axiosInstance from "../../axiosInstance";
import dayjs from "dayjs";

const { Option } = Select;

const PropertyPanel = ({ entity, loading, onTaskUpdated }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = React.useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [currentStatus, setCurrentStatus] = React.useState(""); // 🧠 status from backend (confirmed)
  const [pendingStatus, setPendingStatus] = React.useState(""); // 🧠 what user selected but not saved yet
  const [isBackendFixed, setIsBackendFixed] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  // 🧩 Set form values when entity changes
  useEffect(() => {
    if (entity?.type === "task" && entity?.data) {
      const status = entity.data.task_status;
      setCurrentStatus(status);
      setPendingStatus(status);
      setIsBackendFixed(status === "FIXED");

      form.setFieldsValue({
        task_name: entity.data.task_name,
        task_description: entity.data.task_description,
        task_priority: entity.data.task_priority,
        task_status: entity.data.task_status,
        task_actual_efforts: entity.data.task_actual_efforts
          ? dayjs(entity.data.task_actual_efforts, "HH:mm:ss")
          : null,
      });
    } else {
      form.resetFields();
      setCurrentStatus("");
      setPendingStatus("");
      setIsBackendFixed(false);
    }
  }, [entity, form]);

  // 🧠 Allowed transitions based on confirmed (current) status
  const getAllowedNextStatuses = () => {
    switch (currentStatus) {
      case "NEW":
        return ["ASSIGNED"];
      case "ASSIGNED":
        return ["IN_PROGRESS"];
      case "IN_PROGRESS":
        return ["FIXED", "ON_HOLD"];
      case "ON_HOLD":
        return ["IN_PROGRESS"];
      default:
        return [];
    }
  };

  // 🧩 Save logic
  const handleSave = async (values) => {
    if (!entity?.data?.task_id) return;

    try {
      setSaving(true);
      messageApi.open({
        type: "loading",
        content: "Updating task...",
        duration: 0,
        key: "update-task",
      });
      

      const payload = {
        task_description: values.task_description,
        task_status: values.task_status,
        ...(values.task_status === "FIXED" && {
          task_actual_efforts: values.task_actual_efforts
            ? values.task_actual_efforts.format("HH:mm:ss")
            : null,
        }),
      };

      await axiosInstance.put(`/tasks/${entity.data.task_id}/`, payload);

      // 🧩 Refresh backend data (fixes Issue #1)
      const updated = await axiosInstance.get(`/tasks/${entity.data.task_id}/`);

      // 🧠 Update local states with latest from backend
      const updatedStatus = updated.data.task_status;
      setCurrentStatus(updatedStatus);
      setPendingStatus(updatedStatus);
      setIsBackendFixed(updatedStatus === "FIXED");

      form.setFieldsValue({
        ...updated.data,
        task_actual_efforts: updated.data.task_actual_efforts
          ? dayjs(updated.data.task_actual_efforts, "HH:mm:ss")
          : null,
      });

      messageApi.open({
        type: "success",
        content: "✅ Task updated successfully!",
        duration: 2,
        key: "update-task",
      });

      if (onTaskUpdated) onTaskUpdated(entity.data.task_id); // refresh TrackerList
    } catch (err) {
      console.error("Error updating task:", err);
      messageApi.open({
        type: "error",
        content: "❌ Failed to update task!",
        duration: 2,
        key: "update-task",
      });
    } finally {
      setSaving(false);
    }
  };

  // 🧩 Handle local status changes
  const handleStatusChange = (value) => {
    if (value === "FIXED") setShowConfirm(true);
    setPendingStatus(value); // 👈 Only temporary until saved
  };

  const confirmFixStatus = () => {
    setShowConfirm(false);
    setPendingStatus("FIXED");
    form.setFieldValue("task_status", "FIXED");
  };

  const cancelFixStatus = () => {
    setShowConfirm(false);
    form.setFieldValue("task_status", currentStatus);
    setPendingStatus(currentStatus);
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spin tip="Loading Task Details..." />
      </div>
    );

  if (!entity) return <div className="text-muted">Select an item to view details.</div>;

  const { type } = entity;
  const allowedNextStatuses = getAllowedNextStatuses();

  // === 🧩 Task Form ===
  if (type === "task") {
    return (
      <>
        {contextHolder}
        <Card size="small" className="shadow-sm">
          <h6 className="fw-semibold text-primary mb-3">Edit Task</h6>

          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item label="Task Name" name="task_name">
              <Input readOnly style={{ backgroundColor: "#f5f5f5" }} />
            </Form.Item>

            <Form.Item label="Description" name="task_description">
              <Input.TextArea
                rows={3}
                disabled={isBackendFixed}
                style={isBackendFixed ? { backgroundColor: "#f5f5f5" } : {}}
              />
            </Form.Item>

            <Form.Item label="Priority" name="task_priority">
              <Select disabled style={{ backgroundColor: "#f5f5f5" }}>
                <Option value="HIGH">High</Option>
                <Option value="MEDIUM">Medium</Option>
                <Option value="LOW">Low</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Status" name="task_status">
              <Select
                disabled={isBackendFixed}
                onChange={handleStatusChange}
              >
                {isBackendFixed ? (
                  <Option value="FIXED">Fixed</Option>
                ) : (
                  allowedNextStatuses.map((s) => (
                    <Option key={s} value={s}>
                      {s.replace("_", " ")}
                    </Option>
                  ))
                )}
              </Select>
            </Form.Item>

            {/* Show Actual Efforts only if status FIXED (temporary or saved) */}
            {pendingStatus === "FIXED" && (
              <Form.Item
                label="Actual Efforts (HH:MM:SS)"
                name="task_actual_efforts"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.reject("Please select actual efforts");
                      }

                      // convert to string
                      const timeString = value.format("HH:mm:ss");
                      if (timeString === "00:00:00") {
                        return Promise.reject("Actual efforts cannot be 00:00:00");
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <TimePicker
                  format="HH:mm:ss"
                  showNow={false}
                  style={{ width: "100%" }}
                  placeholder="Select Time"
                  disabled={isBackendFixed}
                />
              </Form.Item>
            )}

            {!isBackendFixed && (
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={saving} block>
                  Save Changes
                </Button>
              </Form.Item>
            )}
          </Form>
        </Card>

        {/* 🔔 Confirmation Modal for marking Fixed */}
        <Modal
          title="Confirm Status Change"
          open={showConfirm}
          onOk={confirmFixStatus}
          onCancel={cancelFixStatus}
          okText="Yes, mark as Fixed"
          cancelText="Cancel"
        >
          <p>
            Are you sure you want to mark this task as <b>Fixed</b>? Once saved, it will become read-only.
          </p>
        </Modal>
      </>
    );
  }

  return (
    <div className="text-muted">
      No form available for entity type: <b>{type}</b>
    </div>
  );
};

export default PropertyPanel;
