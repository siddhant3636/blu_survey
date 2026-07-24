import React, { useEffect, useState } from "react";
import masterService from "../../services/master.service";
import Table from "../../components/common/Table";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import MasterNavTabs from "../../components/masters/MasterNavTabs";

const PhotoCategoryMaster = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await masterService.getPhotoCategories();
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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
      await masterService.createPhotoCategory({
        name: form.name.trim(),
        description: form.description.trim(),
      });
      setForm({ name: "", description: "" });
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create category");
    }
  };

  const handleStartEdit = (c) => {
    setEditingId(c.id);
    setEditForm({ name: c.name, description: c.description || "" });
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.name.trim()) return;
    try {
      await masterService.updatePhotoCategory(id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
      });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update category");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await masterService.togglePhotoCategoryStatus(id);
      fetchCategories();
    } catch (err) {
      setError("Failed to update category status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this photo category?")) return;
    try {
      await masterService.deletePhotoCategory(id);
      fetchCategories();
    } catch (err) {
      setError("Failed to delete photo category");
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
        <h3 style={{ fontSize: "16px", marginBottom: "14px", fontWeight: "700" }}>Add Photo Target Category</h3>
        <form onSubmit={handleSubmit}>
          <Input label="Category Name" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Charger Front / Panel Board" />
          <Input label="Description" name="description" value={form.description} onChange={handleChange} placeholder="Tagging requirements" />
          <Button type="submit" style={{ marginTop: "12px" }}>Add Category</Button>
        </form>
      </Card>

      <Card>
        <h3 style={{ fontSize: "16px", marginBottom: "14px", fontWeight: "700" }}>Configured Photo Categories</h3>
        <Table headers={["Category Name", "Description", "Status", "Actions"]}>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>
                {editingId === c.id ? (
                  <Input name="name" value={editForm.name} onChange={handleEditChange} style={{ padding: "4px 8px" }} />
                ) : (
                  <strong>{c.name}</strong>
                )}
              </td>
              <td>
                {editingId === c.id ? (
                  <Input name="description" value={editForm.description} onChange={handleEditChange} style={{ padding: "4px 8px" }} />
                ) : (
                  c.description || "N/A"
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
                <div style={{ display: "flex", gap: "6px" }}>
                  {editingId === c.id ? (
                    <>
                      <Button size="small" onClick={() => handleSaveEdit(c.id)}>Save</Button>
                      <Button size="small" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button size="small" variant="secondary" onClick={() => handleStartEdit(c)}>Edit</Button>
                      <Button size="small" variant="secondary" onClick={() => handleToggleStatus(c.id)}>
                        {c.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button size="small" variant="danger" onClick={() => handleDelete(c.id)}>Delete</Button>
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

export default PhotoCategoryMaster;
