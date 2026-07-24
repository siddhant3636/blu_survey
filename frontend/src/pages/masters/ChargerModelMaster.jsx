import React, { useEffect, useState } from "react";
import masterService from "../../services/master.service";
import Table from "../../components/common/Table";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import MasterNavTabs from "../../components/masters/MasterNavTabs";

const ChargerModelMaster = () => {
  const [models, setModels] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", manufacturerId: "", powerRating: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", manufacturerId: "", powerRating: "" });
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [modelsRes, mfgRes] = await Promise.all([
        masterService.getModels(),
        masterService.getManufacturers(),
      ]);
      setModels(modelsRes.data.models || []);
      setManufacturers(mfgRes.data.manufacturers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
    if (!form.name.trim() || !form.manufacturerId || !form.powerRating.trim()) return;
    try {
      await masterService.createModel({
        name: form.name.trim(),
        manufacturerId: form.manufacturerId,
        powerRating: form.powerRating.trim(),
      });
      setForm({ name: "", manufacturerId: "", powerRating: "" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create model");
    }
  };

  const handleStartEdit = (m) => {
    setEditingId(m.id);
    setEditForm({
      name: m.name,
      manufacturerId: m.manufacturerId || "",
      powerRating: m.powerRating || "",
    });
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.name.trim() || !editForm.manufacturerId || !editForm.powerRating.trim()) return;
    try {
      await masterService.updateModel(id, {
        name: editForm.name.trim(),
        manufacturerId: editForm.manufacturerId,
        powerRating: editForm.powerRating.trim(),
      });
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update model");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await masterService.toggleModelStatus(id);
      fetchData();
    } catch (err) {
      setError("Failed to update model status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this model?")) return;
    try {
      await masterService.deleteModel(id);
      fetchData();
    } catch (err) {
      setError("Failed to delete model");
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
      
      <Card style={{ maxWidth: "500px" }}>
        <h3 style={{ fontSize: "16px", marginBottom: "14px", fontWeight: "700" }}>Add Charger Model</h3>
        <form onSubmit={handleSubmit}>
          <Select
            label="Manufacturer"
            name="manufacturerId"
            value={form.manufacturerId}
            onChange={handleChange}
            options={manufacturers.map((m) => ({ value: m.id, label: m.name }))}
            required
          />
          <Input label="Model Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Terra 54 / Citycharger" required />
          <Input label="Power Rating (e.g. 50kW, 120kW)" name="powerRating" value={form.powerRating} onChange={handleChange} required />
          <Button type="submit" style={{ marginTop: "12px" }}>Add Charger Model</Button>
        </form>
      </Card>

      <Card>
        <h3 style={{ fontSize: "16px", marginBottom: "14px", fontWeight: "700" }}>Configured Charger Models</h3>
        <Table headers={["Model Name", "Manufacturer", "Power Rating", "Status", "Actions"]}>
          {models.map((m) => (
            <tr key={m.id}>
              <td>
                {editingId === m.id ? (
                  <Input name="name" value={editForm.name} onChange={handleEditChange} style={{ padding: "4px 8px" }} />
                ) : (
                  <strong>{m.name}</strong>
                )}
              </td>
              <td>
                {editingId === m.id ? (
                  <Select
                    name="manufacturerId"
                    value={editForm.manufacturerId}
                    onChange={handleEditChange}
                    options={manufacturers.map((mfg) => ({ value: mfg.id, label: mfg.name }))}
                  />
                ) : (
                  m.manufacturer?.name || "N/A"
                )}
              </td>
              <td>
                {editingId === m.id ? (
                  <Input name="powerRating" value={editForm.powerRating} onChange={handleEditChange} style={{ padding: "4px 8px" }} />
                ) : (
                  m.powerRating
                )}
              </td>
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
                <div style={{ display: "flex", gap: "6px" }}>
                  {editingId === m.id ? (
                    <>
                      <Button size="small" onClick={() => handleSaveEdit(m.id)}>Save</Button>
                      <Button size="small" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button size="small" variant="secondary" onClick={() => handleStartEdit(m)}>Edit</Button>
                      <Button size="small" variant="secondary" onClick={() => handleToggleStatus(m.id)}>
                        {m.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button size="small" variant="danger" onClick={() => handleDelete(m.id)}>Delete</Button>
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

export default ChargerModelMaster;
