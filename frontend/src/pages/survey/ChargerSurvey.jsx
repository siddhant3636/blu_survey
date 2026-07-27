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
import SinglePhotoUploader from "../../components/common/SinglePhotoUploader";
import { Camera as CameraIcon, Trash2, CheckCircle2, AlertTriangle, Upload } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

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
        types: parsed.types.map((t) => {
          if (t && typeof t === "object") {
            return {
              rating: String(t.rating || ""),
              brandId: String(t.brandId || ""),
              brandName: String(t.brandName || ""),
            };
          }
          return { rating: String(t || ""), brandId: "", brandName: "" };
        }),
      };
    }
    if (Array.isArray(parsed)) {
      return {
        count: parsed.length,
        types: parsed.map((t) => {
          if (t && typeof t === "object") {
            return {
              rating: String(t.rating || ""),
              brandId: String(t.brandId || ""),
              brandName: String(t.brandName || ""),
            };
          }
          return { rating: String(t || ""), brandId: "", brandName: "" };
        }),
      };
    }
    if (typeof parsed === "string" && parsed.trim() !== "") {
      return { count: 1, types: [{ rating: parsed.trim(), brandId: "", brandName: "" }] };
    }
  } catch (e) {
    if (typeof raw === "string" && raw.trim() !== "") {
      return { count: 1, types: [{ rating: raw.trim(), brandId: "", brandName: "" }] };
    }
  }
  return { count: 0, types: [] };
};

