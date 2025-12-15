const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function authHeaders() {
  const t = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {})
  };
}

export const obtenerPaciente = async (id) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const response = await fetch(`${API}/api/pacientes/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.mensaje || 'Error al obtener paciente');
  }

  return await response.json();
};

// Crear un nuevo paciente
export async function crearPaciente(payload) {
  const res = await fetch(`${API}/api/pacientes`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (res.status === 401) {
    handleAuthError();
    return [];
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.mensaje || 'Error creando paciente');
  return data;
}

// Listar todos los pacientes
export async function listarPacientes() {
  const res = await fetch(`${API}/api/pacientes`, { headers: authHeaders() });
  if (res.status === 401) {
    handleAuthError();
    return [];
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.mensaje || 'Error listando pacientes');
  return data;
}

// Obtener ubicación específica
export async function mostrarUbicacionPaciente(pacienteId) {
  const res = await fetch(`${API}/api/pacientes/${pacienteId}/ubicacion`, {
    headers: authHeaders() 
  });
  if (res.status === 401) {
    handleAuthError();
    return [];
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al obtener la ubicación');
  return data; 
}

// Actualizar datos generales de un paciente
export async function actualizarPaciente(pacienteId, payload) {
  const res = await fetch(`${API}/api/pacientes/${pacienteId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (res.status === 401) {
    handleAuthError();
    return [];
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.mensaje || `Error ${res.status} al actualizar paciente`);
  }
  return data;
}

// Eliminar un paciente 
export async function eliminarPaciente(pacienteId) {
  const res = await fetch(`${API}/api/pacientes/${pacienteId}`, {
    method: 'DELETE',
    headers: authHeaders()
  });

  if (res.status === 401) {
    handleAuthError();
    return [];
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.mensaje || `Error ${res.status} al eliminar paciente`);
  }
  return data;
}

// Asignar dispositivo
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
    handleAuthError();
    return [];
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.mensaje || `Error ${res.status} al asignar dispositivo`);
  }
  return data;
}

// Liberar dispositivo 
export async function liberarDispositivo(pacienteId) {
  return await actualizarPaciente(pacienteId, { 
    dispositivo_id: null,
    dispositivo_alias: null 
  });
}

// Actualizar configuración de alertas (Umbrales)
export async function actualizarConfiguracionPaciente(pacienteId, config) {
  const res = await fetch(`${API}/api/pacientes/${pacienteId}/config`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(config),
  });

  if (res.status === 401) {
    handleAuthError();
    return [];
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.mensaje || 'Error al actualizar la configuración');
  }
  return data;
}

// Editar solo el alias del dispositivo
export async function editarAliasDispositivo(pacienteId, nuevoAlias) {
  return await actualizarPaciente(pacienteId, { 
    dispositivo_alias: nuevoAlias 
  });
}

function handleAuthError() {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('cuidador');
  sessionStorage.removeItem('cuidador');
  window.location.href = '/auth';
}