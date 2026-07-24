import React, { useEffect, useState } from "react";
import masterService from "../../services/master.service";
import Table from "../../components/common/Table";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import MasterNavTabs from "../../components/masters/MasterNavTabs";

const EquipmentMaster = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  const fetchEquipments = async () => {
    try {
      const res = await masterService.getEquipments();
      setEquipments(res.data.equipments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return;
    try {
      await masterService.createEquipment({
        name: form.name.trim(),
        description: form.description.trim(),
      });
      setForm({ name: "", description: "" });
      fetchEquipments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create equipment");
    }
  };

  const handleStartEdit = (eq) => {
    setEditingId(eq.id);
    setEditForm({ name: eq.name, description: eq.description || "" });
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.name.trim()) return;
    try {
      await masterService.updateEquipment(id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
      });
      setEditingId(null);
      fetchEquipments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update equipment");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await masterService.toggleEquipmentStatus(id);
      fetchEquipments();
    } catch (err) {
      setError("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this equipment entry?")) return;
    try {
      await masterService.deleteEquipment(id);
      fetchEquipments();
    } catch (err) {
      setError("Failed to delete equipment");
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
        <h3 style={{ fontSize: "16px", marginBottom: "14px", fontWeight: "700" }}>Add Audit Equipment</h3>
        <form onSubmit={handleSubmit}>
          <Input label="Equipment Name" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Earth Clamp Tester" />
          <Input label="Category / Description" name="description" value={form.description} onChange={handleChange} placeholder="Testing equipment details or Category Tag" />
          <Button type="submit" style={{ marginTop: "12px" }}>Add Equipment</Button>
        </form>
      </Card>

      <Card>
        <h3 style={{ fontSize: "16px", marginBottom: "14px", fontWeight: "700" }}>Configured Equipment</h3>
        <Table headers={["Name", "Description / Category", "Status", "Actions"]}>
          {equipments.map((eq) => (
            <tr key={eq.id}>
              <td>
                {editingId === eq.id ? (
                  <Input name="name" value={editForm.name} onChange={handleEditChange} style={{ padding: "4px 8px" }} />
                ) : (
                  <strong>{eq.name}</strong>
                )}
              </td>
              <td>
                {editingId === eq.id ? (
                  <Input name="description" value={editForm.description} onChange={handleEditChange} style={{ padding: "4px 8px" }} />
                ) : (
                  eq.description || "N/A"
                )}
              </td>
              <td>
                <span style={{
                  padding: "3px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: "600",
                  backgroundColor: eq.isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  color: eq.isActive ? "#10b981" : "#ef4444"
                }}>
                  {eq.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </td>
              <td>
                <div style={{ display: "flex", gap: "6px" }}>
                  {editingId === eq.id ? (
                    <>
                      <Button size="small" onClick={() => handleSaveEdit(eq.id)}>Save</Button>
                      <Button size="small" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button size="small" variant="secondary" onClick={() => handleStartEdit(eq)}>Edit</Button>
                      <Button size="small" variant="secondary" onClick={() => handleToggleStatus(eq.id)}>
                        {eq.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button size="small" variant="danger" onClick={() => handleDelete(eq.id)}>Delete</Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

export default EquipmentMaster;
