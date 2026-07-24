import React from "react";
import Button from "../../components/common/Button";

const ServerError = () => {
  return (
    <div style={{ textAlign: "center", padding: "100px 20px" }}>
      <h1 style={{ fontSize: "72px", color: "var(--warning)" }}>500</h1>
      <h2 style={{ marginBottom: "20px" }}>Internal Server Error</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "30px" }}>
        An unexpected error occurred on the server. Please try again later.
      </p>
      <Button onClick={() => window.location.reload()}>Retry</Button>
    </div>
  );
};

export default ServerError;
