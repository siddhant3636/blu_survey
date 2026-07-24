import React from "react";
import { useAuth } from "../../hooks/useAuth";
import LogoutButton from "../common/LogoutButton.jsx"; 
import ThemeSwitch from "../common/ThemeSwitch.jsx";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      {/* Dynamic Heading on Light or Dark Theme */}
      <div style={{ fontWeight: "700", fontSize: "18px", color: "var(--header-text)", letterSpacing: "0.5px" }}>
        BluSmart Survey
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <ThemeSwitch />
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "14px", color: "var(--header-text)", fontWeight: "500" }}>{user.name}</span>
            <LogoutButton onClick={logout} />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;