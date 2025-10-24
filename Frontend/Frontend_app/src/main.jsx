import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

// <<< 1. IMPORTAR EL AUTH PROVIDER >>>
import { AuthProvider } from "./context/AuthContext.jsx";
// Asumiendo que usarás react-router-dom para la navegación
import { BrowserRouter } from "react-router-dom";

const GOOGLE_CLIENT_ID = "633035842493-v5n957qvo61sfcomuj0d628knjf9movs.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* <<< 2. ENVOLVER LA APP CON EL PROVIDER >>> */}
      <AuthProvider>
        {/* Envolvemos con BrowserRouter para poder navegar */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
