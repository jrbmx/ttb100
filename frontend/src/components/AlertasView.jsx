// src/components/AlertasView.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { marcarAlertaComoVista, marcarTodasComoVistas } from '../services/alertas';

// --- Iconos ---
const IconAlert = () => (
  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const IconCheckCircle = () => (
  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconArrowLeft = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);
const IconSearch = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const IconEye = () => (
  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const IconPrev = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);
const IconNext = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
// --- Fin Iconos ---

// Helper para formatear la fecha (el mismo de Dashboard)
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

// Mapea un tipo de alerta a su ícono y color
const getAlertaStyle = (tipo) => {
  switch (tipo) {
    case 'salida_geocerca':
      return {
        icon: <IconAlert />,
        color: 'border-red-500', // Borde rojo
      };
    case 'entrada_geocerca':
      return {
        icon: <IconCheckCircle />,
        color: 'border-green-500', // Borde verde
      };
    // Puedes añadir más tipos aquí (ej: 'bateria_baja', 'emergencia')
    default:
      return {
        icon: <IconAlert />,
        color: 'border-gray-500',
      };
  }
};

const ITEMS_PER_PAGE = 8; // Número de alertas por página

export default function AlertasView({ alertas, isLoading, onBackClick, onRefreshAlerts }) {
  const [currentTab, setCurrentTab] = useState('nuevas'); // 'nuevas' o 'historial'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMarking, setIsMarking] = useState(false); // Para el botón "Marcar como leída"
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // 1. Lógica de Filtrado y Búsqueda
  const filteredAlerts = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    
    return alertas.filter(alerta => {
      // Filtrar por Pestaña
      if (currentTab === 'nuevas' && alerta.vista) {
        return false;
      }
      
      // Filtrar por Búsqueda
      if (searchTerm) {
        const nombrePaciente = (alerta.paciente ? `${alerta.paciente.nombre} ${alerta.paciente.apellidoP}` : '').toLowerCase();
        const mensaje = alerta.mensaje.toLowerCase();
        
        if (!nombrePaciente.includes(lowerSearch) && !mensaje.includes(lowerSearch)) {
          return false;
        }
      }
      
      return true;
    });
  }, [alertas, currentTab, searchTerm]);

  // 2. Lógica de Paginación
  const { paginatedAlerts, totalPages } = useMemo(() => {
    const total = Math.ceil(filteredAlerts.length / ITEMS_PER_PAGE);
    const lastIndex = currentPage * ITEMS_PER_PAGE;
    const firstIndex = lastIndex - ITEMS_PER_PAGE;
    
    return {
      paginatedAlerts: filteredAlerts.slice(firstIndex, lastIndex),
      totalPages: total
    };
  }, [filteredAlerts, currentPage]);

  // 3. Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, currentTab]);

  // 4. Handler para marcar como leída
  const handleMarkAsRead = async (alertaId) => {
    setIsMarking(true);
    try {
      await marcarAlertaComoVista(alertaId);
      onRefreshAlerts(); // Le dice al Dashboard que recargue la lista de alertas
    } catch (e) {
      console.error("Error al marcar como leída:", e);
      // Aquí podrías usar el sistema de popup
    } finally {
      setIsMarking(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await marcarTodasComoVistas();
      onRefreshAlerts(); // Recarga las alertas en el Dashboard
    } catch (e) {
      console.error("Error al marcar todas como leídas:", e);
      // (Aquí podrías usar tu sistema de popup/toast si lo pasas como prop)
    } finally {
      setIsMarkingAll(false);
    }
  };

  const countNuevas = alertas.filter(a => !a.vista).length;

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 z-1 animate-zoom-in mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          CENTRO DE ALERTAS RECIBIDAS
        </h2>
        <button
          onClick={onBackClick}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <IconArrowLeft />
          Regresar
        </button>
      </div>

      {/* Pestañas y Búsqueda */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        {/* Pestañas */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setCurrentTab('nuevas')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${currentTab === 'nuevas' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Nuevas
            {countNuevas > 0 && (
              <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                {countNuevas}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('historial')}
            className={`px-4 py-2 text-sm font-medium ${currentTab === 'historial' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Historial
          </button>
        </div>
        
        {/* Barra de Búsqueda */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por paciente o mensaje..."
            className="w-full md:w-80 border border-gray-300 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {isMarkingAll ? "Marcando..." : "Marcar todas como leídas"}
          </button>
        </div>
      )}

      {/* Lista de Alertas */}
      <div className="space-y-4 min-h-[400px]">
        {isLoading && <p className="text-center text-gray-500">Cargando alertas...</p>}
        
        {!isLoading && paginatedAlerts.length === 0 && (
          <p className="text-center text-gray-500 pt-10">
            {searchTerm ? "No se encontraron alertas con ese filtro." : "No hay alertas para mostrar."}
          </p>
        )}

        {!isLoading && paginatedAlerts.map((alerta) => {
          const { icon, color } = getAlertaStyle(alerta.tipo);
          const nombrePaciente = alerta.paciente 
            ? `${alerta.paciente.nombre} ${alerta.paciente.apellidoP} ${alerta.paciente.apellidoM}` 
            : 'Paciente desconocido';
          
          return (
            <div 
              key={alerta._id} 
              className={`flex flex-col sm:flex-row sm:items-start p-4 bg-white rounded-lg shadow-md border border-l-4 ${color} ${!alerta.vista ? 'bg-blue-50' : ''}`}
            >
              <div className="flex-shrink-0">
                {icon}
              </div>
              <div className="ml-0 sm:ml-3 mt-2 sm:mt-0 flex-1">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                  <span className="text-sm font-semibold text-gray-900">
                    {nombrePaciente}
                  </span>
                  <span className="text-xs text-gray-500 mt-1 sm:mt-0">
                    {formatTimeAgo(alerta.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {alerta.mensaje}
                </p>
                {currentTab === 'nuevas' && !alerta.vista && (
                  <button 
                    onClick={() => handleMarkAsRead(alerta._id)}
                    disabled={isMarking}
                    className="flex items-center text-xs text-blue-600 hover:text-blue-800 mt-2 disabled:opacity-50"
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

      {/* Controles de Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-6">
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <IconPrev />
            <span className="ml-2">Anterior</span>
          </button>
          
          <span className="text-sm text-gray-700">
            Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
          </span>
          
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <span className="mr-2">Siguiente</span>
            <IconNext />
          </button>
        </div>
      )}
    </div>
  );
}