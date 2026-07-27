import React, { useRef, useState, useEffect } from "react";
import { useCamera } from "../../hooks/useCamera";
import Button from "./Button";

const Camera = ({ onCapture, onCancel }) => {
  const { videoRef, stream, error, startCamera, stopCamera, capturePhoto } = useCamera();
  const canvasRef = useRef(null);
  const [capturedImg, setCapturedImg] = useState(null);

  const handleStart = async () => {
    setCapturedImg(null);
    await startCamera();
  };

  useEffect(() => {
    setCapturedImg(null);
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    const photo = capturePhoto(canvasRef);
    if (photo) {
      setCapturedImg(photo);
      stopCamera();
      if (onCapture) onCapture(photo);
    }
  };

  const handleCancel = () => {
    stopCamera();
    if (onCancel) onCancel();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", width: "100%", maxWidth: "100%" }}>
      {error && <p style={{ color: "var(--danger)", fontSize: "13px", textAlign: "center" }}>{error}</p>}
      
      <div style={{
        width: "100%", maxWidth: "400px", height: "260px",
        backgroundColor: "#000", borderRadius: "var(--border-radius)",
        overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative"
      }}>
        {stream ? (
          <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Initializing Camera...</span>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
        {stream && (
          <Button variant="primary" onClick={handleCapture} style={{ flex: "1 1 120px", maxWidth: "160px" }}>
            📷 Capture
          </Button>
        )}
        <Button variant="secondary" onClick={handleCancel} style={{ flex: "1 1 120px", maxWidth: "160px" }}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default Camera;
