import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import "../css/Notifications.css";

export default function Notifications() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/notifications")
      .then(res => setNotificaciones(res.data))
      .catch(err => console.error("Error notificaciones:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-root">
      <Sidebar />

      <main className="content notifications-page">
        <header className="page-header">
          <h1>🔔 Notificaciones</h1>
          <p className="subtitle">Mantente al día con tu actividad en Codium</p>
        </header>

        {loading && <p className="page-state">Cargando notificaciones…</p>}

        {!loading && notificaciones.length === 0 && (
          <div className="empty-state">
            <span>🎉</span>
            <p>No tienes notificaciones nuevas</p>
          </div>
        )}

        <div className="notifications-list">
          {notificaciones.map((n) => (
            <div
              key={n.id}
              className={`notification-card ${n.leida ? "read" : "unread"}`}
            >
              {!n.leida && <span className="dot" />}

              <div className="icon">
                <span className="material-symbols-outlined">
                  {n.icono || "notifications"}
                </span>
              </div>

              <div className="info">
                <p className="title">{n.titulo}</p>
                <p className="time">{n.tiempo}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
