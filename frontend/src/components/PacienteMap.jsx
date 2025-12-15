// src/components/PacienteMap.jsx
import { useEffect, useRef, useState, useCallback } from "react";
// AGREGAMOS ScaleControl A LOS IMPORTS
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, ScaleControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- SERVICIOS DE DATOS ---
import { listarGeocercas } from "../services/geocercas";
import { getDatosRelevantes } from "../services/datos";

const cdmxCenter = [19.4326, -99.1332];
const cdmxBounds = L.latLngBounds(
  L.latLng(19.0, -99.5), // Esquina Suroeste
  L.latLng(19.8, -98.7)  // Esquina Noreste
);

const pulsingIcon = L.divIcon({
  className: 'pulsing-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});

// --- COMPONENTE NUEVO: BOTÓN DE RECENTRAR ---
function RecenterControl({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (!coords) return;

    // Creamos un control personalizado de Leaflet
    const CustomControl = L.Control.extend({
      options: { position: "bottomright" }, // Ubicación del botón
      onAdd: function () {
        const btn = L.DomUtil.create("button", "leaflet-bar leaflet-control recenter-btn");
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>';
        btn.title = "Centrar en paciente";
        btn.onclick = (e) => {
          L.DomEvent.stopPropagation(e); // Evita que el clic traspase al mapa
          map.setView(coords, 16, { animate: true }); // Vuela a la coordenada
        };
        return btn;
      },
    });

    const control = new CustomControl();
    map.addControl(control);

    return () => {
      map.removeControl(control);
    };
  }, [map, coords]);

  return null;
}

function normalizeResponse(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.geocercas)) return raw.geocercas;
  if (Array.isArray(raw.coords)) return [raw];
  return [];
}

function toLatLngs(coords) {
  if (!Array.isArray(coords)) return [];
  return coords
    .map((pt) => {
      if (Array.isArray(pt) && pt.length >= 2) {
        const [lat, lng] = pt;
        return L.latLng(Number(lat), Number(lng));
      }
      if (pt && typeof pt === "object" && "lat" in pt && "lng" in pt) {
        return L.latLng(Number(pt.lat), Number(pt.lng));
      }
      return null;
    })
    .filter(Boolean);
}

