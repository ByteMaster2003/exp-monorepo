import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, ThemeProvider } from "ui/providers";

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
