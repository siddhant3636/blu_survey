import React from "react";

const Select = ({ label, value, onChange, options = [], name, required = false, className = "" }) => {
  return (
    // Added position relative and a high z-index to force it above the glass cards
    <div className={`form-group ${className}`} style={{ position: "relative", zIndex: 500 }}>
      {label && <label className="form-label">{label}{required && " *"}</label>}
      
      <select name={name} value={value} onChange={onChange} required={required} className="form-control">
        <option value="">Select option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;