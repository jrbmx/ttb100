import React, { useState } from 'react';

// Iconos de paginación
const IconPrev = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>);
const IconNext = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>);

const ITEMS_PER_PAGE = 10;

export default function HistoryTable({ data }) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-gray-500">No hay historial disponible.</div>;
  }

  // Calcular paginación
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-medium border-b">
            <tr>
              <th className="px-6 py-3">Fecha y hora</th>
              <th className="px-6 py-3 text-center">Frecuencia</th>
              <th className="px-6 py-3 text-center">Oxígeno</th>
              <th className="px-6 py-3 text-center">Ubicación (latitud, longitud)</th>
              <th className="px-6 py-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentData.map((row) => {
              const date = new Date(row.fecha);
              // Detectar si es WiFi o Null Island
              const isWifi = row.latitud === 91.0 || row.longitud === 181.0;
              const isNull = row.latitud === 0 && row.longitud === 0;
              const isGPS = !isWifi && !isNull;

              // Estado del sensor
              let statusBadge = <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">Normal</span>;
              
              if (!row.contacto_cardiaco) {
                statusBadge = <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">Sensor desconectado</span>;
              } else if (row.caida_detectada) {
                statusBadge = <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">Caída</span>;
              } else if (row.inactividad_detectada) {
                statusBadge = <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">Inactividad</span>;
              }

              return (
                <tr key={row._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                    {date.toLocaleDateString('es-MX')} <span className="text-gray-400 mx-1">|</span> {date.toLocaleTimeString('es-MX')}
                  </td>
                  <td className="px-6 py-3 text-center font-medium text-gray-800">
                    {row.frecuencia} bpm
                  </td>
                  <td className="px-6 py-3 text-center font-medium text-gray-800">
                    {row.oxigeno}%
                  </td>
                  <td className="px-6 py-3 text-center text-gray-500 text-xs">
                    {isGPS ? (
                      <span className="font-mono text-sm">{row.latitud.toFixed(5)}, {row.longitud.toFixed(5)}</span>
                    ) : isWifi ? (
                      <span className="text-teal-600 font-medium">WiFi / GSM</span>
                    ) : (
                      <span className="text-gray-400">Sin señal</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-center">
                    {statusBadge}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <span className="text-xs text-gray-500">
            Mostrando página <span className="font-semibold text-gray-800">{currentPage}</span> de {totalPages}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconPrev />
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconNext />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}