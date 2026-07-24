import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import siteService from "../../services/site.service";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";

const EditSite = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    siteId: "",
    name: "",
    concessionaire: "",
    landOwningAgency: "",
    address: "",
    latitude: "",
    longitude: "",
    status: "PENDING",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const role = user?.role;
  const canEditDetails = role === "ADMIN" || role === "SUB_ADMIN";

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const res = await siteService.getSite(id);
        const siteData = res.data?.data?.site || res.data?.site;
        if (siteData) {
          setForm({
            siteId: siteData.siteId || "",
            name: siteData.name || "",
            concessionaire: siteData.concessionaire || "",
            landOwningAgency: siteData.landOwningAgency || "",
            address: siteData.address || "",
            latitude: siteData.latitude !== null && siteData.latitude !== undefined ? String(siteData.latitude) : "",
            longitude: siteData.longitude !== null && siteData.longitude !== undefined ? String(siteData.longitude) : "",
            status: siteData.status || "PENDING",
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch site data");
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        siteId: form.siteId ? form.siteId.trim() : undefined,
        name: form.name,
        concessionaire: form.concessionaire,
        landOwningAgency: form.landOwningAgency,
        address: form.address,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        status: form.status,
      };

      await siteService.updateSite(id, payload);
      navigate("/survey-sites");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update survey site");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ maxWidth: "550px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Edit Survey Site</h2>
        <Button variant="secondary" onClick={() => navigate("/survey-sites")}>Back to Sites List</Button>
      </div>

      {error && <p style={{ color: "var(--danger)", marginBottom: "16px" }}>{error}</p>}

      <Card>
        <form onSubmit={handleSubmit}>
          {canEditDetails && (
            <>
              <Input label="Site ID" name="siteId" value={form.siteId} onChange={handleChange} placeholder="e.g. BSC001" />
              <Input label="Site Name" name="name" value={form.name} onChange={handleChange} required placeholder="Site Name" />
              <Input label="Concessionaire" name="concessionaire" value={form.concessionaire} onChange={handleChange} placeholder="Concessionaire name" />
              <Input label="Land Owning Agency" name="landOwningAgency" value={form.landOwningAgency} onChange={handleChange} placeholder="Land owning agency" />
              <Input label="Full Address" name="address" value={form.address} onChange={handleChange} required placeholder="Site address" />
              <Input label="Latitude" name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} placeholder="e.g. 28.6328" />
              <Input label="Longitude" name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} placeholder="e.g. 77.2197" />
            </>
          )}
          
          <Select
            label="Site Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={[
              { value: "PENDING", label: "PENDING" },
              { value: "ASSIGNED", label: "ASSIGNED" },
              { value: "IN_PROGRESS", label: "IN_PROGRESS" },
              { value: "COMPLETED", label: "COMPLETED" },
            ]}
            required
          />
          <Button type="submit" style={{ width: "100%", marginTop: "20px" }} disabled={saving}>
            {saving ? "Updating Site..." : "Update Site Details"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default EditSite;
