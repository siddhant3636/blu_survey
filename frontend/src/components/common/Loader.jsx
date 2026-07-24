import React from "react";

const Loader = ({ size = "medium", className = "" }) => {
  const spinnerSize = size === "small" ? "20px" : size === "large" ? "50px" : "32px";

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }} className={className}>
      <div style={{
        width: spinnerSize,
        height: spinnerSize,
        border: "3px solid var(--border-color)",
        borderTop: "3px solid var(--secondary)",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