function formatExactTime(isoDate) {
  if (!isoDate) return "N/A";
  try {
    return new Date(isoDate).toLocaleString("es-MX", {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  } catch (e) {
    return "Fecha inválida";
  }
}

function Paint({ paciente, geocercas, datosPaciente }) {
  const map = useMap();
  const groupRef = useRef(null);
  const isFirstLoad = useRef(true); // Para controlar el zoom inicial

  useEffect(() => {
    if (!groupRef.current) {
      groupRef.current = L.featureGroup().addTo(map);
    }
    groupRef.current.clearLayers();

    let pacienteCoords = null;

    geocercas.forEach((g) => {
      const coords = g.coords || g.polygon || g.vertices || [];
      const latlngs = toLatLngs(coords);
      if (latlngs.length >= 3) {
        L.polygon(latlngs, { color: "#2563eb", weight: 2, fillOpacity: 0.1 }).addTo(groupRef.current)
          .bindPopup(`<b>${g.nombre || 'Geocerca'}</b>`);
      }
    });

    const { ultimoGpsValido } = datosPaciente;

    if (ultimoGpsValido) {
      pacienteCoords = [ultimoGpsValido.latitud, ultimoGpsValido.longitud];
    }

    try {
      // Solo centramos automáticamente si es la primera carga o si explícitamente se desea seguir
      // Aquí lo dejamos para la primera carga para no molestar al usuario si está moviendo el mapa
      if (isFirstLoad.current && pacienteCoords) {
        map.setView(pacienteCoords, 16, { animate: true });
        isFirstLoad.current = false;
      } 
      // Si no hay paciente, ajustamos bounds a las geocercas
      else if (isFirstLoad.current && !pacienteCoords) {
        const layers = groupRef.current.getLayers();
        if (layers.length > 0) {
          const b = groupRef.current.getBounds();
          if (b.isValid()) map.fitBounds(b.pad(0.25));
        } else {
          map.setView(cdmxCenter, 13);
        }
        isFirstLoad.current = false;
      }
    } catch (e) {
      console.error("Error al centrar el mapa:", e);
    }

  }, [map, paciente, geocercas, datosPaciente]);

  const { ultimoDato, ultimoGpsValido } = datosPaciente;
  const esWifi = ultimoDato && ultimoDato.latitud === 91.0;

  return (
    <>
      {ultimoGpsValido && (
        <Marker
          position={[ultimoGpsValido.latitud, ultimoGpsValido.longitud]}
          icon={pulsingIcon}
        >
          <Popup className="custom-leaflet-popup">
            <div className="custom-popup-content">
              <strong>{paciente.nombre} {paciente.apellidoP} {paciente.apellidoM || ''}</strong>
              {ultimoDato ? (
                <>
                  <hr />
                  <span><strong>Frecuencia:</strong> {ultimoDato.frecuencia} bpm</span>
                  <span><strong>Oxígeno:</strong> {ultimoDato.oxigeno} %</span>
                  <span className="fecha">
                    <strong>Signos vitales:</strong> {formatExactTime(ultimoDato.fecha)}
                  </span>
                </>
              ) : <span>Sin datos vitales</span>}

              <hr style={{ margin: '6px 0 2px 0' }} />
              <span className="fecha">
                <strong>Ubicación:</strong> {formatExactTime(ultimoGpsValido.fecha)}
              </span>

              {(esWifi) && (
                <span><strong>Estado:</strong> Conectado a WiFi</span>
              )}
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}

export default function PacienteMap({ paciente }) {
  const [geocercas, setGeocercas] = useState([]);
  const [datosPaciente, setDatosPaciente] = useState({ ultimoDato: null, ultimoGpsValido: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMapData = useCallback(async () => {
    if (!paciente?._id) return;
    setError("");

    try {
      const geocercasPromise = listarGeocercas(paciente._id);
      const datosPromise = getDatosRelevantes(paciente._id);

      const [geoData, datosData] = await Promise.all([geocercasPromise, datosPromise]);

      setGeocercas(normalizeResponse(geoData));
      setDatosPaciente(datosData);

    } catch (e) {
      console.error("Error al refrescar datos del mapa:", e);
      setError(e.message || "No se pudieron cargar los datos");
    } finally {
      setIsLoading(false);
    }
  }, [paciente]);

  useEffect(() => {
    setIsLoading(true);
    fetchMapData();
  }, [fetchMapData]);

  useEffect(() => {
    if (paciente) {
      const intervalId = setInterval(fetchMapData, 15000);
      return () => clearInterval(intervalId);
    }
  }, [paciente, fetchMapData]);

  // Preparamos coordenadas para el botón de recentrar
  const currentCoords = datosPaciente.ultimoGpsValido 
    ? [datosPaciente.ultimoGpsValido.latitud, datosPaciente.ultimoGpsValido.longitud]
    : null;

  if (!paciente) {
    return <div className="text-center p-10">Selecciona un paciente.</div>;
  }

  return (
    <>
      <div className="h-[60vh] w-full rounded-lg overflow-hidden relative border">

        <MapContainer
          center={cdmxCenter}
          zoom={13}
          minZoom={10}
          maxBounds={cdmxBounds}
          style={{ height: "100%", width: "100%", backgroundColor: '#f0f0f0' }}
        >
          {/* 1. AGREGAMOS LA ESCALA */}
          <ScaleControl position="bottomleft" imperial={false} />

          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Estándar">
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satélite">
              <TileLayer
                attribution='Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Minimalista">
              <TileLayer
                attribution='CartoDB'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* 2. AGREGAMOS EL BOTÓN DE RECENTRAR */}
          {currentCoords && <RecenterControl coords={currentCoords} />}

          {!isLoading && (
            <Paint
              paciente={paciente}
              geocercas={geocercas}
              datosPaciente={datosPaciente}
            />
          )}
        </MapContainer>

        {isLoading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-[1000]">
            <p className="text-lg font-medium text-gray-700">Cargando mapa...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] p-3 bg-red-100 border border-red-300 rounded shadow-lg text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
      <style>{`
        /* --- ESTILOS DEL BOTÓN RECENTRAR --- */
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

        /* --- Marcador Pulsante --- */
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 1; }
          70% { transform: scale(2.5); opacity: 0; }
          100% { transform: scale(0.9); opacity: 0; }
        }
        .pulsing-marker {
          width: 20px;
          height: 20px;
          background-color: #2563eb; 
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
          background-color: #3b82f6; 
          border-radius: 50%;
          animation: pulse 2s infinite;
          z-index: -1;
        }
        
        /* --- Popup Personalizado --- */
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border: 1px solid #eee;
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
        }
        .custom-leaflet-popup .leaflet-popup-tip {
          background: #ffffff;
        }
        .custom-leaflet-popup a.leaflet-popup-close-button {
          color: #555;
          padding: 8px 8px 0 0;
        }
        
        .custom-popup-content {
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 14px;
          line-height: 1.5;
          min-width: 220px;
        }
        .custom-popup-content strong {
          font-weight: 600;
          color: #111827;
        }
        .custom-popup-content hr {
          border: 0;
          height: 1px;
          background-color: #f3f4f6;
          margin: 4px 0;
        }
        .custom-popup-content .fecha {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }
        .custom-popup-content span {
          color: #374151;
        }
      `}</style>
    </>
  );
}