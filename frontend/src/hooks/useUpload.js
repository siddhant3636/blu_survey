import { useState } from "react";
import axios from "axios";

export const useUpload = (uploadUrl) => {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFile = async (file, additionalData = {}) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("photo", file);
    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });

    try {
      const response = await axios.post(uploadUrl || "/api/v1/photos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Upload failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { progress, loading, error, uploadFile };
};
