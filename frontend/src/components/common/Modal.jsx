import React from "react";
import Button from "./Button";

const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0, 0, 0, 0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000
    }}>
      <div className="glass-card" style={{ width: "90%", maxWidth: "500px", position: "relative" }}>
        <h3 style={{ marginBottom: "16px", fontSize: "18px" }}>{title}</h3>
        <div>{children}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
