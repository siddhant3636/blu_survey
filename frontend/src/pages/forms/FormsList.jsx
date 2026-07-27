import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import surveyService from "../../services/survey.service";
import siteService from "../../services/site.service";
import userService from "../../services/user.service";
import masterService from "../../services/master.service";
import photoService from "../../services/photo.service";
import reportService from "../../services/report.service";
import { useAuth } from "../../hooks/useAuth";
import Table from "../../components/common/Table";
import StatusBadge from "../../components/common/StatusBadge";
import Input from "../../components/common/Input";
import Select2 from "../../components/common/Select2";
import MultiPhotoUploader from "../../components/common/MultiPhotoUploader";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";

const FormsList = () => {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Site Selection & Dynamic Form State
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [selectedSiteObj, setSelectedSiteObj] = useState(null);
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  // Photos Attachment State (Optional - Non mandatory)
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  // Categorized Breaker Masters
  const [mccb4pRatings, setMccb4pRatings] = useState([]);
  const [mcb2pRatings, setMcb2pRatings] = useState([]);
  const [mcb4pRatings, setMcb4pRatings] = useState([]);
  const [makeOptions, setMakeOptions] = useState([]);

  // Selected Breakers State
  const [mccb4pSelected, setMccb4pSelected] = useState("");
  const [mcb2pSelected, setMcb2pSelected] = useState("");
  const [mcb4pSelected, setMcb4pSelected] = useState("");
  const [breakerMakeSelected, setBreakerMakeSelected] = useState("");

  // Master Options
  const [manufacturers, setManufacturers] = useState([]);
  const [models, setModels] = useState([]);
  const [connectors, setConnectors] = useState([]);

  // Form Field Values
  const [formFields, setFormFields] = useState({
    // Panel
    panelName: "LT Panel Board 1",
    cableSize: "3.5C x 240 sqmm Armoured Al",
    // Charger
    manufacturerId: "",
    modelId: "",
    connectorId: "",
    serialNumber: "",
    powerRating: "60kW DC",
  });

  // Assign Surveyor Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [surveyors, setSurveyors] = useState([]);
  const [modalSiteId, setModalSiteId] = useState("");
  const [selectedSurveyorId, setSelectedSurveyorId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  const role = user?.role;
  const canAssign = role === "ADMIN" || role === "SUB_ADMIN";

  const fetchSurveysAndMasters = async () => {
    try {
      setLoading(true);
      const [surveysRes, sitesRes, mfgRes, connRes, eqRes] = await Promise.all([
        surveyService.getSurveys(),
        siteService.getSites(),
        masterService.getManufacturers(),
        masterService.getConnectors(),
        masterService.getEquipments(),
      ]);

      const surveyList = surveysRes.data?.data?.surveys || surveysRes.data?.surveys || [];
      const siteList = sitesRes.data?.data?.sites || sitesRes.data?.sites || [];
      
      setSurveys(surveyList);
      setSites(siteList);
      setManufacturers(mfgRes.data?.manufacturers || []);
      setConnectors(connRes.data?.connectors || []);

      // Categorized equipment ratings & makes from Masters Management
      const allEquipments = eqRes.data?.equipments || [];
      setMccb4pRatings(
        allEquipments
          .filter((e) => e.description === "MCCB Rating" || e.description === "MCCB 4P Rating")
          .map((e) => ({ value: e.name, label: e.name }))
      );

      setMcb2pRatings(
        allEquipments
          .filter((e) => e.description === "MCB 2P Rating")
          .map((e) => ({ value: e.name, label: e.name }))
      );

      setMcb4pRatings(
        allEquipments
          .filter((e) => e.description === "MCB 4P Rating")
          .map((e) => ({ value: e.name, label: e.name }))
      );

      setMakeOptions(
        allEquipments
          .filter((e) => e.description === "MCCB MAKE" || e.description === "MCB MAKE")
          .map((e) => ({ value: e.name, label: e.name }))
      );

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load forms data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveysAndMasters();
  }, []);

  // Handle Site Selection -> Loads or Initiates Survey & Master Form
  const handleSiteSelect = async (siteId) => {
    setSelectedSiteId(siteId);
    setFormSuccess("");
    setFormError("");
    setSelectedPhotos([]);
    if (!siteId) {
      setSelectedSiteObj(null);
      setActiveSurvey(null);
      return;
    }

    const st = sites.find((s) => s.id === siteId);
    setSelectedSiteObj(st);
    setFormLoading(true);

    try {
      // Step 1: Check existing survey or initiate survey container with valid defaults
      let survey = null;
      try {
        const sRes = await surveyService.getSurveyBySite(siteId);
        survey = sRes.data?.data?.survey || sRes.data?.survey;
      } catch (e) {
        survey = null;
      }

      if (!survey) {
        const todayStr = new Date().toISOString().split("T")[0];
        const timeStr = new Date().toTimeString().split(" ")[0].substring(0, 5);
        
        const step1Res = await surveyService.initiateStep1({
          surveySiteId: siteId,
          surveyDate: todayStr,
          surveyTime: timeStr,
          operator: "BluSmart Fleet",
          city: st?.city || st?.address || "Delhi NCR",
          pincode: "110001",
          parkingArea: "Basement / Ground",
          internetAvailability: "4G / 5G + Wi-Fi",
          totalChargers: 1,
          totalPanels: 1,
          totalTransformers: 1,
          totalDG: 1,
        });
        survey = step1Res.data?.data?.survey || step1Res.data?.survey;
      }

      setActiveSurvey(survey);

      // Populate existing asset values if available
      if (survey?.panels && survey.panels.length > 0) {
        const panel = survey.panels[0];
        let pRating = panel.breakerRating || "";
        let pMake = "";
        if (pRating.includes(" (") && pRating.endsWith(")")) {
          const parts = pRating.split(" (");
          pRating = parts[0];
          pMake = parts[1].slice(0, -1);
        }

        if (pRating.startsWith("MCB ") && pRating.includes("2P")) {
          setMcb2pSelected(pRating);
          setMccb4pSelected("");
          setMcb4pSelected("");
        } else if (pRating.startsWith("MCB ") && pRating.includes("4P")) {
          setMcb4pSelected(pRating);
          setMccb4pSelected("");
          setMcb2pSelected("");
        } else if (pRating) {
          setMccb4pSelected(pRating);
          setMcb2pSelected("");
          setMcb4pSelected("");
        }

        setBreakerMakeSelected(pMake);
        setFormFields((prev) => ({
          ...prev,
          panelName: panel.name || "LT Panel Board 1",
          cableSize: panel.cableSize || "3.5C x 240 sqmm Armoured Al",
        }));
      }

      if (survey?.chargers && survey.chargers.length > 0) {
        const charger = survey.chargers[0];
        setFormFields((prev) => ({
          ...prev,
          manufacturerId: charger.manufacturerId || "",
          modelId: charger.modelId || "",
          connectorId: charger.connectorId || "",
          serialNumber: charger.serialNumber || "",
          powerRating: charger.powerRating || "60kW DC",
        }));

        if (charger.manufacturerId) {
          const mRes = await masterService.getModels(charger.manufacturerId);
          setModels(mRes.data?.models || []);
        }
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || "Failed to initialize station survey form");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Manufacturer Change -> Dynamically load models from Masters
  const handleManufacturerChange = async (mfgId) => {
    setFormFields((prev) => ({ ...prev, manufacturerId: mfgId, modelId: "" }));
    if (mfgId) {
      try {
        const res = await masterService.getModels(mfgId);
        setModels(res.data?.models || []);
      } catch (err) {
        setModels([]);
      }
    } else {
      setModels([]);
    }
  };

  // Selection Handlers ensuring single active breaker selection
  const handleMccb4pChange = (val) => {
    setMccb4pSelected(val);
    if (val) {
      setMcb2pSelected("");
      setMcb4pSelected("");
    }
  };

  const handleMcb2pChange = (val) => {
    setMcb2pSelected(val);
    if (val) {
      setMccb4pSelected("");
      setMcb4pSelected("");
    }
  };

  const handleMcb4pChange = (val) => {
    setMcb4pSelected(val);
    if (val) {
      setMccb4pSelected("");
      setMcb2pSelected("");
    }
  };

  // Submit Dynamic Survey Form -> Save to Database
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!activeSurvey) return;

    setFormLoading(true);
    setFormSuccess("");
    setFormError("");

    try {
      const activeRating = mccb4pSelected || mcb2pSelected || mcb4pSelected;
      if (!activeRating) {
        setFormError("Please select a Breaker Rating from MCCB 4P, MCB 2P, or MCB 4P options.");
        setFormLoading(false);
        return;
      }

      // 1. Save Panel Data
      if (activeSurvey.panels && activeSurvey.panels.length > 0) {
        const panelId = activeSurvey.panels[0].id;
        const combinedBreaker = breakerMakeSelected 
          ? `${activeRating} (${breakerMakeSelected})` 
          : activeRating;

        await surveyService.saveAssetData("panel", panelId, {
          name: formFields.panelName,
          capacity: "400A TPN",
          incomingSource: "Transformer 1 LT",
          breakerRating: combinedBreaker,
          cableSize: formFields.cableSize,
        });
      }

      // 2. Save Charger Data
      if (activeSurvey.chargers && activeSurvey.chargers.length > 0) {
        const chargerId = activeSurvey.chargers[0].id;
        await surveyService.saveAssetData("charger", chargerId, {
          manufacturerId: formFields.manufacturerId,
          modelId: formFields.modelId,
          connectorId: formFields.connectorId,
          serialNumber: formFields.serialNumber || `SN-HUB-${Math.floor(10000 + Math.random() * 90000)}`,
          powerRating: formFields.powerRating,
          chargerType: "DC Fast Charger",
          chargerCategory: "Fast",
          currentStatus: "Operational",
          displayWorking: "Yes",
          cableCondition: "Good / Intact",
          earthingStatus: "Dual Earthing OK",
          fireSafety: "Extinguisher Present & Valid",
          lightingStatus: "Sufficient Canopy Lighting",
        });
      }

      // 3. Upload Optional Attached Photos (If Any Selected)
      if (selectedPhotos && selectedPhotos.length > 0) {
        const formData = new FormData();
        formData.append("surveyId", activeSurvey.id);
        selectedPhotos.forEach((file) => {
          formData.append("photos", file);
        });
        await photoService.uploadMultiplePhotos(formData);
      }

      // 4. Mark Survey Status as SUBMITTED in Database
      await surveyService.updateSurvey(activeSurvey.id, {
        status: "SUBMITTED",
        remarks: "Submitted via dynamic master form",
      });

      setFormSuccess("✅ Form submitted successfully and saved to database!");
      setSelectedPhotos([]);
      fetchSurveysAndMasters();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || "Failed to submit survey form");
    } finally {
      setFormLoading(false);
    }
  };

  // Assign Surveyor Modal
  const openAssignModal = async () => {
    setAssignError("");
    setAssignSuccess("");
    setShowAssignModal(true);
    try {
      const usersRes = await userService.getUsers();
      const usersList = usersRes.data?.data?.users || usersRes.data?.users || [];
      const surveyorList = usersList.filter((u) => u.role === "SURVEY_PERSON" || u.role === "SURVEYOR");
      setSurveyors(surveyorList);
      if (sites.length > 0) setModalSiteId(sites[0].id);
      if (surveyorList.length > 0) setSelectedSurveyorId(surveyorList[0].id);
    } catch (err) {
      setAssignError("Failed to load surveyors list");
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!modalSiteId || !selectedSurveyorId) {
      setAssignError("Please select both a site and a surveyor.");
      return;
    }
    setAssignLoading(true);
    setAssignError("");
    setAssignSuccess("");
    try {
      await siteService.createAssignment({
        surveySiteId: modalSiteId,
        surveyorId: selectedSurveyorId
      });
      setAssignSuccess("Survey assigned successfully!");
      fetchSurveysAndMasters();
      setTimeout(() => {
        setShowAssignModal(false);
        setAssignSuccess("");
      }, 1200);
    } catch (err) {
      setAssignError(err.response?.data?.message || "Failed to assign surveyor");
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) return <Loader size="large" />;

  // Filter logic for lower table
  const filteredSurveys = surveys.filter((s) => {
    const siteName = s.surveySite?.name || "";
    const surveyorName = s.createdBySurveyor?.name || s.surveyor?.name || "";
    const matchesSearch =
      siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surveyorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700" }}>Forms & Survey Management</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "2px" }}>
            Select a site, fill dynamic MCCB 4P / MCB 2P / MCB 4P master fields, optionally snap photos, submit to database, and view reports
          </p>
        </div>

        {canAssign && (
          <Button onClick={openAssignModal} style={{ backgroundColor: "var(--primary)" }}>
            + Assign Surveyor
          </Button>
        )}
      </div>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      {/* 🚀 DYNAMIC FORM CREATION CARD */}
      <Card style={{ border: "1px solid var(--primary)", boxShadow: "0 4px 20px rgba(99, 102, 241, 0.15)", position: "relative", zIndex: 20 }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "var(--secondary)" }}>
          ⚡ Step 1: Select Survey Site & Fill Master Form
        </h3>

        {/* Site Selection Select2 Dropdown */}
        <div style={{ maxWidth: "500px", marginBottom: "20px", position: "relative", zIndex: 50 }}>
          <Select2
            label="Select EV Charging Station Site"
            value={selectedSiteId}
            onChange={(e) => handleSiteSelect(e.target.value)}
            options={sites.map((st) => ({
              value: st.id,
              label: `[${st.siteId || 'BSC'}] ${st.name} (${st.address})`
            }))}
            placeholder="Search / Select Survey Site..."
          />
        </div>

        {formLoading && <Loader />}
        {formError && <p style={{ color: "var(--danger)", marginBottom: "12px" }}>{formError}</p>}
        {formSuccess && <p style={{ color: "#10b981", fontWeight: "600", marginBottom: "12px" }}>{formSuccess}</p>}

        {/* Dynamic Form Checklist Loaded After Site Selection */}
        {selectedSiteId && activeSurvey && !formLoading && (
          <form onSubmit={handleFormSubmit} style={{ marginTop: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h4 style={{ fontSize: "15px", fontWeight: "700" }}>
                Checklist Form for {selectedSiteObj?.name}
              </h4>
              <StatusBadge status={activeSurvey.status} />
            </div>

            {/* Form Fields Loaded from Master Management */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "20px" }}>
              
              {/* Panel Masters Section with MCCB 4P, MCB 2P, MCB 4P */}
              <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h5 style={{ fontSize: "14px", fontWeight: "700", color: "#10b981", marginBottom: "4px" }}>
                  ⚡ Electrical Panel Breaker Masters
                </h5>
                
                <Input
                  label="Panel Board Name / Tag"
                  value={formFields.panelName}
                  onChange={(e) => setFormFields({ ...formFields, panelName: e.target.value })}
                  placeholder="e.g. LT Panel Board 1"
                  required
                />

                {/* MCCB 4P Rating Field */}
                <Select2
                  label="⚡ MCCB 4P Rating (Master Data)"
                  value={mccb4pSelected}
                  onChange={(e) => handleMccb4pChange(e.target.value)}
                  options={mccb4pRatings}
                  placeholder="Select MCCB 4P Rating..."
                />

                {/* MCB 2P Rating Field */}
                <Select2
                  label="🔌 MCB 2P Rating (Master Data)"
                  value={mcb2pSelected}
                  onChange={(e) => handleMcb2pChange(e.target.value)}
                  options={mcb2pRatings}
                  placeholder="Select MCB 2P Rating..."
                />

                {/* MCB 4P Rating Field */}
                <Select2
                  label="⚡ MCB 4P Rating (Master Data)"
                  value={mcb4pSelected}
                  onChange={(e) => handleMcb4pChange(e.target.value)}
                  options={mcb4pRatings}
                  placeholder="Select MCB 4P Rating..."
                />

                {/* Breaker Make / Brand */}
                <Select2
                  label="🏷️ Breaker Make / Brand (Master Data)"
                  value={breakerMakeSelected}
                  onChange={(e) => setBreakerMakeSelected(e.target.value)}
                  options={makeOptions}
                  placeholder="Select Breaker Make..."
                  required
                />

                <Input
                  label="Cable Size & Specification"
                  value={formFields.cableSize}
                  onChange={(e) => setFormFields({ ...formFields, cableSize: e.target.value })}
                  placeholder="e.g. 3.5C x 240 sqmm Armoured Al"
                />
              </div>

              {/* Charger Masters Section */}
              <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h5 style={{ fontSize: "14px", fontWeight: "700", color: "#6366f1", marginBottom: "4px" }}>
                  🔌 EV Charger Masters
                </h5>

                <Select2
                  label="Charger Manufacturer (Master Data)"
                  value={formFields.manufacturerId}
                  onChange={(e) => handleManufacturerChange(e.target.value)}
                  options={manufacturers.map((m) => ({ value: m.id, label: m.name }))}
                  placeholder="Search / Select Manufacturer..."
                  required
                />

                <Select2
                  label="Charger Model (Master Data)"
                  value={formFields.modelId}
                  onChange={(e) => setFormFields({ ...formFields, modelId: e.target.value })}
                  options={models.map((m) => ({ value: m.id, label: `${m.name} (${m.powerRating})` }))}
                  placeholder={formFields.manufacturerId ? "Search / Select Model..." : "Select Manufacturer First"}
                  required
                  disabled={!formFields.manufacturerId}
                />

                <Select2
                  label="Connector Type (Master Data)"
                  value={formFields.connectorId}
                  onChange={(e) => setFormFields({ ...formFields, connectorId: e.target.value })}
                  options={connectors.map((c) => ({ value: c.id, label: c.type }))}
                  placeholder="Search / Select Connector (CCS2, Type 2)..."
                  required
                />

                <Input
                  label="Charger Serial Number"
                  value={formFields.serialNumber}
                  onChange={(e) => setFormFields({ ...formFields, serialNumber: e.target.value })}
                  placeholder="e.g. SN-DEL-98765"
                />
              </div>
            </div>

            {/* 📷 OPTIONAL MULTI-PHOTO ATTACHMENT SECTION */}
            <div style={{ backgroundColor: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "8px", border: "1px dashed var(--border-color)", marginBottom: "20px" }}>
              <MultiPhotoUploader
                files={selectedPhotos}
                setFiles={setSelectedPhotos}
                label="Station & Equipment Photos"
                maxFiles={10}
              />
            </div>

            {/* Submit Button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <Button type="submit" style={{ backgroundColor: "var(--primary)", padding: "10px 24px" }} disabled={formLoading}>
                {formLoading ? "Submitting..." : "🚀 Submit Survey Form & Save to Database"}
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* 📊 SUBMITTED FORMS TABLE */}
      <Card style={{ position: "relative", zIndex: 1 }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>Submitted Forms & Surveys Catalog</h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
          <Input
            label="Search Form / Site / Surveyor"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type site or surveyor name..."
          />
          <Select2
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "DRAFT", label: "DRAFT" },
              { value: "SUBMITTED", label: "SUBMITTED" },
              { value: "UNDER_REVIEW", label: "UNDER_REVIEW" },
              { value: "APPROVED", label: "APPROVED" },
              { value: "RETURNED", label: "RETURNED" }
            ]}
          />
        </div>

        {filteredSurveys.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>No Forms Found</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Select a site above to fill and submit a survey form checklist.
            </p>
          </div>
        ) : (
          <Table headers={["Survey Site", "Assigned Surveyor", "Submitted Date", "Total Assets", "Status", "Actions"]}>
            {filteredSurveys.map((s) => {
              const siteName = s.surveySite?.name || "EV Station";
              const surveyor = s.createdBySurveyor?.name || 
                (s.surveySite?.assignments && s.surveySite.assignments[0]?.surveyor?.name) || 
                "Field Surveyor";
              const dateStr = s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "N/A";
              const totalAssetsCount = (s.chargers?.length || 0) + (s.panels?.length || 0) + (s.transformers?.length || 0) + (s.dgs?.length || 0);

              const isReturned = s.status === "RETURNED";
              return (
                <tr
                  key={s.id}
                  style={isReturned ? {
                    backgroundColor: "rgba(239, 68, 68, 0.04)",
                    borderLeft: "4px solid #ef4444"
                  } : {}}
                >
                  <td><strong>{siteName}</strong></td>
                  <td>{surveyor}</td>
                  <td>{dateStr}</td>
                  <td><strong>{totalAssetsCount}</strong></td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <Link to={`/forms/${s.id}`}>
                        <Button style={{ padding: "4px 10px", fontSize: "12px" }}>
                          👁️ View Form
                        </Button>
                      </Link>

                      <a href={reportService.getExcelReportUrl(s.id)} download target="_blank" rel="noreferrer">
                        <Button variant="secondary" style={{ padding: "4px 10px", fontSize: "12px" }}>
                          📊 Excel
                        </Button>
                      </a>

                      <a href={reportService.getPDFReportUrl(s.id)} download target="_blank" rel="noreferrer">
                        <Button style={{ padding: "4px 10px", fontSize: "12px", backgroundColor: "#3b82f6" }}>
                          📄 PDF
                        </Button>
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>

      {/* Assign Surveyor Modal */}
      {showAssignModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.65)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "var(--card-bg, #1e293b)",
            padding: "24px",
            borderRadius: "12px",
            maxWidth: "480px",
            width: "100%",
            border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>Assign Survey Site</h3>

            {assignError && <p style={{ color: "var(--danger)", marginBottom: "12px" }}>{assignError}</p>}
            {assignSuccess && <p style={{ color: "#10b981", marginBottom: "12px" }}>{assignSuccess}</p>}

            <form onSubmit={handleAssignSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Select2
                label="Select Survey Site"
                value={modalSiteId}
                onChange={(e) => setModalSiteId(e.target.value)}
                options={sites.map((st) => ({ value: st.id, label: st.name }))}
                placeholder="Search / Select Station..."
                required
              />

              <Select2
                label="Select Field Surveyor"
                value={selectedSurveyorId}
                onChange={(e) => setSelectedSurveyorId(e.target.value)}
                options={surveyors.map((sv) => ({ value: sv.id, label: `${sv.name} (${sv.email})` }))}
                placeholder="Search / Select Surveyor..."
                required
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <Button type="button" variant="secondary" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={assignLoading}>
                  {assignLoading ? "Assigning..." : "Confirm Assignment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormsList;
