import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import surveyService from "../../services/survey.service";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Camera from "../../components/common/Camera";
import GPS from "../../components/common/GPS";
import Loader from "../../components/common/Loader";
import { useUpload } from "../../hooks/useUpload";
import { Camera as CameraIcon, Trash2, CheckCircle2 } from "lucide-react";

const PHOTO_SECTIONS = [
  { id: "Front Closed", label: "Front Closed", icon: "📷", desc: "Front view with panel/cabinet door closed" },
  { id: "Front Open", label: "Front Open", icon: "📸", desc: "Front view showing internal breakers & components" },
  { id: "Back", label: "Back View", icon: "🔙", desc: "Rear view showing cables and enclosure back" },
  { id: "Right", label: "Right Side View", icon: "➡️", desc: "Right side clearance & casing view" },
  { id: "Left", label: "Left Side View", icon: "⬅️", desc: "Left side clearance & casing view" },
];

const PhotoUpload = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });

  const { uploadFile, progress, loading: uploading } = useUpload(
    `${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/photos`
  );

  const fetchPhotos = async () => {
    try {
      const photosRes = await surveyService.getPhotos(surveyId);
      setPhotos(photosRes.data.photos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [surveyId]);

  const handleCapture = async (base64Img, targetSectionId) => {
    const secId = targetSectionId || activeSection;
    if (!secId) {
      alert("Please select a target angle first.");
      return;
    }

    try {
      const resBlob = await fetch(base64Img);
      const blob = await resBlob.blob();
      const file = new File([blob], `${secId.replace(/\s+/g, "_")}-${Date.now()}.jpg`, { type: "image/jpeg" });

      await uploadFile(file, {
        surveyId,
        categoryId: secId,
        latitude: coordinates.latitude || "",
        longitude: coordinates.longitude || "",
      });

      setActiveSection(null);
      fetchPhotos();
    } catch (err) {
      alert(err || "Upload failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await surveyService.removePhoto(id);
      fetchPhotos();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ maxWidth: "850px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "700" }}>Equipment & Site Photos</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Capture 5 mandatory angles for audit verification</p>
        </div>
        <Button variant="secondary" onClick={() => navigate(`/survey/assets/${surveyId}`)}>Back to Matrix</Button>
      </div>

      <GPS onCoordinatesFetched={(c) => setCoordinates(c)} />

      {uploading && (
        <Card style={{ padding: "16px", backgroundColor: "rgba(99, 102, 241, 0.1)", border: "1px solid var(--primary)" }}>
          <p style={{ fontWeight: "600", fontSize: "14px", marginBottom: "8px" }}>Uploading Photo... {progress}%</p>
          <div style={{ height: "6px", width: "100%", backgroundColor: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, backgroundColor: "var(--primary)", transition: "width 0.2s ease" }} />
          </div>
        </Card>
      )}

      {/* 5 PHOTO SECTIONS GRID (2 BOXES PER ROW) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
        {PHOTO_SECTIONS.map((sec, idx) => {
          const matchedPhoto = photos.find(
            (p) => p.category?.name?.toLowerCase() === sec.id.toLowerCase()
          );

          return (
            <Card key={sec.id} style={{ padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>{sec.icon}</span> {idx + 1}. {sec.label}
                      {matchedPhoto && <CheckCircle2 size={16} style={{ color: "#10b981" }} />}
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{sec.desc}</p>
                  </div>
                  {matchedPhoto && (
                    <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "600", backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "3px 8px", borderRadius: "10px", whitespace: "nowrap" }}>
                      ✓ Logged
                    </span>
                  )}
                </div>

                {matchedPhoto ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                    <div style={{ width: "100%", height: "160px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                      <img
                        src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api/v1", "") : "http://localhost:5000"}${matchedPhoto.url}`}
                        alt={sec.label}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <p style={{ fontWeight: "600", color: "var(--text-primary)" }}>{matchedPhoto.fileName}</p>
                      <p>📍 {matchedPhoto.latitude ? `${matchedPhoto.latitude.toFixed(4)}, ${matchedPhoto.longitude.toFixed(4)}` : "No GPS attached"}</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: "10px" }}>
                    {activeSection === sec.id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <Camera onCapture={(img) => handleCapture(img, sec.id)} />
                        <Button variant="secondary" size="small" onClick={() => setActiveSection(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <div
                        onClick={() => setActiveSection(sec.id)}
                        style={{
                          minHeight: "140px",
                          borderRadius: "8px",
                          border: "2px dashed var(--border-color)",
                          backgroundColor: "var(--bg-color)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          cursor: "pointer",
                          padding: "16px",
                          textAlign: "center",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <CameraIcon size={26} style={{ color: "var(--primary)" }} />
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--primary)" }}>
                          Open Camera for {sec.label}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {matchedPhoto && (
                <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border-color)" }}>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleDelete(matchedPhoto.id)}
                    style={{ width: "100%", color: "var(--danger)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                  >
                    <Trash2 size={14} /> Remove / Retake Photo
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
        <Button variant="secondary" onClick={() => navigate(`/survey/assets/${surveyId}`)}>Back to Matrix</Button>
        <Link to={`/survey/review/${surveyId}`}>
          <Button>Proceed to Final Review →</Button>
        </Link>
      </div>
    </div>
  );
};

export default PhotoUpload;
