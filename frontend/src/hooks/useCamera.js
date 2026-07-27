import { useState, useRef, useCallback } from "react";

export const useCamera = () => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const activeRequestRef = useRef(false);

  const stopCamera = useCallback(() => {
    activeRequestRef.current = false;
    
    // 1. Explicitly stop tracks on streamRef
    if (streamRef.current) {
      try {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => {
          try {
            track.stop();
          } catch (e) {}
        });
      } catch (e) {}
      streamRef.current = null;
    }

    // 2. Explicitly stop tracks on videoRef.srcObject if present
    if (videoRef.current) {
      try {
        if (videoRef.current.srcObject && typeof videoRef.current.srcObject.getTracks === "function") {
          videoRef.current.srcObject.getTracks().forEach((track) => {
            try {
              track.stop();
            } catch (e) {}
          });
        }
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch (e) {}
    }

    setStream(null);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera access is not supported on this device or browser.");
      return;
    }
    
    // Stop any existing tracks/streams
    stopCamera();

    activeRequestRef.current = true;
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Default to back camera on mobile
        audio: false,
      });
      
      // If stopCamera was called while getUserMedia was pending, clean up and discard
      if (!activeRequestRef.current) {
        mediaStream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (e) {}
        });
        return;
      }

      setStream(mediaStream);
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      if (activeRequestRef.current) {
        setError("Camera access is not supported on this device or browser.");
      }
    }
  }, [stopCamera]);

  const capturePhoto = useCallback((canvasRef) => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      if (width > 0 && height > 0) {
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, width, height);
        return canvas.toDataURL("image/jpeg", 0.92);
      }
    }
    return null;
  }, []);

  return { videoRef, stream, error, startCamera, stopCamera, capturePhoto };
};
