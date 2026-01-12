import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/ProfileEditPage.css";

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    nombre: "",
    apellidos: "",
    email: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        const user = res.data;

        setUserId(user.id_persona);

        setFormData({
          username: user.nombre_usuario || "",
          nombre: user.nombre || "",
          apellidos: user.apellidos || "",
          email: user.correo || "",
          newPassword: "",
          confirmPassword: ""
        });

        setAvatarPreview(
          user.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.nombre_usuario
            )}&size=200`
        );
      } catch (err) {
        setError("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setSuccess(false);

  if (formData.newPassword !== formData.confirmPassword) {
    setError("Las contraseñas no coinciden");
    return;
  }

  try {
    // 🔹 SOLO actualizar perfil si hay cambios reales
    if (
      formData.username ||
      formData.nombre ||
      formData.apellidos
    ) {
      const profilePayload = {
        nombre_usuario: formData.username,
        nombre: formData.nombre,
        apellidos: formData.apellidos
      };

      await api.put(`/personas/${userId}`, profilePayload);
    }

    // 🔹 SOLO cambiar contraseña si fue escrita
    if (formData.newPassword) {
      await api.put(`/personas/${userId}/password`, {
        password: formData.newPassword
      });
    }

    setSuccess(true);
  } catch (err) {
    setError("Error al actualizar perfil");
  }
};


  if (loading) return <p>Cargando...</p>;

  return (
    <div className="profile-page dark">
      <div className="profile-modal">
        <header className="modal-header">
          <h2>Editar Perfil</h2>
          <span className="subtitle">
            Actualiza tu información personal y configuración de cuenta
          </span>
        </header>

        <section className="avatar-section">
          <div
            className="avatar-large"
            style={{ backgroundImage: `url(${avatarPreview})` }}
          />
        </section>

        <form onSubmit={handleSubmit} className="profile-form">
          <h3>Información Personal</h3>

          <div className="grid">
            <div className="field">
              <label>Nombre de Usuario</label>
              <div className="input-group">
                <span>👤</span>
                <input
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field">
              <label>Nombre</label>
              <div className="input-group">
                <span>🧑</span>
                <input
                  id="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field">
              <label>Apellidos</label>
              <div className="input-group">
                <span>🧑</span>
                <input
                  id="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="field">
            <label>Correo Electrónico</label>
            <div className="input-group">
              <span>📧</span>
              <input
                id="email"
                type="email"
                value={formData.email}
                disabled
              />
            </div>
          </div>

          <h3>Seguridad</h3>

          <div className="grid">
            <div className="field">
              <label>Nueva Contraseña</label>
              <div className="input-group">
                <span>🔑</span>
                <input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field">
              <label>Confirmar Contraseña</label>
              <div className="input-group">
                <span>✅</span>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">Perfil actualizado correctamente</p>}

          <div className="actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/profile")}
            >
              ⬅️ Regresar
            </button>

            <button type="submit" className="btn-primary">
              💾 Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
