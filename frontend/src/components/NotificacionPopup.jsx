// src/components/NotificacionPopup.jsx
import React from 'react';

// --- Icono Verde (Success) ---
// ¡CAMBIO! Color de 'text-green-500' a 'text-white'
const IconSuccess = () => (
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// --- Icono Rojo (Error) ---
// ¡CAMBIO! Color de 'text-red-500' a 'text-white'
const IconError = () => (
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// (Icono de Cerrar, sin cambios)
const IconClose = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);


export default function NotificacionPopup({ popup, onClose, onClick }) {
  if (!popup.show) return null;

  // Elige el ícono basado en 'popup.success'
  const icon = popup.success ? <IconSuccess /> : <IconError />;
  
  // --- ¡CAMBIO! Elige el color de FONDO ---
  const backgroundColor = popup.success ? 'bg-green-600' : 'bg-red-600';
  const closeButtonColor = popup.success 
    ? 'text-green-100 hover:text-white' 
    : 'text-red-100 hover:text-white';
  // ---------------------------------

  return (
    <div 
      className="fixed top-5 left-0 right-0 z-[5000] flex justify-center animate-fade-in-down pointer-events-none"
    >
      <div 
        onClick={onClick} 
        className={`flex items-center max-w-sm w-full shadow-2xl rounded-xl p-4 ${backgroundColor} pointer-events-auto cursor-pointer`}
      >
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-3 mr-4 flex-1">
          <p className="text-sm font-medium text-white">
            {popup.message}
          </p>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Evita que el clic en el botón cierre el modal (aunque ya lo hace)
            onClose();
          }} 
          className={closeButtonColor}
        >
          <IconClose />
        </button>
      </div>
    </div>
  );
}