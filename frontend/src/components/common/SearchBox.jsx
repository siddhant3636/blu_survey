import React from "react";

const SearchBox = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-control"
      />
    </div>
  );
};

export default SearchBox;
