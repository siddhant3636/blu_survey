import React from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";

const NotFound = () => {
  return (
    <div style={{ textAlign: "center", padding: "100px 20px" }}>
      <h1 style={{ fontSize: "72px", color: "var(--secondary)" }}>404</h1>
      <h2 style={{ marginBottom: "20px" }}>Page Not Found</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "30px" }}>
        The page you are looking for might have been removed or is temporarily unavailable.
      </p>
      <Link to="/dashboard"><Button>Go to Dashboard</Button></Link>
    </div>
  );
};

export default NotFound;
