import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <h2>BluSmart Survey</h2>
          <p>Sign in to your account to start surveying</p>
        </div>
        {error && (
          <div style={{
            padding: "12px", background: "rgba(255, 23, 68, 0.1)",
            color: "var(--danger)", borderRadius: "var(--border-radius)",
            marginBottom: "16px", fontSize: "14px", border: "1px solid var(--danger)"
          }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
          />
          <Button type="submit" disabled={loading} style={{ width: "100%", marginTop: "10px" }}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;
