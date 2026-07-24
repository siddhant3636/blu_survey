import React, { useEffect, useState } from "react";
import userService from "../../services/user.service";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";

const UserPerformance = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getUsers();
        const userList = res.data?.data?.users || res.data?.users || [];
        setUsers(userList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <Loader size="large" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h2 style={{ fontSize: "24px", fontWeight: "700" }}>User Performance Metrics</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Surveyor activity and team member statistics
        </p>
      </div>

      <Card>
        <Table headers={["Name", "Email", "Role", "Active Status", "Account Created"]}>
          {users.map((u) => (
            <tr key={u.id}>
              <td><strong>{u.name}</strong></td>
              <td>{u.email}</td>
              <td>
                <span style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: "600",
                  backgroundColor: u.role === "ADMIN" ? "rgba(99, 102, 241, 0.15)" : u.role === "SUB_ADMIN" ? "rgba(14, 165, 233, 0.15)" : "rgba(34, 197, 94, 0.15)",
                  color: u.role === "ADMIN" ? "#6366f1" : u.role === "SUB_ADMIN" ? "#0ea5e9" : "#22c55e"
                }}>
                  {u.role}
                </span>
              </td>
              <td><StatusBadge status={u.isActive ? "ACTIVE" : "INACTIVE"} /></td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

export default UserPerformance;
