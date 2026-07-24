import React, { useEffect, useState } from "react";
import masterService from "../../services/master.service";
import Table from "../../components/common/Table";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import MasterNavTabs from "../../components/masters/MasterNavTabs";

const MccbMaster = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("MCCB Rating");
  const [newValue, setNewValue] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState("");

  const categories = [
    { value: "MCCB Rating", label: "MCCB Rating" },
    { value: "MCB 4P Rating", label: "MCB 4P Rating" },
    { value: "MCB 2P Rating", label: "MCB 2P Rating" },
    { value: "MCCB MAKE", label: "MCCB MAKE" },
    { value: "MCB MAKE", label: "MCB MAKE" }
  ];

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

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setNewValue("");
    setError("");
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    const isRatingCategory = ["MCCB Rating", "MCB 4P Rating", "MCB 2P Rating"].includes(category);
    
    if (isRatingCategory) {
      if (val !== "" && !/^\d+$/.test(val)) {
        setError("Please enter only the numeric value (e.g., 63). Prefixes and suffixes are added automatically.");
        return;
      }
    }
    
    setError("");
    setNewValue(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newValue.trim()) return;
    setError("");

    let valueToSubmit = newValue.trim();
    const isRatingCategory = ["MCCB Rating", "MCB 4P Rating", "MCB 2P Rating"].includes(category);

    if (isRatingCategory) {
      if (!/^\d+$/.test(valueToSubmit)) {
        setError("Please enter only the numeric value (e.g., 63).");
        return;
      }
      
      if (category === "MCCB Rating") {
        valueToSubmit = `MCCB ${valueToSubmit}A 4P`;
      } else if (category === "MCB 2P Rating") {
        valueToSubmit = `MCB ${valueToSubmit}A 2P`;
      } else if (category === "MCB 4P Rating") {
        valueToSubmit = `MCB ${valueToSubmit}A 4P`;
      }
    }

    try {
      await masterService.createEquipment({
        name: valueToSubmit,
        description: category
      });
      setNewValue("");
      fetchEquipments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create master entry");
    }
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditValue(item.name);
  };

  const handleSaveEdit = async (id) => {
    if (!editValue.trim()) return;
    try {
      await masterService.updateEquipment(id, { name: editValue.trim() });
      setEditingId(null);
      fetchEquipments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update entry");
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
    if (!window.confirm("Are you sure you want to delete this rating entry?")) return;
    try {
      await masterService.deleteEquipment(id);
      fetchEquipments();
    } catch (err) {
      setError("Failed to delete entry");
    }
  };

  if (loading) return <Loader />;

  const mccbList = equipments.filter((e) => e.description === "MCCB Rating" || e.description === "MCCB 4P Rating");
  const mcb4pList = equipments.filter((e) => e.description === "MCB 4P Rating");
  const mcb2pList = equipments.filter((e) => e.description === "MCB 2P Rating");
  const mccbMakeList = equipments.filter((e) => e.description === "MCCB MAKE");
  const mcbMakeList = equipments.filter((e) => e.description === "MCB MAKE");

  const isRatingCategorySelected = ["MCCB Rating", "MCB 4P Rating", "MCB 2P Rating"].includes(category);

  const renderSection = (title, items) => (
    <div
      style={{
        backgroundColor: "var(--card-bg, rgba(21, 28, 44, 0.85))",
        borderRadius: "10px",
        border: "1px solid var(--border-color, rgba(255, 255, 255, 0.1))",
        overflow: "hidden",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)"
      }}
    >
      <div
        style={{
          backgroundColor: "#10b981",
          color: "#ffffff",
          padding: "14px 18px",
          fontWeight: "700",
          fontSize: "15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: "12px", backgroundColor: "rgba(0,0,0,0.2)", padding: "2px 8px", borderRadius: "10px" }}>
          {items.length} Items
        </span>
      </div>

      <div style={{ padding: "12px 16px" }}>
        {items.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "14.5px", padding: "10px 0" }}>No items configured</p>
        ) : (
          <Table headers={["Name", "Status", "Actions"]}>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  {editingId === item.id ? (
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} style={{ padding: "4px 8px" }} />
                      <Button size="small" onClick={() => handleSaveEdit(item.id)}>Save</Button>
                      <Button size="small" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <strong>{item.name}</strong>
                  )}
                </td>
                <td>
                  <span style={{
                    padding: "2px 6px",
                    borderRadius: "10px",
                    fontSize: "10px",
                    fontWeight: "600",
                    backgroundColor: item.isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                    color: item.isActive ? "#10b981" : "#ef4444"
                  }}>
                    {item.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {editingId !== item.id && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item.id)}
                      style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                    >
                      {item.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      style={{ background: "none", border: "none", color: "var(--danger, #ef4444)", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Masters Management Catalog</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "2px" }}>
          Configure MCCB/MCB breaker ratings and manufacturer makes
        </p>
      </div>

      <MasterNavTabs />

      {error && <p style={{ color: "var(--danger)", marginBottom: "12px", fontSize: "14px" }}>⚠️ {error}</p>}
      
      <Card style={{ maxWidth: "480px" }}>
        <h3 style={{ fontSize: "16px", marginBottom: "14px", fontWeight: "700" }}>Add Master Field Entry</h3>
        <form onSubmit={handleSubmit}>
          <Select
            label="Category Type"
            value={category}
            onChange={handleCategoryChange}
            options={categories}
            required
          />
          <Input
            label={isRatingCategorySelected ? "Rating Value (Number Only)" : "Field Value"}
            type="text"
            value={newValue}
            onChange={handleInputChange}
            placeholder={isRatingCategorySelected ? "Enter rating (e.g., 63)" : "e.g. L&T"}
            required
          />
          <Button type="submit" style={{ marginTop: "12px" }}>Add Entry</Button>
        </form>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
        {renderSection("MCCB Ratings", mccbList)}
        {renderSection("MCB 2P Ratings", mcb2pList)}
        {renderSection("MCB 4P Ratings", mcb4pList)}
        {renderSection("MCCB MAKE", mccbMakeList)}
        {renderSection("MCB MAKE", mcbMakeList)}
      </div>
    </div>
  );
};

export default MccbMaster;
