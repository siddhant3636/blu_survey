import React, { useEffect, useState } from "react";
import masterService from "../../services/master.service";
import Table from "../../components/common/Table";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import MasterNavTabs from "../../components/masters/MasterNavTabs";

const ConnectorMaster = () => {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editType, setEditType] = useState("");
  const [error, setError] = useState("");

  const fetchConnectors = async () => {
    try {
      const res = await masterService.getConnectors();
      setConnectors(res.data.connectors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!type.trim()) return;
    try {
      await masterService.createConnector({ type: type.trim() });
      setType("");
      fetchConnectors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create connector");
    }
  };

  const handleStartEdit = (c) => {
    setEditingId(c.id);
    setEditType(c.type);
  };

  const handleSaveEdit = async (id) => {
    if (!editType.trim()) return;
    try {
      await masterService.updateConnector(id, { type: editType.trim() });
      setEditingId(null);
      fetchConnectors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update connector");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await masterService.toggleConnectorStatus(id);
      fetchConnectors();
    } catch (err) {
      setError("Failed to update connector status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this connector type?")) return;
    try {
      await masterService.deleteConnector(id);
      fetchConnectors();
    } catch (err) {
      setError("Failed to delete connector");
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Masters Management Catalog</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "2px" }}>
          Configure charger hardware specifications, models, connectors, and photo tags
        </p>
      </div>

      <MasterNavTabs />

      {error && <p style={{ color: "var(--danger)", fontSize: "14px" }}>⚠️ {error}</p>}
      
      <Card style={{ maxWidth: "450px" }}>
        <h3 style={{ fontSize: "16px", marginBottom: "14px", fontWeight: "700" }}>Add Connector Type</h3>
        <form onSubmit={handleSubmit}>
          <Input label="Connector Type (e.g. CCS2, CHAdeMO, Type 2 AC)" value={type} onChange={(e) => setType(e.target.value)} required />
          <Button type="submit" style={{ marginTop: "12px" }}>Add Connector Type</Button>
        </form>
      </Card>

      <Card>
        <h3 style={{ fontSize: "16px", marginBottom: "14px", fontWeight: "700" }}>Configured Connector Types</h3>
        <Table headers={["Connector Type", "Status", "Actions"]}>
          {connectors.map((c) => (
            <tr key={c.id}>
              <td>
                {editingId === c.id ? (
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <Input value={editType} onChange={(e) => setEditType(e.target.value)} style={{ padding: "4px 8px" }} />
                    <Button size="small" onClick={() => handleSaveEdit(c.id)}>Save</Button>
                    <Button size="small" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <strong>{c.type}</strong>
                )}
              </td>
              <td>
                <span style={{
                  padding: "3px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: "600",
                  backgroundColor: c.isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  color: c.isActive ? "#10b981" : "#ef4444"
                }}>
                  {c.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </td>
              <td>
                <div style={{ display: "flex", gap: "8px" }}>
                  {editingId !== c.id && (
                    <Button size="small" variant="secondary" onClick={() => handleStartEdit(c)}>Edit</Button>
                  )}
                  <Button size="small" variant="secondary" onClick={() => handleToggleStatus(c.id)}>
                    {c.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button size="small" variant="danger" onClick={() => handleDelete(c.id)}>Delete</Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

export default ConnectorMaster;
