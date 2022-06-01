import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from '@mui/material/CssBaseline';
import { ProvideAuth } from "./hooks/useAuth";
import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <StrictMode>
    <CssBaseline />
    <ProvideAuth>
      <App />
    </ProvideAuth>
  </StrictMode>
);