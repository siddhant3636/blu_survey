import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <AppRoutes />
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
