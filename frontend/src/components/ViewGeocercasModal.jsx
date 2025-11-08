// src/components/ViewGeocercasModal.jsx
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { listarGeocercas } from "../services/geocercas";
import { getDatosRelevantes } from "../services/datos";

const pulsingIcon = L.divIcon({
  className: 'pulsing-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});

// Normaliza cualquier respuesta de la API a una lista de geocercas [{coords: [...]}, ...]
function normalizeResponse(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;                       // ya es lista
  if (Array.isArray(raw.geocercas)) return raw.geocercas;   // { geocercas: [...] }
  if (Array.isArray(raw.coords)) return [raw];              // un solo doc { coords: [...] }
  return [];
}

// Convierte coords variados -> L.LatLng[]
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

function Paint({ paciente, geocercas, datosPaciente }) {
  const map = useMap();
  const groupRef = useRef(null);

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

    const { ultimoDato, ultimoGpsValido } = datosPaciente;

    if (ultimoGpsValido) {
      pacienteCoords = [ultimoGpsValido.latitud, ultimoGpsValido.longitud];
      const marker = L.marker(pacienteCoords, { icon: pulsingIcon }).addTo(groupRef.current);

      if (ultimoDato && paciente) {
        const esWifi = ultimoDato.latitud === 91.0;
        const popupContent = `
          <div class="custom-popup-content">
            <strong>${paciente.nombre} ${paciente.apellidoP} ${paciente.apellidoM}</strong>
            <hr />
            <span><strong>Frecuencia:</strong> ${ultimoDato.frecuencia} bpm</span>
            <span><strong>Oxígeno:</strong> ${ultimoDato.oxigeno} %</span>
            <span><strong>Estado:</strong> ${esWifi ? 'Conectado a WiFi' : 'Con GPS'}</span>
            <span class="fecha"><strong>Últ. Act:</strong> ${new Date(ultimoDato.fecha).toLocaleString("es-MX")}</span>
          </div>
        `;
        marker.bindPopup(popupContent, { className: 'custom-leaflet-popup' });
      }
    }

    try {
      if (pacienteCoords) {
        map.setView(pacienteCoords, 16, { animate: true }); 
      }
      else if (geocercas.length > 0) {
        const layers = groupRef.current.getLayers();
        if (layers.length > 0) {
          const b = groupRef.current.getBounds();
          if (b.isValid()) {
            map.fitBounds(b.pad(0.25));
          }
        }
      }
      else {
        map.setView([19.4326, -99.1332], 13);
      }
    } catch (e) {
      console.error("Error al centrar el mapa:", e);
      map.setView([19.4326, -99.1332], 13);
    }

  }, [map, paciente, geocercas, datosPaciente]);

  return null;
}

export default function ViewGeocercasModal({ open, onClose, paciente }) {
  const [mountKey, setMountKey] = useState(0); // Para forzar re-render del mapa
  const [geocercas, setGeocercas] = useState([]);
  const [datosPaciente, setDatosPaciente] = useState({ ultimoDato: null, ultimoGpsValido: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && paciente?._id) {
      const fetchData = async () => {
        setIsLoading(true);
        setError("");
        setMountKey(k => k + 1); // Forzar que el mapa se recargue
        
        try {
          const geocercasPromise = listarGeocercas(paciente._id);
          const datosPromise = getDatosRelevantes(paciente._id);

          const [geoData, datosData] = await Promise.all([geocercasPromise, datosPromise]);
          
          setGeocercas(normalizeResponse(geoData));
          setDatosPaciente(datosData);

        } catch (e) {
          setError(e.message || "No se pudieron cargar los datos");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [open, paciente]);


  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000] p-4 animate-popup-fade">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
          
          {/* Header del Modal */}
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Ubicación y zonas seguras</h3>
            <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">Cerrar</button>
          </div>
          
          {/* Cuerpo del Modal */}
          <div className="p-4">
            <div className="h-[60vh] w-full rounded-lg overflow-hidden relative border">
              
              {/* Mapa de Leaflet */}
              <MapContainer 
                key={mountKey} // Clave única para forzar recarga
                center={[19.4326, -99.1332]} 
                zoom={13} 
                style={{ height: "100%", width: "100%", backgroundColor: '#f0f0f0' }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {!isLoading && (
                  <Paint
                    paciente={paciente}
                    geocercas={geocercas}
                    datosPaciente={datosPaciente}
                  />
                )}
              </MapContainer>

              {/* Indicador de Carga */}
              {isLoading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-[1000]">
                  <p className="text-lg font-medium text-gray-700">Cargando mapa...</p>
                </div>
              )}

              {/* Indicador de Error */}
              {!isLoading && error && (
                 <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] p-3 bg-red-100 border border-red-300 rounded shadow-lg text-sm text-red-700">
                  {error}
                 </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mt-3">
              Las zonas seguras (geocercas) aparecen en <span className="font-semibold text-blue-600">azul</span>.
              La última ubicación conocida del paciente es el <span className="font-semibold text-blue-600">marcador pulsante</span>.
            </p>
          </div>
        </div>
      </div>

      {/* --- CSS PARA EL MARCADOR PULSANTE --- */}
      <style>{`
        /* --- Marcador Pulsante --- */
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 1; }
          70% { transform: scale(2.5); opacity: 0; }
          100% { transform: scale(0.9); opacity: 0; }
        }
        .pulsing-marker {
          width: 20px;
          height: 20px;
          background-color: #2563eb; /* azul más fuerte */
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
          background-color: #3b82f6; /* azul */
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
        
        /* Contenido interno del popup */
        .custom-popup-content {
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 6px; /* Espacio entre líneas */
          font-size: 14px;
          line-height: 1.5;
          min-width: 220px; /* Ancho mínimo */
        }
        .custom-popup-content strong {
          font-weight: 600;
          color: #111827; /* Casi negro */
        }
        .custom-popup-content hr {
          border: 0;
          height: 1px;
          background-color: #f3f4f6; /* Gris claro */
          margin: 4px 0;
        }
        .custom-popup-content .fecha {
          font-size: 12px;
          color: #6b7280; /* Gris medio */
          margin-top: 4px;
        }
        .custom-popup-content span {
          color: #374151; /* Gris oscuro */
        }
      `}</style>
    </>
  );
}
