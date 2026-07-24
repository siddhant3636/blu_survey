import React from "react";
import { Link } from "react-router-dom";
import Card from "../../components/common/Card";

const SurveyDashboard = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "24px", fontWeight: "700" }}>Surveyor Dashboard</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Manage your assigned field survey tasks</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
        <Link to="/survey/assigned">
          <Card className="metric-card" style={{ cursor: "pointer", minHeight: "120px" }}>
            <div className="metric-icon" style={{ fontSize: "28px" }}>📋</div>
            <div>
              <h3 style={{ fontSize: "16px", color: "var(--text-primary)" }}>Assigned Sites</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>View and start new site surveys</p>
            </div>
          </Card>
        </Link>

        <Link to="/survey/history">
          <Card className="metric-card" style={{ cursor: "pointer", minHeight: "120px" }}>
            <div className="metric-icon" style={{ fontSize: "28px" }}>⏱️</div>
            <div>
              <h3 style={{ fontSize: "16px", color: "var(--text-primary)" }}>Survey History</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>List previously submitted surveys</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default SurveyDashboard;
