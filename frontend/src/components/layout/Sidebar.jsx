import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  SlidersHorizontal, 
  BarChart3, 
  ClipboardList, 
  History, 
  Settings,
  ChevronDown,
  ChevronRight,
  Zap,
  Building2,
  Plug,
  Camera,
  Wrench,
  FileText
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [mastersExpanded, setMastersExpanded] = useState(
    location.pathname.startsWith("/masters")
  );

  const role = user?.role;

  const masterSubLinks = [
    { path: "/masters/equipment", label: "Master Categories & Ratings", icon: Wrench },
    { path: "/masters/mccb", label: "MCCB Ratings", icon: Zap },
    { path: "/masters/manufacturers", label: "Manufacturers", icon: Building2 },
    { path: "/masters/models", label: "Charger Models", icon: Zap },
    { path: "/masters/connectors", label: "Connector Types", icon: Plug },
    { path: "/masters/photo-categories", label: "Photo Categories", icon: Camera },
  ];

  const getLinkStyle = (path, isExact = false) => {
    const isActive = isExact ? location.pathname === path : location.pathname.startsWith(path);
    return {
      padding: "10px 14px",
      borderRadius: "var(--border-radius)",
      backgroundColor: isActive ? "var(--nav-active-bg)" : "transparent",
      color: isActive ? "var(--nav-active-text)" : "var(--text-primary)",
      fontWeight: isActive ? "600" : "500",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      transition: "all 0.2s ease"
    };
  };

  return (
    <aside className="app-sidebar">
      {/* User Info Header */}
      <div style={{ paddingBottom: "16px", borderBottom: "1px solid var(--border-color)", marginBottom: "16px" }}>
        <p style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Logged In As</p>
        <h4 style={{ color: "var(--text-primary)", marginTop: "2px", fontSize: "15px", fontWeight: "700" }}>{user?.name}</h4>
        <span style={{
          display: "inline-block",
          marginTop: "6px",
          padding: "2px 8px",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: "600",
          backgroundColor: role === "ADMIN" ? "rgba(99, 102, 241, 0.15)" : role === "SUB_ADMIN" ? "rgba(14, 165, 233, 0.15)" : "rgba(34, 197, 94, 0.15)",
          color: role === "ADMIN" ? "#6366f1" : role === "SUB_ADMIN" ? "#0ea5e9" : "#22c55e"
        }}>
          {role}
        </span>
      </div>

      {/* Navigation Items */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        
        {/* Dashboard */}
        <Link to="/dashboard" style={getLinkStyle("/dashboard", true)}>
          <LayoutDashboard size={18} opacity={location.pathname === "/dashboard" ? 1 : 0.75} />
          <span>Dashboard</span>
        </Link>

        {/* FORMS LINK */}
        {role !== "SURVEY_PERSON" && role !== "SURVEYOR" && (
          <Link to="/forms" style={getLinkStyle("/forms")}>
            <FileText size={18} opacity={location.pathname.startsWith("/forms") ? 1 : 0.75} />
            <span>Forms</span>
          </Link>
        )}


        {/* ADMIN Links */}
        {role === "ADMIN" && (
          <>
            <Link to="/users" style={getLinkStyle("/users")}>
              <Users size={18} opacity={location.pathname.startsWith("/users") ? 1 : 0.75} />
              <span>Users</span>
            </Link>

            <Link to="/survey-sites" style={getLinkStyle("/survey-sites")}>
              <MapPin size={18} opacity={location.pathname.startsWith("/survey-sites") ? 1 : 0.75} />
              <span>Survey Sites</span>
            </Link>

            {/* Masters Management Expandable Dropdown Menu */}
            <div>
              <button
                type="button"
                onClick={() => setMastersExpanded(!mastersExpanded)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "var(--border-radius)",
                  backgroundColor: location.pathname.startsWith("/masters") ? "var(--nav-active-bg)" : "transparent",
                  color: location.pathname.startsWith("/masters") ? "var(--nav-active-text)" : "var(--text-primary)",
                  fontWeight: location.pathname.startsWith("/masters") ? "600" : "500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <SlidersHorizontal size={18} opacity={location.pathname.startsWith("/masters") ? 1 : 0.75} />
                  <span>Masters Management</span>
                </div>
                {mastersExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {/* Sub-menu Dropdown List */}
              {mastersExpanded && (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  paddingLeft: "28px",
                  marginTop: "6px",
                  marginBottom: "4px",
                  borderLeft: "2px solid var(--border-color)"
                }}>
                  {masterSubLinks.map((sub) => {
                    const isSubActive = location.pathname === sub.path;
                    const SubIcon = sub.icon;
                    return (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "var(--border-radius)",
                          backgroundColor: isSubActive ? "var(--nav-active-bg)" : "transparent",
                          color: isSubActive ? "var(--nav-active-text)" : "var(--text-secondary)",
                          fontSize: "13px",
                          fontWeight: isSubActive ? "600" : "400",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <SubIcon size={15} opacity={isSubActive ? 1 : 0.7} />
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link to="/reports" style={getLinkStyle("/reports")}>
              <BarChart3 size={18} opacity={location.pathname.startsWith("/reports") ? 1 : 0.75} />
              <span>Reports</span>
            </Link>
          </>
        )}

        {/* SUB_ADMIN Links */}
        {(role === "SUB_ADMIN" || role === "MANAGER") && (
          <>
            <Link to="/users" style={getLinkStyle("/users")}>
              <Users size={18} opacity={location.pathname.startsWith("/users") ? 1 : 0.75} />
              <span>Users</span>
            </Link>

            <Link to="/survey-sites" style={getLinkStyle("/survey-sites")}>
              <MapPin size={18} opacity={location.pathname.startsWith("/survey-sites") ? 1 : 0.75} />
              <span>Survey Sites</span>
            </Link>

            <Link to="/reports" style={getLinkStyle("/reports")}>
              <BarChart3 size={18} opacity={location.pathname.startsWith("/reports") ? 1 : 0.75} />
              <span>Reports & Reviews</span>
            </Link>
          </>
        )}

        {/* SURVEY_PERSON Links */}
        {(role === "SURVEY_PERSON" || role === "SURVEYOR") && (
          <>
            <Link to="/survey/assigned" style={getLinkStyle("/survey/assigned")}>
              <ClipboardList size={18} opacity={location.pathname.startsWith("/survey/assigned") ? 1 : 0.75} />
              <span>My Assigned Sites</span>
            </Link>

            <Link to="/survey/history" style={getLinkStyle("/survey/history")}>
              <History size={18} opacity={location.pathname.startsWith("/survey/history") ? 1 : 0.75} />
              <span>Survey History</span>
            </Link>
          </>
        )}

        {/* Settings */}
        <Link to="/settings" style={getLinkStyle("/settings")}>
          <Settings size={18} opacity={location.pathname.startsWith("/settings") ? 1 : 0.75} />
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
