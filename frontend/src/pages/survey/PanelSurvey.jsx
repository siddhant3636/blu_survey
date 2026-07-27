import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";
import surveyService from "../../services/survey.service";
import masterService from "../../services/master.service";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Select2 from "../../components/common/Select2";
import Button from "../../components/common/Button";
import GPS from "../../components/common/GPS";
import Loader from "../../components/common/Loader";
import SinglePhotoUploader from "../../components/common/SinglePhotoUploader";
import { Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const PANEL_PHOTO_SECTIONS = [
  { id: "Front View", label: "Front View", icon: "📷", desc: "Front view of Panel Board door" },
  { id: "Left View", label: "Left View", icon: "⬅️", desc: "Left side clearance view" },
  { id: "Right View", label: "Right View", icon: "➡️", desc: "Right side clearance view" },
];

const getSectionLabel = (key) => {
  const labels = {
    mainDistribution: "Main Distribution Charger Panel",
    fastSlow: "Fast + Slow Charger Panel",
    fast: "Fast Charger Panel",
    slow: "Slow Charger Panel"
  };
  return labels[key] || key;
};

const PanelSurvey = () => {
  const { surveyId } = useParams();
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get("assetId");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [assetIndex, setAssetIndex] = useState(1);
  
  const [isLockedByOther, setIsLockedByOther] = useState(false);
  const [lockOwnerName, setLockOwnerName] = useState("");

  // Dynamic Master Dropdown Lists
  const [mccb4pRatings, setMccb4pRatings] = useState([]);
  const [makeOptions, setMakeOptions] = useState([]);

  // Dynamic Panel Sections state
  const [panelSections, setPanelSections] = useState({
    mainDistribution: [],
    fastSlow: [],
    fast: [],
    slow: [],
  });

  const [sectionCounts, setSectionCounts] = useState({
    mainDistribution: 0,
    fastSlow: 0,
    fast: 0,
    slow: 0,
  });

  // Reduction confirmation modal state
  const [reductionModal, setReductionModal] = useState({
    show: false,
    type: "", // "panel" or "mccb"
    sectionKey: "",
    panelIndex: null,
    oldVal: 0,
    newVal: 0,
    label: "",
    removedCount: 0,
  });

  const [legacyBreaker, setLegacyBreaker] = useState("");

  const [form, setForm] = useState({
    name: "",
    capacity: "",
    incomingSource: "",
    cableSize: "",
  });

  // Panel Photos & Camera state
  const [panelPhotos, setPanelPhotos] = useState([]);
  const [surveyStatus, setSurveyStatus] = useState("DRAFT");
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });

  const fetchPhotos = async () => {
    try {
      const pRes = await surveyService.getPhotos(surveyId);
      setPanelPhotos(pRes.data?.photos || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const lockAsset = async () => {
      if (!assetId) return;
      try {
        await surveyService.lockAsset("panel", assetId);
        setIsLockedByOther(false);
      } catch (err) {
        if (err.response?.status === 409) {
          setIsLockedByOther(true);
          setLockOwnerName(err.response?.data?.message || "another surveyor");
        } else {
          console.error("Lock error:", err);
        }
      }
    };
    lockAsset();
  }, [assetId]);

  useEffect(() => {
    const isReadOnlyLocal = isLockedByOther || ["SUBMITTED", "UNDER_REVIEW", "APPROVED"].includes(surveyStatus);
    if (isReadOnlyLocal || !assetId) return;

    const interval = setInterval(async () => {
      try {
        await surveyService.lockAsset("panel", assetId);
      } catch (err) {
        console.error("Failed to renew lock:", err);
      }
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [assetId, isLockedByOther, surveyStatus]);

  useEffect(() => {
    return () => {
      const isReadOnlyLocal = isLockedByOther || ["SUBMITTED", "UNDER_REVIEW", "APPROVED"].includes(surveyStatus);
      if (!isReadOnlyLocal && assetId) {
        surveyService.unlockAsset("panel", assetId).catch(console.error);
      }
    };
  }, [assetId, isLockedByOther, surveyStatus]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surveyRes, eqRes] = await Promise.all([
          surveyService.getSurvey(surveyId),
          masterService.getEquipments({ activeOnly: true })
        ]);

        const allEquipments = eqRes.data.equipments || [];
        
        setMccb4pRatings(
          allEquipments
            .filter((e) => e.description === "MCCB Rating" || e.description === "MCCB 4P Rating")
            .map((e) => ({ value: e.name, label: e.name }))
        );

        setMakeOptions(
          allEquipments
            .filter((e) => e.description === "MCCB MAKE" || e.description === "MCB MAKE")
            .map((e) => ({ value: e.name, label: e.name }))
        );

        const sData = surveyRes.data?.data?.survey || surveyRes.data?.survey;
        if (sData?.status) {
          setSurveyStatus(sData.status);
        }
        const targetAsset = (sData?.panels || []).find((p) => p.id === assetId);
        if (targetAsset) {
          setAssetIndex(targetAsset.assetIndex);
          
          let parsedRating = targetAsset.breakerRating || "";
          let parsedSections = {
            mainDistribution: [],
            fastSlow: [],
            fast: [],
            slow: [],
          };

          try {
            if (parsedRating.startsWith("{")) {
              parsedSections = JSON.parse(parsedRating);
            } else if (parsedRating) {
              setLegacyBreaker(parsedRating);
            }
          } catch (e) {
            console.error("Failed to parse breakerRating as JSON", e);
            if (parsedRating) setLegacyBreaker(parsedRating);
          }

          setSectionCounts({
            mainDistribution: parsedSections.mainDistribution?.length || 0,
            fastSlow: parsedSections.fastSlow?.length || 0,
            fast: parsedSections.fast?.length || 0,
            slow: parsedSections.slow?.length || 0,
          });

          // Ensure every loaded panel has mccbCountInput initialized
          const sectionKeys = ["mainDistribution", "fastSlow", "fast", "slow"];
          sectionKeys.forEach((key) => {
            const list = parsedSections[key] || [];
            list.forEach((p) => {
              p.mccbCountInput = p.mccb4p?.length || 0;
            });
          });

          setPanelSections(parsedSections);

          setForm({
            name: targetAsset.name || `Panel Board #${targetAsset.assetIndex}`,
            capacity: targetAsset.capacity || "",
            incomingSource: targetAsset.incomingSource || "",
            cableSize: targetAsset.cableSize || "",
          });

          if (targetAsset.latitude && targetAsset.longitude) {
            setCoordinates({
              latitude: targetAsset.latitude,
              longitude: targetAsset.longitude,
            });
          }
        }

        fetchPhotos();
      } catch (err) {
        setError("Failed to load panel survey details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [surveyId, assetId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handlePanelCountChange = (sectionKey, rawVal) => {
    if (rawVal === "") {
      setSectionCounts((prev) => ({ ...prev, [sectionKey]: "" }));
      return;
    }

    const cleanVal = String(rawVal).replace(/[^0-9]/g, "");
    const newCount = cleanVal === "" ? 0 : Math.max(0, parseInt(cleanVal, 10));

    setSectionCounts((prev) => ({ ...prev, [sectionKey]: newCount }));

    const currentList = panelSections[sectionKey] || [];
    const currentCount = currentList.length;

    if (newCount > currentCount) {
      const expanded = [...currentList];
      while (expanded.length < newCount) {
        expanded.push({
          name: "",
          mccb4p: []
        });
      }
      setPanelSections((prev) => ({ ...prev, [sectionKey]: expanded }));
    } else if (newCount < currentCount) {
      const toRemove = currentList.slice(newCount);
      const hasData = toRemove.some((p) => {
        const hasName = p.name && p.name.trim() !== "";
        const hasMccbs = p.mccb4p && p.mccb4p.some((m) => (m.rating && m.rating.trim() !== "") || (m.brand && m.brand.trim() !== ""));
        return hasName || hasMccbs;
      });

      if (hasData) {
        setReductionModal({
          show: true,
          type: "panel",
          sectionKey,
          panelIndex: null,
          oldVal: currentCount,
          newVal: newCount,
          label: getSectionLabel(sectionKey),
          removedCount: currentCount - newCount,
        });
      } else {
        const truncated = currentList.slice(0, newCount);
        setPanelSections((prev) => ({ ...prev, [sectionKey]: truncated }));
      }
    }
  };

  const handlePanelCountBlur = (sectionKey) => {
    const currentVal = sectionCounts[sectionKey];
    if (currentVal === "") {
      const currentList = panelSections[sectionKey] || [];
      const currentCount = currentList.length;
      if (currentCount > 0) {
        const hasData = currentList.some((p) => {
          const hasName = p.name && p.name.trim() !== "";
          const hasMccbs = p.mccb4p && p.mccb4p.some((m) => (m.rating && m.rating.trim() !== "") || (m.brand && m.brand.trim() !== ""));
          return hasName || hasMccbs;
        });

        if (hasData) {
          setReductionModal({
            show: true,
            type: "panel",
            sectionKey,
            panelIndex: null,
            oldVal: currentCount,
            newVal: 0,
            label: getSectionLabel(sectionKey),
            removedCount: currentCount,
          });
        } else {
          setSectionCounts((prev) => ({ ...prev, [sectionKey]: 0 }));
          setPanelSections((prev) => ({ ...prev, [sectionKey]: [] }));
        }
      } else {
        setSectionCounts((prev) => ({ ...prev, [sectionKey]: 0 }));
      }
    }
  };

  const handleMccbCountChange = (sectionKey, panelIndex, rawVal) => {
    const currentList = panelSections[sectionKey] || [];
    const panel = currentList[panelIndex];
    if (!panel) return;

    if (rawVal === "") {
      const updatedList = currentList.map((p, idx) =>
        idx === panelIndex ? { ...p, mccbCountInput: "" } : p
      );
      setPanelSections((prev) => ({ ...prev, [sectionKey]: updatedList }));
      return;
    }

    const cleanVal = String(rawVal).replace(/[^0-9]/g, "");
    const newCount = cleanVal === "" ? 0 : Math.max(0, parseInt(cleanVal, 10));

    const currentMccbList = panel.mccb4p || [];
    const currentCount = currentMccbList.length;

    const updatePanelMccbCount = (count, list) => {
      const updatedList = currentList.map((p, idx) =>
        idx === panelIndex ? { ...p, mccbCountInput: count, mccb4p: list } : p
      );
      setPanelSections((prev) => ({ ...prev, [sectionKey]: updatedList }));
    };

    if (newCount > currentCount) {
      const expanded = [...currentMccbList];
      while (expanded.length < newCount) {
        expanded.push({ rating: "", brand: "" });
      }
      updatePanelMccbCount(newCount, expanded);
    } else if (newCount < currentCount) {
      const toRemove = currentMccbList.slice(newCount);
      const hasData = toRemove.some((m) => (m.rating && m.rating.trim() !== "") || (m.brand && m.brand.trim() !== ""));

      if (hasData) {
        const updatedList = currentList.map((p, idx) =>
          idx === panelIndex ? { ...p, mccbCountInput: newCount } : p
        );
        setPanelSections((prev) => ({ ...prev, [sectionKey]: updatedList }));

        setReductionModal({
          show: true,
          type: "mccb",
          sectionKey,
          panelIndex,
          oldVal: currentCount,
          newVal: newCount,
          label: `${getSectionLabel(sectionKey)} #${panelIndex + 1} Breakers`,
          removedCount: currentCount - newCount,
        });
      } else {
        const truncated = currentMccbList.slice(0, newCount);
        updatePanelMccbCount(newCount, truncated);
      }
    }
  };

  const handleMccbCountBlur = (sectionKey, panelIndex) => {
    const currentList = panelSections[sectionKey] || [];
    const panel = currentList[panelIndex];
    if (!panel) return;

    if (panel.mccbCountInput === "") {
      const currentMccbList = panel.mccb4p || [];
      const currentCount = currentMccbList.length;
      if (currentCount > 0) {
        const hasData = currentMccbList.some((m) => (m.rating && m.rating.trim() !== "") || (m.brand && m.brand.trim() !== ""));
        if (hasData) {
          setReductionModal({
            show: true,
            type: "mccb",
            sectionKey,
            panelIndex,
            oldVal: currentCount,
            newVal: 0,
            label: `${getSectionLabel(sectionKey)} #${panelIndex + 1} Breakers`,
            removedCount: currentCount,
          });
        } else {
          const updatedList = currentList.map((p, idx) =>
            idx === panelIndex ? { ...p, mccbCountInput: 0, mccb4p: [] } : p
          );
          setPanelSections((prev) => ({ ...prev, [sectionKey]: updatedList }));
        }
      } else {
        const updatedList = currentList.map((p, idx) =>
          idx === panelIndex ? { ...p, mccbCountInput: 0 } : p
        );
        setPanelSections((prev) => ({ ...prev, [sectionKey]: updatedList }));
      }
    }
  };

  const handlePanelNameChange = (sectionKey, panelIndex, nameVal) => {
    const currentList = panelSections[sectionKey] || [];
    const updatedList = currentList.map((p, idx) =>
      idx === panelIndex ? { ...p, name: nameVal } : p
    );
    setPanelSections((prev) => ({ ...prev, [sectionKey]: updatedList }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`${sectionKey}_${panelIndex}_name`];
      return next;
    });
  };

  const handleMccbFieldChange = (sectionKey, panelIndex, mccbIndex, fieldKey, val) => {
    const currentList = panelSections[sectionKey] || [];
    const panel = currentList[panelIndex];
    if (!panel) return;

    const mccbList = panel.mccb4p || [];
    const updatedMccbList = mccbList.map((m, idx) =>
      idx === mccbIndex ? { ...m, [fieldKey]: val } : m
    );

    const updatedList = currentList.map((p, idx) =>
      idx === panelIndex ? { ...p, mccb4p: updatedMccbList } : p
    );

    setPanelSections((prev) => ({ ...prev, [sectionKey]: updatedList }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`${sectionKey}_${panelIndex}_mccb_${mccbIndex}_${fieldKey}`];
      return next;
    });
  };

  const handleConfirmReduction = () => {
    const { type, sectionKey, panelIndex, newVal } = reductionModal;
    const currentList = panelSections[sectionKey] || [];

    if (type === "panel") {
      const truncated = currentList.slice(0, newVal);
      setPanelSections((prev) => ({ ...prev, [sectionKey]: truncated }));
      setSectionCounts((prev) => ({ ...prev, [sectionKey]: newVal }));
    } else if (type === "mccb") {
      const panel = currentList[panelIndex];
      if (panel) {
        const currentMccbList = panel.mccb4p || [];
        const truncated = currentMccbList.slice(0, newVal);
        const updatedList = currentList.map((p, idx) =>
          idx === panelIndex ? { ...p, mccb4p: truncated, mccbCountInput: newVal } : p
        );
        setPanelSections((prev) => ({ ...prev, [sectionKey]: updatedList }));
      }
    }

    setReductionModal({ show: false, type: "", sectionKey: "", panelIndex: null, oldVal: 0, newVal: 0, label: "", removedCount: 0 });
  };

  const handleCancelReduction = () => {
    const { type, sectionKey, panelIndex, oldVal } = reductionModal;
    if (type === "panel") {
      setSectionCounts((prev) => ({ ...prev, [sectionKey]: oldVal }));
    } else if (type === "mccb") {
      setPanelSections((prev) => {
        const currentList = prev[sectionKey] || [];
        const updatedList = currentList.map((p, idx) =>
          idx === panelIndex ? { ...p, mccbCountInput: oldVal } : p
        );
        return { ...prev, [sectionKey]: updatedList };
      });
    }
    setReductionModal({ show: false, type: "", sectionKey: "", panelIndex: null, oldVal: 0, newVal: 0, label: "", removedCount: 0 });
  };

  const findMatchedPhoto = (secLabel) => {
    const targetLabel = secLabel.toLowerCase();
    const expectedCategory = `panel #${assetIndex} - ${targetLabel}`;
    return panelPhotos.find((p) => {
      const name = (p.category?.name || "").toLowerCase();
      if (name === expectedCategory) return true;
      if (name.includes(targetLabel)) {
        if (name.includes(`#${assetIndex}`) || name.includes(`panel ${assetIndex}`) || name.includes(`panel_${assetIndex}`)) {
          return true;
        }
        if (panelPhotos.length <= 3) return true;
      }
      return false;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name || !form.name.trim()) {
      newErrors.name = "Panel Board Name / Tag is required.";
    }

    if (
      coordinates.latitude === null ||
      coordinates.longitude === null ||
      isNaN(coordinates.latitude) ||
      isNaN(coordinates.longitude) ||
      coordinates.latitude < -90 ||
      coordinates.latitude > 90 ||
      coordinates.longitude < -180 ||
      coordinates.longitude > 180
    ) {
      newErrors.gps = "Valid GPS location coordinates are required. Please click 'Fetch Location'.";
    }

    PANEL_PHOTO_SECTIONS.forEach((sec) => {
      if (!findMatchedPhoto(sec.label)) {
        newErrors[`photo_${sec.label}`] = `${sec.label} photo is required.`;
      }
    });

    // Validate the 4 dynamic panel sections
    const sections = ["mainDistribution", "fastSlow", "fast", "slow"];
    sections.forEach((secKey) => {
      const list = panelSections[secKey] || [];
      list.forEach((panel, pIdx) => {
        if (!panel.name || !panel.name.trim()) {
          newErrors[`${secKey}_${pIdx}_name`] = "Panel Name is required.";
        }
        if (panel.mccb4p) {
          panel.mccb4p.forEach((mccb, mIdx) => {
            if (!mccb.rating || !mccb.rating.trim()) {
              newErrors[`${secKey}_${pIdx}_mccb_${mIdx}_rating`] = "Rating is required.";
            }
            if (!mccb.brand || !mccb.brand.trim()) {
              newErrors[`${secKey}_${pIdx}_mccb_${mIdx}_brand`] = "Brand/Maker is required.";
            }
          });
        }
      });
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      const elem = document.getElementById(`field-${firstKey}`) || document.getElementsByName(firstKey)[0];
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth", block: "center" });
        if (elem.focus) elem.focus();
      }
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const cleanedSections = {};
      Object.keys(panelSections).forEach((key) => {
        cleanedSections[key] = (panelSections[key] || []).map((panel) => {
          const { mccbCountInput, ...rest } = panel;
          return rest;
        });
      });

      const payload = {
        name: form.name.trim(),
        capacity: form.capacity.trim() || null,
        incomingSource: form.incomingSource.trim() || null,
        cableSize: form.cableSize.trim() || null,
        breakerRating: JSON.stringify(cleanedSections),
        latitude: parseFloat(coordinates.latitude),
        longitude: parseFloat(coordinates.longitude),
      };

      await surveyService.saveAssetData("panel", assetId, payload);
      navigate(`/survey/assets/${surveyId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save panel survey");
    } finally {
      setSubmitting(false);
    }
  };

  const isReadOnly = ["SUBMITTED", "UNDER_REVIEW", "APPROVED"].includes(surveyStatus);

  if (loading) return <Loader />;

  if (isLockedByOther) {
    return (
      <div style={{ maxWidth: "500px", margin: "80px auto", textAlign: "center" }}>
        <Card style={{ border: "1px solid var(--danger)", padding: "24px" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔒</div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--danger)", marginBottom: "12px" }}>Access Denied</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
            This form is currently being filled by {lockOwnerName || "another surveyor"}. To prevent concurrent edits, you cannot view or edit this form while it is locked.
          </p>
          <Button variant="secondary" onClick={() => navigate(`/survey/assets/${surveyId}`)}>
            Back to Assets Matrix
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Electrical Panel #{assetIndex} Survey Form</h2>
        <Button variant="secondary" onClick={() => navigate(`/survey/assets/${surveyId}`)}>Back to Matrix</Button>
      </div>

      {error && (
        <div style={{ padding: "12px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", borderRadius: "8px", color: "var(--danger)", marginBottom: "16px", fontSize: "14px" }}>
          ⚠️ {error}
        </div>
      )}

      {legacyBreaker && (
        <div style={{ padding: "12px", backgroundColor: "rgba(224, 242, 254, 0.1)", border: "1px solid #38bdf8", borderRadius: "8px", color: "#0284c7", marginBottom: "16px", fontSize: "13px" }}>
          ℹ️ Legacy Breaker Configured: <strong>{legacyBreaker}</strong>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          <div id="field-name">
            <Input label="Panel Board Name / Tag" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. LT Panel Board 1" error={errors.name} disabled={isReadOnly} />
          </div>

          <Input label="Capacity Rating (e.g. 250A, 400A TPN)" name="capacity" value={form.capacity} onChange={handleChange} placeholder="e.g. 400A TPN" disabled={isReadOnly} />
          <Input label="Incoming Feeder Source" name="incomingSource" value={form.incomingSource} onChange={handleChange} placeholder="e.g. Transformer 1 LT Side" disabled={isReadOnly} />
          
          {/* ⚡ Four Dynamic Panel Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>
              ⚡ Breaker Panels Configuration
            </h3>
            {Object.keys(panelSections).map((secKey) => {
              const list = panelSections[secKey] || [];
              const label = getSectionLabel(secKey);

              return (
                <div key={secKey} style={{ backgroundColor: "rgba(255,255,255,0.01)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#6366f1" }}>
                      {label}
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Number of Panels:</span>
                      <input
                        type="number"
                        min="0"
                        value={sectionCounts[secKey]}
                        disabled={isReadOnly}
                        onChange={(e) => {
                          e.target.value = e.target.value.replace(/^0+(\d+)/, "$1");
                          handlePanelCountChange(secKey, e.target.value);
                        }}
                        onBlur={() => handlePanelCountBlur(secKey)}
                        style={{
                          width: "60px",
                          padding: "6px 8px",
                          backgroundColor: "var(--card-bg)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "6px",
                          color: "var(--text-primary)",
                          outline: "none",
                          textAlign: "center"
                        }}
                      />
                    </div>
                  </div>

                  {list.map((panel, pIdx) => {
                    return (
                      <div key={pIdx} style={{ backgroundColor: "rgba(255,255,255,0.02)", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)", marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <strong style={{ fontSize: "13px" }}>{label} #{pIdx + 1}</strong>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginBottom: "12px" }}>
                          <div id={`field-${secKey}_${pIdx}_name`}>
                            <Input
                              label="Panel Name / Tag *"
                              value={panel.name || ""}
                              onChange={(e) => handlePanelNameChange(secKey, pIdx, e.target.value)}
                              placeholder="e.g. MDB-01"
                              error={errors[`${secKey}_${pIdx}_name`]}
                              disabled={isReadOnly}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "8px" }}>
                              MCCB 4P Count
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={panel.mccbCountInput !== undefined ? panel.mccbCountInput : (panel.mccb4p?.length || 0)}
                              disabled={isReadOnly}
                              onChange={(e) => {
                                e.target.value = e.target.value.replace(/^0+(\d+)/, "$1");
                                handleMccbCountChange(secKey, pIdx, e.target.value);
                              }}
                              onBlur={() => handleMccbCountBlur(secKey, pIdx)}
                              style={{
                                width: "100%",
                                padding: "12px 16px",
                                backgroundColor: "var(--card-bg)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "var(--border-radius)",
                                color: "var(--text-primary)",
                                outline: "none",
                                fontSize: "14px"
                              }}
                            />
                          </div>
                        </div>

                        {(panel.mccb4p || []).map((mccb, mIdx) => {
                          return (
                            <div key={mIdx} style={{ backgroundColor: "rgba(0,0,0,0.1)", padding: "12px", borderRadius: "6px", border: "1px solid var(--border-color)", marginBottom: "8px" }}>
                              <div style={{ fontSize: "12px", fontWeight: "700", marginBottom: "8px" }}>
                                MCCB 4P #{mIdx + 1}
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
                                <div id={`field-${secKey}_${pIdx}_mccb_${mIdx}_rating`}>
                                  <Select2
                                    label="Rating *"
                                    value={mccb.rating || ""}
                                    onChange={(e) => handleMccbFieldChange(secKey, pIdx, mIdx, "rating", e.target.value)}
                                    options={mccb4pRatings}
                                    placeholder="Select Rating..."
                                    error={errors[`${secKey}_${pIdx}_mccb_${mIdx}_rating`]}
                                    disabled={isReadOnly}
                                  />
                                </div>
                                <div id={`field-${secKey}_${pIdx}_mccb_${mIdx}_brand`}>
                                  <Select2
                                    label="Brand / Maker *"
                                    value={mccb.brand || ""}
                                    onChange={(e) => handleMccbFieldChange(secKey, pIdx, mIdx, "brand", e.target.value)}
                                    options={makeOptions}
                                    placeholder="Select Brand..."
                                    error={errors[`${secKey}_${pIdx}_mccb_${mIdx}_brand`]}
                                    disabled={isReadOnly}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <Input label="Incoming Cable Size & Specification" name="cableSize" value={form.cableSize} onChange={handleChange} placeholder="e.g. 3.5C x 240 sqmm Armoured Al" disabled={isReadOnly} />

          {/* 📍 GPS Tagging Section */}
          <div id="field-gps" style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "700" }}>📍 GPS Location Tagging <span style={{ color: "var(--danger)" }}>*</span></h4>
            </div>
            {!isReadOnly ? (
              <GPS onCoordinatesFetched={(c) => { setCoordinates(c); setErrors((prev) => ({ ...prev, gps: null })); }} />
            ) : (
              coordinates.latitude && (
                <div style={{ padding: "10px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "6px", fontSize: "13px" }}>
                  Tagged Location: Lat {coordinates.latitude.toFixed(6)}, Lng {coordinates.longitude.toFixed(6)}
                </div>
              )
            )}
            {errors.gps && <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "6px" }}>{errors.gps}</p>}
          </div>

          {/* 📷 Panel Photo Upload Section (Front, Left, Right) */}
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>
              📷 Upload Panel #{assetIndex} Photos (Front, Left, Right) <span style={{ color: "var(--danger)" }}>*</span>
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px" }}>
              Capture 3 required angle photos of this electrical panel.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginTop: "12px" }}>
              {PANEL_PHOTO_SECTIONS.map((sec) => {
                const matched = findMatchedPhoto(sec.label);
                const validationError = errors[`photo_${sec.label}`];

                return (
                  <SinglePhotoUploader
                    key={sec.id}
                    surveyId={surveyId}
                    categoryId={`Panel #${assetIndex} - ${sec.label}`}
                    label={sec.label}
                    icon={sec.icon}
                    coordinates={coordinates}
                    matchedPhoto={matched}
                    onUploadSuccess={fetchPhotos}
                    onDeleteSuccess={fetchPhotos}
                    validationError={validationError}
                    readOnly={isReadOnly}
                  />
                );
              })}
            </div>
          </div>
          
          {!isReadOnly && (
            <Button type="submit" disabled={submitting} style={{ width: "100%", marginTop: "24px" }}>
              {submitting ? "Saving Panel Survey..." : `Save & Complete Panel #${assetIndex} Checklist`}
            </Button>
          )}
        </form>
      </Card>

      {/* ⚠️ REDUCTION CONFIRMATION MODAL */}
      {reductionModal.show && createPortal(
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--danger)", marginBottom: "12px" }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
                Confirm Count Reduction
              </h3>
            </div>

            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "16px" }}>
              You are reducing the count for <strong>{reductionModal.label}</strong> from <strong>{reductionModal.oldVal}</strong> to <strong>{reductionModal.newVal}</strong>.
            </p>

            <div style={{
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "20px",
              border: "1px solid var(--border-color)",
              color: "var(--danger)",
              fontSize: "13px",
              fontWeight: "600"
            }}>
              ⚠️ The last {reductionModal.removedCount} configured item {reductionModal.removedCount === 1 ? "" : "s"} will be permanently removed.
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Do you want to continue? Lower-numbered records will be preserved intact.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", flexWrap: "wrap" }}>
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

export default PanelSurvey;
