// src/components/AlertasView.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { marcarAlertaComoVista, marcarTodasComoVistas } from '../services/alertas';

// --- ICONOS ESPECÍFICOS ---

// Icono Peligro (Rojo)
const IconDanger = () => (
  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// Icono Éxito (Verde)
const IconSuccess = () => (
  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Icono Advertencia (Naranja)
const IconWarning = () => (
  <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// Icono Corazón (Salud)
const IconHeart = () => (
  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

// Icono Reloj (Inactividad)
const IconClock = () => (
  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Icono Desconexión
const IconDisconnect = () => (
  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.486 9.173L12 10.686l-1.486-1.514a3 3 0 10-4.243 4.243l1.514 1.486L6.257 16.4a1 1 0 01-1.414 0l-1.414-1.414a1 1 0 010-1.414l5.657-5.657a1 1 0 011.414 0l1.414 1.414L10.514 10.8l1.486 1.514 1.486-1.514a3 3 0 114.243 4.243l-1.514 1.486 1.514 1.514a1 1 0 010 1.414l-1.414 1.414a1 1 0 01-1.414 0l-5.657-5.657a1 1 0 010-1.414l1.414-1.414 1.514 1.486z" />
  </svg>
);

// --- Iconos de Navegación ---
const IconArrowLeft = () => (<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>);
const IconSearch = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const IconEye = () => (<svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>);
const IconPrev = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>);
const IconNext = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>);


function formatTimeAgo(isoDate) {
  if (!isoDate) return "N/A";
  const now = new Date();
  const past = new Date(isoDate);
  const seconds = Math.floor((now - past) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return `hace ${Math.floor(interval)} años`;
  interval = seconds / 2592000;
  if (interval > 1) return `hace ${Math.floor(interval)} meses`;
  interval = seconds / 86400;
  if (interval > 1) return `hace ${Math.floor(interval)} días`;
  interval = seconds / 3600;
  if (interval > 1) return `hace ${Math.floor(interval)} horas`;
  interval = seconds / 60;
  if (interval > 1) return `hace ${Math.floor(interval)} min.`;
  return `hace ${Math.floor(seconds)} seg.`;
}

// --- LÓGICA DE ESTILOS POR TIPO DE ALERTA ---
const getAlertaStyle = (tipo) => {
  switch (tipo) {
    // --- CRÍTICOS (ROJO) ---
    case 'caida':
    case 'ritmo_anormal':
    case 'oxigeno_bajo':
      return {
        icon: tipo === 'caida' ? <IconDanger /> : <IconHeart />, // Corazón para signos vitales
        color: 'border-red-500', 
        bg: 'bg-red-50',
        text: 'text-red-900'
      };

    // --- ADVERTENCIAS (NARANJA/ÁMBAR) ---
    case 'salida_geocerca':
    case 'inactividad':
    case 'sensor_desconectado':
    case 'bateria_baja':
      return {
        icon: tipo === 'inactividad' ? <IconClock /> : 
              tipo === 'sensor_desconectado' ? <IconDisconnect /> : 
              <IconWarning />,
        color: 'border-amber-500',
        bg: 'bg-amber-50',
        text: 'text-amber-900'
      };

    // --- POSITIVOS (VERDE) ---
    case 'entrada_geocerca':
    case 'signos_normales':
      return {
        icon: <IconSuccess />,
        color: 'border-emerald-500',
        bg: 'bg-emerald-50',
        text: 'text-emerald-900'
      };

    // --- DEFAULT (AZUL/GRIS) ---
    default:
      return {
        icon: <IconWarning />, // Icono genérico
        color: 'border-gray-400',
        bg: 'bg-white',
        text: 'text-gray-900'
      };
  }
};

const ITEMS_PER_PAGE = 8; 

export default function AlertasView({ alertas, isLoading, onBackClick, onRefreshAlerts }) {
  const [currentTab, setCurrentTab] = useState('nuevas'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMarking, setIsMarking] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const filteredAlerts = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    
    return alertas.filter(alerta => {
      if (currentTab === 'nuevas' && alerta.vista) return false;
      
      if (searchTerm) {
        const nombrePaciente = (alerta.paciente ? `${alerta.paciente.nombre} ${alerta.paciente.apellidoP}` : '').toLowerCase();
        const mensaje = alerta.mensaje.toLowerCase();
        
        if (!nombrePaciente.includes(lowerSearch) && !mensaje.includes(lowerSearch)) return false;
      }
      return true;
    });
  }, [alertas, currentTab, searchTerm]);

  const { paginatedAlerts, totalPages } = useMemo(() => {
    const total = Math.ceil(filteredAlerts.length / ITEMS_PER_PAGE);
    const lastIndex = currentPage * ITEMS_PER_PAGE;
    const firstIndex = lastIndex - ITEMS_PER_PAGE;
    
    return {
      paginatedAlerts: filteredAlerts.slice(firstIndex, lastIndex),
      totalPages: total
    };
  }, [filteredAlerts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, currentTab]);

  const handleMarkAsRead = async (alertaId) => {
    setIsMarking(true);
    try {
      await marcarAlertaComoVista(alertaId);
      onRefreshAlerts(); 
    } catch (e) {
      console.error("Error al marcar como leída:", e);
    } finally {
      setIsMarking(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await marcarTodasComoVistas();
      onRefreshAlerts(); 
    } catch (e) {
      console.error("Error al marcar todas como leídas:", e);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const countNuevas = alertas.filter(a => !a.vista).length;

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 z-1 animate-zoom-in mb-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          CENTRO DE ALERTAS
        </h2>
        <button
          onClick={onBackClick}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <IconArrowLeft />
          Regresar
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setCurrentTab('nuevas')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${currentTab === 'nuevas' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Nuevas
            {countNuevas > 0 && (
              <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                {countNuevas}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('historial')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${currentTab === 'historial' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Historial
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar paciente o tipo..."
            className="w-full md:w-80 border border-gray-300 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch />
          </div>
        </div>
      </div>

      {currentTab === 'nuevas' && countNuevas > 0 && (
        <div className="mb-4 text-right">
          <button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll || isMarking}
            className="text-sm font-medium text-teal-600 hover:text-teal-800 disabled:opacity-50 transition-colors"
          >
            {isMarkingAll ? "Procesando..." : "Marcar todas como leídas"}
          </button>
        </div>
      )}

      <div className="space-y-3 min-h-[400px]">
        {isLoading && <p className="text-center text-gray-500 py-10">Cargando alertas...</p>}
        
        {!isLoading && paginatedAlerts.length === 0 && (
          <p className="text-center text-gray-500 py-10">
            {searchTerm ? "No se encontraron resultados." : "No hay alertas en esta sección."}
          </p>
        )}

        {!isLoading && paginatedAlerts.map((alerta) => {
          const { icon, color, bg, text } = getAlertaStyle(alerta.tipo);
          const nombrePaciente = alerta.paciente 
            ? `${alerta.paciente.nombre} ${alerta.paciente.apellidoP} ${alerta.paciente.apellidoM}` 
            : 'Paciente desconocido';
          
          return (
            <div 
              key={alerta._id} 
              className={`flex flex-col sm:flex-row sm:items-start p-4 rounded-lg shadow-sm border-l-4 transition-all hover:shadow-md ${color} ${alerta.vista ? 'bg-white' : bg}`}
            >
              <div className="flex-shrink-0 pt-1">
                {icon}
              </div>
              <div className="ml-0 sm:ml-3 mt-2 sm:mt-0 flex-1">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                  <span className={`text-sm font-bold ${text}`}>
                    {nombrePaciente}
                  </span>
                  <span className="text-xs text-gray-400 mt-1 sm:mt-0">
                    {formatTimeAgo(alerta.createdAt)}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${alerta.vista ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                  {alerta.mensaje}
                </p>
                {currentTab === 'nuevas' && !alerta.vista && (
                  <button 
                    onClick={() => handleMarkAsRead(alerta._id)}
                    disabled={isMarking}
                    className="flex items-center text-xs text-teal-600 hover:text-teal-800 mt-3 font-medium transition-colors"
                  >
                    <IconEye />
                    Marcar como leída
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-6">
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <IconPrev />
            <span className="ml-2 hidden sm:inline">Anterior</span>
          </button>
          
          <span className="text-sm text-gray-600">
            Página <span className="font-bold text-gray-900">{currentPage}</span> de {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <span className="mr-2 hidden sm:inline">Siguiente</span>
            <IconNext />
          </button>
        </div>
      )}
    </div>
  );
}