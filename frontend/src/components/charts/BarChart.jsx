import React from "react";

const BarChart = ({ title }) => {
  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <h3 style={{ fontSize: "16px", color: "var(--text-secondary)" }}>{title || "Surveys Completed"}</h3>
      <div style={{ display: "flex", alignItems: "flex-end", height: "180px", gap: "16px", padding: "10px 0" }}>
        {[60, 45, 80, 55, 90, 70, 100].map((height, idx) => (
          <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "100%", height: `${height}%`,
              background: "var(--premium-gradient)",
              borderRadius: "4px 4px 0 0",
              transition: "height 1s ease"
            }} />
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>M{idx + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
