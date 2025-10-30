import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Table, Button, Card } from "antd";
import "../styles/dashboard.css";
import axiosInstance from "../../../axiosInstance";

const STATUS_COLORS = {
  "Best Track": "#4caf50",
  "Good Track": "#8bc34a",
  "On Track": "#2196f3",
  "Low Deviation": "#ff9800",
  "High Deviation": "#f44336",
  Total: "#6c757d",
};

const DeviationTracker = ({ filters, selectedNode, trackerType, onRowSelect }) => {
  const [deviationData, setDeviationData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Total");
  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [selectedRowKey, setSelectedRowKey] = useState(null);

  const apiMap = {
    task_deviation: "/task-deviation-tracker/",
    associate_deviation: "/associate-deviation-tracker/",
  };

  useEffect(() => {
    const fetchDeviationData = async () => {
      if (!filters || Object.keys(filters).length === 0) return;

      try {
        const payload = { ...filters, selectedNode };
        const endpoint = apiMap[trackerType];
        if (!endpoint) return;

        const res = await axiosInstance.post(endpoint, payload);
        console.log("📊 Deviation Tracker Response:", res.data);
        setDeviationData(res.data);

        // ✅ Dynamic table columns
        if (Array.isArray(res.data.columns)) {
          const formatted = res.data.columns.map((col) => ({
            title: col.title,
            dataIndex: col.dataIndex,
            key: col.dataIndex,
          }));
          setDynamicColumns(formatted);
        }

        // ✅ Merge all categories dynamically (no hardcoding)
        const allData = Object.values(res.data.items || {}).flat();
        setOriginalData(allData);
        setTableData(allData);
      } catch (err) {
        console.error("Error fetching deviation tracker data:", err);
      }
    };

    fetchDeviationData();
  }, [filters, selectedNode]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);

    if (category === "Total") {
      setTableData(originalData);
    } else {
      // ✅ Match category dynamically, ignoring case
      const matchKey = Object.keys(deviationData.items || {}).find(
        (k) => k.toLowerCase() === category.toLowerCase()
      );
      setTableData(deviationData.items?.[matchKey] || []);
    }
  };

  if (!deviationData) return <div>Loading Deviation Tracker...</div>;

  // ✅ Prepare chart data (excluding Total)
  const chartData = Object.entries(deviationData.statusCounts || {})
    .filter(([key]) => key !== "Total")
    .map(([name, value]) => ({
      name,
      value,
      itemStyle: { color: STATUS_COLORS[name] || "#999" },
    }));

  // ✅ Chart config
  const chartOptions = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      orient: "horizontal",
      bottom: 0,
      textStyle: { fontSize: 12 },
    },
    series: [
      {
        name: "Deviation",
        type: "pie",
        radius: ["35%", "75%"],
        roseType: "radius",
        label: {
          show: true,
          formatter: "{b}: {d}%",
          fontSize: 12,
        },
        labelLine: {
          length: 15,
          length2: 10,
        },
        itemStyle: {
          shadowBlur: 100,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.3)",
        },
        emphasis: {
          scale: true,
          scaleSize: 10,
        },
        data: chartData,
      },
    ],
  };

  return (
    <Card
      title={
        <h5 className="fw-bold text-primary mb-0">
          {trackerType === "associate_deviation"
            ? "Associate Deviation Tracker"
            : "Task Deviation Tracker"}
        </h5>
      }
      variant="bordered"
      className="mb-4 shadow-sm"
      style={{ width: "100%" }}
    >
      <div className="task-tracker-container">
        {/* ===== SECTION 1: PIE CHART ===== */}
        <div className="task-chart-section">
          <ReactECharts
            option={chartOptions}
            style={{ height: "280px", width: "100%" }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>

        {/* ===== SECTION 2: CATEGORY BUTTONS ===== */}
        <div className="task-buttons-section">
          {Object.entries(deviationData.statusCounts || {}).map(
            ([category, count]) => (
              <Button
                key={category}
                className="w-100 fw-semibold"
                style={{
                  backgroundColor:
                    selectedCategory === category
                      ? "#000"
                      : STATUS_COLORS[category],
                  color: "#fff",
                  border:
                    selectedCategory === category
                      ? "2px solid #000"
                      : "1px solid transparent",
                  transition: "all 0.2s ease-in-out",
                }}
                onClick={() => handleCategoryClick(category)}
              >
                {category} ({count})
              </Button>
            )
          )}
        </div>

        {/* ===== SECTION 3: TABLE ===== */}
        <div className="task-table-section">
          <input
            type="text"
            placeholder={`Search ${
              trackerType === "associate_deviation" ? "associates..." : "tasks..."
            }`}
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
                const filtered = originalData.filter((item) =>
                  Object.values(item).some(
                    (val) =>
                      val &&
                      String(val).toLowerCase().includes(query.toLowerCase())
                  )
                );
                setTableData(filtered);
              }
            }}
          />

          <Table
            columns={dynamicColumns}
            dataSource={tableData}
            size="small"
            bordered
            rowKey={(record) =>
              trackerType === "associate_deviation"
                ? record.emp_id
                : record.task_id
            }
            scroll={{ y: 200 }}
            onRow={(record) => ({
              onClick: () => {
                setSelectedRowKey(
                  trackerType === "associate_deviation"
                    ? record.emp_id
                    : record.task_id
                );
                if (onRowSelect) {
                  const type =
                    trackerType === "associate_deviation"
                      ? "associate"
                      : "task";
                  const id =
                    trackerType === "associate_deviation"
                      ? record.emp_id
                      : record.task_id;
                  onRowSelect(type, id);
                }
              },
            })}
            rowClassName={(record) =>
              trackerType === "associate_deviation"
                ? record.emp_id === selectedRowKey
                  ? "selected-row"
                  : ""
                : record.task_id === selectedRowKey
                ? "selected-row"
                : ""
            }
          />
        </div>
      </div>
    </Card>
  );
};

export default DeviationTracker;
