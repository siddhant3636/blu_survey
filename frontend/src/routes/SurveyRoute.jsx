import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const SurveyRoute = ({ children }) => {
  const { user } = useAuth();
  const allowed = ["ADMIN", "SUB_ADMIN", "SURVEY_PERSON", "SURVEYOR"];
  return user && allowed.includes(user.role) ? children : <Navigate to="/unauthorized" replace />;
};

export default SurveyRoute;
