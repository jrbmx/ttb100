// src/components/EditarAliasModal.jsx
import React, { useState, useEffect } from 'react';

export default function EditarAliasModal({ open, onClose, onConfirm, paciente, isGuardando }) {
  const [alias, setAlias] = useState("");

  // Cargar el alias actual cuando se abre el modal
  useEffect(() => {
    if (open && paciente) {
      setAlias(paciente.dispositivo_alias || "");
    }
  }, [open, paciente]);

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
        
        <h3 className="text-xl font-bold text-center mb-2 text-teal-600">Editar nombre del dispositivo</h3>
        
        <p className="text-center text-gray-600 mb-6 text-sm">
          Cambiar el alias para el dispositivo de:
          <strong className="block mt-1 text-gray-900">{paciente.nombre} {paciente.apellidoP} {paciente.apellidoM}</strong>
        </p>

        {/* --- INPUT --- */}
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-6">
          <label className="block text-teal-800 mb-1 font-bold text-xs uppercase tracking-wider ml-1">
            Nuevo Alias
          </label>
          <div className="bg-white rounded-xl border border-teal-200 p-1 shadow-sm focus-within:ring-2 focus-within:ring-teal-400">
            <input 
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Ej: Reloj Nuevo"
              className="w-full bg-transparent border-none p-2 focus:ring-0 text-center text-gray-700 font-bold text-lg"
              autoFocus
            />
          </div>
        </div>

        {/* --- BOTONES --- */}
        <div className="flex justify-around">
          <button 
            onClick={() => onConfirm(alias)}
            disabled={isGuardando || !alias.trim()}
            className={`px-6 py-2 rounded-full text-white font-bold transition transform hover:scale-105 hover:shadow-lg ${
              isGuardando || !alias.trim() 
                ? 'bg-teal-300 cursor-not-allowed' 
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {isGuardando ? "Guardando..." : "Guardar"}
          </button>
          
          <button 
            onClick={onClose}
            disabled={isGuardando}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full transition transform hover:bg-gray-100 hover:scale-105 hover:shadow"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}