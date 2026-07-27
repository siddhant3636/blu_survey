import React, { useState, useEffect } from "react";
import { Camera as CameraIcon, Trash2, CheckCircle2, Lock } from "lucide-react";
import Button from "./Button";
import { useUpload } from "../../hooks/useUpload";
import surveyService from "../../services/survey.service";
import Camera from "./Camera";

const getImageUrl = (photo) => {
  if (!photo) return null;
  let rawUrl = photo.url || (photo.filePath ? `/uploads/${photo.filePath}` : null);
  if (!rawUrl) return null;

  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }

  if (!rawUrl.startsWith("/")) {
    rawUrl = `/${rawUrl}`;
  }

  const encodedPath = rawUrl
    .split("/")
    .map((seg) => {
      try {
        const decoded = decodeURIComponent(seg);
        return encodeURIComponent(decoded);
      } catch (e) {
        return encodeURIComponent(seg);
      }
    })
    .join("/");

  let envApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

  if (
    typeof window !== "undefined" &&
    window.location &&
    !window.location.hostname.includes("localhost") &&
    !window.location.hostname.includes("127.0.0.1") &&
    envApiUrl.includes("localhost")
  ) {
    envApiUrl = window.location.origin + "/api/v1";
  }

  const apiHost = envApiUrl
    .replace(/\/api\/v1\/?$/, "")
    .replace(/\/+$/, "");

  return `${apiHost}${encodedPath}`;
};

