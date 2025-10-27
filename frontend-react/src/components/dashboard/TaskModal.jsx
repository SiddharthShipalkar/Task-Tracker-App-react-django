// src/components/dashboard/TaskModal.jsx
import React, { useState } from "react";
import axiosInstance from "../../axiosInstance";

const TaskModal = ({ show, onClose, onTaskAdded }) => {
  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: taskName, description: taskDesc /* plus other fields as required */ };
      await axiosInstance.post("/add-task", payload);
      setTaskName("");
      setTaskDesc("");
      onTaskAdded();
    } catch (err) {
      console.error("Error adding task:", err);
      // show error UI as needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-dialog modal-centered">
        <div className="modal-content p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Add Task</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Task Name</label>
              <input className="form-control" value={taskName} onChange={(e) => setTaskName(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea className="form-control" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} rows={3} />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? "Saving..." : "Save Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
