import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import surveyService from "../../services/survey.service";
import { useAuth } from "../../hooks/useAuth";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";
import { ChevronDown, ChevronRight, CheckCircle2, AlertTriangle, Edit3, Image as ImageIcon, MapPin } from "lucide-react";

const FinalReview = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Confirmation Modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Auditor / Admin status update state
  const [reviewStatus, setReviewStatus] = useState("UNDER_REVIEW");
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [auditMsg, setAuditMsg] = useState("");

  // Accordion Expand/Collapse States
  const [expandedSections, setExpandedSections] = useState({
    siteInfo: true,
    chargers: true,
    panels: true,
    transformers: true,
    dgs: true,
  });

  const [expandedItems, setExpandedItems] = useState({});

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const toggleItem = (itemKey) => {
    setExpandedItems((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  const isAuditor = user?.role === "SUB_ADMIN" || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" || user?.role === "MANAGER";

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      const res = await surveyService.getSurvey(surveyId);
      const sData = res.data?.data?.survey || res.data?.survey;
      setSurvey(sData);
      setReviewStatus(sData?.status || "UNDER_REVIEW");
      setReviewRemarks(sData?.reviewRemarks || "");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load survey details for final review");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurvey();
  }, [surveyId]);

  // Lock background scroll when confirmation modal is active
  useEffect(() => {
    if (showSubmitModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSubmitModal]);

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await surveyService.submitSurvey(surveyId);
      setShowSubmitModal(false);
      alert("🎉 Survey submitted successfully! It is now available for Admin / Super Admin review.");
      navigate(isAuditor ? "/forms" : "/dashboard");
    } catch (err) {
      setShowSubmitModal(false);
      setError(err.response?.data?.message || "Failed to submit survey");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuditorSubmit = async (e) => {
    e.preventDefault();
    setAuditMsg("");
    try {
      await surveyService.updateSurvey(surveyId, { status: reviewStatus, remarks: reviewRemarks });
      setAuditMsg(`Survey status updated to ${reviewStatus} successfully!`);
      fetchSurvey();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update survey review status");
    }
  };

  if (loading) return <Loader size="large" />;
  if (error && !survey) return (
    <div style={{ maxWidth: "600px", margin: "40px auto", textAlign: "center" }}>
      <p style={{ color: "var(--danger)", marginBottom: "16px" }}>{error}</p>
      <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
    </div>
  );
  if (!survey) return <p style={{ padding: "40px", textAlign: "center" }}>Survey record not found.</p>;

  // Calculations
  const site = survey.surveySite || {};
  const chargers = survey.chargers || [];
  const panels = survey.panels || [];
  const transformers = survey.transformers || [];
  const dgs = survey.dgs || [];
  const photos = survey.photos || [];

  const totalAssets = chargers.length + panels.length + transformers.length + dgs.length;
  const completedChargers = chargers.filter((c) => c.status === "COMPLETED");
  const completedPanels = panels.filter((p) => p.status === "COMPLETED");
  const completedTransformers = transformers.filter((t) => t.status === "COMPLETED");
  const completedDGs = dgs.filter((d) => d.status === "COMPLETED");

  const completedAssetsCount = completedChargers.length + completedPanels.length + completedTransformers.length + completedDGs.length;
  const incompleteAssetsCount = totalAssets - completedAssetsCount;
  const isFullyComplete = incompleteAssetsCount === 0;

  // Photo matching helper per asset
  const getAssetPhotos = (assetTypeTitle, assetIndex) => {
    const expectedPrefix = `${assetTypeTitle} #${assetIndex}`.toLowerCase();
    const fallbackPrefix = `${assetTypeTitle}`.toLowerCase();
    return photos.filter((p) => {
      const catName = (p.category?.name || "").toLowerCase();
      return catName.includes(expectedPrefix) || (assetIndex === 1 && catName.includes(fallbackPrefix));
    });
  };

  let envApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
  if (
    typeof window !== "undefined" &&
    window.location &&
    !window.location.hostname.includes("localhost") &&
    !window.location.hostname.includes("127.0.0.1") &&
    envApiUrl.includes("localhost")
  ) {
    envApiUrl = window.location.origin + "/api/v1";
  }
  const apiBaseHost = envApiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");

  const getFullImageUrl = (photo) => {
    if (!photo) return "";
    let rawPath = photo.url || photo.filePath || "";
    if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
      return rawPath;
    }
    if (!rawPath.startsWith("/")) {
      rawPath = `/${rawPath}`;
    }
    return `${apiBaseHost}${rawPath}`;
  };

  const renderPhotosGrid = (assetPhotos) => {
    if (assetPhotos.length === 0) {
      return <p style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>No photos attached</p>;
    }
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "8px", marginTop: "8px" }}>
        {assetPhotos.map((p) => {
          const imageUrl = getFullImageUrl(p);
          return (
            <div key={p.id} style={{ borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border-color)", aspectRatio: "4/3", position: "relative", backgroundColor: "#000" }}>
              <a href={imageUrl} target="_blank" rel="noreferrer">
                <img src={imageUrl} alt={p.category?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </a>
              <span style={{ position: "absolute", bottom: "2px", left: "2px", backgroundColor: "rgba(0,0,0,0.7)", color: "#fff", fontSize: "9px", padding: "1px 4px", borderRadius: "3px" }}>
                {p.category?.name?.split("-")?.pop()?.trim() || "Photo"}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Final Survey Review & Submission</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Station: <strong>{site.name}</strong> ({site.address})
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate(`/survey/assets/${surveyId}`)}>
          Back to Matrix
        </Button>
      </div>

      {error && (
        <div style={{ padding: "12px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", borderRadius: "8px", color: "var(--danger)", fontSize: "14px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* OVERALL READINESS CARD */}
      <Card style={{ border: isFullyComplete ? "1px solid #10b981" : "1px solid var(--danger)", backgroundColor: isFullyComplete ? "rgba(16, 185, 129, 0.03)" : "rgba(239, 68, 68, 0.03)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              {isFullyComplete ? <CheckCircle2 size={20} style={{ color: "#10b981" }} /> : <AlertTriangle size={20} style={{ color: "var(--danger)" }} />}
              <h3 style={{ fontSize: "16px", fontWeight: "700" }}>
                Status: {survey.status === "SUBMITTED" ? "Submitted" : isFullyComplete ? "Ready for Submission" : "Incomplete Assets"}
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Total Configured Assets: <strong>{totalAssets}</strong> | Completed: <strong style={{ color: "#10b981" }}>{completedAssetsCount}</strong> | Incomplete: <strong style={{ color: incompleteAssetsCount > 0 ? "var(--danger)" : "inherit" }}>{incompleteAssetsCount}</strong>
            </p>
          </div>

          <StatusBadge status={survey.status} />
        </div>

        {!isFullyComplete && (
          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "var(--danger)", fontWeight: "600" }}>
              ⚠️ Please complete all required asset forms before submitting the survey. ({incompleteAssetsCount} asset{incompleteAssetsCount > 1 ? "s" : ""} require attention).
            </span>
            <Button size="small" variant="secondary" onClick={() => navigate(`/survey/assets/${surveyId}`)}>
              Go to Incomplete Form
            </Button>
          </div>
        )}
      </Card>

      {/* ================================================== */}
      {/* SECTION 1: SITE INFORMATION (COLLAPSIBLE) */}
      {/* ================================================== */}
      <Card style={{ padding: "0", overflow: "hidden" }}>
        <div
          onClick={() => toggleSection("siteInfo")}
          style={{
            padding: "16px",
            backgroundColor: "rgba(255,255,255,0.02)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            userSelect: "none"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {expandedSections.siteInfo ? <ChevronDown size={18} style={{ color: "var(--primary)" }} /> : <ChevronRight size={18} />}
            <h3 style={{ fontSize: "15px", fontWeight: "700" }}>📍 Section 1: Site Information</h3>
          </div>
          <Button
            size="small"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/survey/step1/${survey.surveySiteId}`);
            }}
            style={{ fontSize: "12px", padding: "4px 10px" }}
          >
            <Edit3 size={12} /> Edit Site Info
          </Button>
        </div>

        {expandedSections.siteInfo && (
          <div style={{ padding: "16px", borderTop: "1px solid var(--border-color)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", fontSize: "13px" }}>
            <div><span style={{ color: "var(--text-secondary)" }}>Station Name:</span> <strong>{site.name}</strong></div>
            <div><span style={{ color: "var(--text-secondary)" }}>Address:</span> <strong>{site.address}</strong></div>
            <div><span style={{ color: "var(--text-secondary)" }}>Survey Date:</span> <strong>{survey.surveyDate || "N/A"}</strong></div>
            <div><span style={{ color: "var(--text-secondary)" }}>Survey Time:</span> <strong>{survey.surveyTime || "N/A"}</strong></div>
            <div><span style={{ color: "var(--text-secondary)" }}>Building / Landmark:</span> <strong>{survey.buildingName || "N/A"}</strong></div>
            <div><span style={{ color: "var(--text-secondary)" }}>Operator:</span> <strong>{survey.operator || "N/A"}</strong></div>
            <div><span style={{ color: "var(--text-secondary)" }}>City / Pincode:</span> <strong>{survey.city ? `${survey.city} - ${survey.pincode || ''}` : "N/A"}</strong></div>
            <div><span style={{ color: "var(--text-secondary)" }}>GPS Coordinates:</span> <strong>{survey.latitude ? `${survey.latitude.toFixed(4)}, ${survey.longitude.toFixed(4)}` : "N/A"}</strong></div>
            <div><span style={{ color: "var(--text-secondary)" }}>Access Person:</span> <strong>{survey.accessPersonName ? `${survey.accessPersonName} (${survey.accessPersonMobile || ''})` : "N/A"}</strong></div>
            <div><span style={{ color: "var(--text-secondary)" }}>Parking Area:</span> <strong>{survey.parkingArea || "N/A"}</strong></div>
            <div><span style={{ color: "var(--text-secondary)" }}>Internet Availability:</span> <strong>{survey.internetAvailability || "N/A"}</strong></div>
            <div><span style={{ color: "var(--text-secondary)" }}>Total Counts:</span> <strong>Chargers: {chargers.length} | Panels: {panels.length} | Transformers: {transformers.length} | DG: {dgs.length}</strong></div>
            {survey.remarks && <div style={{ gridColumn: "1 / -1" }}><span style={{ color: "var(--text-secondary)" }}>Remarks:</span> <strong>{survey.remarks}</strong></div>}
          </div>
        )}
      </Card>

      {/* ================================================== */}
      {/* SECTION 2: CHARGERS (COLLAPSIBLE) */}
      {/* ================================================== */}
      <Card style={{ padding: "0", overflow: "hidden" }}>
        <div
          onClick={() => toggleSection("chargers")}
          style={{ padding: "16px", backgroundColor: "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", userSelect: "none" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {expandedSections.chargers ? <ChevronDown size={18} style={{ color: "var(--primary)" }} /> : <ChevronRight size={18} />}
            <h3 style={{ fontSize: "15px", fontWeight: "700" }}>🔋 Section 2: EV Chargers ({chargers.length})</h3>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            {completedChargers.length} / {chargers.length} Completed
          </span>
        </div>

        {expandedSections.chargers && (
          <div style={{ padding: "16px", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
            {chargers.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No chargers configured.</p>
            ) : (
              chargers.map((c) => {
                const itemKey = `charger_${c.id}`;
                const isExpanded = expandedItems[itemKey] !== false; // Default open
                const assetPhotos = getAssetPhotos("Charger", c.assetIndex);
                const isComplete = c.status === "COMPLETED";

                return (
                  <div key={c.id} style={{ borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", overflow: "hidden" }}>
                    <div
                      onClick={() => toggleItem(itemKey)}
                      style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", backgroundColor: "rgba(255,255,255,0.01)" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <strong style={{ fontSize: "14px" }}>Charger #{c.assetIndex}</strong>
                        {c.lockedByUser && (
                          <span style={{ fontSize: "11px", color: "#818cf8", fontWeight: "600", backgroundColor: "rgba(99, 102, 241, 0.12)", padding: "2px 8px", borderRadius: "4px" }}>
                            👤 Filled by: {c.lockedByUser.name}
                          </span>
                        )}
                        {isComplete ? <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "600", backgroundColor: "rgba(16,185,129,0.1)", padding: "2px 6px", borderRadius: "4px" }}>✓ Completed</span> : <span style={{ fontSize: "11px", color: "var(--danger)", fontWeight: "600", backgroundColor: "rgba(239,68,68,0.1)", padding: "2px 6px", borderRadius: "4px" }}>⚠️ Incomplete</span>}
                      </div>

                      <Button
                        size="small"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/survey/chargers/${surveyId}?assetId=${c.id}`);
                        }}
                        style={{ fontSize: "11px", padding: "3px 8px" }}
                      >
                        <Edit3 size={11} /> Edit Charger #{c.assetIndex}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border-color)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", fontSize: "12px" }}>
                        <div><span style={{ color: "var(--text-secondary)" }}>Manufacturer:</span> <strong>{c.manufacturer?.name || "N/A"}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>Model:</span> <strong>{c.model?.name || "N/A"}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>Connector:</span> <strong>{c.connector?.type || "N/A"}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>MCCB Maker:</span> <strong>{c.mccbMaker?.name || "N/A"}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>MCB Maker:</span> <strong>{c.mcbMaker?.name || "N/A"}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>Serial Number:</span> <strong>{c.serialNumber || "N/A"}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>Capacity:</span> <strong>{c.powerRating || "N/A"}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>Voltage:</span> <strong>{c.voltage || "N/A"}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>Breakers (MCCB / MCB):</span> <strong>{(() => {
                          const parts = [];
                          const formatField = (raw, label) => {
                            if (!raw) return;
                            try {
                              const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
                              if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                                if (Array.isArray(parsed.types)) {
                                  const validTypes = parsed.types.filter((t) => {
                                    if (t && typeof t === "object") return t.rating || t.brandId;
                                    return Boolean(t);
                                  });
                                  if (parsed.count > 0 && validTypes.length > 0) {
                                    const itemsText = validTypes.map((t, idx) => {
                                      if (t && typeof t === "object") {
                                        const brandStr = t.brandName ? ` (${t.brandName})` : "";
                                        return `#${idx + 1}: ${t.rating || "N/A"}${brandStr}`;
                                      }
                                      return `#${idx + 1}: ${t}`;
                                    }).join(", ");
                                    parts.push(`${label} (${parsed.count}): [${itemsText}]`);
                                  }
                                }
                                return;
                              } else if (Array.isArray(parsed) && parsed.length > 0) {
                                const itemsText = parsed.map((t, idx) => `#${idx + 1}: ${t}`).join(", ");
                                parts.push(`${label} (${parsed.length}): [${itemsText}]`);
                                return;
                              }
                            } catch (e) {}
                            if (typeof raw === "string" && raw.trim() !== "" && !raw.trim().startsWith("{")) {
                              parts.push(`${label}: ${raw}`);
                            }
                          };
                          formatField(c.mccb4p, "MCCB 4P");
                          formatField(c.mcb2p, "MCB 2P");
                          formatField(c.mcb4p, "MCB 4P");
                          return parts.length > 0 ? parts.join(" | ") : "None";
                        })()}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>Type & Speed:</span> <strong>{c.chargerType === c.chargerCategory ? c.chargerType : `${c.chargerType} (${c.chargerCategory || "N/A"})`}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>Operational Status:</span> <strong>{c.currentStatus || "N/A"}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>Earthing Status:</span> <strong>{c.earthingStatus || "N/A"}</strong></div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={12} /> GPS Coordinates:</span>
                          <strong>{c.latitude ? `${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}` : "No GPS Location Tagged"}</strong>
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}><ImageIcon size={12} /> Photos ({assetPhotos.length}):</span>
                          {renderPhotosGrid(assetPhotos)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </Card>

      {/* ================================================== */}
      {/* SECTION 3: ELECTRICAL PANELS (COLLAPSIBLE) */}
      {/* ================================================== */}
      <Card style={{ padding: "0", overflow: "hidden" }}>
        <div
          onClick={() => toggleSection("panels")}
          style={{ padding: "16px", backgroundColor: "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", userSelect: "none" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {expandedSections.panels ? <ChevronDown size={18} style={{ color: "var(--primary)" }} /> : <ChevronRight size={18} />}
            <h3 style={{ fontSize: "15px", fontWeight: "700" }}>⚡ Section 3: Electrical Panels ({panels.length})</h3>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            {completedPanels.length} / {panels.length} Completed
          </span>
        </div>

        {expandedSections.panels && (
          <div style={{ padding: "16px", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
            {panels.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No panels configured.</p>
            ) : (
              panels.map((p) => {
                const itemKey = `panel_${p.id}`;
                const isExpanded = expandedItems[itemKey] !== false;
                const assetPhotos = getAssetPhotos("Panel", p.assetIndex);
                const isComplete = p.status === "COMPLETED";

                return (
                  <div key={p.id} style={{ borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", overflow: "hidden" }}>
                    <div
                      onClick={() => toggleItem(itemKey)}
                      style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", backgroundColor: "rgba(255,255,255,0.01)" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <strong style={{ fontSize: "14px" }}>Panel #{p.assetIndex} - {p.name || `Panel Board #${p.assetIndex}`}</strong>
                        {p.lockedByUser && (
                          <span style={{ fontSize: "11px", color: "#818cf8", fontWeight: "600", backgroundColor: "rgba(99, 102, 241, 0.12)", padding: "2px 8px", borderRadius: "4px" }}>
                            👤 Filled by: {p.lockedByUser.name}
                          </span>
                        )}
                        {isComplete ? <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "600", backgroundColor: "rgba(16,185,129,0.1)", padding: "2px 6px", borderRadius: "4px" }}>✓ Completed</span> : <span style={{ fontSize: "11px", color: "var(--danger)", fontWeight: "600", backgroundColor: "rgba(239,68,68,0.1)", padding: "2px 6px", borderRadius: "4px" }}>⚠️ Incomplete</span>}
                      </div>

                      <Button
                        size="small"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/survey/panels/${surveyId}?assetId=${p.id}`);
                        }}
                        style={{ fontSize: "11px", padding: "3px 8px" }}
                      >
                        <Edit3 size={11} /> Edit Panel #{p.assetIndex}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border-color)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", fontSize: "12px" }}>
                        <div><span style={{ color: "var(--text-secondary)" }}>Panel Name / Tag:</span> <strong>{p.name || "N/A"}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>Capacity Rating:</span> <strong>{p.capacity || "N/A"}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>Incoming Source:</span> <strong>{p.incomingSource || "N/A"}</strong></div>
                        {p.breakerRating && p.breakerRating.startsWith("{") ? (
                          <div style={{ gridColumn: "1 / -1", backgroundColor: "rgba(255,255,255,0.01)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                            <span style={{ color: "var(--text-secondary)", fontWeight: "700" }}>Breaker Panels Checklist:</span>
                            {(() => {
                              try {
                                const parsed = JSON.parse(p.breakerRating);
                                const sectionLabels = {
                                  mainDistribution: "Main Distribution Charger Panel",
                                  fastSlow: "Fast + Slow Charger Panel",
                                  fast: "Fast Charger Panel",
                                  slow: "Slow Charger Panel"
                                };
                                return Object.keys(sectionLabels).map((secKey) => {
                                  const list = parsed[secKey] || [];
                                  if (list.length === 0) return null;
                                  return (
                                    <div key={secKey} style={{ marginTop: "10px" }}>
                                      <span style={{ color: "#6366f1", fontWeight: "600" }}>⚡ {sectionLabels[secKey]} ({list.length})</span>
                                      <div style={{ paddingLeft: "12px", marginTop: "6px", display: "flex", flexDirection: "column", gap: "6px" }}>
                                        {list.map((panel, pIdx) => (
                                          <div key={pIdx} style={{ backgroundColor: "rgba(255,255,255,0.01)", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                                            <strong>Panel #{pIdx + 1}: {panel.name || "N/A"}</strong>
                                            <div style={{ paddingLeft: "10px", marginTop: "4px" }}>
                                              {panel.mccb4p && panel.mccb4p.length > 0 ? (
                                                panel.mccb4p.map((mccb, mIdx) => (
                                                  <div key={mIdx} style={{ color: "var(--text-secondary)" }}>
                                                    • MCCB 4P #{mIdx + 1} - Rating: <strong>{mccb.rating || "N/A"}</strong> | Brand: <strong>{mccb.brand || "N/A"}</strong>
                                                  </div>
                                                ))
                                              ) : (
                                                <div style={{ color: "var(--text-secondary)" }}>No MCCB 4P breakers.</div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                });
                              } catch (e) {
                                return <strong>Invalid panel JSON structure</strong>;
                              }
                            })()}
                          </div>
                        ) : (
                          <div><span style={{ color: "var(--text-secondary)" }}>Breaker Make / Rating:</span> <strong>{p.breakerRating || "N/A"}</strong></div>
                        )}
                        <div><span style={{ color: "var(--text-secondary)" }}>Cable Specification:</span> <strong>{p.cableSize || "N/A"}</strong></div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={12} /> GPS Coordinates:</span>
                          <strong>{p.latitude ? `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}` : "No GPS Location Tagged"}</strong>
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}><ImageIcon size={12} /> Photos ({assetPhotos.length}):</span>
                          {renderPhotosGrid(assetPhotos)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </Card>

      {/* ================================================== */}
      {/* SECTION 4: TRANSFORMERS (COLLAPSIBLE) */}
      {/* ================================================== */}
      <Card style={{ padding: "0", overflow: "hidden" }}>
        <div
          onClick={() => toggleSection("transformers")}
          style={{ padding: "16px", backgroundColor: "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", userSelect: "none" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {expandedSections.transformers ? <ChevronDown size={18} style={{ color: "var(--primary)" }} /> : <ChevronRight size={18} />}
            <h3 style={{ fontSize: "15px", fontWeight: "700" }}>🔌 Section 4: Distribution Transformers ({transformers.length})</h3>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            {completedTransformers.length} / {transformers.length} Completed
          </span>
        </div>

        {expandedSections.transformers && (
          <div style={{ padding: "16px", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
            {transformers.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No transformers configured.</p>
            ) : (
              transformers.map((t) => {
                const itemKey = `transformer_${t.id}`;
                const isExpanded = expandedItems[itemKey] !== false;
                const assetPhotos = getAssetPhotos("Transformer", t.assetIndex);
                const isComplete = t.status === "COMPLETED";

                return (
                  <div key={t.id} style={{ borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", overflow: "hidden" }}>
                    <div
                      onClick={() => toggleItem(itemKey)}
                      style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", backgroundColor: "rgba(255,255,255,0.01)" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <strong style={{ fontSize: "14px" }}>Transformer #{t.assetIndex}</strong>
                        {t.lockedByUser && (
                          <span style={{ fontSize: "11px", color: "#818cf8", fontWeight: "600", backgroundColor: "rgba(99, 102, 241, 0.12)", padding: "2px 8px", borderRadius: "4px" }}>
                            👤 Filled by: {t.lockedByUser.name}
                          </span>
                        )}
                        {isComplete ? <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "600", backgroundColor: "rgba(16,185,129,0.1)", padding: "2px 6px", borderRadius: "4px" }}>✓ Completed</span> : <span style={{ fontSize: "11px", color: "var(--danger)", fontWeight: "600", backgroundColor: "rgba(239,68,68,0.1)", padding: "2px 6px", borderRadius: "4px" }}>⚠️ Incomplete</span>}
                      </div>

                      <Button
                        size="small"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/survey/transformers/${surveyId}?assetId=${t.id}`);
                        }}
                        style={{ fontSize: "11px", padding: "3px 8px" }}
                      >
                        <Edit3 size={11} /> Edit Transformer #{t.assetIndex}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border-color)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", fontSize: "12px" }}>
                        <div><span style={{ color: "var(--text-secondary)" }}>Capacity:</span> <strong>{t.capacityKVA ? `${t.capacityKVA} KVA` : "N/A"}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>Voltage Ratio:</span> <strong>{t.voltageRatio || "N/A"}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>Rated Current:</span> <strong>{t.currentRating || "N/A"}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>Earthing Status:</span> <strong>{t.earthingStatus || "N/A"}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>Oil Level & Breather:</span> <strong>{t.oilLevelOk ? "Normal / OK" : "Low / Faulty"}</strong></div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={12} /> GPS Coordinates:</span>
                          <strong>{t.latitude ? `${t.latitude.toFixed(4)}, ${t.longitude.toFixed(4)}` : "No GPS Location Tagged"}</strong>
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}><ImageIcon size={12} /> Photos ({assetPhotos.length}):</span>
                          {renderPhotosGrid(assetPhotos)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </Card>

      {/* ================================================== */}
      {/* SECTION 5: DG SETS (COLLAPSIBLE) */}
      {/* ================================================== */}
      <Card style={{ padding: "0", overflow: "hidden" }}>
        <div
          onClick={() => toggleSection("dgs")}
          style={{ padding: "16px", backgroundColor: "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", userSelect: "none" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {expandedSections.dgs ? <ChevronDown size={18} style={{ color: "var(--primary)" }} /> : <ChevronRight size={18} />}
            <h3 style={{ fontSize: "15px", fontWeight: "700" }}>⚙️ Section 5: Diesel Generator (DG) Sets ({dgs.length})</h3>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            {completedDGs.length} / {dgs.length} Completed
          </span>
        </div>

        {expandedSections.dgs && (
          <div style={{ padding: "16px", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
            {dgs.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No DG sets configured.</p>
            ) : (
              dgs.map((d) => {
                const itemKey = `dg_${d.id}`;
                const isExpanded = expandedItems[itemKey] !== false;
                const assetPhotos = getAssetPhotos("DG", d.assetIndex);
                const isComplete = d.status === "COMPLETED";

                return (
                  <div key={d.id} style={{ borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--card-bg)", overflow: "hidden" }}>
                    <div
                      onClick={() => toggleItem(itemKey)}
                      style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", backgroundColor: "rgba(255,255,255,0.01)" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <strong style={{ fontSize: "14px" }}>DG Set #{d.assetIndex}</strong>
                        {d.lockedByUser && (
                          <span style={{ fontSize: "11px", color: "#818cf8", fontWeight: "600", backgroundColor: "rgba(99, 102, 241, 0.12)", padding: "2px 8px", borderRadius: "4px" }}>
                            👤 Filled by: {d.lockedByUser.name}
                          </span>
                        )}
                        {isComplete ? <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "600", backgroundColor: "rgba(16,185,129,0.1)", padding: "2px 6px", borderRadius: "4px" }}>✓ Completed</span> : <span style={{ fontSize: "11px", color: "var(--danger)", fontWeight: "600", backgroundColor: "rgba(239,68,68,0.1)", padding: "2px 6px", borderRadius: "4px" }}>⚠️ Incomplete</span>}
                      </div>

                      <Button
                        size="small"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/survey/dgs/${surveyId}?assetId=${d.id}`);
                        }}
                        style={{ fontSize: "11px", padding: "3px 8px" }}
                      >
                        <Edit3 size={11} /> Edit DG #{d.assetIndex}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border-color)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", fontSize: "12px" }}>
                        <div><span style={{ color: "var(--text-secondary)" }}>Capacity:</span> <strong>{d.capacityKVA ? `${d.capacityKVA} KVA` : "N/A"}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>Fuel Tank Capacity:</span> <strong>{d.fuelTankLitres ? `${d.fuelTankLitres} Litres` : "N/A"}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>Earthing Condition:</span> <strong>{d.earthingStatus || "N/A"}</strong></div>
                        <div><span style={{ color: "var(--text-secondary)" }}>AMF Panel Present:</span> <strong>{d.amfPanelPresent ? "Yes" : "No"}</strong></div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={12} /> GPS Coordinates:</span>
                          <strong>{d.latitude ? `${d.latitude.toFixed(4)}, ${d.longitude.toFixed(4)}` : "No GPS Location Tagged"}</strong>
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}><ImageIcon size={12} /> Photos ({assetPhotos.length}):</span>
                          {renderPhotosGrid(assetPhotos)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </Card>

      {/* Auditor Review Panel (Status Change Dropdown) */}
      {isAuditor ? (
        <Card style={{ border: "1px solid var(--primary)", marginTop: "10px" }}>
          <h3 style={{ marginBottom: "16px", color: "var(--primary)", fontWeight: "700", fontSize: "16px" }}>
            Audit & Review Survey Status
          </h3>
          {auditMsg && <p style={{ color: "#10b981", marginBottom: "12px", fontSize: "14px" }}>{auditMsg}</p>}
          <form onSubmit={handleAuditorSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Select
              label="Adjust Survey Status"
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
              options={[
                { value: "DRAFT", label: "DRAFT" },
                { value: "SUBMITTED", label: "SUBMITTED" },
                { value: "UNDER_REVIEW", label: "UNDER_REVIEW" },
                { value: "APPROVED", label: "APPROVED" },
                { value: "RETURNED", label: "RETURNED" }
              ]}
              required
            />

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "600", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                Review Notes / Remarks
              </label>
              <textarea
                className="form-control"
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder="Enter reasons for approval, return instructions, or audit findings..."
                rows={3}
                style={{ width: "100%", backgroundColor: "var(--bg-color)", border: "1px solid var(--border-color)", color: "var(--text-primary)", borderRadius: "8px", padding: "10px" }}
              />
            </div>

            <Button type="submit" style={{ width: "100%" }}>Save & Update Survey Status</Button>
          </form>
        </Card>
      ) : (
        /* Surveyor Submit Button Area */
        <div className="responsive-actions-bar" style={{ marginTop: "10px" }}>
          <Button variant="secondary" onClick={() => navigate(`/survey/assets/${surveyId}`)}>
            Keep Editing
          </Button>
          
          <Button
            disabled={!isFullyComplete || ["SUBMITTED", "UNDER_REVIEW", "APPROVED"].includes(survey.status) || submitting}
            onClick={() => setShowSubmitModal(true)}
            style={{ backgroundColor: isFullyComplete ? "var(--primary)" : "var(--border-color)", padding: "12px 28px", fontSize: "15px" }}
          >
            {["SUBMITTED", "UNDER_REVIEW", "APPROVED"].includes(survey.status) ? "✓ Survey Submitted" : "🚀 Submit Survey"}
          </Button>
        </div>
      )}

      {/* ================================================== */}
      {/* FINAL SUBMIT CONFIRMATION MODAL */}
      {/* ================================================== */}
      {showSubmitModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "12px", color: "var(--text-primary)" }}>
              Confirm Survey Submission
            </h3>
            
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "20px" }}>
              Are you sure you want to submit this survey for <strong>{site.name}</strong>?
              <br /><br />
              After submission, the survey will be locked for editing by surveyors and made available for review by Admin and Super Admin.
            </p>

            <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", flexWrap: "wrap" }}>
              <Button variant="secondary" disabled={submitting} onClick={() => setShowSubmitModal(false)}>
                Cancel
              </Button>
              <Button disabled={submitting} onClick={handleConfirmSubmit} style={{ backgroundColor: "var(--primary)" }}>
                {submitting ? "Submitting..." : "Confirm & Submit"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default FinalReview;
