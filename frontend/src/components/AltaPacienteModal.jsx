import { useState } from 'react';
import { crearPaciente } from '../services/pacientes';

export default function AltaPacienteModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ nombre:'', apellidoP:'', apellidoM:'', edad:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar que exista token antes de llamar al backend
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token requerido. Vuelve a iniciar sesión.');
      return;
    }

    try {
      setLoading(true);
      await crearPaciente({ ...form, edad: Number(form.edad) }); // sin DMS
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err.message || 'No se pudo crear el paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Dar de alta paciente</h3>
        <form onSubmit={onSubmit} className="space-y-3">
          <input name="nombre"    value={form.nombre}    onChange={onChange} placeholder="Nombre" className="w-full border p-2 rounded" required />
          <input name="apellidoP" value={form.apellidoP} onChange={onChange} placeholder="Apellido paterno" className="w-full border p-2 rounded" required />
          <input name="apellidoM" value={form.apellidoM} onChange={onChange} placeholder="Apellido materno" className="w-full border p-2 rounded" required />
          <input name="edad"      value={form.edad}      onChange={onChange} placeholder="Edad" type="number" min="0" className="w-full border p-2 rounded" required />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Cancelar</button>
            <button disabled={loading} className="px-4 py-2 rounded bg-teal-600 text-white">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
