import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/common/Loader";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader size="large" className="animate-fade-in" />;
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
