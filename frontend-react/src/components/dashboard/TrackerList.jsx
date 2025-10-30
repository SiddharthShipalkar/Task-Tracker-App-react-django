import React from "react";
import TaskProgressTracker from './trackerCards/TaskProgressTracker';
const TrackerList = ({ filters,selectedNode,onRowSelect }) => {
  const selectedTrackers = filters?.selectedTrackers || []
  console.log(selectedTrackers)
  return (
    <div className="tracker-list">
      {selectedTrackers.some(tracker=> tracker.value==="self_task_progress")&&(
        
        <TaskProgressTracker filters={filters} selectedNode={selectedNode} onRowSelect={onRowSelect} trackerType="self_task_progress"/>
      )}
      {selectedTrackers.some(tracker=> tracker.value==="overall_task_progress")&&(
        
        <TaskProgressTracker filters={filters} selectedNode={selectedNode} onRowSelect={onRowSelect} trackerType="overall_task_progress"/>
      )}
      
    </div>
  );
};

export default TrackerList;
