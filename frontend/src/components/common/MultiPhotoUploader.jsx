import React, { useState, useRef } from "react";
import { Camera, UploadCloud, X, RefreshCw, CheckCircle2 } from "lucide-react";

/**
 * MultiPhotoUploader Component with Live Camera Capture & Multi File Upload
 * Features:
 * - 📸 WebRTC Live Camera Modal (Snap photo directly from laptop/webcam or mobile camera)
 * - 📱 Native Camera capture fallback (`capture="environment"`)
 * - 📁 Multi File Drag & Drop upload
 * - Optional (non-mandatory)
 */
const MultiPhotoUploader = ({
  files = [],
  setFiles,
  label = "Station & Equipment Photos",
  maxFiles = 10
}) => {
  const [dragActive, setDragActive] = useState(false);
  
  // Camera Modal State
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState("");
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Open WebRTC Camera
  const openCamera = async () => {
    setCameraError("");
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setCameraError("Unable to access camera feed. Please check camera permissions or use File Select.");
    }
  };

  // Close Camera Stream
  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  // Capture Snapshot from Live Camera Feed
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const fileName = `camera_photo_${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: "image/jpeg" });

      setFiles((prev) => [...prev, file].slice(0, maxFiles));
      closeCamera();
    }, "image/jpeg", 0.88);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const validImages = selectedFiles.filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...validImages].slice(0, maxFiles));
  };

  const handleRemove = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
      setFiles((prev) => [...prev, ...droppedFiles].slice(0, maxFiles));
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
        <label style={{ fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Camera size={16} style={{ color: "#6366f1" }} />
          <span>{label}</span>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "normal" }}>
            (Optional - Capture or upload photos)
          </span>
        </label>

        {/* Action Buttons: 📸 Live Camera + 📁 Upload Files */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={openCamera}
            style={{
              backgroundColor: "rgba(99, 102, 241, 0.2)",
              color: "#a5b4fc",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease"
            }}
          >
            <Camera size={14} />
            <span>📸 Click Photo</span>
          </button>

          {/* Native Mobile Camera Trigger */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {/* Drag & Drop File Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        style={{
          border: dragActive ? "2px dashed #6366f1" : "2px dashed var(--border-color, rgba(255, 255, 255, 0.2))",
          borderRadius: "10px",
          padding: "18px",
          textAlign: "center",
          backgroundColor: dragActive ? "rgba(99, 102, 241, 0.08)" : "rgba(255, 255, 255, 0.02)",
          transition: "all 0.2s ease",
          cursor: "pointer"
        }}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <UploadCloud size={24} style={{ color: dragActive ? "#6366f1" : "var(--text-secondary)" }} />
          <p style={{ fontSize: "13px", color: "var(--text-primary)" }}>
            <strong>Click to browse files</strong> or drag & drop multiple photos here
          </p>
          <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
            Or use the <strong>"📸 Click Photo"</strong> button above to snap live photos directly from camera
          </p>
        </div>
      </div>

      {/* Photo Previews */}
      {files.length > 0 && (
        <div style={{ marginTop: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle2 size={14} /> Attached Photos ({files.length}/{maxFiles})
            </span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
            gap: "10px"
          }}>
            {files.map((file, idx) => {
              const previewUrl = URL.createObjectURL(file);
              return (
                <div
                  key={idx}
                  style={{
                    position: "relative",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid var(--border-color, rgba(255,255,255,0.15))",
                    aspectRatio: "1/1",
                    backgroundColor: "#000"
                  }}
                >
                  <img
                    src={previewUrl}
                    alt={`Snap ${idx + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(idx);
                    }}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      backgroundColor: "rgba(239, 68, 68, 0.85)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: "22px",
                      height: "22px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}
                    title="Remove photo"
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 📸 WEBRTC LIVE CAMERA MODAL */}
      {showCameraModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "var(--card-bg, #1e293b)",
            padding: "20px",
            borderRadius: "12px",
            maxWidth: "540px",
            width: "100%",
            border: "1px solid var(--border-color, rgba(255,255,255,0.15))",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <Camera size={18} style={{ color: "#6366f1" }} /> Live Camera View
              </h3>
              <button
                type="button"
                onClick={closeCamera}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {cameraError ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--danger)" }}>
                <p>{cameraError}</p>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current && cameraInputRef.current.click()}
                  style={{ marginTop: "12px", padding: "8px 16px", borderRadius: "6px", backgroundColor: "var(--primary)", color: "#fff", border: "none", cursor: "pointer" }}
                >
                  Use Native Mobile Camera
                </button>
              </div>
            ) : (
              <>
                <div style={{
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#000",
                  aspectRatio: "4/3"
                }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                  <button
                    type="button"
                    onClick={closeCamera}
                    style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)", border: "none", cursor: "pointer" }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={captureSnapshot}
                    style={{
                      padding: "10px 24px",
                      borderRadius: "24px",
                      backgroundColor: "#6366f1",
                      color: "#fff",
                      border: "none",
                      fontWeight: "700",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)"
                    }}
                  >
                    <Camera size={18} />
                    <span>Snap Photo</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiPhotoUploader;
