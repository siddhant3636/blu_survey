import React from "react";

const StatusBadge = ({ status }) => {
  const getBadgeStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
      case "COMPLETED":
        return { backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#34d399" };
      case "RETURNED":
      case "REJECTED":
        return { backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#f87171" };
      case "PENDING":
      case "DRAFT":
        return { backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" };
      case "UNDER_REVIEW":
        return { backgroundColor: "rgba(99, 102, 241, 0.15)", color: "#818cf8" };
      case "SUBMITTED":
      case "ASSIGNED":
      case "IN_PROGRESS":
        return { backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" };
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
