import React from "react";
import { Link, useLocation } from "react-router-dom";

const MasterNavTabs = () => {
  const location = useLocation();

  const tabs = [
    { path: "/masters/equipment", label: "Master Categories & Ratings" },
    { path: "/masters/mccb", label: "MCCB Ratings" },
    { path: "/masters/manufacturers", label: "Manufacturers" },
    { path: "/masters/models", label: "Charger Models" },
    { path: "/masters/connectors", label: "Connector Types" },
    { path: "/masters/photo-categories", label: "Photo Categories" },
  ];

  return (
    <div style={{
      display: "flex",
      gap: "10px",
      borderBottom: "1px solid var(--border-color)",
      paddingBottom: "12px",
      marginBottom: "20px",
      flexWrap: "wrap",
    }}>
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--border-radius)",
              backgroundColor: isActive ? "var(--primary)" : "rgba(255, 255, 255, 0.05)",
              color: isActive ? "#ffffff" : "var(--text-primary)",
              fontWeight: isActive ? "600" : "500",
              fontSize: "14px",
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
};

export default MasterNavTabs;
