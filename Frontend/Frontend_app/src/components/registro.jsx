import { useState } from "react";
// <<< 1. IMPORTAR EL INTERCEPTOR 'api' EN LUGAR DE 'axios' >>>
import api from "../services/api"; 
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
// <<< 2. IMPORTAR EL HOOK DE AUTENTICACIÓN Y NAVEGACIÓN >>>
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


function RegisterForm() {
    // ... (formData, handleChange - SIN CAMBIOS) ...
    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        correo: "",
        contrasena_plana: "",
        nombre_usuario: "",
    });

    // <<< 3. USAR EL CONTEXTO Y LA NAVEGACIÓN >>>
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // <<< 4. USAR 'api' EN LUGAR DE 'axios' Y RUTA RELATIVA >>>
            const res = await api.post("/personas", formData);
            alert(res.data.message);
            // Opcional: ¿hacer login también en registro manual?
            // if (res.data.token) {
            //     login(res.data.token);
            //     navigate("/dashboard"); // Redirigir
            // }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || "Error al registrar usuario");
        }
    };

    // ✅ Manejar autenticación con Google (MODIFICADO)
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
            // <<< 5. USAR 'api' Y LA RUTA RELATIVA >>>
            const res = await api.post("/auth/google", userData);
            
            // <<< 6. USAR LA FUNCIÓN login() DEL CONTEXTO >>>
            if (res.data.token) {
                login(res.data.token);
                
                // <<< 7. REDIRIGIR AL USUARIO A SU PERFIL O DASHBOARD >>>
                navigate("/profile"); // O '/dashboard', '/home', etc.

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

    return (
        <div style={{ maxWidth: "400px", margin: "auto" }}>
            <h2>Registro de Usuario</h2>
            <form onSubmit={handleSubmit}>
                {/* ... (inputs del formulario - SIN CAMBIOS) ... */}
                <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required />
                <input type="text" name="apellidos" placeholder="Apellidos" onChange={handleChange} required />
                <input type="email" name="correo" placeholder="Correo" onChange={handleChange} required />
                <input type="text" name="nombre_usuario" placeholder="Nombre de usuario" onChange={handleChange} required />
                <input type="password" name="contrasena_plana" placeholder="Contraseña" onChange={handleChange} required />
                <button type="submit">Registrarse</button>
            </form>

            <hr />
            <p>O regístrate con Google</p>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
        </div>
    );
}
export default RegisterForm;
