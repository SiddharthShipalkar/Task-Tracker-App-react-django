// src/components/dashboard/TreeViewPanel.jsx
import React from "react";
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

const TreeViewPanel = ({ data = [], onNodeSelect = () => {} }) => {
  const treeData = mapToTreeData(data);

  const handleSelect = (selectedKeys, { node }) => {
    // node.dataRef contains original object
    if (node && node.dataRef) onNodeSelect(node.dataRef);
  };

  return (
    <div className="treeview-panel">
      <Tree
        treeData={treeData}
        defaultExpandAll={false}
        showIcon
        onSelect={handleSelect}
        selectable
      />
    </div>
  );
};

export default TreeViewPanel;
