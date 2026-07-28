import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import siteService from "../../services/site.service";
import userService from "../../services/user.service";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import { Search, X } from "lucide-react";

const EditSite = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    concessionaire: "",
    landOwningAgency: "",
    address: "",
    status: "PENDING",
  });
  const [siteIdDisplay, setSiteIdDisplay] = useState("");
  const [surveyors, setSurveyors] = useState([]);
  const [surveyorSearchQuery, setSurveyorSearchQuery] = useState("");
  const [selectedSurveyorIds, setSelectedSurveyorIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const role = user?.role;
  const canEditDetails = role === "ADMIN" || role === "SUB_ADMIN";

  const filteredSurveyors = surveyors.filter((s) => {
    if (!surveyorSearchQuery) return true;
    try {
      const regex = new RegExp(surveyorSearchQuery, "i");
      return regex.test(s.name) || regex.test(s.email);
    } catch (err) {
      const q = surveyorSearchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteRes, usersRes] = await Promise.all([
          siteService.getSite(id),
          userService.getUsers(),
        ]);
        const siteData = siteRes.data?.data?.site || siteRes.data?.site;
        const userList = usersRes.data?.data?.users || usersRes.data?.users || [];
        
        if (siteData) {
          setForm({
            name: siteData.name || "",
            concessionaire: siteData.concessionaire || "",
            landOwningAgency: siteData.landOwningAgency || "",
            address: siteData.address || "",
            status: siteData.status || "PENDING",
          });
          setSiteIdDisplay(siteData.siteId || "");
          
          const initialSurveyorIds = (siteData.assignments || [])
            .filter((a) => !a.isDeleted)
            .map((a) => a.surveyorId);
          setSelectedSurveyorIds(initialSurveyorIds);
        }

        setSurveyors(
          userList.filter(
            (u) => u.role === "SURVEY_PERSON" || u.role === "SURVEYOR"
          )
        );
      } catch (err) {
        console.error(err);
        setError("Failed to fetch site and surveyor data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSurveyorToggle = (sId) => {
    setSelectedSurveyorIds((prev) =>
      prev.includes(sId) ? prev.filter((id) => id !== sId) : [...prev, sId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name,
        concessionaire: form.concessionaire,
        landOwningAgency: form.landOwningAgency,
        address: form.address,
        status: form.status,
        surveyorIds: selectedSurveyorIds,
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
      <div className="responsive-header-bar">
        <h2>Edit Survey Site</h2>
        <Button variant="secondary" onClick={() => navigate("/survey-sites")}>Back to Sites List</Button>
      </div>

      {error && <p style={{ color: "var(--danger)", marginBottom: "16px" }}>{error}</p>}

      <Card>
        <form onSubmit={handleSubmit}>
          {siteIdDisplay && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>
                Site ID (System Generated)
              </label>
              <div style={{
                padding: "12px 16px",
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--border-radius)",
                color: "var(--text-primary)",
                fontWeight: "600",
                fontSize: "14px"
              }}>
                {siteIdDisplay}
              </div>
            </div>
          )}

          {canEditDetails && (
            <>
              <Input label="Site Name *" name="name" value={form.name} onChange={handleChange} required placeholder="Site Name" />
              <Input label="Concessionaire" name="concessionaire" value={form.concessionaire} onChange={handleChange} placeholder="Concessionaire name" />
              <Input label="Land Owning Agency" name="landOwningAgency" value={form.landOwningAgency} onChange={handleChange} placeholder="Land owning agency" />
              <Input label="Full Address *" name="address" value={form.address} onChange={handleChange} required placeholder="Site address" />
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

          {canEditDetails && (
            <div style={{ margin: "20px 0" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
                Assign Field Surveyor(s) (Select One or Multiple)
              </label>
              {surveyors.length > 0 && (
                <div style={{ position: "relative", marginBottom: "10px" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
                    <Search size={16} style={{ opacity: 0.5 }} />
                  </span>
                  <input
                    type="text"
                    value={surveyorSearchQuery}
                    onChange={(e) => setSurveyorSearchQuery(e.target.value)}
                    placeholder="Search surveyors (regex supported)..."
                    className="form-control"
                    style={{ paddingLeft: "36px", paddingRight: "36px" }}
                  />
                  {surveyorSearchQuery && (
                    <span
                      onClick={() => setSurveyorSearchQuery("")}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        color: "var(--text-secondary)",
                        opacity: 0.6
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
                    >
                      <X size={16} />
                    </span>
                  )}
                </div>
              )}
              {surveyors.length === 0 ? (
                <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>No active Survey Persons found in system.</p>
              ) : (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--border-radius)",
                  padding: "12px",
                }}>
                  {filteredSurveyors.length === 0 ? (
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", textAlign: "center", padding: "10px" }}>
                      No matching surveyors found.
                    </p>
                  ) : (
                    filteredSurveyors.map((s) => (
                      <label key={s.id} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px" }}>
                        <input
                          type="checkbox"
                          checked={selectedSurveyorIds.includes(s.id)}
                          onChange={() => handleSurveyorToggle(s.id)}
                        />
                        <span><strong>{s.name}</strong> ({s.email})</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          <Button type="submit" style={{ width: "100%", marginTop: "20px" }} disabled={saving}>
            {saving ? "Updating Site..." : "Update Site Details"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default EditSite;
