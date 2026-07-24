import React from "react";

const Input = ({ label, type = "text", value, onChange, placeholder, name, required = false, className = "", error, max, min, step, disabled, style, ...props }) => {
  return (
    <div className={`form-group ${className}`}>
      {label && <label className="form-label">{label}{required && " *"}</label>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        max={max}
        min={min}
        step={step}
        disabled={disabled}
        style={style}
        className="form-control"
        {...props}
      />
      {error && <span style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>{error}</span>}
    </div>
  );
};

export default Input;
