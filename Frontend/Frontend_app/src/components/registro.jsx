import { useState } from "react";
import api from "../services/api"; 
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import "../css/authPage.css";

function AuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    correo: "",
    contrasena_plana: "",
    nombre_usuario: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ================= VALIDACIONES =================
  const validateForm = () => {
    const newErrors = {};

    if (!formData.correo) {
      newErrors.correo = "El correo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = "Correo no válido";
    }

    if (!formData.contrasena_plana) {
      newErrors.contrasena_plana = "La contraseña es obligatoria";
    } else if (formData.contrasena_plana.length < 6) {
      newErrors.contrasena_plana = "Mínimo 6 caracteres";
    }

    if (!isLoginMode) {
      if (!formData.nombre.trim()) {
        newErrors.nombre = "Nombre obligatorio";
      }

      if (!formData.apellidos.trim()) {
        newErrors.apellidos = "Apellido obligatorio";
      }

      if (!formData.nombre_usuario.trim()) {
        newErrors.nombre_usuario = "Usuario obligatorio";
      } else if (/\s/.test(formData.nombre_usuario)) {
        newErrors.nombre_usuario = "No debe contener espacios";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= SUBMIT =================
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    isLoginMode ? handleLogin(e) : handleRegister(e);
  };

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        correo: formData.correo,
        contrasena_plana: formData.contrasena_plana,
      });

      if (res.data.token) {
        login(res.data.token);
        navigate("/profile");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Credenciales inválidas");
    }
  };

  const handleRegister = async () => {
    try {
      const res = await api.post("/auth/register", formData);
      alert(res.data.message || "Registro exitoso");
      setIsLoginMode(true);
      setFormData({ ...formData, contrasena_plana: "" });
    } catch (error) {
      alert(error.response?.data?.error || "Error al registrar");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);

    const res = await api.post("/auth/google", {
      nombre: decoded.given_name,
      apellidos: decoded.family_name || "",
      correo: decoded.email,
      contrasena_plana: decoded.sub,
      nombre_usuario: decoded.email.split("@")[0],
      token_refresco: credentialResponse.credential,
    });

    if (res.data.token) {
      login(res.data.token);
      navigate("/profile");
    }
  };

  return (
    <div className="auth-container">
      <button className="back-button-top" onClick={() => navigate("/")}>
        <FaArrowLeft /> Regresar
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-codium">&lt;/&gt; CODIUM</div>
          <h1>{isLoginMode ? "Bienvenido" : "Crear cuenta"}</h1>
        </div>

        <div className="auth-selector">
          <button className={isLoginMode ? "active" : ""} onClick={() => setIsLoginMode(true)}>
            Iniciar Sesión
          </button>
          <button className={!isLoginMode ? "active" : ""} onClick={() => setIsLoginMode(false)}>
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLoginMode && (
            <>
              <Input label="Nombre" name="nombre" error={errors.nombre} onChange={handleChange} />
              <Input label="Apellido" name="apellidos" error={errors.apellidos} onChange={handleChange} />
              <Input label="Usuario" name="nombre_usuario" error={errors.nombre_usuario} onChange={handleChange} />
            </>
          )}

          <Input label="Correo" name="correo" type="email" error={errors.correo} onChange={handleChange} />

          <div className="input-group">
            <label>Contraseña</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="contrasena_plana"
                onChange={handleChange}
                className={errors.contrasena_plana ? "input-error" : ""}
              />
              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.contrasena_plana && <span className="error-text">{errors.contrasena_plana}</span>}
          </div>

          <button type="submit" className="btn-submit">
            {isLoginMode ? "Iniciar Sesión" : "Registrarse"}
          </button>
        </form>

        <div className="divider">o</div>

        <GoogleLogin onSuccess={handleGoogleSuccess} />
      </div>
    </div>
  );
}

const Input = ({ label, error, ...props }) => (
  <div className="input-group">
    <label>{label}</label>
    <input {...props} className={error ? "input-error" : ""} />
    {error && <span className="error-text">{error}</span>}
  </div>
);

export default AuthPage;
