const API_URL = "http://localhost:5000/api"; // tu backend

export async function getPersonas(page = 1, perPage = 20) {
  const response = await fetch(`${API_URL}/api/personas?page=${page}&per_page=${perPage}`);
  if (!response.ok) {
    throw new Error("Error al obtener personas");
  }
  return await response.json();
}

export async function deletePersona(id) {
  const response = await fetch(`${API_URL}/api/personas/`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Error al eliminar persona");
  }
  return await response.json();
}
