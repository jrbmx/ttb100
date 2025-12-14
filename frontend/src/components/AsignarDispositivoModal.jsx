import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import Joyride, { STATUS } from 'react-joyride';

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
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    setLocalId(idInput || "");
  }, [idInput]);

  useEffect(() => {
    if (open) {
      setLocalAlias("");
      setShowScanner(false);
      
      const tourVisto = localStorage.getItem('tour_asignar_qr_visto');
      if (!tourVisto) {
        // Iniciamos el tour tras un pequeño delay para asegurar renderizado
        setTimeout(() => {
            setRunTour(true);
        }, 500);
      }
    } else {
        // Si el modal se cierra por props externas, apagamos el tour
        setRunTour(false);
    }
  }, [open]);

  // --- NUEVA FUNCIÓN: Intercepta el cierre para guardar el estado del tour ---
  const handleCloseModal = (e) => {
    // Si el usuario cierra el modal manualmennte, asumimos que ya vio (o ignoró) el tutorial
    if (e.target !== e.currentTarget) return;
    localStorage.setItem('tour_asignar_qr_visto', 'true');
    setRunTour(false);
    onClose();
  };

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      localStorage.setItem('tour_asignar_qr_visto', 'true');
    }
  };

  const tourSteps = [
    {
      target: '.tour-camera-btn',
      content: 'Si tu dispositivo tiene un código QR pegado, presiona aquí para escanearlo y llenar el ID automáticamente.',
      disableBeacon: true,
      placement: 'top',
    }
  ];

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
    // Al confirmar también guardamos que ya usó la función, por ende vio el tour
    localStorage.setItem('tour_asignar_qr_visto', 'true');
    onConfirm(localId, localAlias);
  };

  if (!open || !paciente) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[1200] animate-popup-fade"
      // Usamos handleCloseModal en lugar de onClose directo
      onClick={!showScanner ? handleCloseModal : undefined}
    >
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous={true}
        disableOverlayClose={true}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 1300,
            primaryColor: '#0d9488',
          },
        }}
        locale={{ last: 'Entendido', }} 
      />

      <div 
        className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl transform transition-all duration-500 animate-fade-in-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      > 
        <h3 className="text-xl font-bold text-center mb-2 text-teal-600">Vincular dispositivo</h3>
        
        <p className="text-center text-gray-600 mb-6 text-sm">
          Asignando a:
          <strong className="block mt-1 text-gray-900 text-base">{paciente.nombre} {paciente.apellidoP} {paciente.apellidoM}</strong>
        </p>
        
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-6">
            {!showScanner ? (
              <div className="space-y-4">
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
                      className="tour-camera-btn bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-lg p-2 transition flex items-center justify-center"
                      title="Escanear QR"
                    >
                      <IconCamera />
                    </button>
                  </div>
                </div>

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
            // Usamos handleCloseModal para que guarde en localStorage al cancelar
            onClick={handleCloseModal}
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