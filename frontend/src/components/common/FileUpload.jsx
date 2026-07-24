import React, { useRef } from "react";
import Button from "./Button";

const FileUpload = ({ onFileSelected, accept = "*", label = "Upload File" }) => {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0 && onFileSelected) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        style={{ display: "none" }}
      />
      <Button variant="secondary" onClick={handleButtonClick}>
        {label}
      </Button>
    </div>
  );
};

export default FileUpload;
