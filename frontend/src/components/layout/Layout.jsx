import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import MobileMenu from "./MobileMenu";

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <Sidebar />
      <main className="main-content animate-fade-in">
        <div style={{ minHeight: "calc(100vh - 160px)" }}>
          {children}
        </div>
        <Footer />
      </main>
      <MobileMenu />
    </div>
  );
};


export default Layout;