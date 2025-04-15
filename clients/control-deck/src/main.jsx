import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "ui/providers/auth-provider.jsx";
import { ThemeProvider } from "ui/providers/theme-provider.jsx";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
