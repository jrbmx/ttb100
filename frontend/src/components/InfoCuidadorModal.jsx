import React, { useState, useEffect, useRef } from 'react';

// Icono para el título
const IconInfo = () => (
  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

export default function InfoCuidadorModal({ 
  open, 
  onClose, 
  form, 
  onChange, 
  onUpdate, 
  onDeleteClick 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null); // Ref para el contenido del modal

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Si el modal existe (ref) y el clic fue fuera de él
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (!isLoading) { // Solo cierra si no está cargando
          onClose();
        }
      }
    };
    
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose, isLoading]); 

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onUpdate();
    } catch (error) {
      console.error("Error en onUpdate:", error);
    }
    setIsLoading(false);
  };

  if (!open) return null;
  return (
    <>
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[1200] animate-popup-fade"
    >
      <div 
        ref={modalRef} 
        className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-500 animate-fade-in-up overflow-hidden"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="max-h-[80vh] overflow-y-auto hide-scrollbar">
          <div className="p-2">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-800 flex items-center justify-center">
              <IconInfo />
              Mi Información
            </h3>
            
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              {/* Campo Nombre */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium text-sm">Nombre</label>
                <input 
                  name="nombre" 
                  value={form.nombre} 
                  onChange={onChange} 
                  placeholder="Nombre" 
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

              {/* Campo Teléfono */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium text-sm">Teléfono</label>
                <input 
                  name="telefono" 
                  value={form.telefono} 
                  onChange={onChange} 
                  placeholder="Teléfono" 
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition" 
                  required 
                />
              </div>

              {/* Campo Email (Deshabilitado) */}
              <div>
                <label className="block text-gray-500 mb-1 font-medium text-sm">Correo electrónico (no editable)</label>
                <input 
                  name="email" 
                  value={form.email} 
                  disabled 
                  className="w-full border border-gray-200 rounded-xl p-3 bg-gray-100 text-gray-500"
                />
              </div>

              {/* Botones de Acción */}
              <div className="flex justify-around mt-8 pt-4">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-full text-white transition transform hover:scale-105 hover:shadow-lg ${isLoading ? 'bg-[#2E5984]' : 'bg-[#3A6EA5] hover:bg-[#2E5984]'}`}
                >
                  {isLoading ? 'Actualizando...' : 'Actualizar'}
                </button>
                <button 
                  type="button" 
                  onClick={onClose} 
                  disabled={isLoading}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full transition transform hover:bg-gray-100 hover:scale-105 hover:shadow"
                >
                  Cancelar
                </button>
              </div>
            </form>

            {/* Zona de Peligro (Eliminar Cuenta) */}
            <hr className="my-6 border-gray-200" />
            <div className="text-center">
              <button 
                onClick={onDeleteClick}
                disabled={isLoading}
                className="px-4 py-2 rounded-full text-white transition transform hover:scale-105 hover:shadow-lg bg-red-600 hover:bg-red-700"
              >
                Eliminar cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Estilos CSS para ocultar la barra de scroll en todos los navegadores */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE y Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
      </>
  );
}

