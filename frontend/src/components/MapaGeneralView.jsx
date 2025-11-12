// src/components/MapaGeneralView.jsx
import React, { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";

// --- Constantes del Mapa ---
const cdmxBounds = L.latLngBounds(
  L.latLng(19.0, -99.5), // Suroeste
  L.latLng(19.8, -98.7)  // Noreste
);

// --- Marcador Pulsante (CSS en Dashboard.js) ---
const pulsingIcon = L.divIcon({
  className: 'pulsing-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});

// Icono para "Regresar"
const IconArrowLeft = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

/**
 * Componente interno para pintar marcadores
 * Recibe la lista de pacientes y los últimos datos
 */
function PaintMarkers({ pacientes, ultimosDatos }) {
  const validPacientes = pacientes.filter(p => {
    const datos = ultimosDatos[p._id];
    // Solo incluimos pacientes que tengan un 'ultimoGpsValido'
    return datos && datos.ultimoGpsValido;
  });

  return (
    <>
      {validPacientes.map(paciente => {
        const { ultimoDato, ultimoGpsValido } = ultimosDatos[paciente._id];
        const coords = [ultimoGpsValido.latitud, ultimoGpsValido.longitud];
        
        // Contenido del Popup (igual que en ViewGeocercasModal)
        const esWifi = ultimoDato.latitud === 91.0;
        return (
          <Marker 
            key={paciente._id} 
            position={coords} 
            icon={pulsingIcon}
          >
            <Popup className="custom-leaflet-popup">
              <div className="custom-popup-content">
                <strong>{paciente.nombre} {paciente.apellidoP} {paciente.apellidoM}</strong>
                <hr />
                <span><strong>Frecuencia:</strong> {ultimoDato.frecuencia} bpm</span>
                <span><strong>Oxígeno:</strong> {ultimoDato.oxigeno} %</span>
                <span><strong>Estado:</strong> {esWifi ? 'Conectado a WiFi' : 'Con GPS'}</span>
                <span className="fecha">
                  <strong>Últ. Act:</strong> {new Date(ultimoDato.fecha).toLocaleString("es-MX")}
                </span>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

/**
 * Vista del Mapa General
 */
export default function MapaGeneralView({ pacientes, ultimosDatos, onBackClick }) {
  const mapRef = useRef(null);
  
  // Filtramos los datos que sí tienen ubicación para centrar el mapa
  const bounds = L.latLngBounds();
  pacientes.forEach(p => {
    const datos = ultimosDatos[p._id];
    if (datos && datos.ultimoGpsValido) {
      bounds.extend([datos.ultimoGpsValido.latitud, datos.ultimoGpsValido.longitud]);
    }
  });

  // Si hay al menos un paciente, usamos sus límites. Si no, CDMX.
  const mapBoundsToFit = bounds.isValid() ? bounds.pad(0.25) : cdmxBounds;

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 z-1 animate-zoom-in mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          MAPA GENERAL DE PACIENTES
        </h2>
        <button
          onClick={onBackClick}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <IconArrowLeft />
          Regresar
        </button>
      </div>

      {/* Contenedor del Mapa */}
      <div className="h-[70vh] w-full rounded-lg overflow-hidden relative border">
        <MapContainer 
          bounds={mapBoundsToFit} // Centra el mapa en los marcadores
          minZoom={10} 
          maxBounds={cdmxBounds}
          style={{ height: "100%", width: "100%", backgroundColor: '#f0f0f0' }}
          ref={mapRef}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <PaintMarkers
            pacientes={pacientes}
            ultimosDatos={ultimosDatos}
          />
        </MapContainer>
      </div>
    </div>
  );
}