const SinglePhotoUploader = ({
  surveyId,
  categoryId,
  label,
  icon,
  coordinates,
  matchedPhoto,
  onUploadSuccess,
  onDeleteSuccess,
  validationError,
  readOnly = false,
}) => {
  const uploadUrl = `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, "") : "http://localhost:5000"}/api/v1/photos`;
  const { uploadFile, progress, loading: uploading, error: uploadError } = useUpload(uploadUrl);
  const [localError, setLocalError] = useState(null);
  const [cameraSupportError, setCameraSupportError] = useState(null);
  const [imgLoadFailed, setImgLoadFailed] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);

  // FIX: Preview tabhi clear hoga jab hum dusre question ya survey par jayenge.
  // Upload success hone par (matchedPhoto aane par) local preview gayab nahi hoga.
  useEffect(() => {
    setLocalPreview(null);
    setImgLoadFailed(false);
  }, [surveyId, categoryId]);

  // Handles cleanup of object URLs if needed
  useEffect(() => {
    return () => {
      if (localPreview && localPreview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(localPreview);
        } catch (e) { }
      }
    };
  }, [localPreview]);

  const handleFileSelected = async (file) => {
    if (!file || readOnly) return;
    setLocalError(null);
    setCameraSupportError(null);
    setImgLoadFailed(false);
    try {
      await uploadFile(file, {
        surveyId,
        categoryId,
        latitude: coordinates.latitude || "",
        longitude: coordinates.longitude || "",
      });
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error(`Upload error details for ${label}:`, err);
      const userMessage = err.response?.data?.message || err.message || "Image upload failed. Please try again.";
      setLocalError(userMessage);
      setLocalPreview(null);
    }
  };

  const handleDelete = async () => {
    if (!matchedPhoto || readOnly) return;
    if (!window.confirm(`Are you sure you want to delete the photo for ${label}?`)) return;
    setLocalError(null);
    setCameraSupportError(null);
    try {
      await surveyService.removePhoto(matchedPhoto.id);
      setLocalPreview(null);
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (err) {
      console.error(`Delete error details for ${label}:`, err);
      const userMessage = err.response?.data?.message || err.message || "Failed to delete photo. Please try again.";
      setLocalError(userMessage);
    }
  };

  const triggerCamera = async () => {
    if (readOnly) return;
    setLocalError(null);
    setCameraSupportError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraSupportError("Camera access is not supported on this device or browser.");
      return;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideoInput = devices.some((device) => device.kind === "videoinput");
      if (!hasVideoInput) {
        setCameraSupportError("Camera access is not supported on this device or browser.");
        return;
      }
      setShowWebcam(true);
    } catch (err) {
      setCameraSupportError("Camera access is not supported on this device or browser.");
    }
  };

  const handleCapture = async (base64Img) => {
    try {
      setImgLoadFailed(false);

      // Set the base64 string directly as the preview image immediately.
      setLocalPreview(base64Img);
      setShowWebcam(false);

      // Convert to file for uploading in the background
      const resBlob = await fetch(base64Img);
      const blob = await resBlob.blob();
      const safeCategory = categoryId ? String(categoryId).replace(/\s+/g, "_") : "capture";
      const file = new File([blob], `${safeCategory}-${Date.now()}.jpg`, { type: "image/jpeg" });

      await handleFileSelected(file);
    } catch (err) {
      console.error("Handle capture error:", err);
      setLocalPreview(null);
      setLocalError("Failed to process captured image");
    }
  };

  const hasError = validationError || localError || uploadError || cameraSupportError;
  const imageSrc = getImageUrl(matchedPhoto);
  // localPreview ko pehle priority milegi taaki upload ke baad bhi yahi dikhta rahe
  const displaySrc = localPreview || imageSrc;

  return (
    <div
      id={`field-photo_${label.replace(/\s+/g, "_")}`}
      style={{
        padding: "14px",
        borderRadius: "8px",
        border: hasError ? "1px solid var(--danger)" : "1px solid var(--border-color)",
        backgroundColor: "var(--bg-color)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "220px",
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
            {icon} {label} {!readOnly && <span style={{ color: "var(--danger)" }}>*</span>}
          </span>
          {readOnly ? (
            <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "2px" }}>
              <Lock size={12} /> Read-only
            </span>
          ) : matchedPhoto ? (
            <CheckCircle2 size={16} style={{ color: "#10b981" }} />
          ) : null}
        </div>

        {uploading && (
          <div style={{ padding: "8px", backgroundColor: "rgba(99, 102, 241, 0.1)", borderRadius: "6px", marginBottom: "8px" }}>
            <p style={{ fontSize: "11px", fontWeight: "600", margin: 0 }}>Uploading... {progress}%</p>
          </div>
        )}

        {showWebcam ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
            <Camera onCapture={handleCapture} onCancel={() => setShowWebcam(false)} />
          </div>
        ) : displaySrc ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ width: "100%", height: "110px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border-color)", backgroundColor: "#000" }}>
              {!imgLoadFailed ? (
                <img
                  src={displaySrc}
                  alt={label}
                  onError={(e) => {
                    console.error("Failed to load image preview:", displaySrc);
                    setImgLoadFailed(true);
                  }}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px", textAlign: "center" }}>
                  <p style={{ fontSize: "11px", color: "var(--danger)", margin: 0, fontWeight: "600" }}>Image File Unavailable</p>
                  <p style={{ fontSize: "10px", color: "var(--text-secondary)", margin: "2px 0 0 0" }}>{matchedPhoto?.fileName || "Check network or file path"}</p>
                </div>
              )}
            </div>
            {matchedPhoto ? (
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0 }}>
                📍 {matchedPhoto.latitude ? `${matchedPhoto.latitude.toFixed(3)}, ${matchedPhoto.longitude.toFixed(3)}` : "No GPS"}
              </p>
            ) : (
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0 }}>
                📍 Fetching metadata...
              </p>
            )}
          </div>
        ) : (
          !readOnly && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
              <Button
                variant="primary"
                size="small"
                type="button"
                disabled={uploading}
                onClick={triggerCamera}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <CameraIcon size={14} /> Capture {label}
              </Button>
            </div>
          )
        )}
      </div>

      {hasError && (
        <p style={{ color: "var(--danger)", fontSize: "11px", marginTop: "6px", marginBottom: 0 }}>
          {validationError || localError || uploadError || cameraSupportError}
        </p>
      )}

      {matchedPhoto && !readOnly && !showWebcam && (
        <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <Button
            variant="secondary"
            size="small"
            type="button"
            disabled={uploading}
            onClick={triggerCamera}
            style={{ width: "100%", fontSize: "11px", padding: "4px 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
          >
            <CameraIcon size={12} /> Retake
          </Button>
          <Button
            variant="secondary"
            size="small"
            type="button"
            disabled={uploading}
            onClick={handleDelete}
            style={{ width: "100%", color: "var(--danger)", fontSize: "11px", padding: "4px 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
          >
            <Trash2 size={12} /> Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default SinglePhotoUploader;