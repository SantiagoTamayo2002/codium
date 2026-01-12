import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import "../css/RetoActivo.css";

export default function RetoActivo() {
  const { id } = useParams();

  const [reto, setReto] = useState(null);
  const [codigo, setCodigo] = useState("");
  const [idLenguaje, setIdLenguaje] = useState("");
  const [loading, setLoading] = useState(false);

  const [tab, setTab] = useState("enunciado"); // enunciado | envios | casos
  const [envios, setEnvios] = useState([]);
  const [loadingEnvios, setLoadingEnvios] = useState(false);

  // =========================
  // Cargar reto
  // =========================
  useEffect(() => {
    api.get(`/retos/${id}`)
      .then(res => {
        setReto(res.data);
        const primer = res.data.lenguajes_permitidos?.[0];
        if (primer?.id_lenguaje) {
          setIdLenguaje(String(primer.id_lenguaje));
        }
      })
      .catch(() => alert("Error al cargar el reto"));
  }, [id]);

  // =========================
  // Cargar envíos al abrir tab
  // =========================
  useEffect(() => {
    if (tab === "envios") {
      setLoadingEnvios(true);
      api.get(`/retos/${id}/envios`)
        .then(res => setEnvios(res.data))
        .catch(() => alert("Error cargando envíos"))
        .finally(() => setLoadingEnvios(false));
    }
  }, [tab, id]);

  // =========================
  // Enviar solución
  // =========================
  const enviarSolucion = async () => {
    if (!codigo.trim()) return alert("Debes escribir tu solución");
    if (!idLenguaje) return alert("Selecciona un lenguaje");

    setLoading(true);
    try {
      const res = await api.post(`/retos/${id}/submit`, {
        codigo_fuente: codigo,
        id_lenguaje: parseInt(idLenguaje, 10)
      });

      alert(res.data.message || "Solución enviada correctamente");
      setCodigo("");
      setTab("envios"); // ir directo a envíos
    } catch (err) {
      alert(err.response?.data?.error || "Error enviando la solución");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Loading general
  // =========================
  if (!reto) {
    return (
      <div className="dashboard-root">
        <Sidebar />
        <main className="content">
          <p className="loading">Cargando reto…</p>
        </main>
      </div>
    );
  }

  // =========================
  // Render
  // =========================
  return (
    <div className="dashboard-root">
      <Sidebar />

      <main className="content">
        {/* Header */}
        <div className="reto-header">
          <h1>{reto.titulo}</h1>
          <span className={`badge ${reto.nombre_dificultad.toLowerCase()}`}>
            {reto.nombre_dificultad}
          </span>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={tab === "enunciado" ? "active" : ""}
            onClick={() => setTab("enunciado")}
          >
            Enunciado
          </button>

          <button
            className={tab === "envios" ? "active" : ""}
            onClick={() => setTab("envios")}
          >
            Envíos
          </button>

          <button
            className={tab === "casos" ? "active" : ""}
            onClick={() => setTab("casos")}
          >
            Casos de prueba
          </button>
        </div>

        {/* Contenido Tabs */}
        <div className="descripcion">
          {tab === "enunciado" && (
            <>
              <h3>Descripción</h3>
              <p>{reto.descripcion}</p>
            </>
          )}

          {tab === "casos" && (
            <>
              <h3>Casos de prueba públicos</h3>
              {reto.casos_de_prueba?.length ? (
                reto.casos_de_prueba.map((c, i) => (
                  <div key={i} className="caso">
                    <p><b>Entrada:</b> {c.datos_entrada}</p>
                    <p><b>Salida esperada:</b> {c.salida_esperada}</p>
                  </div>
                ))
              ) : (
                <p>No hay casos públicos</p>
              )}
            </>
          )}

          {tab === "envios" && (
            <>
              <h3>Mis envíos</h3>

              {loadingEnvios ? (
                <p>Cargando envíos…</p>
              ) : envios.length === 0 ? (
                <p>No has realizado envíos aún.</p>
              ) : (
                <table className="envios-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Lenguaje</th>
                      <th>Estado</th>
                      <th>Puntaje</th>
                      <th>Tiempo (ms)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {envios.map(e => (
                      <tr key={e.id_respuesta}>
                        <td>{new Date(e.fecha).toLocaleString()}</td>
                        <td>{e.nombre_lenguaje}</td>
                        <td className={`estado ${e.nombre_estado.toLowerCase()}`}>
                          {e.nombre_estado}
                        </td>
                        <td>{e.puntaje}</td>
                        <td>{e.tiempo_ejecucion_ms ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

        {/* Editor */}
        <div className="editor-box">
          <div className="editor-top">
            <select
              value={idLenguaje}
              onChange={e => setIdLenguaje(e.target.value)}
              disabled={loading}
            >
              {reto.lenguajes_permitidos.map(l => (
                <option key={l.id_lenguaje} value={String(l.id_lenguaje)}>
                  {l.nombre_lenguaje} {l.version ? `(${l.version})` : ""}
                </option>
              ))}
            </select>

            <button onClick={() => setCodigo("")}>
              Reset
            </button>
          </div>

          <textarea
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            placeholder="Escribe tu código aquí..."
          />

          <div className="editor-bottom">
            <button onClick={enviarSolucion} disabled={loading}>
              {loading ? "Enviando..." : "Enviar Solución"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
