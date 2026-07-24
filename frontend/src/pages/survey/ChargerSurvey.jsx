import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import surveyService from "../../services/survey.service";
import masterService from "../../services/master.service";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Select2 from "../../components/common/Select2";
import Button from "../../components/common/Button";
import Camera from "../../components/common/Camera";
import GPS from "../../components/common/GPS";
import Loader from "../../components/common/Loader";
import { useUpload } from "../../hooks/useUpload";
import { Camera as CameraIcon, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";

const CHARGER_PHOTO_SECTIONS = [
  { id: "Front View", label: "Front View", icon: "📷", desc: "Front view of Charger cabinet & display screen" },
  { id: "Left View", label: "Left View", icon: "⬅️", desc: "Left side clearance & ventilation view" },
  { id: "Right View", label: "Right View", icon: "➡️", desc: "Right side clearance & cable holster view" },
];

const parseBreakerData = (raw) => {
  if (!raw) return { count: 0, types: [] };
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && Array.isArray(parsed.types)) {
      return {
        count: Number(parsed.count ?? parsed.types.length ?? 0),
        types: parsed.types.map((t) => String(t || "")),
      };
    }
    if (Array.isArray(parsed)) {
      return { count: parsed.length, types: parsed.map((t) => String(t || "")) };
    }
    if (typeof parsed === "string" && parsed.trim() !== "") {
      return { count: 1, types: [parsed.trim()] };
    }
  } catch (e) {
    if (typeof raw === "string" && raw.trim() !== "") {
      return { count: 1, types: [raw.trim()] };
    }
  }
  return { count: 0, types: [] };
};

