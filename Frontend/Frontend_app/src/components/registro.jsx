import { useState, useEffect } from "react";
import api from "../services/api"; 
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa'; // Íconos para regresar y visibilidad de contraseña

// Importar el CSS específico para este nuevo diseño
import "../css/authPage.css"; 

function AuthPage() {
    // --- ESTADO Y NAVEGACIÓN ---
    const { login } = useAuth();
    const navigate = useNavigate();
    
    // Estado para alternar entre Login (true) y Registro (false)
    const [isLoginMode, setIsLoginMode] = useState(true);
    // Estado para la visibilidad de la contraseña
    const [showPassword, setShowPassword] = useState(false); 

    // Estado del formulario: solo usaremos los campos necesarios para el modo actual
    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        correo: "",
        contrasena_plana: "",
        nombre_usuario: "",
    });

    // --- HANDLERS (SIN CAMBIOS DE LÓGICA) ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Función de LOGIN (Para el modo "Iniciar Sesión")
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const loginData = {
                correo: formData.correo,
                contrasena_plana: formData.contrasena_plana,
            };
            // Asumo que tienes un endpoint /auth/login para el inicio de sesión
            const res = await api.post("/auth/login", loginData); 

            if (res.data.token) {
                login(res.data.token);
                alert("¡Inicio de sesión exitoso!");
                navigate("/profile"); 
            } else {
                alert("Error: No se recibió un token.");
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error.response?.data || error.message);
            alert(error.response?.data?.error || "Credenciales inválidas.");
        }
    };
    
    // Función de REGISTRO (Para el modo "Registrarse")
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/register", formData);
            alert(res.data.message || "Registro exitoso. ¡Inicia sesión ahora!");
            // Después del registro, redirigimos a la vista de login
            setIsLoginMode(true); 
            // Limpiamos la contraseña, pero mantenemos el correo para el login
            setFormData(prev => ({ ...prev, contrasena_plana: "" }));
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || "Error al registrar usuario");
        }
    };
    
    // Función unificada para el submit del formulario
    const handleSubmit = (e) => {
        if (isLoginMode) {
            handleLogin(e);
        } else {
            handleRegister(e);
        }
    };

    // ... (handleGoogleSuccess, handleGoogleError - SIN CAMBIOS) ...
    const handleGoogleSuccess = async (credentialResponse) => {
        const decoded = jwtDecode(credentialResponse.credential);
        const defaultUsername = decoded.email.split('@')[0]; 

        const userData = {
            nombre: decoded.given_name,
            apellidos: decoded.family_name || "",
            correo: decoded.email,
            contrasena_plana: decoded.sub, 
            nombre_usuario: decoded.name || defaultUsername,
            token_refresco: credentialResponse.credential,
        };

        try {
            const res = await api.post("/auth/google", userData);
            
            if (res.data.token) {
                login(res.data.token);
                navigate("/profile"); 
            } else {
                alert("No se recibió un token del servidor.");
            }
        } catch (error) {
            console.error("Error en autenticación con Google:", error.response?.data || error.message);
            alert(error.response?.data?.error || "Error al autenticar con Google.");
        }
    };

    const handleGoogleError = () => {
        alert("Error al autenticar con Google");
    };

    // 🔙 Botón de Regreso a Landing Page
    const goToLanding = () => {
        navigate('/');
    };

    // Alternar modo de Login/Registro
    const toggleMode = (mode) => {
        // Al cambiar de modo, limpiamos la data no esencial
        setFormData({
            nombre: "",
            apellidos: "",
            correo: formData.correo || "", // Mantenemos el correo si ya lo tenía
            contrasena_plana: "",
            nombre_usuario: "",
        });
        setIsLoginMode(mode === 'login');
    };
    
    // 💡 Renderizado del componente
    return (
        <div className="auth-container">
            {/* 🔙 Botón de Regreso (Superior Izquierda) */}
            <button className="back-button-top" onClick={goToLanding}>
                <FaArrowLeft /> Regresar
            </button>
            
            <div className="auth-card">
                
                {/* Logo y Título */}
                <div className="auth-header">
                    <div className="logo-codium">
                        <span className="logo-icon">{"</>"}</span> CODIUM
                    </div>
                    <h1>Bienvenido</h1>
                    <p className="subtitle">
                        {isLoginMode ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
                    </p>
                </div>
                
                {/* Selector de Modo (Tabbed view) */}
                <div className="auth-selector">
                    <button 
                        className={`selector-btn ${isLoginMode ? 'active' : ''}`}
                        onClick={() => toggleMode('login')}
                    >
                        Iniciar Sesión
                    </button>
                    <button 
                        className={`selector-btn ${!isLoginMode ? 'active' : ''}`}
                        onClick={() => toggleMode('register')}
                    >
                        Registrarse
                    </button>
                </div>

                {/* --- FORMULARIO --- */}
                <form onSubmit={handleSubmit} className="auth-form">

                    {/* CAMPOS DE REGISTRO (Solo visibles en modo Registro) */}
                    {!isLoginMode && (
                        <>
                            <div className="input-group">
                                <label htmlFor="nombre">Nombre</label>
                                <input type="text" id="nombre" name="nombre" placeholder="Ingresa tu nombre" onChange={handleChange} required={!isLoginMode} />
                            </div>
                            <div className="input-group">
                                <label htmlFor="nombre_usuario">Nombre de usuario</label>
                                <input type="text" id="nombre_usuario" name="nombre_usuario" placeholder="Crea tu nombre de usuario" onChange={handleChange} required={!isLoginMode} />
                            </div>
                            {/* Puedes añadir más campos como apellidos aquí si los necesitas */}
                        </>
                    )}

                    {/* CAMPOS COMUNES */}
                    <div className="input-group">
                        <label htmlFor="correo">Correo electrónico</label>
                        <input type="email" id="correo" name="correo" placeholder="tu@email.com" onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label htmlFor="contrasena">Contraseña</label>
                        <div className="password-input-wrapper">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                id="contrasena" 
                                name="contrasena_plana" 
                                placeholder="Ingresa tu contraseña" 
                                onChange={handleChange} 
                                required 
                            />
                            {/* Ícono de visibilidad de contraseña */}
                            <span 
                                className="password-toggle" 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>
                    
                    {/* Link ¿Olvidaste tu contraseña? (Solo en Login) */}
                    {isLoginMode && (
                        <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
                    )}

                    {/* Botón Principal de Submit */}
                    <button type="submit" className="btn-submit">
                        {isLoginMode ? 'Iniciar Sesión' : 'Registrarse'}
                    </button>
                </form>

                {/* Separador y Google Login */}
                <div className="divider-or">o</div>

                <div className="google-login-wrapper">
                    <GoogleLogin 
                        onSuccess={handleGoogleSuccess} 
                        onError={handleGoogleError} 
                        theme="outline" 
                        text={isLoginMode ? "signin_with" : "signup_with"}
                    />
                </div>
            </div>
        </div>
    );
}

export default AuthPage;