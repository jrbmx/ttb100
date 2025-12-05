// services/datos.js
const API = process.env.REACT_APP_API_URL || 'https://api-ttgo-1080924017616.us-central1.run.app';

function authHeaders() {
  const t = localStorage.getItem('token'); 
  return {
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {})
  };
}


function esGpsValido(dato) {
  if (!dato) return false;
  if (dato.latitud === 91.0 || dato.longitud === 181.0) {
    return false;
  }
  
  // Es Null Island (inválido)
  if (dato.latitud === 0 && dato.longitud === 0) {
    return false;
  }
  
  return true; 
}

export async function getHistorial(pacienteId, fechaInicio = null, fechaFin = null) {
    let url = `${API}/api/datos/paciente/${pacienteId}`;
    
    const params = new URLSearchParams();
    
    if (fechaInicio) params.append('inicio', fechaInicio);
    if (fechaFin) params.append('fin', fechaFin);
    
    const offset = new Date().getTimezoneOffset();
    params.append('offset', offset.toString());
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    const res = await fetch(url, { 
        headers: authHeaders() 
    });
    
    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
        throw new Error(data.mensaje || 'Error obteniendo historial');
    }
    
    return data; 
}

export async function getDatosRelevantes(pacienteId) {
  const todosLosDatos = await getHistorial(pacienteId);

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