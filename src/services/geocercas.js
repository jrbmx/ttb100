// src/services/geocercas.js
const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function authHeader() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// GET /api/geocercas/:pacienteId  -> devuelve array
export async function listarGeocercas(pacienteId) {
  const res = await fetch(`${API}/api/geocercas/${encodeURIComponent(pacienteId)}`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`No se pudieron obtener las geocercas (${res.status}): ${msg}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : (data ? [data] : []);
}

// POST /api/geocercas  -> crea UNA geocerca
export async function crearGeocerca(pacienteId, coords) {
  const res = await fetch(`${API}/api/geocercas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify({ pacienteId, coords }), // <<< OJO: pacienteId (no "paciente")
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`Error creando geocerca (${res.status}): ${msg}`);
  }
  return res.json();
}
