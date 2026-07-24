import React, { useRef, useState } from "react";
import { useCamera } from "../../hooks/useCamera";
import Button from "./Button";

const Camera = ({ onCapture }) => {
  const { videoRef, stream, error, startCamera, stopCamera, capturePhoto } = useCamera();
  const canvasRef = useRef(null);
  const [capturedImg, setCapturedImg] = useState(null);

  const handleStart = async () => {
    setCapturedImg(null);
    await startCamera();
  };

  const handleCapture = () => {
    const photo = capturePhoto(canvasRef);
    if (photo) {
      setCapturedImg(photo);
      stopCamera();
      if (onCapture) onCapture(photo);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      
      <div style={{
        width: "100%", maxWidth: "400px", height: "300px",
        backgroundColor: "#000", borderRadius: "var(--border-radius)",
        overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        {capturedImg ? (
          <img src={capturedImg} alt="Captured" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : stream ? (
          <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ color: "var(--text-secondary)" }}>Camera Offline</span>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={{ display: "flex", gap: "12px" }}>
        {!stream && !capturedImg && <Button onClick={handleStart}>Start Camera</Button>}
        {stream && <Button variant="primary" onClick={handleCapture}>Capture</Button>}
        {stream && <Button variant="secondary" onClick={stopCamera}>Cancel</Button>}
        {capturedImg && <Button onClick={handleStart}>Retake</Button>}
      </div>
    </div>
  );
};

export default Camera;
