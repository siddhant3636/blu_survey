import React, { useEffect, useState } from "react";
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
import { Camera as CameraIcon, Trash2, CheckCircle2 } from "lucide-react";

const PANEL_PHOTO_SECTIONS = [
  { id: "Front View", label: "Front View", icon: "📷", desc: "Front view of Panel Board door" },
  { id: "Left View", label: "Left View", icon: "⬅️", desc: "Left side clearance view" },
  { id: "Right View", label: "Right View", icon: "➡️", desc: "Right side clearance view" },
];

const PanelSurvey = () => {
  const { surveyId } = useParams();
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get("assetId");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [assetIndex, setAssetIndex] = useState(1);
  
  // Dynamic Master Dropdown Lists
  const [mccb4pRatings, setMccb4pRatings] = useState([]);
  const [mcb2pRatings, setMcb2pRatings] = useState([]);
  const [mcb4pRatings, setMcb4pRatings] = useState([]);
  const [makeOptions, setMakeOptions] = useState([]);

  // Selected Breaker Fields
  const [mccb4pSelected, setMccb4pSelected] = useState("");
  const [mcb2pSelected, setMcb2pSelected] = useState("");
  const [mcb4pSelected, setMcb4pSelected] = useState("");
  const [selectedMake, setSelectedMake] = useState("");

  const [form, setForm] = useState({
    name: "",
    capacity: "",
    incomingSource: "",
    cableSize: "",
  });

  // Panel Photos & Camera state
  const [panelPhotos, setPanelPhotos] = useState([]);
  const [activePhotoSection, setActivePhotoSection] = useState(null);
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });

  const { uploadFile, progress, loading: uploading } = useUpload(
    `${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/photos`
  );

  const fetchPhotos = async () => {
    try {
      const pRes = await surveyService.getPhotos(surveyId);
      setPanelPhotos(pRes.data?.photos || []);
    } catch (err) {
      console.error(err);
    }
  };

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

        const sData = surveyRes.data?.data?.survey || surveyRes.data?.survey;
        const targetAsset = (sData?.panels || []).find((p) => p.id === assetId);
        if (targetAsset) {
          setAssetIndex(targetAsset.assetIndex);
          
          let parsedRating = targetAsset.breakerRating || "";
          let parsedMake = "";
          if (parsedRating.includes(" (") && parsedRating.endsWith(")")) {
            const parts = parsedRating.split(" (");
            parsedRating = parts[0];
            parsedMake = parts[1].slice(0, -1);
          }
          
          if (parsedRating.startsWith("MCB ") && parsedRating.includes("2P")) {
            setMcb2pSelected(parsedRating);
          } else if (parsedRating.startsWith("MCB ") && parsedRating.includes("4P")) {
            setMcb4pSelected(parsedRating);
          } else if (parsedRating.startsWith("MCCB")) {
            setMccb4pSelected(parsedRating);
          } else if (parsedRating) {
            setMccb4pSelected(parsedRating);
          }

          setSelectedMake(parsedMake);

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

  const handleMccb4pChange = (val) => {
    setMccb4pSelected(val);
    setErrors((prev) => ({ ...prev, breakerRating: null }));
    if (val) {
      setMcb2pSelected("");
      setMcb4pSelected("");
    }
  };

  const handleMcb2pChange = (val) => {
    setMcb2pSelected(val);
    setErrors((prev) => ({ ...prev, breakerRating: null }));
    if (val) {
      setMccb4pSelected("");
      setMcb4pSelected("");
    }
  };

  const handleMcb4pChange = (val) => {
    setMcb4pSelected(val);
    setErrors((prev) => ({ ...prev, breakerRating: null }));
    if (val) {
      setMccb4pSelected("");
      setMcb2pSelected("");
    }
  };

  const handleMakeChange = (e) => {
    setSelectedMake(e.target.value);
    setErrors((prev) => ({ ...prev, selectedMake: null }));
  };

  const handlePhotoCapture = async (base64Img, targetSecLabel) => {
    const label = targetSecLabel || activePhotoSection;
    if (!label) return;

    const categoryId = `Panel #${assetIndex} - ${label}`;

    try {
      const resBlob = await fetch(base64Img);
      const blob = await resBlob.blob();
      const file = new File([blob], `panel_${assetIndex}_${label.replace(/\s+/g, "_")}-${Date.now()}.jpg`, { type: "image/jpeg" });

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
    const expectedCategory = `Panel #${assetIndex} - ${secLabel}`.toLowerCase();
    const fallbackCategory = `Panel ${secLabel}`.toLowerCase();
    return panelPhotos.find((p) => {
      const name = (p.category?.name || "").toLowerCase();
      return name === expectedCategory || (assetIndex === 1 && (name === fallbackCategory || (name.includes("panel") && name.includes(secLabel.toLowerCase()))));
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name || !form.name.trim()) {
      newErrors.name = "Panel Board Name / Tag is required.";
    }

    if (!selectedMake || !selectedMake.trim()) {
      newErrors.selectedMake = "Breaker Make / Brand is required.";
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
      const activeRating = mccb4pSelected || mcb2pSelected || mcb4pSelected;
      const combinedBreaker = selectedMake && activeRating
        ? `${activeRating} (${selectedMake})`
        : selectedMake || activeRating || "Default";
        
      const payload = {
        name: form.name.trim(),
        capacity: form.capacity.trim() || null,
        incomingSource: form.incomingSource.trim() || null,
        cableSize: form.cableSize.trim() || null,
        breakerRating: combinedBreaker,
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

  if (loading) return <Loader />;

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

      <Card>
        <form onSubmit={handleSubmit}>
          <div id="field-name">
            <Input label="Panel Board Name / Tag" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. LT Panel Board 1" error={errors.name} />
          </div>

          <Input label="Capacity Rating (e.g. 250A, 400A TPN)" name="capacity" value={form.capacity} onChange={handleChange} placeholder="e.g. 400A TPN" />
          <Input label="Incoming Feeder Source" name="incomingSource" value={form.incomingSource} onChange={handleChange} placeholder="e.g. Transformer 1 LT Side" />
          
          {/* ⚡ Dynamic Breaker Dropdowns (MCCB 4P, MCB 2P, MCB 4P) */}
          <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)", marginBottom: "20px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#6366f1", marginBottom: "12px" }}>
              ⚡ Breaker Selection (Select Type & Brand)
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Select2
                label="⚡ MCCB 4P Rating (Master Data)"
                value={mccb4pSelected}
                onChange={(e) => handleMccb4pChange(e.target.value)}
                options={mccb4pRatings}
                placeholder="Select MCCB 4P Rating (e.g. MCCB 100A 4P, MCCB 250A 4P)..."
              />

              <Select2
                label="🔌 MCB 2P Rating (Master Data)"
                value={mcb2pSelected}
                onChange={(e) => handleMcb2pChange(e.target.value)}
                options={mcb2pRatings}
                placeholder="Select MCB 2P Rating (e.g. MCB 6A 2P, MCB 32A 2P, MCB 63A 2P)..."
              />

              <Select2
                label="⚡ MCB 4P Rating (Master Data)"
                value={mcb4pSelected}
                onChange={(e) => handleMcb4pChange(e.target.value)}
                options={mcb4pRatings}
                placeholder="Select MCB 4P Rating (e.g. MCB 6A 4P, MCB 32A 4P, MCB 63A 4P)..."
              />

              <div id="field-selectedMake">
                <Select2
                  label="🏷️ Breaker Make / Brand (Master Data)"
                  name="selectedMake"
                  value={selectedMake}
                  onChange={handleMakeChange}
                  options={makeOptions}
                  placeholder="Select Breaker Brand (Schneider Electric, L&T, ABB, Havells)..."
                  required
                  error={errors.selectedMake}
                />
              </div>
            </div>
          </div>

          <Input label="Incoming Cable Size & Specification" name="cableSize" value={form.cableSize} onChange={handleChange} placeholder="e.g. 3.5C x 240 sqmm Armoured Al" />

          {/* 📍 GPS Tagging Section */}
          <div id="field-gps" style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "700" }}>📍 GPS Location Tagging <span style={{ color: "var(--danger)" }}>*</span></h4>
            </div>
            <GPS onCoordinatesFetched={(c) => { setCoordinates(c); setErrors((prev) => ({ ...prev, gps: null })); }} />
            {errors.gps && <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "6px" }}>{errors.gps}</p>}
          </div>

          {/* 📷 Panel Photo Upload Section (Front, Left, Right) */}
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>
              📷 Upload Panel #{assetIndex} Photos (Front, Left, Right) <span style={{ color: "var(--danger)" }}>*</span>
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px" }}>
              Capture or upload 3 required angle photos of this electrical panel.
            </p>

            {uploading && (
              <div style={{ padding: "10px", backgroundColor: "rgba(99, 102, 241, 0.1)", borderRadius: "8px", marginBottom: "12px" }}>
                <p style={{ fontSize: "12px", fontWeight: "600" }}>Uploading Panel Photo... {progress}%</p>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginTop: "12px" }}>
              {PANEL_PHOTO_SECTIONS.map((sec) => {
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
            {submitting ? "Saving Panel Survey..." : `Save & Complete Panel #${assetIndex} Checklist`}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default PanelSurvey;
