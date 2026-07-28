import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

/**
 * Select2 - Reusable Searchable Dropdown Component
 * Features:
 * - Real-time search filtering
 * - Dynamic options rendering
 * - Keyboard & click outside handling
 * - Clean glassmorphic / dark theme UI matching application design system
 */
const Select2 = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select or search...",
  required = false,
  disabled = false,
  name,
  onOpen,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      setSearchQuery("");
      if (onOpen) onOpen();
    }
  };

  const handleSelect = (optionValue) => {
    onChange({
      target: {
        name,
        value: optionValue
      }
    });
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({
      target: {
        name,
        value: ""
      }
    });
  };

  // Filter options based on search query
  const filteredOptions = options.filter((opt) => {
    if (!searchQuery) return true;
    try {
      const regex = new RegExp(searchQuery, "i");
      return (
        regex.test(opt.label) ||
        (opt.value && regex.test(String(opt.value))) ||
        (opt.siteId && regex.test(String(opt.siteId))) ||
        (opt.concessionaire && regex.test(String(opt.concessionaire)))
      );
    } catch (err) {
      const q = searchQuery.toLowerCase();
      const labelStr = (opt.label || opt.value || "").toString().toLowerCase();
      const siteIdStr = (opt.siteId || "").toString().toLowerCase();
      const concessionaireStr = (opt.concessionaire || "").toString().toLowerCase();
      return (
        labelStr.includes(q) ||
        siteIdStr.includes(q) ||
        concessionaireStr.includes(q)
      );
    }
  });

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  return (
    <div className="form-group" style={{ marginBottom: "16px", position: "relative", zIndex: isOpen ? 9999 : "auto" }} ref={containerRef}>
      {label && (
        <label className="form-label" style={{ fontWeight: "600", fontSize: "13px", display: "block", marginBottom: "6px" }}>
          {label} {required && <span style={{ color: "var(--danger)" }}>*</span>}
        </label>
      )}

      {/* Main Select Button Box */}
      <div
        onClick={handleToggle}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: "8px",
          border: error ? "1px solid var(--danger)" : "1px solid var(--border-color, rgba(255, 255, 255, 0.15))",
          backgroundColor: disabled ? "var(--border-color)" : "var(--card-bg)",
          color: selectedOption ? "var(--text-primary)" : "var(--text-secondary)",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "14px",
          transition: "all 0.2s ease",
          boxShadow: isOpen ? "0 0 0 2px var(--primary-light, rgba(99, 102, 241, 0.25))" : "none"
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {value && !disabled && (
            <X
              size={14}
              onClick={handleClear}
              style={{ opacity: 0.6, cursor: "pointer", hover: { opacity: 1 } }}
            />
          )}
          <ChevronDown size={16} style={{ transition: "transform 0.2s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
        </div>
      </div>

      {/* Floating Select2 Searchable Dropdown Popup */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "4px",
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
            zIndex: 99999,
            overflow: "hidden",
            maxHeight: "260px",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Search Input Bar */}
          <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--border-color, rgba(255, 255, 255, 0.1))", display: "flex", alignItems: "center", gap: "8px" }}>
            <Search size={15} style={{ opacity: 0.5 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to filter..."
              autoFocus
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text-primary, #ffffff)",
                fontSize: "13px"
              }}
            />
          </div>

          {/* Options List */}
          <div style={{ overflowY: "auto", flex: 1, padding: "4px 0" }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: "12px 14px", fontSize: "13px", color: "var(--text-secondary)", textAlign: "center" }}>
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      padding: "8px 14px",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: isSelected ? "rgba(99, 102, 241, 0.2)" : "transparent",
                      color: isSelected ? "#a5b4fc" : "var(--text-primary, #f8fafc)",
                      transition: "background 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={14} style={{ color: "#818cf8" }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>{error}</p>}
    </div>
  );
};

export default Select2;
