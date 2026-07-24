import React, { useEffect, useState } from "react";
import masterService from "../../services/master.service";
import Table from "../../components/common/Table";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import MasterNavTabs from "../../components/masters/MasterNavTabs";

const ManufacturerMaster = () => {
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  const fetchManufacturers = async () => {
    try {
      const res = await masterService.getManufacturers();
      setManufacturers(res.data.manufacturers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return;
    try {
      await masterService.createManufacturer({ name: name.trim() });
      setName("");
      fetchManufacturers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create manufacturer");
    }
  };

  const handleStartEdit = (m) => {
    setEditingId(m.id);
    setEditName(m.name);
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;
    try {
      await masterService.updateManufacturer(id, { name: editName.trim() });
      setEditingId(null);
      fetchManufacturers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update manufacturer");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await masterService.toggleManufacturerStatus(id);
      fetchManufacturers();
    } catch (err) {
      setError("Failed to update manufacturer status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this manufacturer?")) return;
    try {
      await masterService.deleteManufacturer(id);
      fetchManufacturers();
    } catch (err) {
      setError("Failed to delete manufacturer");
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
        <h3 style={{ fontSize: "16px", marginBottom: "14px", fontWeight: "700" }}>Add Charger Manufacturer</h3>
        <form onSubmit={handleSubmit}>
          <Input label="Manufacturer Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ABB, Delta, Siemens" required />
          <Button type="submit" style={{ marginTop: "12px" }}>Add Manufacturer</Button>
        </form>
      </Card>

      <Card>
        <h3 style={{ fontSize: "16px", marginBottom: "14px", fontWeight: "700" }}>Configured Manufacturers</h3>
        <Table headers={["Manufacturer Name", "Models Count", "Status", "Actions"]}>
          {manufacturers.map((m) => (
            <tr key={m.id}>
              <td>
                {editingId === m.id ? (
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: "4px 8px" }} />
                    <Button size="small" onClick={() => handleSaveEdit(m.id)}>Save</Button>
                    <Button size="small" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <strong>{m.name}</strong>
                )}
              </td>
              <td>{m.models?.length || 0} Model(s)</td>
              <td>
                <span style={{
                  padding: "3px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: "600",
                  backgroundColor: m.isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  color: m.isActive ? "#10b981" : "#ef4444"
                }}>
                  {m.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </td>
              <td>
                <div style={{ display: "flex", gap: "8px" }}>
                  {editingId !== m.id && (
                    <Button size="small" variant="secondary" onClick={() => handleStartEdit(m)}>Edit</Button>
                  )}
                  <Button size="small" variant="secondary" onClick={() => handleToggleStatus(m.id)}>
                    {m.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button size="small" variant="danger" onClick={() => handleDelete(m.id)}>Delete</Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

export default ManufacturerMaster;
