import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../../services/user.service";
import siteService from "../../services/site.service";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Select2 from "../../components/common/Select2";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import { MapPin, CheckSquare, Square, X, Phone } from "lucide-react";

const AddUser = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "SURVEY_PERSON" });
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [selectedSiteIds, setSelectedSiteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isSubAdmin = user?.role === "SUB_ADMIN";

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await siteService.getSites();
        const siteList = res.data?.data?.sites || res.data?.sites || [];
        setSites(siteList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Site Selection via Dropdown
  const handleDropdownSiteSelect = (siteId) => {
    setSelectedSiteId(siteId);
    if (siteId && !selectedSiteIds.includes(siteId)) {
      setSelectedSiteIds((prev) => [...prev, siteId]);
    }
  };

  const toggleSiteSelection = (siteId) => {
    setSelectedSiteIds((prev) =>
      prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]
    );
  };

  const handleRemoveSite = (siteId) => {
    setSelectedSiteIds((prev) => prev.filter((id) => id !== siteId));
    if (selectedSiteId === siteId) {
      setSelectedSiteId("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
        password: form.password ? form.password.trim() : "",
        role: isSubAdmin ? "SURVEY_PERSON" : form.role,
        siteIds: [...new Set(selectedSiteIds)]
      };
      await userService.createUser(payload);
      navigate("/users");
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        setError(apiErrors.map((e) => e.message || `${e.field} is invalid`).join(" | "));
      } else {
        setError(err.response?.data?.message || "Failed to create user");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  const siteOptions = sites.map((st) => ({
    value: st.id,
    label: `[${st.siteId || 'BSC'}] ${st.name} (${st.address})`
  }));

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Create New User & Map Site ID</h2>
        <Button variant="secondary" onClick={() => navigate("/users")}>Back to Users</Button>
      </div>

      {error && <p style={{ color: "var(--danger)", marginBottom: "16px" }}>{error}</p>}
      
      <Card>
        <form onSubmit={handleSubmit}>
          <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Rahul Sharma" />
          <Input label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="e.g. rahul@blusmart.com" />
          
          {/* Mobile Number Field */}
          <Input
            label="Mobile Number / Phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="e.g. 9876543210 (Used as default password if blank)"
          />

          {/* Optional Password Field (Defaults to Mobile Number if blank) */}
          <Input
            label="Password (Optional - Defaults to Mobile Number if left blank)"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Leave blank to use Mobile Number as password"
          />
          
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
            <label className="form-label" style={{ fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <MapPin size={16} style={{ color: "var(--primary)" }} />
              <span>Or Select Multiple Sites from List:</span>
            </label>

            {sites.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No survey sites available in system.</p>
            ) : (
              <div style={{
                maxHeight: "180px",
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
            {saving ? "Creating User..." : "🚀 Create User & Save Site Mapping"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AddUser;
