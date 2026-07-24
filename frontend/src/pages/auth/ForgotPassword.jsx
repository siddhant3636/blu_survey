import React, { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <h2>Forgot Password</h2>
          <p>Retrieve access coordinates to your account</p>
        </div>
        {submitted ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--success)", marginBottom: "20px" }}>
              If the email exists, we have sent instructions to reset your password.
            </p>
            <Link to="/login"><Button>Back to Login</Button></Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your registered email"
            />
            <Button type="submit" style={{ width: "100%", marginTop: "10px" }}>
              Request Password Reset
            </Button>
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <Link to="/login" style={{ color: "var(--secondary)", fontSize: "14px" }}>Back to Login</Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
