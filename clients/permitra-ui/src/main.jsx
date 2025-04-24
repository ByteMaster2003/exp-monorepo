import { SnackbarProvider } from "notistack";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { LoaderComponent } from "ui/components";
import { ThemeProvider } from "ui/providers";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={LoaderComponent}>
      <ThemeProvider>
        <SnackbarProvider
          maxSnack={5}
          preventDuplicate
          anchorOrigin={{ horizontal: "right", vertical: "top" }}
        >
          <App />
        </SnackbarProvider>
      </ThemeProvider>
    </Suspense>
  </StrictMode>
);
