const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function authHeaders() {
  const t = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {})
  };
}

export async function crearPaciente(payload) {
  const res = await fetch(`${API}/api/pacientes`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (res.status === 401) {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('cuidador');
    sessionStorage.removeItem('cuidador');

    window.location.href = '/auth'; 
    return [];
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.mensaje || 'Error creando paciente');
  return data;
}

export async function listarPacientes() {
  const res = await fetch(`${API}/api/pacientes`, { headers: authHeaders() });
  if (res.status === 401) {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('cuidador');
    sessionStorage.removeItem('cuidador');

    window.location.href = '/auth'; 
    return [];
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.mensaje || 'Error listando pacientes');
  return data;
}

export async function mostrarUbicacionPaciente(pacienteId) {
  const res = await fetch(`${API}/api/pacientes/${pacienteId}/ubicacion`, {
    headers: authHeaders() 
  });
  if (res.status === 401) {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('cuidador');
    sessionStorage.removeItem('cuidador');

    window.location.href = '/auth'; 
    return [];
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al obtener la ubicación');
  return data; // { latitud, longitud, fecha }
}

// Actualiza un paciente, usado para asignar o liberar dispositivos
async function actualizarPaciente(pacienteId, payload) {
  const res = await fetch(`${API}/api/pacientes/${pacienteId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('cuidador');
    sessionStorage.removeItem('cuidador');

    window.location.href = '/auth'; 
    return [];
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.mensaje || `Error ${res.status} al actualizar paciente`);
  }
  return data;
}

// Llama a la actualización para setear dispositivo_id a un valor
export async function asignarDispositivo(pacienteId, dispositivoId, alias) {
  if (!dispositivoId || dispositivoId.trim() === '') {
    throw new Error('El ID del dispositivo no puede estar vacío');
  }

  const res = await fetch(`${API}/api/pacientes/${pacienteId}/asignar`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ 
      dispositivo_id: dispositivoId.trim(),
      dispositivo_alias: alias ? alias.trim() : null 
    }),
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('cuidador');
    sessionStorage.removeItem('cuidador');
    window.location.href = '/auth'; 
    return [];
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Aquí atrapamos el mensaje del backend (ej: "El dispositivo ya está asignado a Juan...")
    throw new Error(data.mensaje || `Error ${res.status} al asignar dispositivo`);
  }
  return data;
}

// Llama a la actualización para setear dispositivo_id a null
export async function liberarDispositivo(pacienteId) {
  return await actualizarPaciente(pacienteId, { 
    dispositivo_id: null 
  });
}

// Actualiza la configuración de alertas del paciente (umbrales)
export async function actualizarConfiguracionPaciente(pacienteId, config) {
  const res = await fetch(`${API}/api/pacientes/${pacienteId}/config`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(config),
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('cuidador');
    sessionStorage.removeItem('cuidador');

    window.location.href = '/auth'; 
    return [];
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.mensaje || 'Error al actualizar la configuración');
  }
  return data;
}

export async function editarAliasDispositivo(pacienteId, nuevoAlias) {
  return await actualizarPaciente(pacienteId, { 
    dispositivo_alias: nuevoAlias 
  });
}