import React from "react";

const LineChart = ({ title }) => {
  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <h3 style={{ fontSize: "16px", color: "var(--text-secondary)" }}>{title || "Monthly Submissions"}</h3>
      <div style={{ padding: "10px 0" }}>
        <svg viewBox="0 0 500 180" style={{ width: "100%", height: "180px" }}>
          <path
            d="M 20 150 Q 100 100 180 120 T 340 50 T 480 30"
            fill="none"
            stroke="var(--secondary)"
            strokeWidth="3"
          />
          <path
            d="M 20 150 Q 100 100 180 120 T 340 50 T 480 30 L 480 180 L 20 180 Z"
            fill="url(#gradient)"
            opacity="0.15"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--secondary)" />
              <stop offset="100%" stopColor="var(--bg-color)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default LineChart;
