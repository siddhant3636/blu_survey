import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import surveyService from "../../services/survey.service";
import reportService from "../../services/report.service";
import siteService from "../../services/site.service";
import userService from "../../services/user.service";
import photoService from "../../services/photo.service";
import { useAuth } from "../../hooks/useAuth";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import Select2 from "../../components/common/Select2";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import { ChevronDown, ChevronRight, MapPin, Image as ImageIcon, Edit3 } from "lucide-react";

const FormDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [survey, setSurvey] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Audit status state
  const [status, setStatus] = useState("UNDER_REVIEW");
  const [remarks, setRemarks] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");

  // Admin Edit Site Info Modal state
  const [showEditSiteModal, setShowEditSiteModal] = useState(false);
  const [editSiteForm, setEditSiteForm] = useState({
    operator: "",
    city: "",
    pincode: "",
    buildingName: "",
    accessPersonName: "",
    accessPersonMobile: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  // Re-assignment State
  const [surveyors, setSurveyors] = useState([]);
  const [reassignSurveyorId, setReassignSurveyorId] = useState("");
  const [reassignMsg, setReassignMsg] = useState("");

  // Accordion toggle states
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    chargers: true,
    panels: true,
    transformers: true,
    dgs: true,
  });

  const toggleSection = (sec) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const role = user?.role;
  const isAuditor = role === "ADMIN" || role === "SUB_ADMIN" || role === "MANAGER" || role === "SUPER_ADMIN";

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [surveyRes, photoRes] = await Promise.all([
        surveyService.getSurvey(id),
        photoService.getPhotos(id).catch(() => ({ data: { photos: [] } })),
      ]);

      const data = surveyRes.data?.data?.survey || surveyRes.data?.survey;
      const photoList = photoRes.data?.data?.photos || photoRes.data?.photos || [];

      setSurvey(data);
      setPhotos(photoList);

      if (data) {
        setStatus(data.status || "UNDER_REVIEW");
        setRemarks(data.reviewRemarks || "");
        setEditSiteForm({
          operator: data.operator || "",
          city: data.city || "",
          pincode: data.pincode || "",
          buildingName: data.buildingName || "",
          accessPersonName: data.accessPersonName || "",
          accessPersonMobile: data.accessPersonMobile || "",
        });
      }

      if (isAuditor) {
        const usersRes = await userService.getUsers();
        const usersList = usersRes.data?.data?.users || usersRes.data?.users || [];
        const surveyorList = usersList.filter((u) => u.role === "SURVEY_PERSON" || u.role === "SURVEYOR");
        setSurveyors(surveyorList);
        if (surveyorList.length > 0) setReassignSurveyorId(surveyorList[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load form details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // Lock background scroll when modal is active
  useEffect(() => {
    if (showEditSiteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showEditSiteModal]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdateMsg("");
    try {
      await surveyService.updateSurvey(id, { status, remarks });
      setUpdateMsg("Survey review status updated successfully!");
      fetchDetails();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleEditSiteSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await surveyService.updateSurvey(id, editSiteForm);
      setShowEditSiteModal(false);
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update site info");
    } finally {
      setEditLoading(false);
    }
  };

  const handleReassign = async (e) => {
    e.preventDefault();
    if (!reassignSurveyorId || !survey?.surveySiteId) return;
    setReassignMsg("");
    try {
      await siteService.createAssignment({
        surveySiteId: survey.surveySiteId,
        surveyorId: reassignSurveyorId,
      });
      setReassignMsg("Surveyor re-assigned successfully!");
      fetchDetails();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reassign surveyor");
    }
  };

  if (loading) return <Loader size="large" />;
  if (error) return (
    <div style={{ maxWidth: "600px", margin: "40px auto", textAlign: "center" }}>
      <p style={{ color: "var(--danger)", marginBottom: "16px" }}>{error}</p>
      <Button variant="secondary" onClick={() => navigate("/forms")}>Back to Forms Catalog</Button>
    </div>
  );
  if (!survey) return <p style={{ padding: "40px", textAlign: "center" }}>Survey form record not found.</p>;

  const site = survey.surveySite || {};
  const creator = survey.createdBySurveyor || {};
  const chargers = survey.chargers || [];
  const panels = survey.panels || [];
  const transformers = survey.transformers || [];
  const dgs = survey.dgs || [];
  const assignments = site.assignments || [];

  const getAssetPhotos = (assetTypeTitle, assetIndex) => {
    const expectedPrefix = `${assetTypeTitle} #${assetIndex}`.toLowerCase();
    const fallbackPrefix = `${assetTypeTitle}`.toLowerCase();
    return photos.filter((p) => {
      const catName = (p.category?.name || "").toLowerCase();
      return catName.includes(expectedPrefix) || (assetIndex === 1 && catName.includes(fallbackPrefix));
    });
  };

  const renderAssetPhotos = (assetPhotos) => {
    if (assetPhotos.length === 0) return null;
    return (
      <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
        <strong style={{ display: "block", marginBottom: "6px", color: "var(--text-secondary)" }}>Attached Photos:</strong>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {assetPhotos.map((p) => (
            <div key={p.id} style={{ width: "90px", height: "90px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border-color)", backgroundColor: "#000", position: "relative" }}>
              <a href={p.url || p.filePath} target="_blank" rel="noreferrer">
                <img src={p.url || p.filePath} alt={p.category?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </a>
              <span style={{ position: "absolute", bottom: "2px", left: "2px", backgroundColor: "rgba(0,0,0,0.7)", color: "#fff", fontSize: "8px", padding: "1px 3px", borderRadius: "2px", maxWidth: "86px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {p.category?.name?.split("-")?.pop()?.trim() || "Photo"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBreakerList = (rawJson, label) => {
    if (!rawJson) return null;
    try {
      const parsed = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
      if (parsed && typeof parsed === "object" && parsed.count > 0 && Array.isArray(parsed.types)) {
        const validTypes = parsed.types.filter((t) => {
          if (t && typeof t === "object") return t.rating || t.brandId;
          return Boolean(t);
        });
        if (validTypes.length > 0) {
          return (
            <div style={{ gridColumn: "1 / -1", marginTop: "6px", padding: "8px 12px", backgroundColor: "rgba(255, 255, 255, 0.02)", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
              <strong style={{ display: "block", marginBottom: "4px", color: "var(--text-secondary)" }}>{label} Breakers ({parsed.count})</strong>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "6px" }}>
                {validTypes.map((type, idx) => {
                  let ratingText = "N/A";
                  let brandStr = "";
                  if (type && typeof type === "object") {
                    ratingText = type.rating || "N/A";
                    brandStr = type.brandName ? ` (${type.brandName})` : "";
                  } else {
                    ratingText = String(type || "N/A");
                  }
                  return (
                    <div key={idx}><strong>#{idx + 1}:</strong> {ratingText}{brandStr}</div>
                  );
                })}
              </div>
            </div>
          );
        }
      }
    } catch (e) {}
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "850px", margin: "0 auto" }}>
      {/* Navigation Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Station Survey Details #{survey.id.slice(0, 8)}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Site: <strong>{site.name}</strong> ({site.address})</p>
        </div>
        <Button variant="secondary" onClick={() => navigate("/forms")}>Back to Forms Catalog</Button>
      </div>

      {/* Primary Details & Report Buttons */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "17px", fontWeight: "700" }}>Station Summary</h3>
          <StatusBadge status={survey.status} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", fontSize: "13px" }}>
          <p><strong>Site Name:</strong> {site.name}</p>
          <p><strong>Concessionaire:</strong> {site.concessionaire || "N/A"}</p>
          <p><strong>Land Owning Agency:</strong> {site.landOwningAgency || "N/A"}</p>
          <p><strong>Address:</strong> {site.address}</p>
          <p><strong>Surveyor:</strong> {creator.name} ({creator.email})</p>
          <p><strong>Operator:</strong> {survey.operator || "N/A"}</p>
          <p><strong>City / Pincode:</strong> {survey.city ? `${survey.city} - ${survey.pincode || ''}` : "N/A"}</p>
          <p><strong>Submitted Date:</strong> {survey.submittedAt ? new Date(survey.submittedAt).toLocaleString() : new Date(survey.updatedAt).toLocaleString()}</p>
          {survey.reviewedBy && (
            <p><strong>Reviewed By:</strong> {survey.reviewedBy.name} ({new Date(survey.reviewedAt).toLocaleDateString()})</p>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <a href={reportService.getExcelReportUrl(survey.id)} download target="_blank" rel="noreferrer">
              <Button variant="secondary" style={{ fontSize: "12px", padding: "6px 12px" }}>📊 Download Excel</Button>
            </a>
            <a href={reportService.getPDFReportUrl(survey.id)} download target="_blank" rel="noreferrer">
              <Button style={{ fontSize: "12px", padding: "6px 12px", backgroundColor: "#3b82f6" }}>📄 Download PDF</Button>
            </a>
          </div>

          {isAuditor && (
            <Button size="small" variant="secondary" onClick={() => setShowEditSiteModal(true)}>
              <Edit3 size={12} /> Edit Site Information
            </Button>
          )}
        </div>
      </Card>

      {/* Accordion 1: EV Chargers */}
      <Card style={{ padding: "0", overflow: "hidden" }}>
        <div onClick={() => toggleSection("chargers")} style={{ padding: "14px 16px", backgroundColor: "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {expandedSections.chargers ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <h4 style={{ fontSize: "15px", fontWeight: "700" }}>🔋 EV Chargers ({chargers.length})</h4>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{chargers.filter((c) => c.status === "COMPLETED").length} Completed</span>
        </div>

        {expandedSections.chargers && (
          <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
            {chargers.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No chargers configured.</p>
            ) : (
              chargers.map((c) => (
                <div key={c.id} style={{ borderRadius: "6px", border: "1px solid var(--border-color)", padding: "12px", fontSize: "12px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                  <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong>Charger #{c.assetIndex}</strong>
                      {c.lockedByUser && (
                        <span style={{ fontSize: "11px", color: "#818cf8", fontWeight: "600", backgroundColor: "rgba(99, 102, 241, 0.12)", padding: "2px 8px", borderRadius: "4px" }}>
                          👤 Filled by: {c.lockedByUser.name}
                        </span>
                      )}
                    </div>
                    {isAuditor && (
                      <Button size="small" variant="secondary" onClick={() => navigate(`/survey/chargers/${survey.id}?assetId=${c.id}`)} style={{ fontSize: "11px", padding: "2px 8px" }}>
                        <Edit3 size={11} /> Edit Charger #{c.assetIndex}
                      </Button>
                    )}
                  </div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Manufacturer:</span> <strong>{c.manufacturer?.name || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Model:</span> <strong>{c.model?.name || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Connector:</span> <strong>{c.connector?.type || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>MCCB Maker:</span> <strong>{c.mccbMaker?.name || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>MCB Maker:</span> <strong>{c.mcbMaker?.name || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Serial Number:</span> <strong>{c.serialNumber || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Capacity:</span> <strong>{c.powerRating || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Voltage:</span> <strong>{c.voltage || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Type & Speed:</span> <strong>{c.chargerType ? (c.chargerType === c.chargerCategory ? c.chargerType : `${c.chargerType} (${c.chargerCategory || "N/A"})`) : "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Current Status:</span> <strong>{c.currentStatus || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Display Working:</span> <strong>{c.displayWorking || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Cable Condition:</span> <strong>{c.cableCondition || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Earthing Status:</span> <strong>{c.earthingStatus || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Fire Safety:</span> <strong>{c.fireSafety || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Lighting Status:</span> <strong>{c.lightingStatus || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>GPS:</span> <strong>{c.latitude ? `${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}` : "N/A"}</strong></div>
                  <div style={{ gridColumn: "1 / -1" }}><span style={{ color: "var(--text-secondary)" }}>Remarks:</span> <strong>{c.remarks || "None"}</strong></div>
                  {renderBreakerList(c.mccb4p, "MCCB 4P")}
                  {renderBreakerList(c.mcb2p, "MCB 2P")}
                  {renderBreakerList(c.mcb4p, "MCB 4P")}
                  {renderAssetPhotos(getAssetPhotos("Charger", c.assetIndex))}
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {/* Accordion 2: Electrical Panels */}
      <Card style={{ padding: "0", overflow: "hidden" }}>
        <div onClick={() => toggleSection("panels")} style={{ padding: "14px 16px", backgroundColor: "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {expandedSections.panels ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <h4 style={{ fontSize: "15px", fontWeight: "700" }}>⚡ Electrical Panels ({panels.length})</h4>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{panels.filter((p) => p.status === "COMPLETED").length} Completed</span>
        </div>

        {expandedSections.panels && (
          <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
            {panels.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No panels configured.</p>
            ) : (
              panels.map((p) => (
                <div key={p.id} style={{ borderRadius: "6px", border: "1px solid var(--border-color)", padding: "12px", fontSize: "12px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                  <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong>Panel #{p.assetIndex} - {p.name}</strong>
                      {p.lockedByUser && (
                        <span style={{ fontSize: "11px", color: "#818cf8", fontWeight: "600", backgroundColor: "rgba(99, 102, 241, 0.12)", padding: "2px 8px", borderRadius: "4px" }}>
                          👤 Filled by: {p.lockedByUser.name}
                        </span>
                      )}
                    </div>
                    {isAuditor && (
                      <Button size="small" variant="secondary" onClick={() => navigate(`/survey/panels/${survey.id}?assetId=${p.id}`)} style={{ fontSize: "11px", padding: "2px 8px" }}>
                        <Edit3 size={11} /> Edit Panel #{p.assetIndex}
                      </Button>
                    )}
                  </div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Name / Tag:</span> <strong>{p.name || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Capacity:</span> <strong>{p.capacity || "N/A"}</strong></div>
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
                  <div><span style={{ color: "var(--text-secondary)" }}>Cable Size:</span> <strong>{p.cableSize || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>GPS:</span> <strong>{p.latitude ? `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}` : "N/A"}</strong></div>
                  {renderAssetPhotos(getAssetPhotos("Panel", p.assetIndex))}
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {/* Accordion 3: Transformers */}
      <Card style={{ padding: "0", overflow: "hidden" }}>
        <div onClick={() => toggleSection("transformers")} style={{ padding: "14px 16px", backgroundColor: "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {expandedSections.transformers ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <h4 style={{ fontSize: "15px", fontWeight: "700" }}>🔌 Distribution Transformers ({transformers.length})</h4>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{transformers.filter((t) => t.status === "COMPLETED").length} Completed</span>
        </div>

        {expandedSections.transformers && (
          <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
            {transformers.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No transformers configured.</p>
            ) : (
              transformers.map((t) => (
                <div key={t.id} style={{ borderRadius: "6px", border: "1px solid var(--border-color)", padding: "12px", fontSize: "12px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                  <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong>Transformer #{t.assetIndex}</strong>
                      {t.lockedByUser && (
                        <span style={{ fontSize: "11px", color: "#818cf8", fontWeight: "600", backgroundColor: "rgba(99, 102, 241, 0.12)", padding: "2px 8px", borderRadius: "4px" }}>
                          👤 Filled by: {t.lockedByUser.name}
                        </span>
                      )}
                    </div>
                    {isAuditor && (
                      <Button size="small" variant="secondary" onClick={() => navigate(`/survey/transformers/${survey.id}?assetId=${t.id}`)} style={{ fontSize: "11px", padding: "2px 8px" }}>
                        <Edit3 size={11} /> Edit Transformer #{t.assetIndex}
                      </Button>
                    )}
                  </div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Capacity:</span> <strong>{t.capacityKVA ? `${t.capacityKVA} KVA` : "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Voltage Ratio:</span> <strong>{t.voltageRatio || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Rated Current:</span> <strong>{t.currentRating || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Oil Level OK:</span> <strong>{t.oilLevelOk ? "Yes" : "No"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Earthing Status:</span> <strong>{t.earthingStatus || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>GPS:</span> <strong>{t.latitude ? `${t.latitude.toFixed(4)}, ${t.longitude.toFixed(4)}` : "N/A"}</strong></div>
                  {renderAssetPhotos(getAssetPhotos("Transformer", t.assetIndex))}
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {/* Accordion 4: DG Sets */}
      <Card style={{ padding: "0", overflow: "hidden" }}>
        <div onClick={() => toggleSection("dgs")} style={{ padding: "14px 16px", backgroundColor: "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {expandedSections.dgs ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <h4 style={{ fontSize: "15px", fontWeight: "700" }}>⚙️ Diesel Generators (DG) ({dgs.length})</h4>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{dgs.filter((d) => d.status === "COMPLETED").length} Completed</span>
        </div>

        {expandedSections.dgs && (
          <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
            {dgs.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No DG sets configured.</p>
            ) : (
              dgs.map((d) => (
                <div key={d.id} style={{ borderRadius: "6px", border: "1px solid var(--border-color)", padding: "12px", fontSize: "12px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                  <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "6px", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong>DG Set #{d.assetIndex}</strong>
                      {d.lockedByUser && (
                        <span style={{ fontSize: "11px", color: "#818cf8", fontWeight: "600", backgroundColor: "rgba(99, 102, 241, 0.12)", padding: "2px 8px", borderRadius: "4px" }}>
                          👤 Filled by: {d.lockedByUser.name}
                        </span>
                      )}
                    </div>
                    {isAuditor && (
                      <Button size="small" variant="secondary" onClick={() => navigate(`/survey/dgs/${survey.id}?assetId=${d.id}`)} style={{ fontSize: "11px", padding: "2px 8px" }}>
                        <Edit3 size={11} /> Edit DG #{d.assetIndex}
                      </Button>
                    )}
                  </div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Capacity:</span> <strong>{d.capacityKVA ? `${d.capacityKVA} KVA` : "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Fuel Tank:</span> <strong>{d.fuelTankLitres ? `${d.fuelTankLitres} Litres` : "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>AMF Panel:</span> <strong>{d.amfPanelPresent ? "Yes" : "No"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Earthing:</span> <strong>{d.earthingStatus || "N/A"}</strong></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>GPS:</span> <strong>{d.latitude ? `${d.latitude.toFixed(4)}, ${d.longitude.toFixed(4)}` : "N/A"}</strong></div>
                  {renderAssetPhotos(getAssetPhotos("DG", d.assetIndex))}
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {/* 📷 Station Photos Gallery */}
      <Card>
        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "14px" }}>
          📷 Station & Asset Photos ({photos.length})
        </h3>
        {photos.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>No photos attached to this survey.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}>
            {photos.map((p) => (
              <div key={p.id} style={{ borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border-color)", aspectRatio: "1/1", backgroundColor: "#000", position: "relative" }}>
                <a href={p.url || p.filePath} target="_blank" rel="noreferrer">
                  <img src={p.url || p.filePath} alt={p.category?.name || "Photo"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </a>
                <span style={{ position: "absolute", bottom: "4px", left: "4px", backgroundColor: "rgba(0,0,0,0.75)", color: "#fff", fontSize: "10px", padding: "2px 6px", borderRadius: "3px" }}>
                  {p.category?.name || "PHOTO"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Auditor / Admin Controls */}
      {isAuditor && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "20px" }}>
          {/* Status Update Control */}
          <Card style={{ border: "1px solid var(--primary)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--primary)", marginBottom: "14px" }}>
              Audit & Review Status
            </h3>
            {updateMsg && <p style={{ color: "#10b981", marginBottom: "12px", fontSize: "13px" }}>{updateMsg}</p>}
            <form onSubmit={handleStatusUpdate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Select2
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: "DRAFT", label: "DRAFT" },
                  { value: "SUBMITTED", label: "SUBMITTED" },
                  { value: "UNDER_REVIEW", label: "UNDER_REVIEW" },
                  { value: "APPROVED", label: "APPROVED" },
                  { value: "RETURNED", label: "RETURNED" }
                ]}
              />

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "600", fontSize: "13px", display: "block", marginBottom: "4px" }}>
                  Remarks / Audit Notes
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter audit notes..."
                  style={{ width: "100%", backgroundColor: "var(--bg-color)", border: "1px solid var(--border-color)", color: "var(--text-primary)", borderRadius: "8px", padding: "8px" }}
                />
              </div>

              <Button type="submit">Update Survey Status</Button>
            </form>
          </Card>

          {/* Reassign Surveyor Control */}
          <Card style={{ border: "1px solid #10b981" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#10b981", marginBottom: "14px" }}>
              Reassign Surveyor
            </h3>
            {reassignMsg && <p style={{ color: "#10b981", marginBottom: "12px", fontSize: "13px" }}>{reassignMsg}</p>}
            <form onSubmit={handleReassign} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Select2
                label="Assign to Surveyor"
                value={reassignSurveyorId}
                onChange={(e) => setReassignSurveyorId(e.target.value)}
                options={surveyors.map((s) => ({ value: s.id, label: `${s.name} (${s.email})` }))}
                placeholder="Search / Select Surveyor..."
                required
              />
              <Button type="submit" style={{ backgroundColor: "#10b981" }}>Confirm Re-assignment</Button>
            </form>
          </Card>
        </div>
      )}

      {/* Admin Edit Site Modal */}
      {showEditSiteModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>Edit Site Information</h3>
            <form onSubmit={handleEditSiteSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Input label="Operator" value={editSiteForm.operator} onChange={(e) => setEditSiteForm({ ...editSiteForm, operator: e.target.value })} />
              <Input label="City" value={editSiteForm.city} onChange={(e) => setEditSiteForm({ ...editSiteForm, city: e.target.value })} />
              <Input label="Pincode" value={editSiteForm.pincode} onChange={(e) => setEditSiteForm({ ...editSiteForm, pincode: e.target.value })} />
              <Input label="Building / Landmark" value={editSiteForm.buildingName} onChange={(e) => setEditSiteForm({ ...editSiteForm, buildingName: e.target.value })} />
              <Input label="Access Person Name" value={editSiteForm.accessPersonName} onChange={(e) => setEditSiteForm({ ...editSiteForm, accessPersonName: e.target.value })} />
              <Input label="Access Person Mobile" value={editSiteForm.accessPersonMobile} onChange={(e) => setEditSiteForm({ ...editSiteForm, accessPersonMobile: e.target.value })} />

              <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
                <Button type="button" variant="secondary" disabled={editLoading} onClick={() => setShowEditSiteModal(false)}>Cancel</Button>
                <Button type="submit" disabled={editLoading}>{editLoading ? "Saving..." : "Save Changes"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormDetails;
