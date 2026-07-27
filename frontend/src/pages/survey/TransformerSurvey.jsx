import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import surveyService from "../../services/survey.service";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Camera from "../../components/common/Camera";
import GPS from "../../components/common/GPS";
import Loader from "../../components/common/Loader";
import SinglePhotoUploader from "../../components/common/SinglePhotoUploader";
import { Camera as CameraIcon, Trash2, CheckCircle2, Upload } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const TRANSFORMER_PHOTO_SECTIONS = [
  { id: "Front View", label: "Front View", icon: "📷", desc: "Front view of Transformer & rating plate" },
  { id: "Left View", label: "Left View", icon: "⬅️", desc: "Left side view & radiator fins" },
  { id: "Right View", label: "Right View", icon: "➡️", desc: "Right side view & earthing connection" },
];

const TransformerSurvey = () => {
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

  const [form, setForm] = useState({
    capacityKVA: "",
    voltageRatio: "",
    currentRating: "",
    oilLevelOk: true,
    earthingStatus: "",
  });

  // Transformer Photos & Camera state
  const [transformerPhotos, setTransformerPhotos] = useState([]);
  const [surveyStatus, setSurveyStatus] = useState("DRAFT");
  const [activePhotoSection, setActivePhotoSection] = useState(null);
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });

  const fetchPhotos = async () => {
    try {
      const pRes = await surveyService.getPhotos(surveyId);
      setTransformerPhotos(pRes.data?.photos || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const lockAsset = async () => {
      if (!assetId) return;
      try {
        await surveyService.lockAsset("transformer", assetId);
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
        await surveyService.lockAsset("transformer", assetId);
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
        surveyService.unlockAsset("transformer", assetId).catch(console.error);
      }
    };
  }, [assetId, isLockedByOther, surveyStatus]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await surveyService.getSurvey(surveyId);
        const sData = res?.data?.data?.survey || res?.data?.survey;
        if (sData?.status) {
          setSurveyStatus(sData.status);
        }
        const targetAsset = (sData?.transformers || []).find((t) => t.id === assetId);
        if (targetAsset) {
          setAssetIndex(targetAsset.assetIndex);
          setForm({
            capacityKVA: targetAsset.capacityKVA !== null && targetAsset.capacityKVA !== undefined ? String(targetAsset.capacityKVA) : "",
            voltageRatio: targetAsset.voltageRatio || "",
            currentRating: targetAsset.currentRating || "",
            oilLevelOk: targetAsset.oilLevelOk !== false,
            earthingStatus: targetAsset.earthingStatus || "",
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
        setError("Failed to load transformer details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [surveyId, assetId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const findMatchedPhoto = (secLabel) => {
    const targetLabel = secLabel.toLowerCase();
    const expectedCategory = `transformer #${assetIndex} - ${targetLabel}`;
    return transformerPhotos.find((p) => {
      const name = (p.category?.name || "").toLowerCase();
      if (name === expectedCategory) return true;
      if (name.includes(targetLabel)) {
        if (name.includes(`#${assetIndex}`) || name.includes(`transformer ${assetIndex}`) || name.includes(`transformer_${assetIndex}`)) {
          return true;
        }
        if (transformerPhotos.length <= 3) return true;
      }
      return false;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    const parsedCap = parseFloat(form.capacityKVA);
    if (!form.capacityKVA || isNaN(parsedCap) || parsedCap <= 0) {
      newErrors.capacityKVA = "Capacity in KVA is required and must be greater than 0.";
    }

    if (!form.voltageRatio || !form.voltageRatio.trim()) {
      newErrors.voltageRatio = "Voltage Ratio is required.";
    }

    if (!form.currentRating || !form.currentRating.trim()) {
      newErrors.currentRating = "Rated Current is required.";
    }

    if (!form.earthingStatus || !form.earthingStatus.trim()) {
      newErrors.earthingStatus = "Earthing Pit Status & Continuity is required.";
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

    TRANSFORMER_PHOTO_SECTIONS.forEach((sec) => {
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
      const payload = {
        capacityKVA: parseFloat(form.capacityKVA),
        voltageRatio: form.voltageRatio.trim(),
        currentRating: form.currentRating.trim(),
        earthingStatus: form.earthingStatus.trim(),
        oilLevelOk: Boolean(form.oilLevelOk),
        latitude: parseFloat(coordinates.latitude),
        longitude: parseFloat(coordinates.longitude),
      };

      await surveyService.saveAssetData("transformer", assetId, payload);
      navigate(`/survey/assets/${surveyId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save transformer survey");
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
        <h2>Distribution Transformer #{assetIndex} Audit</h2>
        <Button variant="secondary" onClick={() => navigate(`/survey/assets/${surveyId}`)}>Back to Matrix</Button>
      </div>

      {error && (
        <div style={{ padding: "12px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", borderRadius: "8px", color: "var(--danger)", marginBottom: "16px", fontSize: "14px" }}>
          ⚠️ {error}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          <div id="field-capacityKVA">
            <Input label="Capacity in KVA" name="capacityKVA" type="number" step="any" min="0.01" value={form.capacityKVA} onChange={handleChange} required placeholder="e.g. 500" error={errors.capacityKVA} disabled={isReadOnly} />
          </div>

          <div id="field-voltageRatio">
            <Input label="Voltage Ratio (e.g. 11kV/415V)" name="voltageRatio" value={form.voltageRatio} onChange={handleChange} required placeholder="e.g. 11kV / 415V" error={errors.voltageRatio} disabled={isReadOnly} />
          </div>

          <div id="field-currentRating">
            <Input label="Rated Current" name="currentRating" value={form.currentRating} onChange={handleChange} required placeholder="e.g. 695A LT Side" error={errors.currentRating} disabled={isReadOnly} />
          </div>

          <div id="field-earthingStatus">
            <Input label="Earthing Pit Status & Continuity" name="earthingStatus" value={form.earthingStatus} onChange={handleChange} required placeholder="e.g. Dual copper earthing connected, OK" error={errors.earthingStatus} disabled={isReadOnly} />
          </div>

          <div className="form-group" style={{ display: "flex", gap: "10px", alignItems: "center", margin: "16px 0" }}>
            <input type="checkbox" name="oilLevelOk" checked={form.oilLevelOk} onChange={handleChange} id="chk-oil" disabled={isReadOnly} />
            <label htmlFor="chk-oil" style={{ fontSize: "14px", cursor: "pointer" }}>Transformer Oil Level & Silica Gel Breather Normal</label>
          </div>

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

          {/* 📷 Transformer Photo Upload Section (Front, Left, Right) */}
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>
              📷 Upload Transformer #{assetIndex} Photos (Front, Left, Right) <span style={{ color: "var(--danger)" }}>*</span>
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px" }}>
              Capture or upload 3 required angle photos of this distribution transformer.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginTop: "12px" }}>
              {TRANSFORMER_PHOTO_SECTIONS.map((sec) => {
                const matched = findMatchedPhoto(sec.label);
                const validationError = errors[`photo_${sec.label}`];

                return (
                  <SinglePhotoUploader
                    key={sec.id}
                    surveyId={surveyId}
                    categoryId={`Transformer #${assetIndex} - ${sec.label}`}
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
              {submitting ? "Saving Transformer Survey..." : `Save & Complete Transformer #${assetIndex}`}
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
};

export default TransformerSurvey;
