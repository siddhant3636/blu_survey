import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.role === "ADMIN" ? children : <Navigate to="/unauthorized" replace />;
};

export default AdminRoute;
