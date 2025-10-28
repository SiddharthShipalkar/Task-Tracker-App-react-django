// src/components/dashboard/TreeViewPanel.jsx
import React, { useEffect, useState } from "react";
import { Tree } from "antd";
import { FolderOutlined, ProjectOutlined, UsergroupAddOutlined } from "@ant-design/icons";

/*
 expected `data` shape:
 [
   { id: 1, title: "Project A", type: "project", status: "active", children: [
       { id: 11, title: "Dept X", type: "department", status: "active", children: [...] }
   ]},
 ]
 We'll transform to antd treeData format and include custom title render with icon and color.
*/

const iconForType = (type) => {
  switch (type) {
    case "project":
      return <ProjectOutlined />;
    case "department":
      return <FolderOutlined />;
    case "team":
      return <UsergroupAddOutlined />;
    default:
      return <FolderOutlined />;
  }
};

const mapToTreeData = (nodes) =>
  nodes?.map((n) => ({
    key: String(n.id),
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: n.status === "inactive" ? "#999" : "#0d6efd" }}>{iconForType(n.type)}</span>
        <span style={{ color: n.status === "inactive" ? "#777" : "#222" }}>{n.title || n.name}</span>
        {/* you can add badge or count here */}
      </div>
    ),
    dataRef: n, // keep original payload so we can pass it up
    children: n.children ? mapToTreeData(n.children) : [],
  }));

const TreeViewPanel = ({ data = [],userRole = "", onNodeSelect = () => {} }) => {
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [autoExpanded, setAutoExpanded] = useState(false); // 👈 ensures expand-all runs only once
  const [selectedKeys, setSelectedKeys] = useState([]);
  const treeData = mapToTreeData(data);
  // ✅ Expand all nodes when data is first loaded
  useEffect(() => {
    if (data.length > 0 && !autoExpanded) {
      const collectKeys = (nodes) =>
        nodes.reduce((acc, n) => {
          acc.push(String(n.id));
          if (n.children?.length) acc.push(...collectKeys(n.children));
          return acc;
        }, []);
      const allKeys = collectKeys(data);
      setExpandedKeys(allKeys);
      setAutoExpanded(true);
    }
  }, [data, autoExpanded]);
  // ✅ Automatically preselect node based on role
  useEffect(() => {
    if (!data.length) return;

    const findNodeByType = (nodes, type) => {
      for (const node of nodes) {
        if (node.type === type && node.status !== "inactive") return node;
        if (node.children?.length) {
          const found = findNodeByType(node.children, type);
          if (found) return found;
        }
      }
      return null;
    };

    let defaultNode = null;
    if (userRole?.toLowerCase() === "manager") {
      defaultNode = findNodeByType(data, "project");
    } else {
      defaultNode = findNodeByType(data, "team");
    }

    if (defaultNode) {
      setSelectedKeys([String(defaultNode.id)]);
      onNodeSelect(defaultNode);
    }
  }, [data, userRole, onNodeSelect]);

  const handleSelect = (selectedKeys, { node }) => {
    if (node.disabled) return; // prevent selecting inactive nodes
    setSelectedKeys(selectedKeys);
    // node.dataRef contains original object
    if (node && node.dataRef) onNodeSelect(node.dataRef);
  };

  return (
    <div className="treeview-panel">
      <Tree
        treeData={treeData}
        showIcon
        expandedKeys={expandedKeys}
        onExpand={(keys) => setExpandedKeys(keys)}
        selectable
        onSelect={handleSelect}
        selectedKeys={selectedKeys} // 👈 controlled selection
      />
    </div>
  );
};

export default TreeViewPanel;
