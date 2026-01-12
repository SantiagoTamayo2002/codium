import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RegisterForm from './components/registro.jsx';
import ProfilePage from './pages/ProfilePage';
import ProfileEditPage from './pages/ProfileEditPage';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/LadingPage';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import RetoActivo from './pages/RetoActivo.jsx';
import ListaRetos from './pages/ListaRetos.jsx';

// 👉 IMPORTAR EL BOTÓN
import AccessibilityButton from './components/AccessibilityButton';

function App() {
  return (
    <>
      {/* 🔹 BOTÓN DE ACCESIBILIDAD GLOBAL */}
      <AccessibilityButton />

      <Routes>
        {/* --- RUTAS PÚBLICAS --- */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* --- RUTAS PROTEGIDAS --- */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/editar"
          element={
            <ProtectedRoute>
              <ProfileEditPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/retos"
          element={
            <ProtectedRoute>
              <ListaRetos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/retos/:id"
          element={
            <ProtectedRoute>
              <RetoActivo />
            </ProtectedRoute>
          }
        />

        {/* --- 404 --- */}
        <Route path="*" element={<div>404 - Página no encontrada</div>} />
      </Routes>
    </>
  );
}

export default App;
