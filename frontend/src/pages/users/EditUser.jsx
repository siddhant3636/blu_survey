import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import userService from "../../services/user.service";
import siteService from "../../services/site.service";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Select2 from "../../components/common/Select2";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import { MapPin, CheckSquare, Square, X } from "lucide-react";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "SURVEY_PERSON", isActive: true });
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [selectedSiteIds, setSelectedSiteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isSubAdmin = user?.role === "SUB_ADMIN";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, sitesRes] = await Promise.all([
          userService.getUser(id),
          siteService.getSites(),
        ]);

        const uData = userRes.data?.data?.user || userRes.data?.user;
        const siteList = sitesRes.data?.data?.sites || sitesRes.data?.sites || [];

        if (isSubAdmin && uData.role !== "SURVEY_PERSON") {
          setError("Access denied. Sub Admins can only view/edit Survey Persons.");
          setLoading(false);
          return;
        }

        setForm({
          name: uData.name || "",
          email: uData.email || "",
          phone: uData.phone || "",
          role: uData.role || "SURVEY_PERSON",
          isActive: uData.isActive ?? true,
        });

        setSites(siteList);

        // Pre-select existing assigned sites
        if (uData.assignedSites && Array.isArray(uData.assignedSites)) {
          setSelectedSiteIds(uData.assignedSites.map((s) => s.id));
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isSubAdmin]);

  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleDropdownSiteSelect = (siteId) => {
    setSelectedSiteId(siteId);
    if (siteId && !selectedSiteIds.includes(siteId)) {
      setSelectedSiteIds((prev) => [...prev, siteId]);
    }
  };

  const toggleSiteSelection = (siteId) => {
    setSelectedSiteIds((prev) =>
      prev.includes(siteId) ? prev.filter((sId) => sId !== siteId) : [...prev, siteId]
    );
  };

  const handleRemoveSite = (siteId) => {
    setSelectedSiteIds((prev) => prev.filter((sId) => sId !== siteId));
    if (selectedSiteId === siteId) {
      setSelectedSiteId("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const nameTrimmed = form.name ? form.name.trim() : "";
    if (!nameTrimmed) {
      setError("Full Name is required and cannot be blank.");
      return;
    }
    if (nameTrimmed.length < 2) {
      setError("Full Name must be at least 2 characters long.");
      return;
    }
    if (/^\d+$/.test(nameTrimmed)) {
      setError("Full Name cannot contain only numeric characters.");
      return;
    }

    const emailTrimmed = form.email ? form.email.trim().toLowerCase() : "";
    if (!emailTrimmed) {
      setError("Email Address is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.phone && form.phone.trim()) {
      const cleanedPhone = form.phone.trim().replace(/[\s-]/g, "");
      if (!/^(\+91)?[6-9]\d{9}$/.test(cleanedPhone)) {
        setError("Mobile Number must be a valid 10-digit Indian phone number.");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = { 
        name: nameTrimmed,
        email: emailTrimmed,
        phone: form.phone ? form.phone.trim() : "",
        role: isSubAdmin ? "SURVEY_PERSON" : form.role,
        isActive: form.isActive,
        siteIds: [...new Set(selectedSiteIds)]
      };

      await userService.updateUser(id, payload);
      setSuccessMsg("✅ User and site mapping updated successfully!");
      setTimeout(() => {
        navigate("/users");
      }, 1000);
    } catch (err) {
      console.error(err);
      const apiErrors = err.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        setError(apiErrors.map((e) => e.message || `${e.field} is invalid`).join(" | "));
      } else {
        setError(err.response?.data?.message || "Failed to update user & site mapping");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (error && isSubAdmin && form.role !== "SURVEY_PERSON") {
    return (
      <div style={{ maxWidth: "500px", margin: "40px auto", textAlign: "center" }}>
        <p style={{ color: "var(--danger)", fontSize: "16px", fontWeight: "600" }}>{error}</p>
        <Button variant="secondary" onClick={() => navigate("/users")} style={{ marginTop: "16px" }}>Back to Users</Button>
      </div>
    );
  }

  const siteOptions = sites.map((st) => ({
    value: st.id,
    label: `[${st.siteId || 'BSC'}] ${st.name} (${st.address})`
  }));

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Edit System User & Mapped Sites</h2>
        <Button variant="secondary" onClick={() => navigate("/users")}>Back to Users</Button>
      </div>

      {error && <p style={{ color: "var(--danger)", marginBottom: "16px" }}>{error}</p>}
      {successMsg && <p style={{ color: "#10b981", fontWeight: "600", marginBottom: "16px" }}>{successMsg}</p>}

      <Card>
        <form onSubmit={handleSubmit}>
          <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} required />
          <Input label="Mobile Number / Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="e.g. 9876543210" />
          
          <Select
            label="User Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            disabled={isSubAdmin}
            options={
              isSubAdmin
                ? [{ value: "SURVEY_PERSON", label: "Survey Person" }]
                : [
                    { value: "ADMIN", label: "Admin" },
                    { value: "SUB_ADMIN", label: "Sub Admin" },
                    { value: "SURVEY_PERSON", label: "Survey Person" },
                  ]
            }
          />

          <div className="form-group" style={{ display: "flex", gap: "10px", alignItems: "center", margin: "16px 0" }}>
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} id="chk-active" />
            <label htmlFor="chk-active" style={{ fontSize: "14px", cursor: "pointer" }}>Account Active</label>
          </div>

          {/* 📍 Select Site ID Dropdown Field */}
          <div style={{ marginTop: "20px", marginBottom: "16px" }}>
            <Select2
              label="Select Site (Site ID Mapping)"
              value={selectedSiteId}
              onChange={(e) => handleDropdownSiteSelect(e.target.value)}
              options={siteOptions}
              placeholder="Search / Select Site ID (e.g. [BSC001] Connaught Place Hub 1)..."
            />
          </div>

          {/* Mapped Site Badges */}
          {selectedSiteIds.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                Mapped Site IDs ({selectedSiteIds.length}):
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {selectedSiteIds.map((sId) => {
                  const siteObj = sites.find((s) => s.id === sId);
                  const code = siteObj?.siteId || `BSC-${sId.slice(0, 4).toUpperCase()}`;
                  return (
                    <span
                      key={sId}
                      style={{
                        backgroundColor: "rgba(99, 102, 241, 0.15)",
                        color: "#818cf8",
                        border: "1px solid rgba(99, 102, 241, 0.4)",
                        borderRadius: "16px",
                        padding: "4px 10px",
                        fontSize: "12px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <MapPin size={12} />
                      <span>[{code}] {siteObj?.name}</span>
                      <X
                        size={14}
                        style={{ cursor: "pointer", opacity: 0.8 }}
                        onClick={() => handleRemoveSite(sId)}
                      />
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Multi-Site Selection List */}
          <div style={{ marginBottom: "20px" }}>
            <label className="form-label" style={{ fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <MapPin size={16} style={{ color: "var(--primary)" }} />
              <span>Map Assigned Survey Sites (Select 1 or Multiple)</span>
            </label>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px" }}>
              Select site IDs mapped with this user for survey data collection:
            </p>

            {sites.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No survey sites available in system.</p>
            ) : (
              <div style={{
                maxHeight: "220px",
                overflowY: "auto",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "8px",
                backgroundColor: "rgba(255,255,255,0.02)",
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }}>
                {sites.map((site) => {
                  const isSelected = selectedSiteIds.includes(site.id);
                  const displayCode = site.siteId || `BSC-${site.id.slice(0, 4).toUpperCase()}`;
                  return (
                    <div
                      key={site.id}
                      onClick={() => toggleSiteSelection(site.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        backgroundColor: isSelected ? "rgba(99, 102, 241, 0.12)" : "transparent",
                        border: isSelected ? "1px solid rgba(99, 102, 241, 0.4)" : "1px solid transparent",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {isSelected ? (
                        <CheckSquare size={18} style={{ color: "#6366f1" }} />
                      ) : (
                        <Square size={18} style={{ color: "var(--text-secondary)" }} />
                      )}
                      <div>
                        <span style={{ fontWeight: "700", fontSize: "13px", color: isSelected ? "#818cf8" : "var(--text-primary)" }}>
                          [{displayCode}] {site.name}
                        </span>
                        <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "1px" }}>
                          {site.address}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Button type="submit" style={{ width: "100%", marginTop: "12px" }} disabled={saving}>
            {saving ? "Updating User & Mapping..." : "Update User & Site Mapping"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default EditUser;
