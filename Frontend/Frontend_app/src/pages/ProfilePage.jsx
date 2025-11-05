import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; // Importamos nuestra instancia de Axios
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
    const { user, logout } = useAuth(); // Obtenemos el usuario y la función logout
    const navigate = useNavigate();
    
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    // Hacemos la llamada a la ruta protegida del backend
                    // api.js añadirá el token "Bearer" automáticamente
                    const res = await api.get('/profile'); 
                    setProfileData(res.data);
                } catch (err) {
                    console.error("Error al obtener perfil:", err);
                    setError(err.response?.data?.error || 'Error al cargar el perfil.');
                    // Si el token es inválido (ej. 401), cerramos sesión
                    if (err.response && (err.response.status === 401 || err.response.status === 422)) {
                        logout();
                        navigate('/register');
                    }
                }
            }
        };

        fetchProfile();
    }, [user, logout, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/register'); // Redirigir después de cerrar sesión
    };

    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    if (!profileData) {
        return <div>Cargando perfil...</div>;
    }

    // Mostramos los datos obtenidos del backend
    return (
        <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
            <h2>Perfil de Usuario</h2>
            <p><strong>ID de Usuario (del token):</strong> {user.id}</p>
            <hr />
            <h4>Datos de la Base de Datos:</h4>
            <p><strong>Nombre:</strong> {profileData.nombre}</p>
            <p><strong>Apellidos:</strong> {profileData.apellidos}</p>
            <p><strong>Email:</strong> {profileData.correo}</p>
            <p><strong>Username:</strong> {profileData.nombre_usuario}</p>
            <p><strong>Rol:</strong> {profileData.id_rol}</p>
            <button onClick={handleLogout} style={{ marginTop: '20px' }}>
                Cerrar Sesión
            </button>
        </div>
    );
}

export default ProfilePage;