const ChargerSurvey = () => {
  const { surveyId } = useParams();
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get("assetId");
  const navigate = useNavigate();

  const [manufacturers, setManufacturers] = useState([]);
  const [models, setModels] = useState([]);
  const [connectors, setConnectors] = useState([]);
  const [capacityOptions, setCapacityOptions] = useState([]);
  const [mccb4pOptions, setMccb4pOptions] = useState([]);
  const [mcb2pOptions, setMcb2pOptions] = useState([]);
  const [mcb4pOptions, setMcb4pOptions] = useState([]);
  const [mccbMakerOptions, setMccbMakerOptions] = useState([]);
  const [mcbMakerOptions, setMcbMakerOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [assetIndex, setAssetIndex] = useState(1);

  // Breaker state (Count + Ratings Array)
  const [mccb4pCount, setMccb4pCount] = useState(0);
  const [mccb4pTypes, setMccb4pTypes] = useState([]);
  const [mcb2pCount, setMcb2pCount] = useState(0);
  const [mcb2pTypes, setMcb2pTypes] = useState([]);
  const [mcb4pCount, setMcb4pCount] = useState(0);
  const [mcb4pTypes, setMcb4pTypes] = useState([]);

  // Reduction confirmation modal state
  const [reductionModal, setReductionModal] = useState({
    show: false,
    field: "",
    label: "",
    oldVal: 0,
    newVal: 0,
    removedCount: 0,
  });

  const [form, setForm] = useState({
    manufacturerId: "",
    modelId: "",
    connectorId: "",
    mccbMakerId: "",
    mcbMakerId: "",
    serialNumber: "",
    powerRating: "60kW DC",
    voltage: "415V AC 3-Phase / 750V DC",
    chargerType: "DC Fast Charger",
    chargerCategory: "Fast",
    currentStatus: "Operational",
    displayWorking: "Yes",
    cableCondition: "Good / Intact",
    earthingStatus: "Dual Earthing OK",
    fireSafety: "Extinguisher Present & Valid",
    lightingStatus: "Sufficient Canopy Lighting",
    remarks: "",
  });

  // Photo & GPS state
  const [chargerPhotos, setChargerPhotos] = useState([]);
  const [activePhotoSection, setActivePhotoSection] = useState(null);
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });

  const { uploadFile, progress, loading: uploading } = useUpload(
    `${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/photos`
  );

  const fetchPhotos = async () => {
    try {
      const pRes = await surveyService.getPhotos(surveyId);
      setChargerPhotos(pRes.data?.photos || []);
    } catch (err) {
      console.error(err);
    }
  };

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surveyRes, mfgRes, connRes, eqRes] = await Promise.all([
          surveyService.getSurvey(surveyId),
          masterService.getManufacturers({ activeOnly: true }),
          masterService.getConnectors({ activeOnly: true }),
          masterService.getEquipments({ activeOnly: true }),
        ]);

        let fetchedMfgs = mfgRes.data.manufacturers || [];
        let fetchedConns = connRes.data.connectors || [];

        const allEquipments = eqRes.data?.equipments || [];
        const caps = allEquipments
          .filter((e) => e.description === "Charger Capacity")
          .map((e) => ({ value: e.name, label: e.name }));
        setCapacityOptions(caps);

        setMccb4pOptions(
          allEquipments
            .filter((e) => e.description === "MCCB Rating" || e.description === "MCCB 4P Rating")
            .map((e) => ({ value: e.name, label: e.name }))
        );

        setMcb2pOptions(
          allEquipments
            .filter((e) => e.description === "MCB 2P Rating")
            .map((e) => ({ value: e.name, label: e.name }))
        );

        setMcb4pOptions(
          allEquipments
            .filter((e) => e.description === "MCB 4P Rating")
            .map((e) => ({ value: e.name, label: e.name }))
        );

        let fetchedMccbMakers = allEquipments
          .filter((e) => e.description === "MCCB MAKE")
          .map((e) => ({ value: e.id, label: e.name }));

        let fetchedMcbMakers = allEquipments
          .filter((e) => e.description === "MCB MAKE")
          .map((e) => ({ value: e.id, label: e.name }));

        const sData = surveyRes.data?.data?.survey || surveyRes.data?.survey;
        const targetAsset = (sData?.chargers || []).find((c) => c.id === assetId);
        if (targetAsset) {
          setAssetIndex(targetAsset.assetIndex);

          // If target asset has saved manufacturer/connector/maker that is deactivated, preserve it in options
          if (targetAsset.manufacturer && !fetchedMfgs.some((m) => m.id === targetAsset.manufacturerId)) {
            fetchedMfgs = [targetAsset.manufacturer, ...fetchedMfgs];
          }
          if (targetAsset.connector && !fetchedConns.some((c) => c.id === targetAsset.connectorId)) {
            fetchedConns = [targetAsset.connector, ...fetchedConns];
          }
          if (targetAsset.mccbMaker && !fetchedMccbMakers.some((m) => m.value === targetAsset.mccbMakerId)) {
            fetchedMccbMakers = [{ value: targetAsset.mccbMaker.id, label: targetAsset.mccbMaker.name }, ...fetchedMccbMakers];
          }
          if (targetAsset.mcbMaker && !fetchedMcbMakers.some((m) => m.value === targetAsset.mcbMakerId)) {
            fetchedMcbMakers = [{ value: targetAsset.mcbMaker.id, label: targetAsset.mcbMaker.name }, ...fetchedMcbMakers];
          }

          setManufacturers(fetchedMfgs);
          setConnectors(fetchedConns);
          setMccbMakerOptions(fetchedMccbMakers);
          setMcbMakerOptions(fetchedMcbMakers);

          setForm((prev) => ({
            ...prev,
            manufacturerId: targetAsset.manufacturerId || "",
            modelId: targetAsset.modelId || "",
            connectorId: targetAsset.connectorId || "",
            mccbMakerId: targetAsset.mccbMakerId || "",
            mcbMakerId: targetAsset.mcbMakerId || "",
            serialNumber: targetAsset.serialNumber || "",
            powerRating: targetAsset.powerRating || "60kW DC",
            voltage: targetAsset.voltage || "415V AC 3-Phase / 750V DC",
            chargerType: targetAsset.chargerType || "DC Fast Charger",
            chargerCategory: targetAsset.chargerCategory || "Fast",
            currentStatus: targetAsset.currentStatus || "Operational",
            displayWorking: targetAsset.displayWorking || "Yes",
            cableCondition: targetAsset.cableCondition || "Good / Intact",
            earthingStatus: targetAsset.earthingStatus || "Dual Earthing OK",
            fireSafety: targetAsset.fireSafety || "Extinguisher Present & Valid",
            lightingStatus: targetAsset.lightingStatus || "Sufficient Canopy Lighting",
            remarks: targetAsset.remarks || "",
          }));

          // Parse saved breaker data
          const parsedMccb4p = parseBreakerData(targetAsset.mccb4p);
          setMccb4pCount(parsedMccb4p.count);
          setMccb4pTypes(parsedMccb4p.types);

          const parsedMcb2p = parseBreakerData(targetAsset.mcb2p);
          setMcb2pCount(parsedMcb2p.count);
          setMcb2pTypes(parsedMcb2p.types);

          const parsedMcb4p = parseBreakerData(targetAsset.mcb4p);
          setMcb4pCount(parsedMcb4p.count);
          setMcb4pTypes(parsedMcb4p.types);

          if (targetAsset.latitude && targetAsset.longitude) {
            setCoordinates({
              latitude: targetAsset.latitude,
              longitude: targetAsset.longitude,
            });
          }

          if (targetAsset.manufacturerId) {
            const mRes = await masterService.getModels(targetAsset.manufacturerId, { activeOnly: true });
            let fetchedModels = mRes.data.models || [];
            if (targetAsset.model && !fetchedModels.some((m) => m.id === targetAsset.modelId)) {
              fetchedModels = [targetAsset.model, ...fetchedModels];
            }
            setModels(fetchedModels);
          }
        } else {
          setManufacturers(fetchedMfgs);
          setConnectors(fetchedConns);
          setMccbMakerOptions(fetchedMccbMakers);
          setMcbMakerOptions(fetchedMcbMakers);
        }
        fetchPhotos();
      } catch (err) {
        setError("Failed to load charger details from masters");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [surveyId, assetId]);

  const handleManufacturerChange = async (e) => {
    const mfgId = e.target.value;
    setForm((prev) => ({ ...prev, manufacturerId: mfgId, modelId: "" }));
    setErrors((prev) => ({ ...prev, manufacturerId: null, modelId: null }));
    if (mfgId) {
      try {
        const res = await masterService.getModels(mfgId, { activeOnly: true });
        setModels(res.data.models || []);
      } catch (err) {
        setModels([]);
      }
    } else {
      setModels([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Handler for breaker count inputs (MCCB 4P, MCB 2P, MCB 4P)
  const handleBreakerCountInputChange = (field, label, rawVal) => {
    const cleanVal = rawVal.replace(/[^0-9]/g, "");
    const newCount = cleanVal === "" ? 0 : Math.max(0, parseInt(cleanVal, 10));

    let currentCount = 0;
    let currentTypes = [];

    if (field === "mccb4p") {
      currentCount = mccb4pCount;
      currentTypes = mccb4pTypes;
    } else if (field === "mcb2p") {
      currentCount = mcb2pCount;
      currentTypes = mcb2pTypes;
    } else if (field === "mcb4p") {
      currentCount = mcb4pCount;
      currentTypes = mcb4pTypes;
    }

    if (newCount > currentCount) {
      const expanded = [...currentTypes];
      while (expanded.length < newCount) {
        expanded.push("");
      }
      updateBreakerState(field, newCount, expanded);
    } else if (newCount < currentCount) {
      const toRemove = currentTypes.slice(newCount);
      const hasNonEmpty = toRemove.some((t) => t && t.trim() !== "");
      if (hasNonEmpty) {
        setReductionModal({
          show: true,
          field,
          label,
          oldVal: currentCount,
          newVal: newCount,
          removedCount: currentCount - newCount,
        });
      } else {
        const truncated = currentTypes.slice(0, newCount);
        updateBreakerState(field, newCount, truncated);
      }
    }
  };

  const updateBreakerState = (field, count, types) => {
    if (field === "mccb4p") {
      setMccb4pCount(count);
      setMccb4pTypes(types);
    } else if (field === "mcb2p") {
      setMcb2pCount(count);
      setMcb2pTypes(types);
    } else if (field === "mcb4p") {
      setMcb4pCount(count);
      setMcb4pTypes(types);
    }
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(`${field}_`)) delete next[k];
      });
      return next;
    });
  };

  const handleConfirmBreakerReduction = () => {
    const { field, newVal } = reductionModal;
    let currentTypes = [];
    if (field === "mccb4p") currentTypes = mccb4pTypes;
    else if (field === "mcb2p") currentTypes = mcb2pTypes;
    else if (field === "mcb4p") currentTypes = mcb4pTypes;

    const truncated = currentTypes.slice(0, newVal);
    updateBreakerState(field, newVal, truncated);
    setReductionModal({ show: false, field: "", label: "", oldVal: 0, newVal: 0, removedCount: 0 });
  };

  const handleCancelBreakerReduction = () => {
    setReductionModal({ show: false, field: "", label: "", oldVal: 0, newVal: 0, removedCount: 0 });
  };

  const handleBreakerTypeChange = (field, index, value) => {
    let currentTypes = [];
    if (field === "mccb4p") currentTypes = [...mccb4pTypes];
    else if (field === "mcb2p") currentTypes = [...mcb2pTypes];
    else if (field === "mcb4p") currentTypes = [...mcb4pTypes];

    currentTypes[index] = value;

    if (field === "mccb4p") setMccb4pTypes(currentTypes);
    else if (field === "mcb2p") setMcb2pTypes(currentTypes);
    else if (field === "mcb4p") setMcb4pTypes(currentTypes);

    setErrors((prev) => ({ ...prev, [`${field}_${index}`]: null }));
  };

  const handlePhotoCapture = async (base64Img, targetSecLabel) => {
    const label = targetSecLabel || activePhotoSection;
    if (!label) return;

    const categoryId = `Charger #${assetIndex} - ${label}`;

    try {
      const resBlob = await fetch(base64Img);
      const blob = await resBlob.blob();
      const file = new File([blob], `charger_${assetIndex}_${label.replace(/\s+/g, "_")}-${Date.now()}.jpg`, { type: "image/jpeg" });

      await uploadFile(file, {
        surveyId,
        categoryId,
        latitude: coordinates.latitude || "",
        longitude: coordinates.longitude || "",
      });

      setActivePhotoSection(null);
      setErrors((prev) => ({ ...prev, [`photo_${label}`]: null }));
      fetchPhotos();
    } catch (err) {
      alert(err || "Photo upload failed");
    }
  };

  const handlePhotoDelete = async (photoId) => {
    try {
      await surveyService.removePhoto(photoId);
      fetchPhotos();
    } catch (err) {
      console.error(err);
    }
  };

  const findMatchedPhoto = (secLabel) => {
    const expectedCategory = `Charger #${assetIndex} - ${secLabel}`.toLowerCase();
    const fallbackCategory = `Charger ${secLabel}`.toLowerCase();
    return chargerPhotos.find((p) => {
      const name = (p.category?.name || "").toLowerCase();
      return name === expectedCategory || (assetIndex === 1 && (name === fallbackCategory || (name.includes("charger") && name.includes(secLabel.toLowerCase()))));
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.manufacturerId || !form.manufacturerId.trim()) {
      newErrors.manufacturerId = "Manufacturer is required.";
    }

    if (!form.modelId || !form.modelId.trim()) {
      newErrors.modelId = "Charger Model is required.";
    }

    if (!form.connectorId || !form.connectorId.trim()) {
      newErrors.connectorId = "Connector Type is required.";
    }

    // Validate MCCB 4P individual dropdown selections
    for (let i = 0; i < mccb4pCount; i++) {
      if (!mccb4pTypes[i] || !mccb4pTypes[i].trim()) {
        newErrors[`mccb4p_${i}`] = `Please select a type/rating for MCCB 4P #${i + 1}.`;
      }
    }

    // Validate MCB 2P individual dropdown selections
    for (let i = 0; i < mcb2pCount; i++) {
      if (!mcb2pTypes[i] || !mcb2pTypes[i].trim()) {
        newErrors[`mcb2p_${i}`] = `Please select a type/rating for MCB 2P #${i + 1}.`;
      }
    }

    // Validate MCB 4P individual dropdown selections
    for (let i = 0; i < mcb4pCount; i++) {
      if (!mcb4pTypes[i] || !mcb4pTypes[i].trim()) {
        newErrors[`mcb4p_${i}`] = `Please select a type/rating for MCB 4P #${i + 1}.`;
      }
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

    CHARGER_PHOTO_SECTIONS.forEach((sec) => {
      if (!findMatchedPhoto(sec.label)) {
        newErrors[`photo_${sec.label}`] = `${sec.label} photo is required.`;
      }
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
      const mccb4pData = { count: mccb4pCount, types: mccb4pTypes };
      const mcb2pData = { count: mcb2pCount, types: mcb2pTypes };
      const mcb4pData = { count: mcb4pCount, types: mcb4pTypes };

      const payload = {
        manufacturerId: form.manufacturerId.trim(),
        modelId: form.modelId.trim(),
        connectorId: form.connectorId.trim(),
        mccbMakerId: form.mccbMakerId ? form.mccbMakerId.trim() : null,
        mcbMakerId: form.mcbMakerId ? form.mcbMakerId.trim() : null,
        serialNumber: form.serialNumber.trim() || null,
        powerRating: form.powerRating.trim() || null,

        mccb4pCount,
        mccb4pTypes,
        mccb4p: JSON.stringify(mccb4pData),

        mcb2pCount,
        mcb2pTypes,
        mcb2p: JSON.stringify(mcb2pData),

        mcb4pCount,
        mcb4pTypes,
        mcb4p: JSON.stringify(mcb4pData),

        voltage: form.voltage.trim() || null,
        chargerType: form.chargerType.trim() || null,
        chargerCategory: form.chargerCategory.trim() || null,
        currentStatus: form.currentStatus.trim() || null,
        displayWorking: form.displayWorking.trim() || null,
        cableCondition: form.cableCondition.trim() || null,
        earthingStatus: form.earthingStatus.trim() || null,
        fireSafety: form.fireSafety.trim() || null,
        lightingStatus: form.lightingStatus.trim() || null,
        remarks: form.remarks.trim() || null,
        latitude: parseFloat(coordinates.latitude),
        longitude: parseFloat(coordinates.longitude),
      };

      await surveyService.saveAssetData("charger", assetId, payload);
      navigate(`/survey/assets/${surveyId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save charger survey");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  const fallbackMCCB4P = [
    { value: "100A", label: "100A" },
    { value: "125A", label: "125A" },
    { value: "160A", label: "160A" },
    { value: "200A", label: "200A" },
    { value: "250A", label: "250A" },
    { value: "400A", label: "400A" },
    { value: "630A", label: "630A" },
  ];

  const fallbackMCB2P = [
    { value: "6A", label: "6A" },
    { value: "10A", label: "10A" },
    { value: "16A", label: "16A" },
    { value: "20A", label: "20A" },
    { value: "25A", label: "25A" },
    { value: "32A", label: "32A" },
    { value: "40A", label: "40A" },
    { value: "63A", label: "63A" },
  ];

  const fallbackMCB4P = [
    { value: "16A", label: "16A" },
    { value: "25A", label: "25A" },
    { value: "32A", label: "32A" },
    { value: "40A", label: "40A" },
    { value: "63A", label: "63A" },
    { value: "80A", label: "80A" },
    { value: "100A", label: "100A" },
    { value: "125A", label: "125A" },
  ];

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Charger #{assetIndex} Detailed Checklist</h2>
        <Button variant="secondary" onClick={() => navigate(`/survey/assets/${surveyId}`)}>Back to Matrix</Button>
      </div>

      {error && (
        <div style={{ padding: "12px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", borderRadius: "8px", color: "var(--danger)", marginBottom: "16px", fontSize: "14px" }}>
          ⚠️ {error}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div id="field-manufacturerId">
              <Select2
                label="Manufacturer"
                name="manufacturerId"
                value={form.manufacturerId}
                onChange={handleManufacturerChange}
                options={manufacturers.map((m) => ({ value: m.id, label: m.name }))}
                placeholder="Search / Select Manufacturer..."
                required
                error={errors.manufacturerId}
              />
            </div>

            <div id="field-modelId">
              <Select2
                label="Charger Model"
                name="modelId"
                value={form.modelId}
                onChange={handleChange}
                options={models.map((m) => ({ value: m.id, label: `${m.name} (${m.powerRating})` }))}
                placeholder={form.manufacturerId ? "Search / Select Model..." : "Select Manufacturer First"}
                required
                disabled={!form.manufacturerId}
                error={errors.modelId}
              />
            </div>

            <div id="field-connectorId">
              <Select2
                label="Connector Type"
                name="connectorId"
                value={form.connectorId}
                onChange={handleChange}
                options={connectors.map((c) => ({ value: c.id, label: c.type }))}
                placeholder="Search / Select Connector..."
                required
                error={errors.connectorId}
              />
            </div>

            <Input label="Serial Number" name="serialNumber" value={form.serialNumber} onChange={handleChange} placeholder="e.g. SN-DEL-98765" />
            
            {capacityOptions.length > 0 ? (
              <Select2
                label="Capacity (Power Rating)"
                name="powerRating"
                value={form.powerRating}
                onChange={handleChange}
                options={capacityOptions}
                placeholder="Search / Select Capacity..."
              />
            ) : (
              <Input label="Capacity (Power Rating)" name="powerRating" value={form.powerRating} onChange={handleChange} placeholder="e.g. 60kW, 120kW" />
            )}

            <Input label="Voltage Input/Output" name="voltage" value={form.voltage} onChange={handleChange} placeholder="e.g. 415V AC / 750V DC" />

            <div id="field-mccbMakerId">
              <Select2
                label="MCCB Maker"
                name="mccbMakerId"
                value={form.mccbMakerId}
                onChange={handleChange}
                options={mccbMakerOptions}
                placeholder="Search / Select MCCB Maker..."
                error={errors.mccbMakerId}
              />
            </div>

            <div id="field-mcbMakerId">
              <Select2
                label="MCB Maker"
                name="mcbMakerId"
                value={form.mcbMakerId}
                onChange={handleChange}
                options={mcbMakerOptions}
                placeholder="Search / Select MCB Maker..."
                error={errors.mcbMakerId}
              />
            </div>

            {/* ⚡ MCCB 4P SECTION */}
            <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "4px" }}>
              <Input
                label="Number of MCCB 4P Breakers"
                name="mccb4pCount"
                type="number"
                min="0"
                value={mccb4pCount === 0 ? "" : mccb4pCount}
                onChange={(e) => handleBreakerCountInputChange("mccb4p", "MCCB 4P", e.target.value)}
                placeholder="Enter count (e.g. 0, 1, 2...)"
              />

              {mccb4pCount > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px", marginTop: "12px", padding: "14px", backgroundColor: "rgba(0,0,0,0.15)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  {Array.from({ length: mccb4pCount }).map((_, idx) => (
                    <div key={idx} id={`field-mccb4p_${idx}`}>
                      <Select2
                        label={`MCCB 4P #${idx + 1} Rating`}
                        name={`mccb4p_${idx}`}
                        value={mccb4pTypes[idx] || ""}
                        onChange={(e) => handleBreakerTypeChange("mccb4p", idx, e.target.value)}
                        options={mccb4pOptions.length > 0 ? mccb4pOptions : fallbackMCCB4P}
                        placeholder={`Select MCCB 4P #${idx + 1} Rating...`}
                        error={errors[`mccb4p_${idx}`]}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ⚡ MCB 2P SECTION */}
            <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "4px" }}>
              <Input
                label="Number of MCB 2P Breakers"
                name="mcb2pCount"
                type="number"
                min="0"
                value={mcb2pCount === 0 ? "" : mcb2pCount}
                onChange={(e) => handleBreakerCountInputChange("mcb2p", "MCB 2P", e.target.value)}
                placeholder="Enter count (e.g. 0, 1, 2...)"
              />

              {mcb2pCount > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px", marginTop: "12px", padding: "14px", backgroundColor: "rgba(0,0,0,0.15)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  {Array.from({ length: mcb2pCount }).map((_, idx) => (
                    <div key={idx} id={`field-mcb2p_${idx}`}>
                      <Select2
                        label={`MCB 2P #${idx + 1} Rating`}
                        name={`mcb2p_${idx}`}
                        value={mcb2pTypes[idx] || ""}
                        onChange={(e) => handleBreakerTypeChange("mcb2p", idx, e.target.value)}
                        options={mcb2pOptions.length > 0 ? mcb2pOptions : fallbackMCB2P}
                        placeholder={`Select MCB 2P #${idx + 1} Rating...`}
                        error={errors[`mcb2p_${idx}`]}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ⚡ MCB 4P SECTION */}
            <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "4px", paddingBottom: "8px" }}>
              <Input
                label="Number of MCB 4P Breakers"
                name="mcb4pCount"
                type="number"
                min="0"
                value={mcb4pCount === 0 ? "" : mcb4pCount}
                onChange={(e) => handleBreakerCountInputChange("mcb4p", "MCB 4P", e.target.value)}
                placeholder="Enter count (e.g. 0, 1, 2...)"
              />

              {mcb4pCount > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px", marginTop: "12px", padding: "14px", backgroundColor: "rgba(0,0,0,0.15)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  {Array.from({ length: mcb4pCount }).map((_, idx) => (
                    <div key={idx} id={`field-mcb4p_${idx}`}>
                      <Select2
                        label={`MCB 4P #${idx + 1} Rating`}
                        name={`mcb4p_${idx}`}
                        value={mcb4pTypes[idx] || ""}
                        onChange={(e) => handleBreakerTypeChange("mcb4p", idx, e.target.value)}
                        options={mcb4pOptions.length > 0 ? mcb4pOptions : fallbackMCB4P}
                        placeholder={`Select MCB 4P #${idx + 1} Rating...`}
                        error={errors[`mcb4p_${idx}`]}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Select2
              label="AC / DC Type"
              name="chargerType"
              value={form.chargerType}
              onChange={handleChange}
              options={[
                { value: "DC Fast Charger", label: "DC Fast Charger" },
                { value: "AC Slow Charger", label: "AC Slow Charger" },
                { value: "AC Dual Gun Charger", label: "AC Dual Gun Charger" },
              ]}
            />
            <Select2
              label="Speed Category"
              name="chargerCategory"
              value={form.chargerCategory}
              onChange={handleChange}
              options={[
                { value: "Fast", label: "Fast Charger (DC)" },
                { value: "Ultra-Fast", label: "Ultra-Fast Charger (150kW+)" },
                { value: "Slow", label: "Slow Charger (AC 7.4kW / 22kW)" },
              ]}
            />
            <Select2
              label="Operational Status"
              name="currentStatus"
              value={form.currentStatus}
              onChange={handleChange}
              options={[
                { value: "Operational", label: "🟢 Operational & Charging" },
                { value: "Faulty / Error Code", label: "🔴 Faulty / Error Screen" },
                { value: "Offline / No Comm", label: "🟡 Offline / Network Issue" },
              ]}
            />
            <Select2
              label="Display Screen Working"
              name="displayWorking"
              value={form.displayWorking}
              onChange={handleChange}
              options={[
                { value: "Yes", label: "Yes - Clear Display" },
                { value: "Damaged / Faded", label: "Damaged / Faded Screen" },
                { value: "No Power Display", label: "No Power / Blank" },
              ]}
            />
            <Select2
              label="Cable & Connector Condition"
              name="cableCondition"
              value={form.cableCondition}
              onChange={handleChange}
              options={[
                { value: "Good / Intact", label: "Good / Intact Cables" },
                { value: "Cut / Exposed Wire", label: "Worn Out / Cut Wire" },
                { value: "Connector Pin Damaged", label: "Connector Pin Damaged" },
              ]}
            />
            <Select2
              label="Earthing & Neutral Status"
              name="earthingStatus"
              value={form.earthingStatus}
              onChange={handleChange}
              options={[
                { value: "Dual Earthing OK", label: "Dual Earthing OK (< 1V N-E)" },
                { value: "Single Earthing", label: "Single Earthing Only" },
                { value: "High Neutral Voltage", label: "High Neutral Voltage (> 5V)" },
              ]}
            />
          </div>

          <div style={{ marginTop: "16px" }}>
            <Input label="Remarks & Specific Defect Description" name="remarks" value={form.remarks} onChange={handleChange} placeholder="Notes on physical condition, screen error codes, cable length..." />
          </div>

          {/* 📍 GPS Tagging Section */}
          <div id="field-gps" style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "700" }}>📍 GPS Location Tagging <span style={{ color: "var(--danger)" }}>*</span></h4>
            </div>
            <GPS onCoordinatesFetched={(c) => { setCoordinates(c); setErrors((prev) => ({ ...prev, gps: null })); }} />
            {errors.gps && <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "6px" }}>{errors.gps}</p>}
          </div>

          {/* 📷 Charger Photo Upload Section (Front, Left, Right) */}
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>
              📷 Upload Charger #{assetIndex} Photos (Front, Left, Right) <span style={{ color: "var(--danger)" }}>*</span>
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px" }}>
              Capture or upload 3 required angle photos of this EV charger.
            </p>

            {uploading && (
              <div style={{ padding: "10px", backgroundColor: "rgba(99, 102, 241, 0.1)", borderRadius: "8px", marginBottom: "12px" }}>
                <p style={{ fontSize: "12px", fontWeight: "600" }}>Uploading Charger Photo... {progress}%</p>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginTop: "12px" }}>
              {CHARGER_PHOTO_SECTIONS.map((sec) => {
                const matched = findMatchedPhoto(sec.label);
                const hasError = errors[`photo_${sec.label}`];

                return (
                  <div
                    key={sec.id}
                    id={`field-photo_${sec.label}`}
                    style={{
                      padding: "14px",
                      borderRadius: "8px",
                      border: hasError ? "1px solid var(--danger)" : "1px solid var(--border-color)",
                      backgroundColor: "var(--bg-color)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                          {sec.icon} {sec.label} <span style={{ color: "var(--danger)" }}>*</span>
                        </span>
                        {matched && <CheckCircle2 size={16} style={{ color: "#10b981" }} />}
                      </div>

                      {matched ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ width: "100%", height: "110px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                            <img
                              src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api/v1", "") : "http://localhost:5000"}${matched.url}`}
                              alt={sec.label}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                          <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                            📍 {matched.latitude ? `${matched.latitude.toFixed(3)}, ${matched.longitude.toFixed(3)}` : "No GPS"}
                          </p>
                        </div>
                      ) : (
                        <div>
                          {activePhotoSection === sec.label ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <Camera onCapture={(img) => handlePhotoCapture(img, sec.label)} />
                              <Button variant="secondary" size="small" onClick={() => setActivePhotoSection(null)}>Cancel</Button>
                            </div>
                          ) : (
                            <div
                              onClick={() => setActivePhotoSection(sec.label)}
                              style={{
                                minHeight: "100px",
                                border: hasError ? "2px dashed var(--danger)" : "2px dashed var(--border-color)",
                                borderRadius: "6px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                cursor: "pointer",
                                padding: "12px",
                                textAlign: "center"
                              }}
                            >
                              <CameraIcon size={22} style={{ color: hasError ? "var(--danger)" : "var(--primary)" }} />
                              <span style={{ fontSize: "12px", fontWeight: "600", color: hasError ? "var(--danger)" : "var(--primary)" }}>
                                Capture {sec.label}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {hasError && <p style={{ color: "var(--danger)", fontSize: "11px", marginTop: "6px" }}>{hasError}</p>}

                    {matched && (
                      <div style={{ marginTop: "10px" }}>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handlePhotoDelete(matched.id)}
                          style={{ width: "100%", color: "var(--danger)", fontSize: "11px", padding: "4px 8px" }}
                        >
                          <Trash2 size={12} /> Retake
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <Button type="submit" disabled={submitting} style={{ width: "100%" }}>
              {submitting ? "Saving Charger Survey..." : `Save & Complete Charger #${assetIndex} Checklist`}
            </Button>
          </div>
        </form>
      </Card>

      {/* ⚠️ REDUCTION CONFIRMATION MODAL */}
      {reductionModal.show && createPortal(
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--danger)", marginBottom: "12px" }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
                Confirm {reductionModal.label} Breaker Count Reduction
              </h3>
            </div>

            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "16px" }}>
              You are reducing the <strong>{reductionModal.label}</strong> breaker count from <strong>{reductionModal.oldVal}</strong> to <strong>{reductionModal.newVal}</strong>.
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
              ⚠️ The last {reductionModal.removedCount} breaker {reductionModal.removedCount === 1 ? "selection" : "selections"} will be permanently removed.
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Do you want to continue? Lower-numbered breaker selections will be preserved intact.
            </p>

            <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", flexWrap: "wrap" }}>
              <Button variant="secondary" onClick={handleCancelBreakerReduction}>
                Cancel
              </Button>
              <Button onClick={handleConfirmBreakerReduction} style={{ backgroundColor: "var(--danger)" }}>
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

export default ChargerSurvey;

