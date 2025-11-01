import React from 'react';

export default function AsignarDispositivoModal({ open, onClose, onConfirm, paciente, isAsignando, idInput, onIdInputChange }) {
  if (!open || !paciente) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[1200] animate-popup-fade"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl transform transition-all duration-500 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-center mb-4 text-green-600">Asignar Dispositivo</h3>
        <p className="text-center text-gray-700 mb-6">
          Ingresa el ID del dispositivo para 
          <strong className="block mt-2">{paciente.nombre} {paciente.apellidoP} {paciente.apellidoM}</strong>
        </p>
        
        <div>
          <label className="block text-gray-700 mb-1 font-medium text-sm">ID del dispositivo</label>
          <input 
            name="dispositivo_id" 
            value={idInput}
            onChange={onIdInputChange} // Conectado al handler del padre
            placeholder="Ej: ESP32-A8B4"
            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
        </div>

        <div className="flex justify-around mt-8">
          <button 
            onClick={onConfirm}
            disabled={isAsignando || !idInput.trim()}
            className={`px-4 py-2 rounded-full text-white transition transform hover:scale-105 hover:shadow-lg ${isAsignando || !idInput.trim() ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isAsignando ? "Asignando..." : "Asignar"}
          </button>
          <button 
            onClick={onClose}
            disabled={isAsignando}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-full transition transform hover:bg-gray-100 hover:scale-105 hover:shadow"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
