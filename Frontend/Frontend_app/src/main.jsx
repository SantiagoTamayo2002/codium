import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";

// Contextos
import { AuthProvider } from "./context/AuthContext.jsx";
import { AccessibilityProvider } from "./context/AccessibilityContext.jsx";

const GOOGLE_CLIENT_ID =
  "633035842493-v5n957qvo61sfcomuj0d628knjf9movs.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AccessibilityProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AccessibilityProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
