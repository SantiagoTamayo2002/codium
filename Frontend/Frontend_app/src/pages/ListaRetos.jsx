import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import "../css/ListaRetos.css";

export default function ListaRetos() {
  const [retos, setRetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/retos/")
      .then(res => setRetos(res.data))
      .catch(err => console.error("Error retos:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-root">
      <Sidebar />

      <main className="content retos-page">
        <header className="page-header">
          <h1>💻 Retos Disponibles</h1>
          <p className="subtitle">
            Selecciona un reto y demuestra tus habilidades
          </p>
        </header>

        {loading && <p className="page-state">Cargando retos…</p>}

        {!loading && retos.length === 0 && (
          <div className="empty-state">
            <span>📭</span>
            <p>No hay retos disponibles</p>
          </div>
        )}

        <section className="retos-grid">
          {retos.map((r) => (
            <article
              key={r.id_reto}
              className="reto-card"
              onClick={() => navigate(`/retos/${r.id_reto}/`)}
            >
              <h3>{r.titulo}</h3>

              <span className={`badge ${r.nombre_dificultad.toLowerCase()}`}>
                {r.nombre_dificultad}
              </span>

              <p className="action">Ver reto →</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
