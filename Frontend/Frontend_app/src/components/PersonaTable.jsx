import React from "react";
import "../css/PersonaTable.css";

const PersonaTable = ({ personas, onDelete }) => {
  return (
    <div className="table-container">
      <table className="persona-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellidos</th>
            <th>Correo</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {personas.length > 0 ? (
            personas.map((p) => (
              <tr key={p.id_persona}>
                <td>{p.nombre}</td>
                <td>{p.apellidos}</td>
                <td>{p.correo}</td>
                <td>{p.nombre_usuario}</td>
                <td>{p.id_rol !== null ? p.id_rol : "Sin rol"}</td>
                <td className="acciones">
                  <button className="btn-edit">✏️ Editar</button>
                  <button
                    className="btn-delete"
                    onClick={() => onDelete(p.id_persona)}
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-data">
                No hay personas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PersonaTable;
