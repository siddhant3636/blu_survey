import React, { useState } from "react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setSuccess(true);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <h2>Change Password</h2>
          <p>Please enter your new password below</p>
        </div>
        {success ? (
          <p style={{ color: "var(--success)" }}>Password successfully changed!</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" style={{ width: "100%", marginTop: "10px" }}>
              Submit
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ChangePassword;
