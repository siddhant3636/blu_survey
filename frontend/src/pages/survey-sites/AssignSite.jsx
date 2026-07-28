import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import siteService from "../../services/site.service";
import userService from "../../services/user.service";
import RegexSearchSelect from "../../components/common/RegexSearchSelect";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import { Search, X } from "lucide-react";

const AssignSite = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [surveyors, setSurveyors] = useState([]);
  const [surveyorSearchQuery, setSurveyorSearchQuery] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [selectedSurveyorIds, setSelectedSurveyorIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        const [sitesRes, usersRes] = await Promise.all([
          siteService.getSites(),
          userService.getUsers(),
        ]);
        setSites(sitesRes.data.sites.filter((s) => s.status !== "COMPLETED"));
        setSurveyors(
          usersRes.data.users.filter(
            (u) => u.role === "SURVEY_PERSON" || u.role === "SURVEYOR"
          )
        );
      } catch (err) {
        setError("Failed to load sites and surveyors list");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSurveyorToggle = (id) => {
    setSelectedSurveyorIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSiteId) {
      setError("Please select a survey site.");
      return;
    }
    if (selectedSurveyorIds.length === 0) {
      setError("Please select at least one Survey Person to assign.");
      return;
    }

    try {
      await siteService.createAssignment({
        surveySiteId: selectedSiteId,
        surveyorIds: selectedSurveyorIds,
      });
      navigate("/survey-sites");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign site");
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ maxWidth: "550px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px" }}>Assign Survey Site (Multi-User)</h2>
      {error && (
        <div style={{
          padding: "12px",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          border: "1px solid var(--danger)",
          borderRadius: "var(--border-radius)",
          color: "var(--danger)",
          marginBottom: "16px",
          fontSize: "14px",
        }}>
          {error}
        </div>
      )}
      <Card>
        <form onSubmit={handleSubmit}>
          <RegexSearchSelect
            label="Select Candidate Survey Site"
            name="surveySiteId"
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            options={sites.map((s) => ({
              value: s.id,
              label: s.siteId ? `${s.name} (${s.siteId})` : s.name,
              siteId: s.siteId,
              concessionaire: s.concessionaire
            }))}
            required
          />

          <div style={{ margin: "20px 0" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
              Assign Survey Persons (Select One or Multiple)
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

          <Button type="submit" style={{ width: "100%", marginTop: "12px" }}>
            Assign Site to {selectedSurveyorIds.length} Survey Person(s)
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AssignSite;
