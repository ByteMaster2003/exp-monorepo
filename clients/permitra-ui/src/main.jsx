import { SnackbarProvider } from "notistack";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "ui/providers";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <SnackbarProvider
        maxSnack={5}
        preventDuplicate
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  </StrictMode>
);
