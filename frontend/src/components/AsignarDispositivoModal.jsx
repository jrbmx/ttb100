import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

// Ícono grande de "Enlace" para el encabezado
const IconLinkBig = () => (
  <svg className="w-12 h-12 text-teal-600 mx-auto mb-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

// Ícono pequeño de cámara para el botón
const IconCamera = () => (
  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function AsignarDispositivoModal({ 
  open, 
  onClose, 
  onConfirm, 
  paciente, 
  isAsignando, 
  idInput,
  onIdInputChange 
}) {
  
  const [localId, setLocalId] = useState(""); 
  const [localAlias, setLocalAlias] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    setLocalId(idInput || "");
  }, [idInput]);

  useEffect(() => {
    if (open) {
      setLocalAlias("");
      setShowScanner(false);
    }
  }, [open]);

  const handleScan = (result) => {
    if (result && result.length > 0) {
      const text = result[0].rawValue.toUpperCase();
      setLocalId(text);
      if(onIdInputChange) onIdInputChange({ target: { value: text } });
      setShowScanner(false);
    }
  };

  const handleManualIdChange = (e) => {
    const val = e.target.value.toUpperCase();
    setLocalId(val);
    if(onIdInputChange) onIdInputChange({ target: { value: val } });
  };

  const handleConfirmClick = () => {
    onConfirm(localId, localAlias);
  };

  if (!open || !paciente) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[1200] animate-popup-fade"
      onClick={!showScanner ? onClose : undefined}
    >
      <div 
        className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl transform transition-all duration-500 animate-fade-in-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      > 
        <h3 className="text-xl font-bold text-center mb-2 text-teal-600">Vincular dispositivo</h3>
        
        <p className="text-center text-gray-600 mb-6 text-sm">
          Asignando a:
          <strong className="block mt-1 text-gray-900 text-base">{paciente.nombre} {paciente.apellidoP} {paciente.apellidoM}</strong>
        </p>
        
        {/* --- TARJETA DE FORMULARIO (Estilo unificado) --- */}
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-6">
            
            {!showScanner ? (
              <div className="space-y-4">
                {/* Input ID + Botón Cámara */}
                <div>
                  <label className="block text-teal-800 mb-1 font-bold text-xs uppercase tracking-wider ml-1">
                    ID Dispositivo (MAC)
                  </label>
                  <div className="flex gap-2 bg-white rounded-xl border border-teal-200 p-1 shadow-sm focus-within:ring-2 focus-within:ring-teal-400">
                    <input 
                      value={localId}
                      onChange={handleManualIdChange}
                      placeholder="Ej: A1B2C3"
                      className="flex-1 bg-transparent border-none p-2 focus:ring-0 uppercase tracking-widest font-mono text-center text-gray-700 font-bold"
                    />
                    <button 
                      onClick={() => setShowScanner(true)}
                      className="bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-lg p-2 transition flex items-center justify-center"
                      title="Escanear QR"
                    >
                      <IconCamera />
                    </button>
                  </div>
                </div>

                {/* Input Alias */}
                <div>
                  <label className="block text-teal-800 mb-1 font-bold text-xs uppercase tracking-wider ml-1">
                    Nombre / Alias
                  </label>
                  <div className="bg-white rounded-xl border border-teal-200 p-1 shadow-sm focus-within:ring-2 focus-within:ring-teal-400">
                    <input 
                      value={localAlias}
                      onChange={(e) => setLocalAlias(e.target.value)}
                      placeholder="Ej: Reloj de Papá"
                      className="w-full bg-transparent border-none p-2 focus:ring-0 text-center text-gray-700 font-medium"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* --- VISTA ESCÁNER INTEGRADA EN LA TARJETA --- */
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-full h-48 rounded-xl overflow-hidden bg-black mb-3 border-2 border-teal-500 shadow-inner">
                   <Scanner
                      onScan={handleScan}
                      components={{ audio: false, finder: false }}
                      styles={{ container: { width: '100%', height: '100%' } }}
                   />
                   <div className="absolute inset-0 border-2 border-white/30 rounded-lg m-6 pointer-events-none"></div>
                </div>
                <button 
                  onClick={() => setShowScanner(false)}
                  className="text-xs text-red-500 font-bold hover:text-red-700 hover:underline uppercase tracking-wide"
                >
                  Cancelar Cámara
                </button>
              </div>
            )}
        </div>

        {/* --- BOTONES DE ACCIÓN --- */}
        <div className="flex justify-around">
          <button 
            onClick={handleConfirmClick}
            disabled={isAsignando || !localId.trim()}
            className={`px-6 py-2 rounded-full text-white font-bold transition transform hover:scale-105 hover:shadow-lg ${
              isAsignando || !localId.trim() 
                ? 'bg-teal-300 cursor-not-allowed' 
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {isAsignando ? "Asignando..." : "Asignar"}
          </button>
          
          <button 
            onClick={onClose}
            disabled={isAsignando}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full transition transform hover:bg-gray-100 hover:scale-105 hover:shadow"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}