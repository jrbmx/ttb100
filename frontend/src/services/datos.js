// services/datos.js
const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function authHeaders() {
  const t = localStorage.getItem('token'); 
  return {
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {})
  };
}


function esGpsValido(dato) {
  if (!dato) return false;
  const isWifi = (dato.latitud === 91.0 || dato.longitud === 181.0);
  return !isWifi;
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

export async function getDatosRelevantes(pacienteId) {
  const todosLosDatos = await getTodosLosDatos(pacienteId);

  if (!todosLosDatos || todosLosDatos.length === 0) {
    return {
      ultimoDato: null,
      ultimoGpsValido: null
    };
  }

  const ultimoDato = todosLosDatos[0];
  const ultimoGpsValido = todosLosDatos.find(dato => esGpsValido(dato)) || null;

  return {
    ultimoDato,
    ultimoGpsValido
  };
}