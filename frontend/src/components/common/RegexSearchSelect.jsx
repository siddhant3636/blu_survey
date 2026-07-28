import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";

/**
 * RegexSearchSelect - Searchable Dropdown with Regex Matching
 * Features:
 * - Real-time Regex filtering
 * - Robust fallback to substring matching if regex syntax is invalid
 * - Custom styling matching dark/light themes
 * - Chevron and Clear icons
 * - Click-outside and accessibility handling
 */
const RegexSearchSelect = ({
  label,
  value,
  onChange,
  options = [],
  name,
  required = false,
  placeholder = "Select or search...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Find currently selected option
  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Sync searchQuery with selected option label when dropdown is closed or value changes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery(selectedOption ? selectedOption.label : "");
    }
  }, [selectedOption, isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    setIsOpen(true);
    // Select text on focus so user can immediately type to overwrite
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleSelect = (option) => {
    onChange({
      target: {
        name,
        value: option.value
      }
    });
    setSearchQuery(option.label);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({
      target: {
        name,
        value: ""
      }
    });
    setSearchQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Filter options based on regex matching
  const filteredOptions = options.filter((opt) => {
    // If search is empty or matches current selected option's label exactly, show all
    if (!searchQuery || searchQuery === (selectedOption ? selectedOption.label : "")) {
      return true;
    }
    try {
      const regex = new RegExp(searchQuery, "i");
      return (
        regex.test(opt.label) ||
        (opt.siteId && regex.test(opt.siteId)) ||
        (opt.concessionaire && regex.test(opt.concessionaire))
      );
    } catch (err) {
      // Fallback to basic case-insensitive substring match when regex is incomplete or invalid
      const q = searchQuery.toLowerCase();
      return (
        opt.label.toLowerCase().includes(q) ||
        (opt.siteId && opt.siteId.toLowerCase().includes(q)) ||
        (opt.concessionaire && opt.concessionaire.toLowerCase().includes(q))
      );
    }
  });

  return (
    <div
      className={`form-group ${className}`}
      style={{
        position: "relative",
        zIndex: isOpen ? 9999 : 500,
        marginBottom: "20px"
      }}
      ref={containerRef}
    >
      {label && (
        <label className="form-label" style={{ fontWeight: "600", fontSize: "14px", display: "block", marginBottom: "6px" }}>
          {label} {required && <span style={{ color: "var(--danger)" }}>*</span>}
        </label>
      )}

      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          required={required && !value}
          className="form-control"
          style={{
            width: "100%",
            paddingRight: "60px"
          }}
        />

        <div
          style={{
            position: "absolute",
            right: "12px", top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--text-secondary)"
          }}
        >
          {value && (
            <X
              size={16}
              onClick={handleClear}
              style={{ cursor: "pointer", opacity: 0.6 }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
            />
          )}
          <ChevronDown
            size={18}
            onClick={() => {
              setIsOpen((prev) => !prev);
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }}
            style={{
              cursor: "pointer",
              transition: "transform 0.2s ease",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
            }}
          />
        </div>
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "6px",
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--border-radius)",
            boxShadow: "var(--box-shadow)",
            backdropFilter: "var(--glass-blur)",
            zIndex: 10000,
            overflow: "hidden",
            maxHeight: "220px",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div style={{ overflowY: "auto", flex: 1, padding: "6px 0" }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: "12px 16px", fontSize: "14px", color: "var(--text-secondary)", textAlign: "center" }}>
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={opt.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(opt);
                    }}
                    style={{
                      padding: "10px 16px",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: isSelected ? "rgba(99, 102, 241, 0.15)" : "transparent",
                      color: isSelected ? "var(--secondary)" : "var(--text-primary)",
                      transition: "background-color 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={14} style={{ color: "var(--secondary)" }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegexSearchSelect;
