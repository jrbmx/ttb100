const API = process.env.REACT_APP_API_URL || 'https://api-ttgo-1080924017616.us-central1.run.app';

function authHeaders() {
  const t = localStorage.getItem('token'); // lo tomamos de localStorage
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
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.mensaje || 'Error creando paciente');
  return data;
}

export async function listarPacientes() {
  const res = await fetch(`${API}/api/pacientes`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.mensaje || 'Error listando pacientes');
  return data;
}

export async function mostrarUbicacionPaciente(pacienteId) {
  const res = await fetch(`${API}/api/pacientes/${pacienteId}/ubicacion`, {
    headers: authHeaders() 
  });
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

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.mensaje || `Error ${res.status} al actualizar paciente`);
  }
  return data;
}

// Llama a la actualización para setear dispositivo_id a un valor
export async function asignarDispositivo(pacienteId, dispositivoId) {
  if (!dispositivoId || dispositivoId.trim() === '') {
    throw new Error('El ID del dispositivo no puede estar vacío');
  }
  return await actualizarPaciente(pacienteId, { 
    dispositivo_id: dispositivoId.trim() 
  });
}

// Llama a la actualización para setear dispositivo_id a null
export async function liberarDispositivo(pacienteId) {
  return await actualizarPaciente(pacienteId, { 
    dispositivo_id: null 
  });
}