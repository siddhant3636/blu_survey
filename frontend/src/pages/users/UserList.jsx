import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import userService from "../../services/user.service";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import Card from "../../components/common/Card";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getUsers();
        const userList = res.data?.data?.users || res.data?.users || [];
        setUsers(userList);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load user directory.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <Loader size="large" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="responsive-header-bar">
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700" }}>System Users Directory</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Manage system surveyors, admins, phone numbers, and mapped site IDs</p>
        </div>
        <Link to="/users/add"><Button>+ Add New User</Button></Link>
      </div>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      {users.length === 0 ? (
        <Card>
          <div style={{ padding: "20px", textAlign: "center" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>No Surveyors Found</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Click "Add New User" to create field surveyor accounts and map site IDs.
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <Table headers={["Name", "Email", "Mobile Number", "Role", "Mapped Sites (Site IDs)", "Status", "Actions"]}>
            {users.map((u) => {
              const mappedSites = u.assignedSites || [];
              return (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.phone || "—"}</td>
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
                  <td>
                    {mappedSites.length === 0 ? (
                      <span style={{ color: "var(--text-secondary)", fontSize: "12px", italic: "true" }}>No Sites Mapped</span>
                    ) : (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {mappedSites.map((st) => (
                          <span
                            key={st.id}
                            style={{
                              backgroundColor: "rgba(99, 102, 241, 0.12)",
                              color: "#818cf8",
                              border: "1px solid rgba(99, 102, 241, 0.3)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: "600"
                            }}
                            title={st.name}
                          >
                            {st.siteId}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>{u.isActive ? "🟢 Active" : "🔴 Deactivated"}</td>
                  <td>
                    <Link to={`/users/edit/${u.id}`} style={{ color: "var(--secondary)", fontWeight: "600" }}>Edit</Link>
                  </td>
                </tr>
              );
            })}
          </Table>
        </Card>
      )}
    </div>
  );
};

export default UserList;
