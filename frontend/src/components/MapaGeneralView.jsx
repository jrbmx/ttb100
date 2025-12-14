// src/components/MapaGeneralView.jsx
import React, { useRef, useEffect } from 'react';
// AGREGAMOS IMPORTS NUEVOS: LayersControl, ScaleControl, useMap
import { MapContainer, TileLayer, Marker, Popup, LayersControl, ScaleControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";

// --- Constantes del Mapa ---
const cdmxBounds = L.latLngBounds(
  L.latLng(19.0, -99.5), // Suroeste
  L.latLng(19.8, -98.7)  // Noreste
);

// --- Marcador Pulsante ---
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
 * COMPONENTE NUEVO: Botón para encuadrar a TODOS los pacientes
 * Recibe los límites (bounds) calculados de todos los marcadores.
 */
function RecenterGlobalControl({ bounds }) {
  const map = useMap();

  useEffect(() => {
    if (!bounds || !bounds.isValid()) return;

    const GlobalViewBtn = L.Control.extend({
      options: { position: "bottomright" },
      onAdd: () => {
        const btn = L.DomUtil.create("button", "leaflet-bar leaflet-control recenter-btn");
        // Icono de "Mundo" o "Encuadre"
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M3.6 9h16.8" /><path d="M3.6 15h16.8" /><path d="M11.5 3a17 17 0 0 0 0 18" /><path d="M12.5 3a17 17 0 0 1 0 18" /></svg>';
        btn.title = "Ver todos los pacientes";
        btn.onclick = (e) => {
          L.DomEvent.stopPropagation(e);
          // Ajusta el mapa para que quepan todos los marcadores con un margen (padding)
          map.fitBounds(bounds, { padding: [50, 50], animate: true });
        };
        return btn;
      }
    });

    const control = new GlobalViewBtn();
    map.addControl(control);

    return () => {
      map.removeControl(control);
    };
  }, [map, bounds]);

  return null;
}

/**
 * Componente interno para pintar marcadores
 */
function PaintMarkers({ pacientes, ultimosDatos }) {
  const validPacientes = pacientes.filter(p => {
    const datos = ultimosDatos[p._id];
    return datos && datos.ultimoGpsValido;
  });

  return (
    <>
      {validPacientes.map(paciente => {
        const { ultimoDato, ultimoGpsValido } = ultimosDatos[paciente._id];
        const coords = [ultimoGpsValido.latitud, ultimoGpsValido.longitud];
        
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
  
  // 1. Calculamos los límites (bounds) que incluyen a TODOS los pacientes
  const bounds = L.latLngBounds();
  pacientes.forEach(p => {
    const datos = ultimosDatos[p._id];
    if (datos && datos.ultimoGpsValido) {
      bounds.extend([datos.ultimoGpsValido.latitud, datos.ultimoGpsValido.longitud]);
    }
  });

  // Si hay pacientes, usamos sus límites; si no, vista default CDMX
  const mapBoundsToFit = bounds.isValid() ? bounds.pad(0.1) : cdmxBounds;

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 z-1 animate-zoom-in mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            MAPA GENERAL
          </h2>
        </div>
        <button
          onClick={onBackClick}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <IconArrowLeft />
          Regresar
        </button>
      </div>

      {/* Contenedor del Mapa */}
      <div className="h-[70vh] w-full rounded-lg overflow-hidden relative border border-gray-200 shadow-inner">
        <MapContainer 
          bounds={mapBoundsToFit} 
          minZoom={10} 
          maxBounds={cdmxBounds} 
          style={{ height: "100%", width: "100%", backgroundColor: '#f0f0f0' }}
          ref={mapRef}
        >
          
          {/* 1. ESCALA MÉTRICA */}
          <ScaleControl position="bottomleft" imperial={false} />

          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Estándar">
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satélite">
              <TileLayer
                attribution="Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Minimalista">
              <TileLayer
                attribution="CartoDB"
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* 3. BOTÓN "VER TODOS" (Recentrar Global) */}
          {bounds.isValid() && <RecenterGlobalControl bounds={mapBoundsToFit} />}

          <PaintMarkers
            pacientes={pacientes}
            ultimosDatos={ultimosDatos}
          />
        </MapContainer>
      </div>

      {/* Estilos locales (copiados del otro mapa para consistencia) */}
      <style>{`
        .recenter-btn {
          background-color: white;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 2px solid rgba(0,0,0,0.2) !important;
          border-radius: 4px;
          box-shadow: 0 1px 5px rgba(0,0,0,0.4);
          color: #333;
          transition: background-color 0.2s;
        }
        .recenter-btn:hover {
          background-color: #f4f4f4;
          color: #000;
        }

        /* Marcador y Popup igual que en PacienteMap */
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 1; }
          70% { transform: scale(2.5); opacity: 0; }
          100% { transform: scale(0.9); opacity: 0; }
        }
        .pulsing-marker {
          width: 20px;
          height: 20px;
          background-color: #ef4444; /* Rojo para distinguir en mapa general? O azul #2563eb */
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 8px rgba(0,0,0,0.5);
          position: relative;
        }
        .pulsing-marker::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background-color: #f87171;
          border-radius: 50%;
          animation: pulse 2s infinite;
          z-index: -1;
        }
        
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .custom-popup-content {
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 13px;
          min-width: 180px;
        }
        .custom-popup-content hr { margin: 4px 0; border-color: #eee; }
      `}</style>
    </div>
  );
}