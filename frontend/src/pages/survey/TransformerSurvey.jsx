import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import surveyService from "../../services/survey.service";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Camera from "../../components/common/Camera";
import GPS from "../../components/common/GPS";
import Loader from "../../components/common/Loader";
import { useUpload } from "../../hooks/useUpload";
import { Camera as CameraIcon, Trash2, CheckCircle2 } from "lucide-react";

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

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [assetIndex, setAssetIndex] = useState(1);

  const [form, setForm] = useState({
    capacityKVA: "",
    voltageRatio: "",
    currentRating: "",
    oilLevelOk: true,
    earthingStatus: "",
  });

  // Transformer Photos & Camera state
  const [transformerPhotos, setTransformerPhotos] = useState([]);
  const [activePhotoSection, setActivePhotoSection] = useState(null);
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });

  const { uploadFile, progress, loading: uploading } = useUpload(
    `${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/photos`
  );

  const fetchPhotos = async () => {
    try {
      const pRes = await surveyService.getPhotos(surveyId);
      setTransformerPhotos(pRes.data?.photos || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await surveyService.getSurvey(surveyId);
        const sData = res.data?.data?.survey || res.data?.survey;
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

  const handlePhotoCapture = async (base64Img, targetSecLabel) => {
    const label = targetSecLabel || activePhotoSection;
    if (!label) return;

    const categoryId = `Transformer #${assetIndex} - ${label}`;

    try {
      const resBlob = await fetch(base64Img);
      const blob = await resBlob.blob();
      const file = new File([blob], `transformer_${assetIndex}_${label.replace(/\s+/g, "_")}-${Date.now()}.jpg`, { type: "image/jpeg" });

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
    const expectedCategory = `Transformer #${assetIndex} - ${secLabel}`.toLowerCase();
    const fallbackCategory = `Transformer ${secLabel}`.toLowerCase();
    return transformerPhotos.find((p) => {
      const name = (p.category?.name || "").toLowerCase();
      return name === expectedCategory || (assetIndex === 1 && (name === fallbackCategory || (name.includes("transformer") && name.includes(secLabel.toLowerCase()))));
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

  if (loading) return <Loader />;

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
            <Input label="Capacity in KVA" name="capacityKVA" type="number" step="any" min="0.01" value={form.capacityKVA} onChange={handleChange} required placeholder="e.g. 500" error={errors.capacityKVA} />
          </div>

          <div id="field-voltageRatio">
            <Input label="Voltage Ratio (e.g. 11kV/415V)" name="voltageRatio" value={form.voltageRatio} onChange={handleChange} required placeholder="e.g. 11kV / 415V" error={errors.voltageRatio} />
          </div>

          <div id="field-currentRating">
            <Input label="Rated Current" name="currentRating" value={form.currentRating} onChange={handleChange} required placeholder="e.g. 695A LT Side" error={errors.currentRating} />
          </div>

          <div id="field-earthingStatus">
            <Input label="Earthing Pit Status & Continuity" name="earthingStatus" value={form.earthingStatus} onChange={handleChange} required placeholder="e.g. Dual copper earthing connected, OK" error={errors.earthingStatus} />
          </div>

          <div className="form-group" style={{ display: "flex", gap: "10px", alignItems: "center", margin: "16px 0" }}>
            <input type="checkbox" name="oilLevelOk" checked={form.oilLevelOk} onChange={handleChange} id="chk-oil" />
            <label htmlFor="chk-oil" style={{ fontSize: "14px", cursor: "pointer" }}>Transformer Oil Level & Silica Gel Breather Normal</label>
          </div>

          {/* 📍 GPS Tagging Section */}
          <div id="field-gps" style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "700" }}>📍 GPS Location Tagging <span style={{ color: "var(--danger)" }}>*</span></h4>
            </div>
            <GPS onCoordinatesFetched={(c) => { setCoordinates(c); setErrors((prev) => ({ ...prev, gps: null })); }} />
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

            {uploading && (
              <div style={{ padding: "10px", backgroundColor: "rgba(99, 102, 241, 0.1)", borderRadius: "8px", marginBottom: "12px" }}>
                <p style={{ fontSize: "12px", fontWeight: "600" }}>Uploading Transformer Photo... {progress}%</p>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginTop: "12px" }}>
              {TRANSFORMER_PHOTO_SECTIONS.map((sec) => {
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
                      justify: "space-between"
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

          <Button type="submit" disabled={submitting} style={{ width: "100%", marginTop: "24px" }}>
            {submitting ? "Saving Transformer Survey..." : `Save & Complete Transformer #${assetIndex}`}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default TransformerSurvey;
