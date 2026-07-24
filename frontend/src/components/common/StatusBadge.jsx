import React from "react";

const StatusBadge = ({ status }) => {
  const getBadgeStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
      case "COMPLETED":
        return { backgroundColor: "rgba(0, 230, 118, 0.15)", color: "var(--success)" };
      case "ASSIGNED":
      case "IN_PROGRESS":
        return { backgroundColor: "rgba(0, 229, 255, 0.15)", color: "var(--secondary)" };
      case "PENDING":
      case "DRAFT":
        return { backgroundColor: "rgba(255, 214, 0, 0.15)", color: "var(--warning)" };
      case "REJECTED":
        return { backgroundColor: "rgba(255, 23, 68, 0.15)", color: "var(--danger)" };
      default:
        return { backgroundColor: "var(--border-color)", color: "var(--text-secondary)" };
    }
  };

  return (
    <span style={{
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      ...getBadgeStyle(status)
    }}>
      {status}
    </span>
  );
};

export default StatusBadge;
