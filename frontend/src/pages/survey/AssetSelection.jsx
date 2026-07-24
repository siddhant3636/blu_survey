import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import surveyService from "../../services/survey.service";
import { useAuth } from "../../hooks/useAuth";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";

const AssetSelection = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Collapsible state for asset groups (default closed)
  const [expandedGroups, setExpandedGroups] = useState({
    charger: false,
    panel: false,
    transformer: false,
    dg: false,
  });

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const fetchSurveyDetails = async () => {
    try {
      const res = await surveyService.getSurvey(surveyId);
      const sData = res.data?.data?.survey || res.data?.survey;
      setSurvey(sData);
    } catch (err) {
      setError("Failed to load survey details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveyDetails();
  }, [surveyId]);

  const handleOpenAsset = (assetType, asset) => {
    navigate(`/survey/${assetType}s/${surveyId}?assetId=${asset.id}`);
  };

  if (loading) return <Loader />;
  if (!survey) return <p>Survey record not found.</p>;

  // Calculate Progress Stats
  const chargers = survey.chargers || [];
  const panels = survey.panels || [];
  const transformers = survey.transformers || [];
  const dgs = survey.dgs || [];

  const totalAssets = chargers.length + panels.length + transformers.length + dgs.length;
  const completedChargers = chargers.filter((c) => c.status === "COMPLETED").length;
  const completedPanels = panels.filter((p) => p.status === "COMPLETED").length;
  const completedTransformers = transformers.filter((t) => t.status === "COMPLETED").length;
  const completedDGs = dgs.filter((d) => d.status === "COMPLETED").length;

  const totalCompleted = completedChargers + completedPanels + completedTransformers + completedDGs;
  const overallProgressPercent = totalAssets > 0 ? Math.round((totalCompleted / totalAssets) * 100) : 0;

  const renderProgressCard = (title, icon, total, completed) => {
    const pending = total - completed;
    return (
      <Card key={title} style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h4 style={{ fontSize: "14px", fontWeight: "700" }}>{icon} {title}</h4>
          <span style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary)" }}>{total}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)" }}>
          <span style={{ color: "#10b981", fontWeight: "600" }}>✓ Completed: {completed}</span>
          <span style={{ color: "#ef4444", fontWeight: "600" }}>⌛ Pending: {pending}</span>
        </div>
      </Card>
    );
  };

  const renderAssetGroup = (title, icon, assetType, items) => {
    const isExpanded = expandedGroups[assetType];
    const completedCount = items.filter((i) => i.status === "COMPLETED").length;

    return (
      <Card key={assetType} style={{ marginBottom: "16px" }}>
        <div
          onClick={() => toggleGroup(assetType)}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none",
            paddingBottom: isExpanded ? "12px" : "0",
            borderBottom: isExpanded ? "1px solid var(--border-color)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {isExpanded ? (
              <ChevronDown size={20} style={{ color: "var(--primary)" }} />
            ) : (
              <ChevronRight size={20} style={{ color: "var(--text-secondary)" }} />
            )}
            <h3 style={{ fontSize: "16px", fontWeight: "700" }}>
              {icon} {title} ({items.length})
            </h3>
          </div>

          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>
            {completedCount} / {items.length} Completed
          </span>
        </div>

        {isExpanded && (
          <div style={{ marginTop: "14px" }}>
            {items.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No assets configured in Step 1.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {items.map((asset) => {
                  return (
                    <div
                      key={asset.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        borderRadius: "var(--border-radius)",
                        border: "1px solid var(--border-color)",
                        backgroundColor: "var(--card-bg)",
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: "14px", fontWeight: "600" }}>
                          {assetType.toUpperCase()} #{asset.assetIndex} {asset.name ? `- ${asset.name}` : ""}
                        </h4>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <StatusBadge status={asset.status} />
                        <Button
                          size="small"
                          variant={asset.status === "COMPLETED" ? "secondary" : "primary"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAsset(assetType, asset);
                          }}
                        >
                          {asset.status === "COMPLETED" ? "View / Edit" : "Open Form"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div style={{ maxWidth: "750px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Survey Dashboard & Asset List</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Station: <strong>{survey.surveySite?.name}</strong>. Choose any asset to view and complete details.
          </p>
        </div>
        <Button variant="secondary" onClick={fetchSurveyDetails}>🔄 Refresh Real-Time Matrix</Button>
      </div>

      {/* INCOMPLETE ASSETS WARNING BANNER */}
      {error && (
        <div style={{ padding: "14px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", borderRadius: "8px", color: "var(--danger)", marginBottom: "20px" }}>
          <p style={{ fontWeight: "700", fontSize: "14px", marginBottom: "4px" }}>⚠️ Survey Incomplete</p>
          <p style={{ fontSize: "13px" }}>{error}</p>
        </div>
      )}

      {/* OVERALL PROGRESS BAR */}
      <Card style={{ marginBottom: "20px", padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: "700" }}>Overall Survey Completion</span>
          <span style={{ fontSize: "16px", fontWeight: "800", color: "var(--primary)" }}>{overallProgressPercent}%</span>
        </div>
        <div style={{ height: "10px", width: "100%", backgroundColor: "var(--border-color)", borderRadius: "5px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${overallProgressPercent}%`, backgroundColor: overallProgressPercent === 100 ? "#10b981" : "var(--primary)", transition: "width 0.4s ease" }} />
        </div>
      </Card>

      {/* PROGRESS BREAKDOWN CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {renderProgressCard("Chargers", "🔋", chargers.length, completedChargers)}
        {renderProgressCard("Panels", "⚡", panels.length, completedPanels)}
        {renderProgressCard("Transformers", "🔌", transformers.length, completedTransformers)}
        {renderProgressCard("DG Sets", "⚙️", dgs.length, completedDGs)}
      </div>

      {/* ASSET SELECTION GROUPS */}
      {renderAssetGroup("EV Chargers", "🔋", "charger", chargers)}
      {renderAssetGroup("Electrical Panels", "⚡", "panel", panels)}
      {renderAssetGroup("Distribution Transformers", "🔌", "transformer", transformers)}
      {renderAssetGroup("Diesel Generators (DG)", "⚙️", "dg", dgs)}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <Button
          onClick={() => {
            const incompleteChargers = chargers.filter((c) => c.status !== "COMPLETED");
            const incompletePanels = panels.filter((p) => p.status !== "COMPLETED");
            const incompleteTransformers = transformers.filter((t) => t.status !== "COMPLETED");
            const incompleteDGs = dgs.filter((d) => d.status !== "COMPLETED");

            const totalIncomplete = incompleteChargers.length + incompletePanels.length + incompleteTransformers.length + incompleteDGs.length;

            if (totalIncomplete > 0) {
              let firstIncomplete = null;
              let typeName = "";
              if (incompleteChargers.length > 0) {
                firstIncomplete = incompleteChargers[0];
                typeName = `Charger #${firstIncomplete.assetIndex}`;
                setExpandedGroups((prev) => ({ ...prev, charger: true }));
              } else if (incompletePanels.length > 0) {
                firstIncomplete = incompletePanels[0];
                typeName = `Panel #${firstIncomplete.assetIndex}`;
                setExpandedGroups((prev) => ({ ...prev, panel: true }));
              } else if (incompleteTransformers.length > 0) {
                firstIncomplete = incompleteTransformers[0];
                typeName = `Transformer #${firstIncomplete.assetIndex}`;
                setExpandedGroups((prev) => ({ ...prev, transformer: true }));
              } else if (incompleteDGs.length > 0) {
                firstIncomplete = incompleteDGs[0];
                typeName = `DG #${firstIncomplete.assetIndex}`;
                setExpandedGroups((prev) => ({ ...prev, dg: true }));
              }

              setError(`Please complete all required asset forms before submitting the survey. ${totalIncomplete} ${totalIncomplete === 1 ? "asset requires" : "assets require"} attention (${typeName} is incomplete).`);
              window.scrollTo({ top: 0, behavior: "smooth" });
              return;
            }

            navigate(`/survey/review/${surveyId}`);
          }}
        >
          Final Preview →
        </Button>
      </div>
    </div>
  );
};

export default AssetSelection;
