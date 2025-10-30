import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../axiosInstance";
import QuickFilters from "./QuickFilters";
import TreeViewPanel from "./TreeviewPanel";
import TrackerList from "./TrackerList";
import PropertyPanel from "./PropertyPanel";
import TaskModal from "./TaskModal";
import "./styles/dashboard.css";
import { message } from "antd";

import "antd/dist/reset.css"; // Ant Design v5 reset

const Dashboard = () => {
  const [treeData, setTreeData] = useState([]);
  const [filterData, setFilterData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [messageapi,contextHolder]=message.useMessage()
  const [user, setUser] = useState(null); // 👈 Add this to hold user data
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [loadingEntity, setLoadingEntity] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

const handleTaskUpdated = (taskId) => {
  console.log("Task updated:", taskId);
  setRefreshKey((prev) => prev + 1); // triggers rerender of TrackerList
};

const handleRowSelect = async (entityType, entityId) => {
  setLoadingEntity(true);
  try {
    let res = null;

    // 🔹 Choose API dynamically based on entity type
    switch (entityType) {
      case "task":
        res = await axiosInstance.get(`/tasks/${entityId}/`);
        break;

      case "associate":
        res = await axiosInstance.get(`/associates/${entityId}/`);
        break;
      default:
        console.warn(`Unknown entity type: ${entityType}`);
        break;
    }

    if (res) {
      setSelectedEntity({
        type: entityType,
        data: res.data,
      });
    }
  } catch (err) {
    console.error("Error fetching entity details:", err);
  } finally {
    setLoadingEntity(false);
  }
};

  // ✅ Load user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/user-profile/");
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchUser();
  }, []);

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
    messageapi.success(" Task Created Sucessfully!",2)
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
    {contextHolder}
    <div className="dashboard container-fluid px-4 mt-5 pt-4">
      {/* 🔹 Quick Filters + Add Task */}
      <div className="bg-white border rounded p-3 mb-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div className="flex-grow-1 me-3" style={{ minWidth: "60%" }}>
          <QuickFilters onFilterChange={handleFilterChange} userRole={user?.role} />
        </div>
        {/* 🔹 Conditionally render Add Task button */}
        {user?.role !== "Manager" && (
          <div>
            <button
              className="btn btn-success px-4 fw-semibold"
              onClick={() => setShowTaskModal(true)}
            >
              + Add Task
            </button>
          </div>
        )}
      </div>

      {/* 🔹 Main Dashboard Area */}
      <div className="row g-0 border rounded overflow-hidden bg-white">
        {/* Left: Tree / Navigation */}
        <div className="col-12 col-md-2 border-end p-3">
          <h6 className="fw-semibold mb-3 text-secondary">Navigation</h6>
          <TreeViewPanel data={treeData} onNodeSelect={handleNodeSelect} userRole={user?.role} />
        </div>

        {/* Middle: Trackers */}
        <div className="col-12 col-md-7 border-end p-3">
          <h6 className="fw-semibold mb-3 text-secondary">Trackers</h6>
          <TrackerList filters={filterData} selectedNode={selectedNode} onRowSelect={handleRowSelect} key={refreshKey} />
        </div>

        {/* Right: Property Panel */}
        <div className="col-12 col-md-3 p-3">
          <h6 className="fw-semibold mb-3 text-secondary">Property Panel</h6>
          <PropertyPanel entity={selectedEntity} loading={loadingEntity} onTaskUpdated={handleTaskUpdated}/>
        </div>
      </div>

      {/* 🔹 Add Task Modal */}
      <TaskModal
        show={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onTaskAdded={handleTaskAdded}
        user={user}
        
      />
    </div>
    </>
  );
};

export default Dashboard;
