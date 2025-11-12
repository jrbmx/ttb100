// services/alertas.js
const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function authHeaders() {
  const t = localStorage.getItem('token'); // lo tomamos de localStorage
  return {
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {})
  };
}

export async function listarAlertas() {
  const res = await fetch(`${API}/api/alertas`, { 
    headers: authHeaders() 
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.mensaje || 'Error listando alertas');
  return data; // Devuelve array de Alertas
}

export async function marcarAlertaComoVista(alertaId) {
  const res = await fetch(`${API}/api/alertas/${alertaId}/vista`, {
    method: 'PUT',
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.mensaje || 'Error marcando alerta como vista');
  return data; // Devuelve la alerta actualizada
}

export async function marcarTodasComoVistas() {
  const res = await fetch(`${API}/api/alertas/marcar-todas-vistas`, {
    method: 'PUT',
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.mensaje || 'Error marcando todas como vistas');
  return data; // Devuelve { mensaje, modifiedCount }
}