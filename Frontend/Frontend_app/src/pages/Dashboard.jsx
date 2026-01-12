import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import "../css/Dashboard.css";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

export default function Dashboard() {
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/profile")
      .then(res => setPerfil(res.data))
      .catch(() => setError("No se pudo cargar el perfil"));
  }, []);

  if (error) return <p className="dashboard-message error">{error}</p>;
  if (!perfil) return <p className="dashboard-message loading">Cargando dashboard…</p>;

  /* ===== DATA PARA GRÁFICAS ===== */
  const puntosData = [
    { name: "Puntos", value: perfil.puntaje_total }
  ];

  const retosData = [
    { name: "Resueltos", value: perfil.num_retos_resueltos },
    {
      name: "Pendientes",
      value: Math.max(0, perfil.total_retos - perfil.num_retos_resueltos)
    }
  ];

  const COLORS = ["#6366f1", "#334155"];

  return (
    <div className="dashboard-root">
      <Sidebar />

      <main className="content">
        <h2>👋 Hola, {perfil.nombre_usuario}</h2>

        {/* ===== STATS ===== */}
        <section className="stats">
          <div className="stat-card">
            <p>Puntos Totales</p>
            <h3>{perfil.puntaje_total}</h3>
          </div>

          <div className="stat-card">
            <p>Retos Resueltos</p>
            <h3>{perfil.num_retos_resueltos}</h3>
          </div>
        </section>

        {/* ===== GRÁFICAS ===== */}
        <section className="charts">
          {/* --- BAR CHART --- */}
          <div className="chart-card">
            <h4>📊 Progreso de Puntos</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={puntosData}>
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* --- PIE CHART --- */}
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
                  {retosData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
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
