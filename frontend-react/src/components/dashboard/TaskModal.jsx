import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  InputNumber,
  Row,
  Col,
  TimePicker,
} from "antd";
import dayjs from "dayjs";
import axiosInstance from "../../axiosInstance";

const { Option } = Select;
const { TextArea } = Input;

const TaskModal = ({ show, onClose, onTaskAdded, user }) => {
  const [form] = Form.useForm();
  const [teams, setTeams] = useState([]);
  const [taskCategories, setTaskCategories] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [members, setMembers] = useState([]); // 👈 for "Assigned To"
  const [loading, setLoading] = useState(false);

  // ✅ Load teams
  useEffect(() => {
    const fetchTeams = async () => {
      if (!user?.emp_id) return;
      try {
        const res = await axiosInstance.get(`/teams/?emp_id=${user.emp_id}`);
        setTeams(res.data);
        const defaultTeam = res.data.find((t) => t.id === user.team?.team_id);
        if (defaultTeam) form.setFieldValue("team", defaultTeam.id);
      } catch (err) {
        console.error("Error fetching teams:", err);
        message.error("Failed to load teams.");
      }
    };
    fetchTeams();
  }, [user, form]);

  // ✅ Load task categories
  const handleTeamChange = async (teamId) => {
    form.setFieldsValue({ task_category: null, subtask: null });
    setTaskCategories([]);
    setSubtasks([]);
    if (!teamId) return;

    try {
      const res = await axiosInstance.get(`/task-categories/?team_id=${teamId}`);
      setTaskCategories(res.data);
    } catch (err) {
      console.error("Error fetching task categories:", err);
      message.error("Failed to load task categories.");
    }
  };

  // ✅ Load subtasks
  const handleCategoryChange = async (categoryId) => {
    form.setFieldsValue({ subtask: null });
    setSubtasks([]);
    if (!categoryId) return;
    try {
      const res = await axiosInstance.get(
        `/subtasks/?task_category_id=${categoryId}`
      );
      setSubtasks(res.data);
    } catch (err) {
      console.error("Error fetching subtasks:", err);
      message.error("Failed to load subtasks.");
    }
  };

  // ✅ Load assignable users if role = Lead
  useEffect(() => {
    if (user?.role === "Lead") {
      const fetchMembers = async () => {
        try {
          const res = await axiosInstance.get("/accounts/?roles=Associate,Lead");
          setMembers(res.data);
        } catch (err) {
          console.error("Error fetching members:", err);
          message.error("Failed to load members list.");
        }
      };
      fetchMembers();
    }
  }, [user]);

  // ✅ Submit handler
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const timeValue =
        values.task_estimated_efforts && values.task_estimated_efforts.isValid()
          ? values.task_estimated_efforts.format("HH:mm:ss")
          : "00:00:00";

      const payload = {
        task_name: values.task_name,
        team_id: values.team,
        task_category_id: values.task_category,
        subtask_id: values.subtask,
        subtask_count: values.subtask_count || 1,
        task_estimated_efforts: timeValue,
        description: values.description || "",
        status: "New",
        priority: values.priority || "Low",
        assigned_to: values.assigned_to || [], // 👈 new
      };

      const res = await axiosInstance.post("/tasks/create/", payload);
      message.success("✅ Task created successfully!");
      onTaskAdded(res.data);
      onClose();
      form.resetFields();
    } catch (err) {
      console.error("Error creating task:", err);
      message.error("❌ Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setTaskCategories([]);
    setSubtasks([]);
    onClose();
  };

  return (
    <Modal
      title={<span className="fw-semibold">📝 Add New Task</span>}
      open={show}
      onCancel={handleCancel}
      footer={null}
      centered
      width={800}
      bodyStyle={{
        maxHeight: "75vh",
        overflowY: "auto",
        paddingRight: "12px",
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          subtask_count: 1,
          priority: "Low",
          task_estimated_efforts: dayjs("00:00:00", "HH:mm:ss"),
        }}
      >
        {/* Row 1 */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Task Name"
              name="task_name"
              rules={[{ required: true, message: "Please enter task name" }]}
            >
              <Input placeholder="Enter task name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Team"
              name="team"
              rules={[{ required: true, message: "Please select a team" }]}
            >
              <Select
                placeholder="Select Team"
                onChange={handleTeamChange}
                showSearch
                optionFilterProp="children"
              >
                {teams.map((t) => (
                  <Option key={t.id} value={t.id}>
                    {t.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Row 2 */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Task Category"
              name="task_category"
              rules={[
                { required: true, message: "Please select a task category" },
              ]}
            >
              <Select
                placeholder="Select Task Category"
                onChange={handleCategoryChange}
                disabled={taskCategories.length === 0}
                showSearch
                optionFilterProp="children"
              >
                {taskCategories.map((c) => (
                  <Option key={c.id} value={c.id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="SubTask"
              name="subtask"
              rules={subtasks.length > 0
                ? [{ required: true, message: "Please select a subtask" }]
                : []}
            >
              <Select
                placeholder="Select SubTask"
                disabled={subtasks.length === 0}
                showSearch
                optionFilterProp="children"
              >
                {subtasks.map((s) => (
                  <Option key={s.id} value={s.id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Row 3 */}
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Subtask Count"
              name="subtask_count"
              tooltip="Enter number of subtasks"
              rules={[
                { required: true, message: "Please enter subtask count" },
                { type: "number", min: 1, message: "Count must be ≥ 1" },
              ]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item label="Status" name="status">
              <div
                style={{
                  background: "#f0f0f0",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  textAlign: "center",
                  fontWeight: "500",
                  color: "#595959",
                }}
              >
                🟦 New
              </div>
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Priority"
              name="priority"
              rules={[
                { required: true, message: "Please select task priority" },
              ]}
            >
              <Select placeholder="Select Priority">
                <Option value="High">🔴 High</Option>
                <Option value="Medium">🟡 Medium</Option>
                <Option value="Low">🟢 Low</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Row 4: Estimated Efforts + Assigned To (Lead only) */}
        <Row gutter={16}>
          <Col xs={24} md={user?.role === "Lead" ? 12 : 24}>
            <Form.Item
              label="Estimated Efforts (HH:MM:SS)"
              name="task_estimated_efforts"
              tooltip="Select estimated duration"
              rules={[
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.reject("Please select estimated efforts");
                      }

                      // convert to string
                      const timeString = value.format("HH:mm:ss");
                      if (timeString === "00:00:00") {
                        return Promise.reject("Estimated efforts cannot be 00:00:00");
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
              />
            </Form.Item>
          </Col>

          {user?.role === "Lead" && (
            <Col xs={24} md={12}>
              <Form.Item
                label="Assigned To"
                name="assigned_to"
                tooltip="Select team members to assign task"
                rules={[{ required: true, message: "Please select members" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Search and select members"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {members.map((m) => (
                    <Option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          )}
        </Row>

        {/* Final Row: Description */}
        <Form.Item
          label="Description"
          name="description"
          tooltip="Enter task description or details"
        >
          <TextArea rows={3} placeholder="Enter task details..." maxLength={250} showCount />
        </Form.Item>

        {/* Buttons */}
        <Form.Item className="text-end mb-0">
          <Button onClick={handleCancel} className="me-2">
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Add Task
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskModal;
