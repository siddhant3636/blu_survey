import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div className="login-container">
      {children}
    </div>
  );
};

export default AuthLayout;
