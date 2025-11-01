import React from 'react';

export default function DeleteConfirmModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[1200] animate-popup-fade"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl transform transition-all duration-500 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-center mb-4">Confirmación</h3>
        <p className="text-center text-gray-700 mb-6">¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.</p>
        <div className="flex justify-around">
          <button 
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded-full transition transform hover:bg-red-700 hover:scale-105 hover:shadow-lg"
          >
            Sí, eliminar
          </button>
          <button 
            onClick={onClose}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-full transition transform hover:bg-gray-100 hover:scale-105 hover:shadow"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
