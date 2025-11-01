import React from 'react';

export default function InfoCuidadorModal({ open, onClose, form, onChange, onUpdate, onDeleteClick }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[1100] animate-popup-fade">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl transform transition-all duration-500 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#00DDDD] to-[#24E3D6]">Mi Información</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Nombre</label>
            <input name="nombre" value={form.nombre} onChange={onChange} placeholder="Nombre"
                   className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#24E3D6] transition transform hover:scale-105 hover:bg-gray-50" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Apellido Paterno</label>
            <input name="apellidoP" value={form.apellidoP} onChange={onChange} placeholder="Apellido Paterno"
                   className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#24E3D6] transition transform hover:scale-105 hover:bg-gray-50" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Apellido Materno</label>
            <input name="apellidoM" value={form.apellidoM} onChange={onChange} placeholder="Apellido Materno"
                   className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#24E3D6] transition transform hover:scale-105 hover:bg-gray-50" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={onChange} placeholder="Teléfono"
                   className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#24E3D6] transition transform hover:scale-105 hover:bg-gray-50" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Correo electrónico</label>
            <input name="email" value={form.email} disabled className="w-full border border-gray-300 rounded-xl p-3 bg-gray-100" />
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <button onClick={onUpdate}
                  className="flex-1 bg-gradient-to-r from-[#24E3D6] to-[#00DDDD] px-6 py-2 rounded-full text-white font-semibold transition transform hover:scale-105 hover:from-[#00DDDD] hover:to-[#24E3D6] hover:shadow-lg">
            Actualizar
          </button>
          <button onClick={onClose}
                  className="ml-4 flex-1 border border-gray-300 px-6 py-2 rounded-full text-gray-600 transition transform hover:bg-gray-100 hover:scale-105 hover:shadow">
            Cancelar
          </button>
        </div>
        <hr className="my-6" />
        <div className="text-center">
          <button onClick={onDeleteClick}
                  className="text-sm text-red-600 border border-red-400 px-6 py-2 rounded-full transition transform hover:bg-red-200 hover:scale-105 hover:shadow">
            Eliminar cuenta
          </button>
        </div>
      </div>
    </div>
  );
}
