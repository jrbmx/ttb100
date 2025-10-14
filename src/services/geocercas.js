const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/** Lista TODAS las geocercas de un paciente (array) */
export async function listarGeocercas(pacienteId) {
  const res = await fetch(`${API}/api/geocercas/${pacienteId}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('No se pudieron listar las geocercas');
  return res.json();
}

/** Crea UNA geocerca (un polígono) */
export async function crearGeocerca(pacienteId, coords) {
  const res = await fetch(`${API}/api/geocercas`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ pacienteId, coords }),
  });
  if (!res.ok) throw new Error('No se pudo guardar la geocerca');
  return res.json();
}
