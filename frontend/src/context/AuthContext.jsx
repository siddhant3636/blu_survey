import React, { createContext, useState, useEffect } from "react";
import authService from "../services/auth.service";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token && token !== "undefined") {
          const profile = await authService.getCurrentUser();
          setUser(profile.data?.user || profile.user);
        }
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      const authData = res.data || res;
      localStorage.setItem("token", authData.accessToken);
      localStorage.setItem("refreshToken", authData.refreshToken);
      setUser(authData.user);
      return authData.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
