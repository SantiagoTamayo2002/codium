import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // 1. Esperar si el contexto sigue cargando (verificando el token inicial)
    if (isLoading) {
        // Puedes mostrar un spinner o un componente de carga aquí
        return <div>Cargando...</div>;
    }

    // 2. Si no está autenticado, redirigir al formulario de registro/login
    if (!isAuthenticated) {
        // 'replace' evita que el usuario pueda "volver" a la página protegida
        // 'state' guarda la página que intentaba visitar, para redirigirlo allí después del login
        return <Navigate to="/register" replace state={{ from: location }} />;
    }

    // 3. Si está autenticado, renderizar el componente hijo (la página)
    return children;
}

export default ProtectedRoute;
