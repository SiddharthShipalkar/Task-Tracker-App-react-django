// src/components/dashboard/QuickFilters.jsx
import React, { useState, useEffect } from "react";
import { MultiSelect } from "react-multi-select-component";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const QuickFilters = ({ onFilterChange = () => {} }) => {
  const trackerOptions = [
    { label: "Task Progress", value: "task_progress" },
    { label: "Task Deviation", value: "task_deviation" },
    { label: "Associate Deviation", value: "associate_deviation" },
  ];

  const [selectedTrackers, setSelectedTrackers] = useState([]);
  const [dateFilter, setDateFilter] = useState("Single Day");
  const [startDate, setStartDate] = useState(new Date()); // default today
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    setSelectedTrackers(trackerOptions); // default select all
  }, []);

  // notify parent when any filter piece changes
  useEffect(() => {
    onFilterChange({
      selectedTrackers,
      dateFilter,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
    });
  }, [selectedTrackers, dateFilter, startDate, endDate, onFilterChange]);

  // when dateFilter changes, adjust dates
  useEffect(() => {
    if (dateFilter === "Single Day" || dateFilter === "Until Date") {
      setStartDate(new Date());
      setEndDate(null);
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  }, [dateFilter]);

  return (
    <div className="quick-filters bg-white p-3 rounded shadow-sm border w-100">
      <h6 className="fw-semibold text-primary">Quick Filters</h6>

      <div className="d-flex align-items-center flex-wrap gap-3">
        {/* Tracker Type */}
        <div className="filter-item d-flex align-items-center gap-2">
          <label style={{ minWidth: 110 }} className="fw-semibold text-muted mb-0">Tracker Type:</label>
          <div style={{ minWidth: 200, maxWidth: 320 }}>
            <MultiSelect
              options={trackerOptions}
              value={selectedTrackers}
              onChange={setSelectedTrackers}
              labelledBy="Select Tracker Types"
              hasSelectAll={true}
            />
          </div>
        </div>

        {/* Date Filter */}
        <div className="filter-item d-flex align-items-center gap-2">
          <label style={{ minWidth: 100 }} className="fw-semibold text-muted mb-0">Date Filter:</label>
          <select className="form-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ minWidth: 160 }}>
            <option value="Single Day">Single Day</option>
            <option value="Until Date">Until Date</option>
            <option value="Date Range">Date Range</option>
          </select>
        </div>

        {/* Date Picker */}
        <div className="filter-item d-flex align-items-center gap-2">
          <label style={{ minWidth: 100 }} className="fw-semibold text-muted mb-0">Select Date:</label>

          {(dateFilter === "Single Day" || dateFilter === "Until Date") && (
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd/MM/yyyy"
              className="form-control"
              placeholderText="Select date"
            />
          )}

          {dateFilter === "Date Range" && (
            <div className="d-flex align-items-center gap-2">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="Start"
                className="form-control"
              />
              <span className="fw-semibold">to</span>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="End"
                className="form-control"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickFilters;
