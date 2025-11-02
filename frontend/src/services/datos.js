// services/datos.js
const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function authHeaders() {
  const t = localStorage.getItem('token'); 
  return {
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {})
  };
}

export async function getUltimoDato(pacienteId) {
  const res = await fetch(`${API}/api/datos/reciente/${pacienteId}`, { 
    headers: authHeaders() 
  });
  
  if (res.status === 404) {
    return null;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.mensaje || 'Error obteniendo el último dato');
  }
  return data
}

export async function getTodosLosDatos(pacienteId) {
    const res = await fetch(`${API}/api/datos/paciente/${pacienteId}`, { 
        headers: authHeaders() 
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.mensaje || 'Error obteniendo todos los datos');
    }
    return data;
}