const ChargerSurvey = () => {
  const { surveyId } = useParams();
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get("assetId");
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const [isLockedByOther, setIsLockedByOther] = useState(false);
  const [lockOwnerName, setLockOwnerName] = useState("");

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
    serialNumber: "",
    powerRating: "60kW DC",
    voltage: "415V AC 3-Phase / 750V DC",
    chargerType: "Fast",
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
  const [surveyStatus, setSurveyStatus] = useState("DRAFT");
  const [activePhotoSection, setActivePhotoSection] = useState(null);
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });



  const fetchPhotos = async () => {
    try {
      const pRes = await surveyService.getPhotos(surveyId);
      setChargerPhotos(pRes.data?.photos || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const lockAsset = async () => {
      if (!assetId) return;
      try {
        await surveyService.lockAsset("charger", assetId);
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
        await surveyService.lockAsset("charger", assetId);
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
        surveyService.unlockAsset("charger", assetId).catch(console.error);
      }
    };
  }, [assetId, isLockedByOther, surveyStatus]);

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

        const mccbOptionsList = allEquipments
          .filter((e) => e.description === "MCCB Rating" || e.description === "MCCB 4P Rating")
          .map((e) => ({ value: e.name, label: e.name }));
        setMccb4pOptions([{ value: "N/A", label: "N/A" }, ...mccbOptionsList]);

        const mcb2pOptionsList = allEquipments
          .filter((e) => e.description === "MCB 2P Rating")
          .map((e) => ({ value: e.name, label: e.name }));
        setMcb2pOptions([{ value: "N/A", label: "N/A" }, ...mcb2pOptionsList]);

        const mcb4pOptionsList = allEquipments
          .filter((e) => e.description === "MCB 4P Rating")
          .map((e) => ({ value: e.name, label: e.name }));
        setMcb4pOptions([{ value: "N/A", label: "N/A" }, ...mcb4pOptionsList]);

        let fetchedMccbMakers = allEquipments
          .filter((e) => e.description === "MCCB MAKE")
          .map((e) => ({ value: e.id, label: e.name }));

        let fetchedMcbMakers = allEquipments
          .filter((e) => e.description === "MCB MAKE")
          .map((e) => ({ value: e.id, label: e.name }));

        const sData = surveyRes.data?.data?.survey || surveyRes.data?.survey;
        if (sData?.status) {
          setSurveyStatus(sData.status);
        }
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
            serialNumber: targetAsset.serialNumber || "",
            powerRating: targetAsset.powerRating || "60kW DC",
            voltage: targetAsset.voltage || "415V AC 3-Phase / 750V DC",
            chargerType: targetAsset.chargerType === "DC Fast Charger" || targetAsset.chargerType === "AC Slow Charger" || targetAsset.chargerType === "AC Dual Gun Charger"
              ? (targetAsset.chargerType.includes("Fast") ? "Fast" : "Slow")
              : (targetAsset.chargerType || "Fast"),
            chargerCategory: targetAsset.chargerCategory === "Fast Charger (DC)" || targetAsset.chargerCategory === "Slow Charger (AC 7.4kW / 22kW)" || targetAsset.chargerCategory === "Ultra-Fast Charger (150kW+)"
              ? (targetAsset.chargerCategory.includes("Ultra") ? "Ultra Fast" : (targetAsset.chargerCategory.includes("Fast") ? "Fast" : "Slow"))
              : (targetAsset.chargerCategory || "Fast"),
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

  const handleChargerTypeChange = (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, chargerType: val }));
    setErrors((prev) => ({ ...prev, chargerType: null }));

    if (val === "Fast") {
      setMcb2pCount(0);
      setMcb2pTypes([]);
    } else if (val === "Slow") {
      setMccb4pCount(0);
      setMccb4pTypes([]);
    }
  };

  // Handler for breaker count inputs (MCCB 4P, MCB 2P, MCB 4P)
  const handleBreakerCountInputChange = (field, label, rawVal) => {
    if (rawVal === "") {
      if (field === "mccb4p") setMccb4pCount("");
      else if (field === "mcb2p") setMcb2pCount("");
      else if (field === "mcb4p") setMcb4pCount("");
      return;
    }

    const cleanVal = rawVal.replace(/[^0-9]/g, "");
    const newCount = cleanVal === "" ? 0 : Math.max(0, parseInt(cleanVal, 10));

    let currentCount = 0;
    let currentTypes = [];

    if (field === "mccb4p") {
      currentCount = mccb4pCount === "" ? 0 : mccb4pCount;
      currentTypes = mccb4pTypes;
    } else if (field === "mcb2p") {
      currentCount = mcb2pCount === "" ? 0 : mcb2pCount;
      currentTypes = mcb2pTypes;
    } else if (field === "mcb4p") {
      currentCount = mcb4pCount === "" ? 0 : mcb4pCount;
      currentTypes = mcb4pTypes;
    }

    if (newCount > currentCount) {
      const expanded = [...currentTypes];
      while (expanded.length < newCount) {
        expanded.push({ rating: "", brandId: "", brandName: "" });
      }
      updateBreakerState(field, newCount, expanded);
    } else if (newCount < currentCount) {
      const toRemove = currentTypes.slice(newCount);
      const hasNonEmpty = toRemove.some((t) => (t?.rating && t.rating.trim() !== "") || (t?.brandId && t.brandId.trim() !== ""));
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

  const handleBreakerCountBlur = (field, label) => {
    let currentCount = 0;
    if (field === "mccb4p") currentCount = mccb4pCount;
    else if (field === "mcb2p") currentCount = mcb2pCount;
    else if (field === "mcb4p") currentCount = mcb4pCount;

    if (currentCount === "") {
      updateBreakerState(field, 0, []);
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

  const handleBreakerRatingChange = (field, index, ratingValue) => {
    let currentTypes = [];
    if (field === "mccb4p") {
      currentTypes = mccb4pTypes.map((item, idx) => idx === index ? { ...item, rating: ratingValue } : item);
      setMccb4pTypes(currentTypes);
    } else if (field === "mcb2p") {
      currentTypes = mcb2pTypes.map((item, idx) => idx === index ? { ...item, rating: ratingValue } : item);
      setMcb2pTypes(currentTypes);
    } else if (field === "mcb4p") {
      currentTypes = mcb4pTypes.map((item, idx) => idx === index ? { ...item, rating: ratingValue } : item);
      setMcb4pTypes(currentTypes);
    }

    setErrors((prev) => ({ ...prev, [`${field}_${index}`]: null }));
  };

  const handleBreakerBrandChange = (field, index, brandIdValue, makerOptions) => {
    const matchedOption = makerOptions.find((o) => o.value === brandIdValue);
    const brandNameValue = matchedOption ? matchedOption.label : "";

    let currentTypes = [];
    if (field === "mccb4p") {
      currentTypes = mccb4pTypes.map((item, idx) => idx === index ? { ...item, brandId: brandIdValue, brandName: brandNameValue } : item);
      setMccb4pTypes(currentTypes);
    } else if (field === "mcb2p") {
      currentTypes = mcb2pTypes.map((item, idx) => idx === index ? { ...item, brandId: brandIdValue, brandName: brandNameValue } : item);
      setMcb2pTypes(currentTypes);
    } else if (field === "mcb4p") {
      currentTypes = mcb4pTypes.map((item, idx) => idx === index ? { ...item, brandId: brandIdValue, brandName: brandNameValue } : item);
      setMcb4pTypes(currentTypes);
    }

    setErrors((prev) => ({ ...prev, [`${field}_brand_${index}`]: null }));
  };

  const findMatchedPhoto = (secLabel) => {
    const targetLabel = secLabel.toLowerCase();
    const expectedCategory = `charger #${assetIndex} - ${targetLabel}`;
    return chargerPhotos.find((p) => {
      const name = (p.category?.name || "").toLowerCase();
      if (name === expectedCategory) return true;
      if (name.includes(targetLabel)) {
        if (name.includes(`#${assetIndex}`) || name.includes(`charger ${assetIndex}`) || name.includes(`charger_${assetIndex}`)) {
          return true;
        }
        if (chargerPhotos.length <= 3) return true;
      }
      return false;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.chargerType || !form.chargerType.trim()) {
      newErrors.chargerType = "Charger Type is required.";
    }

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
    if (form.chargerType === "Fast") {
      for (let i = 0; i < mccb4pCount; i++) {
        const rVal = mccb4pTypes[i]?.rating;
        if (!rVal || !rVal.trim()) {
          newErrors[`mccb4p_${i}`] = `Please select a type/rating for MCCB 4P #${i + 1}.`;
        } else if (rVal !== "N/A") {
          if (!mccb4pTypes[i]?.brandId || !mccb4pTypes[i].brandId.trim()) {
            newErrors[`mccb4p_brand_${i}`] = `Please select a brand for MCCB 4P #${i + 1}.`;
          }
        }
      }
    }

    // Validate MCB 2P individual dropdown selections
    if (form.chargerType === "Slow") {
      for (let i = 0; i < mcb2pCount; i++) {
        const rVal = mcb2pTypes[i]?.rating;
        if (!rVal || !rVal.trim()) {
          newErrors[`mcb2p_${i}`] = `Please select a type/rating for MCB 2P #${i + 1}.`;
        } else if (rVal !== "N/A") {
          if (!mcb2pTypes[i]?.brandId || !mcb2pTypes[i].brandId.trim()) {
            newErrors[`mcb2p_brand_${i}`] = `Please select a brand for MCB 2P #${i + 1}.`;
          }
        }
      }
    }

    // Validate MCB 4P individual dropdown selections
    for (let i = 0; i < mcb4pCount; i++) {
      const rVal = mcb4pTypes[i]?.rating;
      if (!rVal || !rVal.trim()) {
        newErrors[`mcb4p_${i}`] = `Please select a type/rating for MCB 4P #${i + 1}.`;
      } else if (rVal !== "N/A") {
        if (!mcb4pTypes[i]?.brandId || !mcb4pTypes[i].brandId.trim()) {
          newErrors[`mcb4p_brand_${i}`] = `Please select a brand for MCB 4P #${i + 1}.`;
        }
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
      const mccb4pData = form.chargerType === "Fast" ? { count: mccb4pCount, types: mccb4pTypes } : { count: 0, types: [] };
      const mcb2pData = form.chargerType === "Slow" ? { count: mcb2pCount, types: mcb2pTypes } : { count: 0, types: [] };
      const mcb4pData = { count: mcb4pCount, types: mcb4pTypes };

      const payload = {
        manufacturerId: form.manufacturerId.trim(),
        modelId: form.modelId.trim(),
        connectorId: form.connectorId.trim(),
        mccbMakerId: null,
        mcbMakerId: null,
        serialNumber: form.serialNumber.trim() || null,
        powerRating: form.powerRating.trim() || null,

        mccb4pCount: mccb4pData.count,
        mccb4pTypes: mccb4pData.types,
        mccb4p: JSON.stringify(mccb4pData),

        mcb2pCount: mcb2pData.count,
        mcb2pTypes: mcb2pData.types,
        mcb2p: JSON.stringify(mcb2pData),

        mcb4pCount: mcb4pData.count,
        mcb4pTypes: mcb4pData.types,
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

  const isReadOnly = ["SUBMITTED", "UNDER_REVIEW", "APPROVED"].includes(surveyStatus);

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
          <fieldset disabled={isReadOnly} style={{ border: "none", padding: 0, margin: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {/* 1. Charger Type * */}
            <div id="field-chargerType" style={{ gridColumn: "1 / -1" }}>
              <Select2
                label="Charger Type"
                name="chargerType"
                value={form.chargerType}
                onChange={handleChargerTypeChange}
                options={[
                  { value: "Slow", label: "Slow" },
                  { value: "Fast", label: "Fast" },
                ]}
                placeholder="Select Charger Type..."
                required
                error={errors.chargerType}
              />
            </div>

            {/* 2. Based on Charger Type: Counts */}
            {form.chargerType === "Slow" && (
              <>
                <div id="field-mcb2pCount" style={{ gridColumn: "1 / -1" }}>
                  <Input
                    label="Number of MCB 2P Breakers"
                    name="mcb2pCount"
                    type="number"
                    min="0"
                    value={mcb2pCount}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/^0+(\d+)/, "$1");
                      handleBreakerCountInputChange("mcb2p", "MCB 2P", e.target.value);
                    }}
                    onBlur={() => handleBreakerCountBlur("mcb2p", "MCB 2P")}
                    placeholder="Enter count (e.g. 0, 1, 2...)"
                  />
                </div>
                <div id="field-mcb4pCount" style={{ gridColumn: "1 / -1" }}>
                  <Input
                    label="Number of MCB 4P Breakers"
                    name="mcb4pCount"
                    type="number"
                    min="0"
                    value={mcb4pCount}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/^0+(\d+)/, "$1");
                      handleBreakerCountInputChange("mcb4p", "MCB 4P", e.target.value);
                    }}
                    onBlur={() => handleBreakerCountBlur("mcb4p", "MCB 4P")}
                    placeholder="Enter count (e.g. 0, 1, 2...)"
                  />
                </div>
              </>
            )}

            {form.chargerType === "Fast" && (
              <>
                <div id="field-mccb4pCount" style={{ gridColumn: "1 / -1" }}>
                  <Input
                    label="Number of MCCB 4P Breakers"
                    name="mccb4pCount"
                    type="number"
                    min="0"
                    value={mccb4pCount}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/^0+(\d+)/, "$1");
                      handleBreakerCountInputChange("mccb4p", "MCCB 4P", e.target.value);
                    }}
                    onBlur={() => handleBreakerCountBlur("mccb4p", "MCCB 4P")}
                    placeholder="Enter count (e.g. 0, 1, 2...)"
                  />
                </div>
                <div id="field-mcb4pCount" style={{ gridColumn: "1 / -1" }}>
                  <Input
                    label="Number of MCB 4P Breakers"
                    name="mcb4pCount"
                    type="number"
                    min="0"
                    value={mcb4pCount}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/^0+(\d+)/, "$1");
                      handleBreakerCountInputChange("mcb4p", "MCB 4P", e.target.value);
                    }}
                    onBlur={() => handleBreakerCountBlur("mcb4p", "MCB 4P")}
                    placeholder="Enter count (e.g. 0, 1, 2...)"
                  />
                </div>
              </>
            )}

            {/* 3. Dynamic rating and maker selections */}
            {/* MCCB 4P Dynamic Selections (Fast only) */}
            {form.chargerType === "Fast" && mccb4pCount > 0 && (
              <div style={{ gridColumn: "1 / -1", marginTop: "4px", padding: "14px", backgroundColor: "rgba(0,0,0,0.15)", borderRadius: "8px", border: "1px solid var(--border-color)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
                {Array.from({ length: mccb4pCount }).map((_, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div id={`field-mccb4p_${idx}`}>
                      <Select2
                        label={`MCCB 4P #${idx + 1} Rating`}
                        name={`mccb4p_${idx}`}
                        value={mccb4pTypes[idx]?.rating || ""}
                        onChange={(e) => handleBreakerRatingChange("mccb4p", idx, e.target.value)}
                        options={mccb4pOptions.length > 0 ? mccb4pOptions : fallbackMCCB4P}
                        placeholder={`Select MCCB 4P #${idx + 1} Rating...`}
                        error={errors[`mccb4p_${idx}`]}
                      />
                    </div>
                    <div id={`field-mccb4p_brand_${idx}`}>
                      <Select2
                        label={`MCCB 4P #${idx + 1} Brand`}
                        name={`mccb4p_brand_${idx}`}
                        value={mccb4pTypes[idx]?.brandId || ""}
                        onChange={(e) => handleBreakerBrandChange("mccb4p", idx, e.target.value, mccbMakerOptions)}
                        options={mccbMakerOptions}
                        placeholder={`Select MCCB 4P #${idx + 1} Brand...`}
                        error={errors[`mccb4p_brand_${idx}`]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MCB 2P Dynamic Selections (Slow only) */}
            {form.chargerType === "Slow" && mcb2pCount > 0 && (
              <div style={{ gridColumn: "1 / -1", marginTop: "4px", padding: "14px", backgroundColor: "rgba(0,0,0,0.15)", borderRadius: "8px", border: "1px solid var(--border-color)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
                {Array.from({ length: mcb2pCount }).map((_, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div id={`field-mcb2p_${idx}`}>
                      <Select2
                        label={`MCB 2P #${idx + 1} Rating`}
                        name={`mcb2p_${idx}`}
                        value={mcb2pTypes[idx]?.rating || ""}
                        onChange={(e) => handleBreakerRatingChange("mcb2p", idx, e.target.value)}
                        options={mcb2pOptions.length > 0 ? mcb2pOptions : fallbackMCB2P}
                        placeholder={`Select MCB 2P #${idx + 1} Rating...`}
                        error={errors[`mcb2p_${idx}`]}
                      />
                    </div>
                    <div id={`field-mcb2p_brand_${idx}`}>
                      <Select2
                        label={`MCB 2P #${idx + 1} Brand`}
                        name={`mcb2p_brand_${idx}`}
                        value={mcb2pTypes[idx]?.brandId || ""}
                        onChange={(e) => handleBreakerBrandChange("mcb2p", idx, e.target.value, mcbMakerOptions)}
                        options={mcbMakerOptions}
                        placeholder={`Select MCB 2P #${idx + 1} Brand...`}
                        error={errors[`mcb2p_brand_${idx}`]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MCB 4P Dynamic Selections (Slow or Fast) */}
            {((form.chargerType === "Slow" || form.chargerType === "Fast")) && mcb4pCount > 0 && (
              <div style={{ gridColumn: "1 / -1", marginTop: "4px", padding: "14px", backgroundColor: "rgba(0,0,0,0.15)", borderRadius: "8px", border: "1px solid var(--border-color)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
                {Array.from({ length: mcb4pCount }).map((_, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div id={`field-mcb4p_${idx}`}>
                      <Select2
                        label={`MCB 4P #${idx + 1} Rating`}
                        name={`mcb4p_${idx}`}
                        value={mcb4pTypes[idx]?.rating || ""}
                        onChange={(e) => handleBreakerRatingChange("mcb4p", idx, e.target.value)}
                        options={mcb4pOptions.length > 0 ? mcb4pOptions : fallbackMCB4P}
                        placeholder={`Select MCB 4P #${idx + 1} Rating...`}
                        error={errors[`mcb4p_${idx}`]}
                      />
                    </div>
                    <div id={`field-mcb4p_brand_${idx}`}>
                      <Select2
                        label={`MCB 4P #${idx + 1} Brand`}
                        name={`mcb4p_brand_${idx}`}
                        value={mcb4pTypes[idx]?.brandId || ""}
                        onChange={(e) => handleBreakerBrandChange("mcb4p", idx, e.target.value, mcbMakerOptions)}
                        options={mcbMakerOptions}
                        placeholder={`Select MCB 4P #${idx + 1} Brand...`}
                        error={errors[`mcb4p_brand_${idx}`]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Existing charger fields */}
            <div id="field-manufacturerId">
              <Select2
                label="Charger Manufacturer"
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
                label="Capacity (A)"
                name="powerRating"
                value={form.powerRating}
                onChange={handleChange}
                options={capacityOptions}
                placeholder="Search / Select Capacity..."
              />
            ) : (
              <Input label="Capacity (A)" name="powerRating" value={form.powerRating} onChange={handleChange} placeholder="e.g. 125 A" />
            )}

            <Input label="Voltage Input/Output" name="voltage" value={form.voltage} onChange={handleChange} placeholder="e.g. 415V AC / 750V DC" />

            {/* Redundant standalone MCCB/MCB Maker fields removed as handled dynamically per breaker */}

            <Select2
              label="Speed Category"
              name="chargerCategory"
              value={form.chargerCategory}
              onChange={handleChange}
              options={[
                { value: "Slow", label: "Slow" },
                { value: "Fast", label: "Fast" },
                { value: "Ultra Fast", label: "Ultra Fast" },
              ]}
              required
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

          </fieldset>

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

          {/* 📷 Charger Photo Upload Section (Front, Left, Right) */}
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>
              📷 Upload Charger #{assetIndex} Photos (Front, Left, Right) <span style={{ color: "var(--danger)" }}>*</span>
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px" }}>
              Capture or upload 3 required angle photos of this EV charger.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginTop: "12px" }}>
              {CHARGER_PHOTO_SECTIONS.map((sec) => {
                const matched = findMatchedPhoto(sec.label);
                const validationError = errors[`photo_${sec.label}`];

                return (
                  <SinglePhotoUploader
                    key={sec.id}
                    surveyId={surveyId}
                    categoryId={`Charger #${assetIndex} - ${sec.label}`}
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
            <div style={{ marginTop: "20px" }}>
              <Button type="submit" disabled={submitting} style={{ width: "100%" }}>
                {submitting ? "Saving Charger Survey..." : `Save & Complete Charger #${assetIndex} Checklist`}
              </Button>
            </div>
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

