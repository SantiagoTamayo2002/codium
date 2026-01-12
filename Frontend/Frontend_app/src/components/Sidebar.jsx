import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaHome,
  FaCode,
  FaTrophy,
  FaUser,
  FaBell,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import "../css/Sidebar.css";

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/register");
  };

  return (
    <>
      {/* BOTÓN HAMBURGUESA (solo móvil) */}
      <button className="hamburger" onClick={() => setOpen(!open)}>
        {open ? <FaTimes /> : <FaBars />}
      </button>

      {/* SIDEBAR */}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <span className="logo-icon">&lt;/&gt;</span>
          <span className="logo-text">Codium</span>
        </div>

        <nav className="menu">
          <NavLink to="/dashboard" className="menu-item" onClick={() => setOpen(false)}>
            <FaHome /> <span>Inicio</span>
          </NavLink>

          <NavLink to="/retos" className="menu-item" onClick={() => setOpen(false)}>
            <FaCode /> <span>Retos</span>
          </NavLink>

         

          <NavLink to="/profile" className="menu-item" onClick={() => setOpen(false)}>
            <FaUser /> <span>Perfil</span>
          </NavLink>

          <NavLink to="/notifications" className="menu-item" onClick={() => setOpen(false)}>
            <FaBell /> <span>Notificaciones</span>
          </NavLink>

          

          {/* LOGOUT GLOBAL */}
          <button className="menu-item logout" onClick={handleLogout}>
            <FaSignOutAlt /> <span>Cerrar sesión</span>
          </button>
        </nav>
      </aside>
    </>
  );
}
