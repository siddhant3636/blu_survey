import React from "react";

const PieChart = ({ title }) => {
  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <h3 style={{ fontSize: "16px", color: "var(--text-secondary)" }}>{title || "Survey Status Breakdown"}</h3>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "180px" }}>
        <svg width="150" height="150" viewBox="0 0 42 42" className="donut">
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--border-color)" strokeWidth="4" />
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--success)" strokeWidth="4"
            strokeDasharray="60 40" strokeDashoffset="25" />
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--secondary)" strokeWidth="4"
            strokeDasharray="30 70" strokeDashoffset="85" />
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--warning)" strokeWidth="4"
            strokeDasharray="10 90" strokeDashoffset="15" />
        </svg>
      </div>
      <div style={{ display: "flex", justifyContent: "space-around", fontSize: "12px", color: "var(--text-secondary)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ color: "var(--success)" }}>●</span> Approved</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ color: "var(--secondary)" }}>●</span> In Progress</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ color: "var(--warning)" }}>●</span> Draft</span>
      </div>
    </div>
  );
};

export default PieChart;
