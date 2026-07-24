import React from "react";
import styled from "styled-components";
import Header from "../components/layout/Header.jsx"; 
import Sidebar from "../components/layout/Sidebar.jsx";
import Footer from "../components/layout/Footer.jsx";
import MobileMenu from "../components/layout/MobileMenu.jsx";

const AdminLayout = ({ children }) => {
  return (
    <StyledAdminLayout className="app-layout">
      <Header />
      <Sidebar />
      <main className="main-content admin-transparent-bg animate-fade-in">
        <div className="content-container">
          {children}
        </div>
        <Footer />
      </main>
      <MobileMenu />
    </StyledAdminLayout>
  );
};

const StyledAdminLayout = styled.div`
  width: 100%;
  min-height: 100vh;
  
  /* Default / Dark Theme Admin Layout */
  --s: 200px;
  --c1: #1d1d1d;
  --c2: #4e4f51;
  --c3: #3c3c3c;

  background:
    repeating-conic-gradient(
        from 30deg,
        #0000 90deg 120deg,
        var(--c3) 0deg 180deg
      )
      calc(0.5 * var(--s)) calc(0.5 * var(--s) * 0.577),
    repeating-conic-gradient(
      from 30deg,
      var(--c1) 0deg 60deg,
      var(--c2) 0deg 120deg,
      var(--c3) 0deg 180deg
    );
  background-size: var(--s) calc(var(--s) * 0.577);
  background-attachment: fixed;

  --text-primary: #f3f4f6;
  --text-secondary: #9ca3af;
  --card-bg: rgba(21, 28, 44, 0.85);
  color: var(--text-primary);

  h1, h2, h3, h4, h5, h6 {
    color: var(--text-primary) !important;
  }

  /* Light Theme Admin Layout - High Contrast Dark Text */
  &[data-theme="light"],
  html[data-theme="light"] &,
  body[data-theme="light"] & {
    background-color: var(--bg-color, #f1f5f9);
    background-image: none;
    --text-primary: #0f172a;
    --text-secondary: #334155;
    --card-bg: #ffffff;
    --surface-color: #ffffff;
    --glass-bg: #ffffff;
    --border-color: #cbd5e1;
    color: #0f172a;

    h1, h2, h3, h4, h5, h6 {
      color: #0f172a !important;
    }
  }
`;

export default AdminLayout;