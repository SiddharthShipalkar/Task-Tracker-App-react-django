import React from "react";
import TaskProgressTracker from "./trackerCards/TaskProgressTracker";
import "../dashboard/styles/TrackerList.css" // 👈 add a CSS file for styling
import DeviationTracker from "./trackerCards/DeviationTracker";

const TrackerList = ({ filters, selectedNode, onRowSelect }) => {
  const selectedTrackers = filters?.selectedTrackers || [];
  console.log("selectedTrackers",selectedTrackers)
  return (
    <div className="tracker-scroll-container">
      <div className="tracker-list-container">
        {selectedTrackers.some((tracker) => tracker.value === "self_task_progress") && (
          <TaskProgressTracker
            filters={filters}
            selectedNode={selectedNode}
            onRowSelect={onRowSelect}
            trackerType="self_task_progress"
          />
        )}

        {selectedTrackers.some((tracker) => tracker.value === "overall_task_progress") && (
          <TaskProgressTracker
            filters={filters}
            selectedNode={selectedNode}
            onRowSelect={onRowSelect}
            trackerType="overall_task_progress"
          />
        )}
        {selectedTrackers.some((tracker) => tracker.value === "task_deviation") && (
          <DeviationTracker
            filters={filters}
            selectedNode={selectedNode}
            onRowSelect={onRowSelect}
            trackerType="task_deviation"
          />
        )}
        {/* {selectedTrackers.some((tracker) => tracker.value === "associate_deviation") && (
          <TaskProgressTracker
            filters={filters}
            selectedNode={selectedNode}
            onRowSelect={onRowSelect}
            trackerType="associate_deviation"
          />
        )} */}
      </div>
    </div>
  );
};

export default TrackerList;
