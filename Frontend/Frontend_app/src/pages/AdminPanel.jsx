import React, { useState, useEffect } from "react";
import PersonaTable from "../components/PersonaTable";
import "../css/AdminPanel.css";
import prueba from "../css/img/prueba.png";

const API_URL = "http://localhost:5000/api"; // <- cambia esto a tu backend

const AdminPanel = () => {
  const [user] = useState({
    nombre: "Admin",
    apellidos: "User",
    id_persona: 12345,
    foto: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkIkkgFX2tC6OEvfd3VFOKzrm_sg0FnNrW_a5-lExTDvJz6azRMzdiJda6_hKOiBx0CcS6wk7ZYrCfZiRd_mGcZFCp84h0oHFSOY3xcTSDuO2EPyqtiNfLaAoj1nLzRZcThIHhSZJGOYWLl__kmVbeGVb95XvQcuFrV8SDQYcnKBtHt9oYCLux-We8cs6aicy9LenkDIifZwAsz8D32fIVagt1zNJUJyreSINRipNvDXOcbdzCxxUS3_8As3rrJdb35yAyZ1ZDVYA"
  });
  const [personas, setPersonas] = useState([]);
  const [searchText, setSearchText] = useState("");

  // Fetch de personas desde la API
  useEffect(() => {
    fetch(`${API_URL}/personas`)
      .then(res => {
        if(!res.ok) throw new Error("Error al obtener personas");
        return res.json();
      })
      .then(data => setPersonas(data))
      .catch(err => console.error("Error fetching personas:", err));
  }, []);

  // Eliminar persona
  const handleDelete = (id_persona) => {
    fetch(`${API_URL}/personas/${id_persona}`, { method: "DELETE" })
      .then(res => {
        if(res.ok) setPersonas(prev => prev.filter(p => p.id_persona !== id_persona));
        else console.error("Error eliminando persona:", res.statusText);
      })
      .catch(err => console.error("Error eliminando persona:", err));
  };

  // Filtrar personas según búsqueda
  const filteredPersonas = personas.filter(p =>
    p.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
    p.apellidos.toLowerCase().includes(searchText.toLowerCase()) ||
    p.correo.toLowerCase().includes(searchText.toLowerCase()) ||
    p.nombre_usuario.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="admin-panel">
      <header className="header">
        <div className="header-left">
          <img src={prueba} alt="Logo" className="logo" />
        </div>
        <div className="header-center">
          <h1>Admin Panel</h1>
        </div>
        <div className="header-right">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
          />
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="profile">
            <div className="profile-img">
              <img src={user.foto} alt="Admin" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
              <div className="status-dot"></div>
            </div>
            <div className="profile-name">{user.nombre} {user.apellidos}</div>

          </div>
          <a href="#">Change Username</a>
          <a href="#">Change Password</a>
          <a href="#">Change Profile Photo</a>
          <a href="#" className="danger">Sign Out</a>
          <button className="google-btn">Sign in with Google</button>
        </aside>

        <main className="main">
          <h2>People Management</h2>
          <PersonaTable personas={filteredPersonas} onDelete={handleDelete} />
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
