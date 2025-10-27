import React from "react";
import TaskProgressTracker from './trackerCards/TaskProgressTracker';

const TrackerList = ({ trackers = [] }) => {
  return (
    <div className="tracker-list">
      {/* For now we only show one tracker type */}
      <TaskProgressTracker />
    </div>
  );
};

export default TrackerList;
