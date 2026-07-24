import React from "react";
import { useAuth } from "../../hooks/useAuth";
import Card from "../../components/common/Card";

const UserProfile = () => {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px" }}>My Profile</h2>
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;
