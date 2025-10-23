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
export async function crearGeocerca(pacienteId, coords, nombre) {
  const res = await fetch(`${API}/api/geocercas`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ pacienteId, coords, nombre }),
  });
  if (!res.ok) throw new Error('No se pudo guardar la geocerca');
  return res.json();
}

/** Actualiza UNA geocerca existente */
export async function actualizarGeocerca(geocercaId, coords, nombre) {
  const res = await fetch(`${API}/api/geocercas/${geocercaId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ coords, nombre }),
  });
  if (!res.ok) throw new Error('No se pudo actualizar la geocerca');
  return res.json();
}

/** Elimina UNA geocerca */
export async function eliminarGeocerca(geocercaId) {
  const res = await fetch(`${API}/api/geocercas/${geocercaId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('No se pudo eliminar la geocerca');
  return res.json();
}