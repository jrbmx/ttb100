import React from 'react';

export default function LiberarDispositivoModal({ open, onClose, onConfirm, paciente, isLiberando }) {
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
        <h3 className="text-xl font-bold text-center mb-4 text-red-600">Confirmar Acción</h3>
        <p className="text-center text-gray-700 mb-6">
          ¿Estás seguro de que deseas liberar el dispositivo 
          <strong className="block my-2 bg-gray-100 p-2 rounded">{paciente.dispositivo_id}</strong>
          del paciente 
          <strong className="block mt-2">{paciente.nombre} {paciente.apellidoP} {paciente.apellidoM}</strong>?
        </p>
        <div className="flex justify-around">
          <button 
            onClick={onConfirm}
            disabled={isLiberando}
            className={`px-4 py-2 rounded-full text-white transition transform hover:scale-105 hover:shadow-lg ${isLiberando ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {isLiberando ? "Liberando..." : "Sí, liberar"}
          </button>
          <button 
            onClick={onClose}
            disabled={isLiberando}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-full transition transform hover:bg-gray-100 hover:scale-105 hover:shadow"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
