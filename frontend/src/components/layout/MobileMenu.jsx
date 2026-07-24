import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const MobileMenu = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="mobile-menu-wrapper">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mobile-menu-fab-btn"
        aria-label="Toggle mobile menu"
      >
        {isOpen ? "✖" : "☰"}
      </button>

      {isOpen && (
        <div className="glass-card mobile-menu-dropdown">
          <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
          {user.role === "SURVEY_PERSON" || user.role === "SURVEYOR" ? (
            <>
              <Link to="/survey/assigned" onClick={() => setIsOpen(false)}>Assignments</Link>
              <Link to="/survey/history" onClick={() => setIsOpen(false)}>History</Link>
            </>
          ) : (
            <>
              <Link to="/users" onClick={() => setIsOpen(false)}>Users</Link>
              <Link to="/survey-sites" onClick={() => setIsOpen(false)}>Sites</Link>
              <Link to="/reports" onClick={() => setIsOpen(false)}>Reports</Link>
            </>
          )}
          <Link to="/settings" onClick={() => setIsOpen(false)}>Settings</Link>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
