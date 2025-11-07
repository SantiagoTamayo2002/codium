import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import "../css/ProfilePage.css";

function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                navigate('/register');
                return;
            }

            setLoading(true);
            try {
                const res = await api.get('/profile'); 
                setProfileData(res.data);
                setError(null);
            } catch (err) {
                console.error("Error al obtener perfil:", err);
                setError(err.response?.data?.error || 'Error al cargar el perfil.');
                
                if (err.response && (err.response.status === 401 || err.response.status === 422)) {
                    logout();
                    navigate('/register');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, logout, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/register');
    };

    // ESTADO DE CARGA
    if (loading) {
        return (
            <div className="profile-container">
                <p>Cargando perfil</p>
            </div>
        );
    }

    // ESTADO DE ERROR
    if (error) {
        return (
            <div className="profile-container">
                <div className="error-message">Error: {error}</div>
                <button className="profile-button" onClick={handleLogout}>
                    Volver al inicio
                </button>
            </div>
        );
    }

    // ESTADO SIN DATOS
    if (!profileData) {
        return (
            <div className="profile-container">
                <p>No hay datos disponibles</p>
            </div>
        );
    }

    // MOSTRAR PERFIL
    return (
        <div className="profile-container">
            <h2>Perfil de Usuario</h2>
            <p><strong>ID de Usuario:</strong> {user.id}</p>
            <hr />
            <h4>Datos de la Base de Datos</h4>
            <p><strong>Nombre:</strong> {profileData.nombre}</p>
            <p><strong>Apellidos:</strong> {profileData.apellidos}</p>
            <p><strong>Email:</strong> {profileData.correo}</p>
            <p><strong>Username:</strong> {profileData.nombre_usuario}</p>
            <p><strong>Rol:</strong> {profileData.id_rol}</p>

            <button className="profile-button" onClick={handleLogout}>
                Cerrar Sesión
            </button>
        </div>
    );
}

export default ProfilePage;