import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../axiosInstance";
import QuickFilters from "./QuickFilters";
import TreeViewPanel from "./TreeviewPanel";
import TrackerList from "./TrackerList";
import PropertyPanel from "./PropertyPanel";
import TaskModal from "./TaskModal";
import "./styles/dashboard.css";

import "antd/dist/reset.css"; // Ant Design v5 reset

const Dashboard = () => {
  const [treeData, setTreeData] = useState([]);
  const [filterData, setFilterData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [trackerData, setTrackerData] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // ✅ Load protected data once
  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const response = await axiosInstance.get("/protected-view/");
        console.log("Success:", response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchProtectedData();
  }, []);

  // ✅ Load static tree once
  useEffect(() => {
    const loadTree = async () => {
      try {
        const res = await axiosInstance.get("/tree-data/");
        setTreeData(res.data);
      } catch (err) {
        console.error("Error loading tree-data:", err);
      }
    };
    loadTree();
  }, []);

  // ✅ Fetch trackers (stable function)
  const fetchTrackers = useCallback(
  async (filters = filterData, node = selectedNode) => {
    try {
      if (!filters) return;
      const payload = { ...filters, selectedNode: node };
      const res = await axiosInstance.post("/get-filtered-trackers/", payload);
      setTrackerData(res.data);
    } catch (err) {
      console.error("Error fetching trackers:", err);
      setTrackerData([]);
    }
  },
  [filterData, selectedNode] // 👈 stable dependency
);

  // ✅ Refresh when filterData or selectedNode changes
  useEffect(() => {
  if (!filterData) return;
  fetchTrackers();
}, [filterData, selectedNode, fetchTrackers]);


  // ✅ Callbacks
  const handleFilterChange = useCallback((filters) => {
  setFilterData((prev) => {
    const prevStr = JSON.stringify(prev || {});
    const newStr = JSON.stringify(filters);
    if (prevStr !== newStr) return filters;
    return prev;
  });
}, []);

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
  };

  const handleTaskAdded = async () => {
    setShowTaskModal(false);
    await fetchTrackers(); // refresh after adding a task
  };

  return (
    <div className="dashboard container-fluid px-4 mt-5 pt-4">
      {/* 🔹 Quick Filters + Add Task */}
      <div className="bg-white border rounded p-3 mb-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div className="flex-grow-1 me-3" style={{ minWidth: "60%" }}>
          <QuickFilters onFilterChange={handleFilterChange} />
        </div>
        <div>
          <button
            className="btn btn-success px-4 fw-semibold"
            onClick={() => setShowTaskModal(true)}
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* 🔹 Main Dashboard Area */}
      <div className="row g-0 border rounded overflow-hidden bg-white">
        {/* Left: Tree / Navigation */}
        <div className="col-12 col-md-2 border-end p-3">
          <h6 className="fw-semibold mb-3 text-secondary">Navigation</h6>
          <TreeViewPanel data={treeData} onNodeSelect={handleNodeSelect} />
        </div>

        {/* Middle: Trackers */}
        <div className="col-12 col-md-7 border-end p-3">
          <h6 className="fw-semibold mb-3 text-secondary">Trackers</h6>
          <TrackerList trackers={trackerData} />
        </div>

        {/* Right: Property Panel */}
        <div className="col-12 col-md-3 p-3">
          <h6 className="fw-semibold mb-3 text-secondary">Property Panel</h6>
          <PropertyPanel />
        </div>
      </div>

      {/* 🔹 Add Task Modal */}
      <TaskModal
        show={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onTaskAdded={handleTaskAdded}
      />
    </div>
  );
};

export default Dashboard;
