import React, { useState, useEffect } from "react";
import axiosInstance from "../../../axiosInstance";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, Button, Card } from "antd";

const COLORS = ["#28a745", "#ffc107", "#fd7e14", "#0d6efd"];

const TaskProgressTracker = () => {
  const [trackerData, setTrackerData] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("Total");
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchTrackerData = async () => {
      try {
        const res = await axiosInstance.get("/task-progress-tracker/");
        setTrackerData(res.data);
        setSelectedStatus("Total");
        setTableData(res.data.tasks["New"].concat(res.data.tasks["In Progress"], res.data.tasks["On Hold"], res.data.tasks["Fixed"]));
      } catch (err) {
        console.error("Error loading tracker data:", err);
      }
    };
    fetchTrackerData();
  }, []);

  const handleStatusClick = (status) => {
    setSelectedStatus(status);
    if (status === "Total") {
      const all = [].concat(
        trackerData.tasks["New"],
        trackerData.tasks["In Progress"],
        trackerData.tasks["On Hold"],
        trackerData.tasks["Fixed"]
      );
      setTableData(all);
    } else {
      setTableData(trackerData.tasks[status] || []);
    }
  };

  if (!trackerData) return <div>Loading Task Progress...</div>;

  const chartData = Object.entries(trackerData.statusCounts)
    .filter(([key]) => key !== "Total")
    .map(([name, value]) => ({ name, value }));

  const columns = [
    { title: "Task ID", dataIndex: "id", key: "id" },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Owner", dataIndex: "owner", key: "owner" },
    { title: "Priority", dataIndex: "priority", key: "priority" },
  ];

  return (
    <Card
      title={<h5 className="fw-bold text-primary mb-0">{trackerData.trackerType}</h5>}
      bordered
      className="mb-4 shadow-sm"
    >
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-4">
        {/* Pie Chart */}
        <div style={{ width: "280px", height: "200px" }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" label>
                {chartData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Buttons */}
        <div className="d-flex flex-wrap gap-2">
          {Object.entries(trackerData.statusCounts).map(([status, count], i) => (
            <Button
              key={status}
              type={selectedStatus === status ? "primary" : "default"}
              onClick={() => handleStatusClick(status)}
            >
              {status} ({count})
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4">
        <Table
          columns={columns}
          dataSource={tableData}
          size="small"
          bordered
          pagination={{ pageSize: 5 }}
          rowKey="id"
        />
      </div>
    </Card>
  );
};

export default TaskProgressTracker;
