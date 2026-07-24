import React from "react";

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav style={{ marginBottom: "20px", fontSize: "14px" }}>
      {items.map((item, idx) => (
        <span key={idx} style={{ color: idx === items.length - 1 ? "var(--text-primary)" : "var(--text-secondary)" }}>
          {item.label}
          {idx < items.length - 1 && <span style={{ margin: "0 8px" }}>/</span>}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;
