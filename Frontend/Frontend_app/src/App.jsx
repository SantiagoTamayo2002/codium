import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from './components/registro.jsx';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

// Creamos un layout simple para la navegación (opcional)
function Layout() {
    // Aquí podrías tener una barra de navegación, etc.
    return (
        <div>
            {/* <h1>Mi Aplicación</h1> */}
            {/* <nav>...</nav> */}
        </div>
    );
}

function App() {
    return (
        <>
            <Layout />
            <Routes>
                {/* --- RUTAS PÚBLICAS --- */}
                {/* Ruta para registrarse (y loguearse con Google) */}
                <Route path="/register" element={<RegisterForm />} />

                {/* --- RUTAS PROTEGIDAS --- */}
                {/* Envolvemos ProfilePage con ProtectedRoute */}
                <Route 
                    path="/profile" 
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    } 
                />

                {/* --- REDIRECCIONES --- */}
                {/* Redirigir la ruta raíz a /register (o /profile si ya está logueado) */}
                <Route path="/" element={<Navigate to="/register" replace />} />

                {/* Ruta 'catch-all' para páginas no encontradas */}
                <Route path="*" element={<div>404 - Página no encontrada</div>} />
            </Routes>
        </>
    );
}

export default App;
