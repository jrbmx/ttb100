// src/components/NotificacionPopup.jsx
import React from 'react';

// --- ICONOS SVG ---
const IconCheck = () => (
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);

const IconError = () => (
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const IconWarning = () => (
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
);

const IconInfo = () => (
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const IconClose = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);

// --- CONFIGURACIÓN DE ESTILOS ---
const STYLES = {
  success: {
    bg: 'bg-emerald-600',
    icon: <IconCheck />,
    btnHover: 'hover:text-emerald-200'
  },
  error: {
    bg: 'bg-red-600',
    icon: <IconError />,
    btnHover: 'hover:text-red-200'
  },
  warning: {
    bg: 'bg-amber-500', // Ámbar/Naranja para alertas de atención
    icon: <IconWarning />,
    btnHover: 'hover:text-amber-100'
  },
  info: {
    bg: 'bg-blue-600',
    icon: <IconInfo />,
    btnHover: 'hover:text-blue-200'
  }
};

export default function NotificacionPopup({ popup, onClose, onClick }) {
  if (!popup.show) return null;

  // Lógica para determinar el tipo de alerta
  // 1. Si viene 'popup.type', usamos ese.
  // 2. Si no, usamos 'popup.success' para mantener compatibilidad con tu código anterior.
  let type = popup.type;
  if (!type) {
    type = popup.success ? 'success' : 'error';
  }

  // Fallback por seguridad si el tipo no existe en STYLES
  const style = STYLES[type] || STYLES.info;

  return (
    <div className="fixed top-5 left-0 right-0 z-[5000] flex justify-center animate-fade-in-down pointer-events-none px-4">
      <div 
        onClick={onClick} 
        className={`flex items-center max-w-sm w-full shadow-2xl rounded-xl p-4 ${style.bg} pointer-events-auto cursor-pointer transition-transform hover:scale-105`}
      >
        <div className="flex-shrink-0">
          {style.icon}
        </div>
        <div className="ml-3 mr-4 flex-1">
          <p className="text-sm font-bold text-white">
            {popup.message}
          </p>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation(); 
            onClose();
          }} 
          className={`text-white/80 transition-colors ${style.btnHover}`}
        >
          <IconClose />
        </button>
      </div>

      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}