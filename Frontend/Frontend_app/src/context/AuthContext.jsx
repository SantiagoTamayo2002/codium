import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    
    // <<< 1. AÑADIR ESTADO DE CARGA >>>
    // Esto es crucial para que ProtectedRoute no te redirija
    // mientras se verifica el token inicial.
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        try {
            if (storedToken) {
                const decoded = jwtDecode(storedToken);
                
                // <<< 2. AÑADIR VALIDACIÓN DE EXPIRACIÓN >>>
                // Comprueba si el token ha expirado
                if (decoded.exp * 1000 < Date.now()) {
                    throw new Error("Token expirado");
                }
                
                setUser({ id: decoded.sub });
                setToken(storedToken);
            }
        } catch (error) {
            // Token inválido o expirado
            console.error("Token inicial inválido:", error);
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
        } finally {
            // <<< 3. MARCAR LA CARGA COMO COMPLETA >>>
            // Pase lo que pase, dejamos de cargar.
            setIsLoading(false);
        }
    }, []); // El array vacío es correcto, solo se ejecuta al montar

    // Función para iniciar sesión
    const login = (newToken) => {
        try {
            localStorage.setItem('token', newToken);
            const decoded = jwtDecode(newToken);
            setUser({ id: decoded.sub }); // 'sub' es el 'identity' que pusiste en Flask
            setToken(newToken);
        } catch (error) {
            console.error("Error al guardar token:", error);
        }
    };

    // Función para cerrar sesión
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        // Opcional: Redirigir al home
        // window.location.href = '/'; 
    };

    const isAuthenticated = !!token;

    return (
        // <<< 4. PASAR "isLoading" AL PROVIDER >>>
        <AuthContext.Provider value={{ isAuthenticated, user, token, isLoading, login, logout }}>
            {/* <<< 5. ESPERAR A QUE TERMINE LA CARGA >>>
              No renderiza los 'children' (tu app) hasta que
              el useEffect haya terminado de verificar el token.
            */}
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para consumir el contexto fácilmente
export const useAuth = () => {
    return useContext(AuthContext);
};

