import React from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";

const Unauthorized = () => {
  return (
    <div style={{ textAlign: "center", padding: "100px 20px" }}>
      <h1 style={{ fontSize: "72px", color: "var(--danger)" }}>403</h1>
      <h2 style={{ marginBottom: "20px" }}>Unauthorized Access</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "30px" }}>
        You do not have the required permissions to view this resource.
      </p>
      <Link to="/dashboard"><Button>Back to Dashboard</Button></Link>
    </div>
  );
};

export default Unauthorized;
