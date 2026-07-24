import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import siteService from "../../services/site.service";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import GPS from "../../components/common/GPS";

const AddSite = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    siteId: "",
    name: "",
    concessionaire: "",
    landOwningAgency: "",
    address: "",
    latitude: "",
    longitude: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCoordinatesFetched = (coords) => {
    setForm((prev) => ({
      ...prev,
      latitude: coords.latitude,
      longitude: coords.longitude,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await siteService.createSite({
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      });
      navigate("/survey-sites");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create site");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px" }}>Create Survey Site</h2>
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      <Card style={{ marginBottom: "20px" }}>
        <form onSubmit={handleSubmit}>
          <Input label="Site ID (Optional - Auto generated as BSC... if empty)" name="siteId" value={form.siteId} onChange={handleChange} placeholder="e.g. BSC004" />
          <Input label="Site Name" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Connaught Place Hub" />
          <Input label="Concessionaire" name="concessionaire" value={form.concessionaire} onChange={handleChange} placeholder="e.g. BluSmart Mobility" />
          <Input label="Land Owning Agency" name="landOwningAgency" value={form.landOwningAgency} onChange={handleChange} placeholder="e.g. NDMC / DDA" />
          <Input label="Full Address" name="address" value={form.address} onChange={handleChange} required placeholder="Full site address" />
          <Input label="Latitude" name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} />
          <Input label="Longitude" name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} />
          <Button type="submit" style={{ width: "100%", marginTop: "12px" }}>Save Site</Button>
        </form>
      </Card>
      <GPS onCoordinatesFetched={handleCoordinatesFetched} />
    </div>
  );
};

export default AddSite;
