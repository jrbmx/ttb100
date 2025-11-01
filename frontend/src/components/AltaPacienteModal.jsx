import { useState } from 'react';
import { crearPaciente } from '../services/pacientes';

const IconUserPlus = () => (
  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
  </svg>
);

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

    const handleClose = () => {
      setForm({ nombre:'', apellidoP:'', apellidoM:'', edad:'' });
      setError('');
      onClose();
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

  const handleClose = () => {
    if (loading) return; // No cerrar si está cargando
    setForm({ nombre:'', apellidoP:'', apellidoM:'', edad:'' });
    setError('');
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[1200] animate-popup-fade"
      onClick={handleClose} // Cierra al hacer clic fuera
    >
      <div 
        className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-500 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // Evita que se cierre al hacer clic dentro
      >
        <h3 className="text-xl font-bold text-center mb-6 text-teal-600 flex items-center justify-center">
          <IconUserPlus />
          Dar de alta paciente
        </h3>
        
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Campo Nombre */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium text-sm">Nombre</label>
            <input 
              name="nombre" 
              value={form.nombre} 
              onChange={onChange} 
              placeholder="Nombre del paciente" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition" 
              required 
            />
          </div>

          {/* Campo Apellido Paterno */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium text-sm">Apellido Paterno</label>
            <input 
              name="apellidoP" 
              value={form.apellidoP} 
              onChange={onChange} 
              placeholder="Apellido paterno" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition" 
              required 
            />
          </div>

          {/* Campo Apellido Materno */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium text-sm">Apellido Materno</label>
            <input 
              name="apellidoM" 
              value={form.apellidoM} 
              onChange={onChange} 
              placeholder="Apellido materno" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition" 
              required 
            />
          </div>

          {/* Campo Edad */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium text-sm">Edad</label>
            <input 
              name="edad" 
              value={form.edad} 
              onChange={onChange} 
              placeholder="Edad" 
              type="number" 
              min="0" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition" 
              required 
            />
          </div>

          {/* Mensaje de Error Estilizado */}
          {error && (
            <div className="text-red-700 text-sm text-center p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Botones Estilizados */}
          <div className="flex justify-around mt-8 pt-4">
            <button 
              type="button" 
              onClick={handleClose} 
              disabled={loading}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full transition transform hover:bg-gray-100 hover:scale-105 hover:shadow"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className={`px-6 py-2 rounded-full text-white transition transform hover:scale-105 hover:shadow-lg ${loading ? 'bg-teal-400' : 'bg-teal-600 hover:bg-teal-700'}`}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
    // === (FIN) JSX ACTUALIZADO ===
  );
}
