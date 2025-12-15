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
        <h3 className="text-xl font-bold text-center mb-2 text-red-600">Desvincular dispositivo</h3>
        
        <p className="text-center text-gray-600 mb-6 text-sm">
          ¿Estás seguro de que deseas quitar el dispositivo de
          <strong className="text-gray-900"> {paciente.nombre} {paciente.apellidoP} {paciente.apellidoM}</strong>?
        </p>
        
        {/* --- TARJETA DEL DISPOSITIVO --- */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8 text-center">
            <span className="block text-xs text-red-400 uppercase font-bold tracking-wider mb-1">
                Dispositivo Actual
            </span>
            {/* 1. ALIAS EN GRANDE */}
            <span className="block text-lg font-bold text-red-800">
                {paciente.dispositivo_alias || "Sin Alias"}
            </span>
            {/* 2. ID TÉCNICO DEBAJO */}
            <span className="block text-xs text-gray-500 font-mono mt-1">
                ID: {paciente.dispositivo_id}
            </span>
        </div>

        <div className="flex justify-around">
          <button 
            onClick={onConfirm}
            disabled={isLiberando}
            className={`px-6 py-2 rounded-full text-white transition transform hover:scale-105 hover:shadow-lg ${
                isLiberando ? 'bg-red-300' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isLiberando ? "Liberando..." : "Sí, liberar"}
          </button>
          
          <button 
            onClick={onClose}
            disabled={isLiberando}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full transition transform hover:bg-gray-100 hover:scale-105 hover:shadow"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}