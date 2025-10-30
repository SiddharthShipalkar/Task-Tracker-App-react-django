import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, Button, Card } from "antd";
import "../styles/dashboard.css";
import axiosInstance from "../../../axiosInstance";

const STATUS_COLORS = {
  "New": "#28a745",
  "Assigned":"#12e5f0e2",
  "In Progress": "#ffc107",
  "On Hold": "#fd7e14",
  "Fixed": "#0d6efd",
  "Total": "#6c757d"
};
const COLORS = ["#28a745","#12e5f0e2", "#ffc107", "#fd7e14", "#0d6efd"];

const TaskProgressTracker = ({ filters, selectedNode, onRowSelect,trackerType }) => {
  const [taskData, setTaskData] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("Total");
  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [selected_RowKey, setSelectedRowKey] = useState(null);
  const apiMap = {
    self_task_progress: "/self-task-progress-tracker/",
    overall_task_progress: "/overall-task-progress-tracker/",
  };

  useEffect(() => {
    const fetchTrackerData = async () => {
      if (!filters || Object.keys(filters).length === 0) return;

      try {
        const payload = { ...filters, selectedNode };
        const endpoint = apiMap[trackerType];
         if (!endpoint) {
          console.error(`❌ No API endpoint found for trackerType: ${trackerType}`);
          return;
        }
        const res = await axiosInstance.post(endpoint,payload)
        console.log("📥 Response:", res.data);

        setTaskData(res.data);
        setSelectedStatus("Total");

        const allTasks = [].concat(
          res.data.tasks["New"] || [],
          res.data.tasks["In Progress"] || [],
          res.data.tasks["On Hold"] || [],
          res.data.tasks["Fixed"] || []
        );

        setOriginalData(allTasks);
        setTableData(allTasks);
      } catch (err) {
        console.error("Error loading tracker data:", err);
      }
    };
    fetchTrackerData();
  }, [filters, selectedNode]);

  const handleStatusClick = (status) => {
    setSelectedStatus(status);
    if (status === "Total") {
      const all = [].concat(
        taskData.tasks["New"],
        taskData.tasks["In Progress"],
        taskData.tasks["On Hold"],
        taskData.tasks["Fixed"]
      );
      setTableData(all);
    } else {
      setTableData(taskData.tasks[status] || []);
    }
  };

  if (!taskData) return <div>Loading Task Progress...</div>;

  const chartData = Object.entries(taskData.statusCounts || {})
    .filter(([key]) => key !== "Total")
    .map(([name, value]) => ({ name, value }));

  const columns = [
    { title: "Task ID", dataIndex: "task_id", key: "task_id" },
    { title: "Title", dataIndex: "task_name", key: "task_name" },
    { title: "Priority", dataIndex: "task_priority", key: "task_priority" },
  ];

  return (
  <Card
    title={<h5 className="fw-bold text-primary mb-0">{taskData.trackerType}</h5>}
    variant="bordered"
    className="mb-4 shadow-sm"
    style={{ width: "100%" }}
  >
    {/* ====== HORIZONTAL LAYOUT CONTAINER ====== */}
    <div className="task-tracker-container">

  {/* ====== SECTION 1: PIE CHART ====== */}
  <div className="task-chart-section">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          outerRadius={110}
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {chartData.map((_, i) => (
            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>

  {/* ====== SECTION 2: STATUS BUTTONS ====== */}
  <div className="task-buttons-section">
    {Object.entries(taskData.statusCounts).map(([status, count]) => (
      <Button
        key={status}
        className="w-100 fw-semibold"
        style={{
          backgroundColor:
            selectedStatus === status ? "#000" : STATUS_COLORS[status],
          color: "#fff",
          border:
            selectedStatus === status
              ? "2px solid #000"
              : "1px solid transparent",
          transition: "all 0.2s ease-in-out",
        }}
        onClick={() => handleStatusClick(status)}
      >
        {status} ({count})
      </Button>
    ))}
  </div>

  {/* ====== SECTION 3: TABLE ====== */}
  <div className="task-table-section">
    <input
      type="text"
      placeholder="Search tasks..."
      style={{
        padding: "0.4rem 0.6rem",
        borderRadius: 6,
        border: "1px solid #ccc",
        outline: "none",
      }}
      onChange={(e) => {
        const query = e.target.value.toLowerCase();
        if (!query) {
          setTableData(originalData);
        } else {
          const filtered = originalData.filter(
            (task) =>
              task.task_name.toLowerCase().includes(query) ||
              String(task.task_id).includes(query)
          );
          setTableData(filtered);
        }
      }}
    />

    <Table
      columns={columns}
      dataSource={tableData}
      size="small"
      bordered
      rowKey="task_id"
      scroll={{ y: 200 }}
      onRow={(record) => ({
        onClick: () => {
          setSelectedRowKey(record.task_id);
          if (onRowSelect) onRowSelect("task", record.task_id);  // 👈 send type + id

        }
      })}
      rowClassName={(record) =>
        record.task_id === selected_RowKey ? "selected-row" : ""
      }
    />
  </div>
</div>


  </Card>
);

};

export default TaskProgressTracker;
