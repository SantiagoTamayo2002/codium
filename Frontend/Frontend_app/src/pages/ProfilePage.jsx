import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../css/ProfilePage.css";
import { FaUserEdit } from "react-icons/fa";

import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell
} from "recharts";

function ProfilePage() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/profile")
      .then(res => setProfileData(res.data))
      .catch(() => setError("Error al cargar el perfil"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-state">Cargando perfil…</div>;
  if (error) return <div className="page-state error">{error}</div>;

  const avatar =
    profileData.avatar ||
    `https://ui-avatars.com/api/?name=${profileData.nombre_usuario}&background=6366f1&color=fff`;

  /* ===== DATA PARA GRÁFICAS ===== */
  const puntosData = [
    { name: "Puntos", value: profileData.puntos_totales }
  ];

  const retosCompletados = profileData.retos_completados?.length || 0;
  const retosTotales = profileData.total_retos || retosCompletados;

  const retosData = [
    { name: "Completados", value: retosCompletados },
    { name: "Pendientes", value: Math.max(0, retosTotales - retosCompletados) }
  ];

  const COLORS = ["#6366f1", "#334155"];

  return (
    <div className="dashboard-root">
      <Sidebar />

      <main className="content">
        {/* ===== HEADER ===== */}
        <div className="profile-header">
          <div
            className="avatar-large"
            style={{ backgroundImage: `url(${avatar})` }}
          />
          <div>
            <h1>{profileData.nombre} {profileData.apellidos}</h1>
            <p className="username">@{profileData.nombre_usuario}</p>
            <p className="email">{profileData.email}</p>

            <button
              className="btn-primary"
              onClick={() => navigate("/profile/editar")}
            >
              <FaUserEdit /> Editar perfil
            </button>
          </div>
        </div>

        {/* ===== STATS ===== */}
        <section className="stats">
          <div className="stat-card">
            <p>Puntos Totales</p>
            <h3>{profileData.puntos_totales}</h3>
          </div>

          <div className="stat-card">
            <p>Retos Completados</p>
            <h3>{retosCompletados}</h3>
          </div>

          <div className="stat-card">
            <p>Racha Actual</p>
            <h3>🔥 {profileData.racha_actual || 0} días</h3>
          </div>
        </section>

        {/* ===== GRÁFICAS ===== */}
        <section className="charts">
          {/* --- PUNTOS --- */}
          <div className="chart-card">
            <h4>📈 Progreso de Puntos</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={puntosData}>
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* --- RETOS --- */}
          <div className="chart-card">
            <h4>🧩 Retos</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={retosData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {retosData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProfilePage;
