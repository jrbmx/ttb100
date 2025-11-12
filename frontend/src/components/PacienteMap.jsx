// src/components/PacienteMap.jsx
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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
    }
    
    try {
      if (pacienteCoords) {
        map.setView(pacienteCoords, 16, { animate: true }); 
      } else {
        const layers = groupRef.current.getLayers();
        if (layers.length > 0) {
          const b = groupRef.current.getBounds();
          if (b.isValid()) {
            map.fitBounds(b.pad(0.25));
          }
        } else {
           map.setView([19.4326, -99.1332], 13);
        }
      }
    } catch (e) {
      console.error("Error al centrar el mapa:", e);
      map.setView([19.4326, -99.1332], 13);
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
              <strong>{paciente.nombre} {paciente.apellidoP}</strong>
              <hr />
              {ultimoDato ? (
                <>
                  <span><strong>Frecuencia:</strong> {ultimoDato.frecuencia} bpm</span>
                  <span><strong>Oxígeno:</strong> {ultimoDato.oxigeno} %</span>
                  <span><strong>Estado:</strong> {esWifi ? 'Conectado a WiFi' : 'Con GPS'}</span>
                  <span className="fecha">
                    <strong>Últ. Act:</strong> {new Date(ultimoDato.fecha).toLocaleString("es-MX")}
                  </span>
                </>
              ) : (
                <span>Sin datos vitales</span>
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

  // Hook para cargar todos los datos
  useEffect(() => {
    if (paciente?._id) {
      const fetchData = async () => {
        setIsLoading(true);
        setError("");
        
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
  }, [paciente]); 

  if (!paciente) {
    return <div className="text-center p-10">Selecciona un paciente.</div>;
  }

  return (
    <div className="h-[60vh] w-full rounded-lg overflow-hidden relative border">
      
      <MapContainer 
        center={cdmxCenter} 
        zoom={13} 
        minZoom={10}
        maxBounds={cdmxBounds}
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
  );
}