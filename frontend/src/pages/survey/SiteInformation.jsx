import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import siteService from "../../services/site.service";
import surveyService from "../../services/survey.service";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import GPS from "../../components/common/GPS";
import Loader from "../../components/common/Loader";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const SiteInformation = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [existingSurvey, setExistingSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reduction Confirmation Modal State
  const [reductionModal, setReductionModal] = useState({
    show: false,
    affectedList: [],
  });

  const [form, setForm] = useState({
    surveyDate: new Date().toISOString().split("T")[0],
    surveyTime: new Date().toTimeString().split(" ")[0].substring(0, 5),
    buildingName: "",
    operator: "BluSmart Fleet",
    siteType: "Public Charging Hub",
    country: "India",
    state: "Delhi NCR",
    district: "Gautam Buddha Nagar",
    city: "Noida",
    pincode: "201301",
    latitude: 28.62,
    longitude: 77.37,
    accessPermission: "Approved",
    accessPersonName: "",
    accessPersonMobile: "",
    entryType: "24x7 Open",
    parkingArea: "Basement / Ground",
    waitingArea: "Available",
    internetAvailability: "4G / 5G + Wi-Fi",
    totalChargers: 4,
    totalPanels: 2,
    totalTransformers: 1,
    totalDG: 1,
    remarks: "",
  });

  const fetchAssignmentAndSurvey = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await siteService.getAssignments();
      const found = res.data.assignments.find((a) => a.id === assignmentId);
      setAssignment(found);

      if (found?.surveySiteId) {
        const sRes = await surveyService.getSurveyBySite(found.surveySiteId);
        if (sRes.data?.survey) {
          const s = sRes.data.survey;
          setExistingSurvey(s);
          
          const isLockedByOther = s.firstPageLocked && s.firstPageLockedByUserId !== user?.id;
          const isSurveyLocked = ["SUBMITTED", "UNDER_REVIEW", "APPROVED"].includes(s.status);
          const isReadOnly = isLockedByOther || isSurveyLocked;

          // Only overwrite form inputs if the page becomes read-only
          if (isReadOnly) {
            setForm((prev) => ({
              ...prev,
              surveyDate: s.surveyDate || prev.surveyDate,
              surveyTime: s.surveyTime || prev.surveyTime,
              buildingName: s.buildingName || "",
              operator: s.operator || "BluSmart Fleet",
              city: s.city || "",
              pincode: s.pincode || "",
              latitude: s.latitude !== null && s.latitude !== undefined ? s.latitude : prev.latitude,
              longitude: s.longitude !== null && s.longitude !== undefined ? s.longitude : prev.longitude,
              accessPersonName: s.accessPersonName || "",
              accessPersonMobile: s.accessPersonMobile || "",
              parkingArea: s.parkingArea || "Basement / Ground",
              internetAvailability: s.internetAvailability || "4G / 5G + Wi-Fi",
              totalChargers: s.totalChargers ?? 4,
              totalPanels: s.totalPanels ?? 2,
              totalTransformers: s.totalTransformers ?? 1,
              totalDG: s.totalDG ?? 1,
              remarks: s.remarks || "",
            }));
          } else if (!silent) {
            // First time load fallback
            setForm((prev) => ({
              ...prev,
              surveyDate: s.surveyDate || prev.surveyDate,
              surveyTime: s.surveyTime || prev.surveyTime,
              buildingName: s.buildingName || "",
              operator: s.operator || "BluSmart Fleet",
              city: s.city || "",
              pincode: s.pincode || "",
              latitude: s.latitude !== null && s.latitude !== undefined ? s.latitude : prev.latitude,
              longitude: s.longitude !== null && s.longitude !== undefined ? s.longitude : prev.longitude,
              accessPersonName: s.accessPersonName || "",
              accessPersonMobile: s.accessPersonMobile || "",
              parkingArea: s.parkingArea || "Basement / Ground",
              internetAvailability: s.internetAvailability || "4G / 5G + Wi-Fi",
              totalChargers: s.totalChargers ?? 4,
              totalPanels: s.totalPanels ?? 2,
              totalTransformers: s.totalTransformers ?? 1,
              totalDG: s.totalDG ?? 1,
              remarks: s.remarks || "",
            }));
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentAndSurvey(false);

    // Auto-refresh Step 1 lock state every 10 seconds silently
    const interval = setInterval(() => {
      fetchAssignmentAndSurvey(true);
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, [assignmentId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "number" || ["totalChargers", "totalPanels", "totalTransformers", "totalDG"].includes(name)) {
      e.target.value = e.target.value.replace(/^0+(\d+)/, "$1");
    }
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? (val === "" ? "" : isNaN(val) ? val : Number(val)) : val,
    }));
  };

  const handleBlur = (e) => {
    const { name, value, type } = e.target;
    if (type === "number" || ["totalChargers", "totalPanels", "totalTransformers", "totalDG"].includes(name)) {
      if (value === "") {
        setForm((prev) => ({ ...prev, [name]: 0 }));
      }
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const submitStep1Payload = async () => {
    setSubmitting(true);
    try {
      const res = await surveyService.initiateStep1({
        surveySiteId: assignment.surveySiteId,
        ...form,
        totalChargers: Number(form.totalChargers),
        totalPanels: Number(form.totalPanels),
        totalTransformers: Number(form.totalTransformers),
        totalDG: Number(form.totalDG),
      });
      const sId = res.data?.data?.survey?.id || res.data?.survey?.id || res.data?.id;
      navigate(`/survey/assets/${sId}`);
    } catch (err) {
      if (err.response?.status === 409) {
        fetchAssignmentAndSurvey(true);
      }
      const apiErrors = err.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        const fieldMsgs = apiErrors.map((e) => e.message || `${e.field} is invalid`).join(" | ");
        setError(fieldMsgs);
      } else {
        setError(err.response?.data?.message || "Failed to initiate Step 1 setup");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side Validation Checks
    const validationErrors = [];
    if (!form.surveyDate) {
      validationErrors.push("Survey Date is required");
    } else if (form.surveyDate > todayStr) {
      validationErrors.push("Survey Date cannot be in the future");
    }
    if (!form.surveyTime) validationErrors.push("Survey Time is required");
    if (!form.operator || !form.operator.trim()) validationErrors.push("Operator Name is required and cannot be blank");
    if (!form.city || !form.city.trim()) validationErrors.push("City is required and cannot be blank");
    if (!form.pincode || !/^[1-9][0-9]{5}$/.test(form.pincode.toString().trim())) {
      validationErrors.push("Pincode must be a valid 6-digit Indian pincode");
    }
    if (form.accessPersonMobile && form.accessPersonMobile.toString().trim()) {
      const cleanedMobile = form.accessPersonMobile.toString().replace(/[\s-]/g, "");
      if (!/^(\+91)?[6-9]\d{9}$/.test(cleanedMobile)) {
        validationErrors.push("Access Person Mobile must be a valid 10-digit Indian mobile number");
      }
    }
    if (form.latitude !== null && form.latitude !== "" && form.latitude !== undefined) {
      const lat = Number(form.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        validationErrors.push("Latitude must be a valid coordinate between -90 and 90");
      }
    }
    if (form.longitude !== null && form.longitude !== "" && form.longitude !== undefined) {
      const lng = Number(form.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        validationErrors.push("Longitude must be a valid coordinate between -180 and 180");
      }
    }

    const counts = [
      { field: "Total Chargers Count", val: form.totalChargers, max: 200 },
      { field: "Total Panels Count", val: form.totalPanels, max: 100 },
      { field: "Total Transformers Count", val: form.totalTransformers, max: 50 },
      { field: "Total DG Sets Count", val: form.totalDG, max: 50 },
    ];

    for (const c of counts) {
      if (c.val === "" || c.val === null || c.val === undefined || isNaN(c.val)) {
        validationErrors.push(`${c.field} is required and must be a valid number`);
      } else if (!Number.isInteger(Number(c.val))) {
        validationErrors.push(`${c.field} must be an integer without decimals`);
      } else if (Number(c.val) < 0) {
        validationErrors.push(`${c.field} cannot be negative`);
      } else if (Number(c.val) > c.max) {
        validationErrors.push(`${c.field} cannot exceed ${c.max}`);
      }
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join(" | "));
      return;
    }

    // Check if any count is reduced and affected items contain saved data
    if (existingSurvey) {
      const affectedList = [];

      // Check Chargers
      const reqChargers = Number(form.totalChargers);
      const curChargers = existingSurvey.chargers || [];
      if (reqChargers < curChargers.length) {
        const sortedDesc = [...curChargers].sort((a, b) => b.assetIndex - a.assetIndex);
        const toRemove = sortedDesc.slice(0, curChargers.length - reqChargers);
        toRemove.forEach((item) => {
          const hasData = item.status !== "AVAILABLE" || !!item.serialNumber || !!item.manufacturerId || !!item.powerRating;
          affectedList.push({
            category: "Charger",
            label: `Charger #${item.assetIndex}`,
            oldTotal: curChargers.length,
            newTotal: reqChargers,
            hasData,
          });
        });
      }

      // Check Panels
      const reqPanels = Number(form.totalPanels);
      const curPanels = existingSurvey.panels || [];
      if (reqPanels < curPanels.length) {
        const sortedDesc = [...curPanels].sort((a, b) => b.assetIndex - a.assetIndex);
        const toRemove = sortedDesc.slice(0, curPanels.length - reqPanels);
        toRemove.forEach((item) => {
          const hasData = item.status !== "AVAILABLE" || !!item.capacity || !!item.breakerRating;
          affectedList.push({
            category: "Electrical Panel",
            label: `Panel #${item.assetIndex}`,
            oldTotal: curPanels.length,
            newTotal: reqPanels,
            hasData,
          });
        });
      }

      // Check Transformers
      const reqTransformers = Number(form.totalTransformers);
      const curTransformers = existingSurvey.transformers || [];
      if (reqTransformers < curTransformers.length) {
        const sortedDesc = [...curTransformers].sort((a, b) => b.assetIndex - a.assetIndex);
        const toRemove = sortedDesc.slice(0, curTransformers.length - reqTransformers);
        toRemove.forEach((item) => {
          const hasData = item.status !== "AVAILABLE" || !!item.capacityKVA || !!item.voltageRatio;
          affectedList.push({
            category: "Transformer",
            label: `Transformer #${item.assetIndex}`,
            oldTotal: curTransformers.length,
            newTotal: reqTransformers,
            hasData,
          });
        });
      }

      // Check DG Sets
      const reqDG = Number(form.totalDG);
      const curDG = existingSurvey.dgs || [];
      if (reqDG < curDG.length) {
        const sortedDesc = [...curDG].sort((a, b) => b.assetIndex - a.assetIndex);
        const toRemove = sortedDesc.slice(0, curDG.length - reqDG);
        toRemove.forEach((item) => {
          const hasData = item.status !== "AVAILABLE" || !!item.capacityKVA || !!item.fuelTankLitres;
          affectedList.push({
            category: "DG Set",
            label: `DG #${item.assetIndex}`,
            oldTotal: curDG.length,
            newTotal: reqDG,
            hasData,
          });
        });
      }

      // If any asset being removed has filled data or count is reduced, show confirmation dialog
      const filledAffected = affectedList.filter((a) => a.hasData);
      if (filledAffected.length > 0 || affectedList.length > 0) {
        setReductionModal({
          show: true,
          affectedList,
        });
        return;
      }
    }

    // No reduction of filled data -> proceed directly
    await submitStep1Payload();
  };

  const handleCancelReduction = () => {
    // Revert counts back to existing survey values if available
    if (existingSurvey) {
      setForm((prev) => ({
        ...prev,
        totalChargers: existingSurvey.totalChargers ?? prev.totalChargers,
        totalPanels: existingSurvey.totalPanels ?? prev.totalPanels,
        totalTransformers: existingSurvey.totalTransformers ?? prev.totalTransformers,
        totalDG: existingSurvey.totalDG ?? prev.totalDG,
      }));
    }
    setReductionModal({ show: false, affectedList: [] });
  };

  const handleConfirmReduction = async () => {
    setReductionModal({ show: false, affectedList: [] });
    await submitStep1Payload();
  };

  // Lock background scroll when reduction confirmation modal is active
  useEffect(() => {
    if (reductionModal.show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [reductionModal.show]);

  if (loading) return <Loader />;
  if (!assignment) return <p style={{ padding: "40px", textAlign: "center" }}>Assignment record not found.</p>;

  const isLockedByOther = existingSurvey && existingSurvey.firstPageLocked && existingSurvey.firstPageLockedByUserId !== user?.id;
  const isSurveyLocked = existingSurvey && ["SUBMITTED", "UNDER_REVIEW", "APPROVED"].includes(existingSurvey.status);
  const isReadOnly = isLockedByOther || isSurveyLocked;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "6px" }}>Step 1: Complete Site Information & Asset Counts</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "20px", fontSize: "14px" }}>
        Enter station details and total asset counts. System will automatically generate individual asset checklists.
      </p>

      {existingSurvey?.firstPageLocked && (
        <div style={{
          padding: "16px",
          backgroundColor: isLockedByOther ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
          border: isLockedByOther ? "1px solid var(--danger)" : "1px solid #10b981",
          borderRadius: "8px",
          color: isLockedByOther ? "var(--danger)" : "#10b981",
          marginBottom: "20px",
          fontSize: "14px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span>
            {isLockedByOther 
              ? `🔒 First page completed by ${existingSurvey.firstPageLockedBy || "another surveyor"} on ${new Date(existingSurvey.firstPageLockedAt).toLocaleString()}. This section is locked and can only be viewed.`
              : `✏️ You completed the first page. You can still modify the counts and details.`}
          </span>
        </div>
      )}

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

      <Card style={{ marginBottom: "20px" }}>
        <form onSubmit={handleNext}>
          <div style={{ paddingBottom: "16px", marginBottom: "16px", borderBottom: "1px solid var(--border-color)" }}>
            <h3 style={{ fontSize: "18px", color: "var(--secondary)" }}>Station Name: {assignment.surveySite.name}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
              Address: {assignment.surveySite.address}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <Input label="Survey Date" name="surveyDate" type="date" value={form.surveyDate} onChange={handleChange} max={todayStr} disabled={isReadOnly} required />
            <Input label="Survey Time" name="surveyTime" type="time" value={form.surveyTime} onChange={handleChange} disabled={isReadOnly} required />
            <Input label="Building / Landmark Name" name="buildingName" value={form.buildingName} onChange={handleChange} placeholder="e.g. Tower B Parking Lot" disabled={isReadOnly} />
            <Input label="Operator Name" name="operator" value={form.operator} onChange={handleChange} disabled={isReadOnly} required />
            <Input label="City" name="city" value={form.city} onChange={handleChange} disabled={isReadOnly} required />
            <Input label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} disabled={isReadOnly} required />
            
            {!isReadOnly && (
              <div style={{ gridColumn: "1 / -1" }}>
                <GPS onCoordinatesFetched={(coords) => setForm((prev) => ({ ...prev, latitude: coords.latitude, longitude: coords.longitude }))} />
              </div>
            )}

            <Input label="Site Access Person Name" name="accessPersonName" value={form.accessPersonName} onChange={handleChange} placeholder="e.g. Security Supervisor" disabled={isReadOnly} />
            <Input label="Access Person Mobile" name="accessPersonMobile" value={form.accessPersonMobile} onChange={handleChange} placeholder="e.g. +91 9876543210" disabled={isReadOnly} />

            <Select
              label="Parking Area Type"
              name="parkingArea"
              value={form.parkingArea}
              onChange={handleChange}
              disabled={isReadOnly}
              options={[
                { value: "Basement / Ground", label: "Basement / Ground Covered" },
                { value: "Open Surface", label: "Open Surface Parking" },
                { value: "Multi-Level Parking (MLCP)", label: "Multi-Level Parking (MLCP)" },
              ]}
            />

            <Select
              label="Internet Availability"
              name="internetAvailability"
              value={form.internetAvailability}
              onChange={handleChange}
              disabled={isReadOnly}
              options={[
                { value: "Only 4G / 5G", label: "Only 4G / 5G" },
                { value: "Only Wi-Fi", label: "Only Wi-Fi" },
                { value: "4G / 5G + Wi-Fi", label: "4G / 5G + Wi-Fi" },
                { value: "No Connectivity / Weak Signal", label: "No Connectivity / Weak Signal" },
              ]}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginTop: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
            <Input label="Total Chargers Count" name="totalChargers" type="number" min="0" max="200" value={form.totalChargers} onChange={handleChange} onBlur={handleBlur} disabled={isReadOnly} required />
            <Input label="Total Panels Count" name="totalPanels" type="number" min="0" max="100" value={form.totalPanels} onChange={handleChange} onBlur={handleBlur} disabled={isReadOnly} required />
            <Input label="Total Transformers Count" name="totalTransformers" type="number" min="0" max="50" value={form.totalTransformers} onChange={handleChange} onBlur={handleBlur} disabled={isReadOnly} required />
            <Input label="Total DG Sets Count" name="totalDG" type="number" min="0" max="50" value={form.totalDG} onChange={handleChange} onBlur={handleBlur} disabled={isReadOnly} required />
          </div>

          <Input label="Site Remarks & Access Instructions" name="remarks" value={form.remarks} onChange={handleChange} placeholder="Landmarks, safety instructions, gate permissions..." disabled={isReadOnly} />

          <div className="responsive-actions-bar">
            <Button type="button" variant="secondary" onClick={() => navigate("/survey/assigned")}>
              ← Back to Assigned Sites
            </Button>
            {isReadOnly ? (
              <Button type="button" onClick={() => navigate(`/survey/assets/${existingSurvey.id}`)}>
                Next →
              </Button>
            ) : (
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving & Syncing..." : "Save & Next →"}
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* REDUCTION CONFIRMATION MODAL */}
      {reductionModal.show && createPortal(
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--danger)", marginBottom: "12px" }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
                Confirm Asset Count Reduction
              </h3>
            </div>

            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "16px" }}>
              You are reducing asset counts on this survey. The following highest-numbered assets will be removed:
            </p>

            <div style={{
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "20px",
              maxHeight: "180px",
              overflowY: "auto",
              border: "1px solid var(--border-color)"
            }}>
              {reductionModal.affectedList.map((item, idx) => (
                <div key={idx} style={{ fontSize: "13px", padding: "4px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px", borderBottom: idx < reductionModal.affectedList.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <span><strong>{item.label}</strong> ({item.category})</span>
                  {item.hasData ? (
                    <span style={{ color: "var(--danger)", fontWeight: "700", fontSize: "11px", backgroundColor: "rgba(239, 68, 68, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
                      ⚠️ Contains Saved Data
                    </span>
                  ) : (
                    <span style={{ color: "var(--text-secondary)", fontSize: "11px" }}>Empty</span>
                  )}
                </div>
              ))}
            </div>

            <p style={{ fontSize: "13px", color: "var(--danger)", fontWeight: "600", marginBottom: "20px" }}>
              Are you sure you want to continue? Lower-numbered assets and their data will be preserved intact.
            </p>

            <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", flexWrap: "wrap" }}>
              <Button variant="secondary" onClick={handleCancelReduction}>
                Cancel
              </Button>
              <Button onClick={handleConfirmReduction} style={{ backgroundColor: "var(--danger)" }}>
                Confirm Reduction
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SiteInformation;
