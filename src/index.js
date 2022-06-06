import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from '@mui/material/CssBaseline';
import { ProvideAuth } from "./hooks/useAuth";
import Canvas from "./Components/Canvas";
import App from "./App";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import ProfilePage from "./Components/ProfilePage";
import PageLogin from "./Components/PageLogin";
import PageSignUp from "./Components/PageSignUp";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <StrictMode>
    <CssBaseline />
    <ProvideAuth>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/Login" element={<PageLogin />} />
          <Route path = "/SignUp" element={<PageSignUp />} />
          <Route path="/Canvas" element={<Canvas />} />
          <Route path="/Profile" element={<ProfilePage />} />
        </Routes>
      </BrowserRouter>
    </ProvideAuth>
  </StrictMode>
);