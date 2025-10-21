// src/components/ViewGeocercasModal.jsx
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { listarGeocercas } from "../services/geocercas";

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

function Paint({ paciente }) {
  const map = useMap();
  const [error, setError] = useState("");
  const groupRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!groupRef.current) groupRef.current = L.featureGroup().addTo(map);
        groupRef.current.clearLayers();

        // pides al backend
        const raw = paciente?._id ? await listarGeocercas(paciente._id) : [];
        const list = normalizeResponse(raw);

        list.forEach((g) => {
          const coords = g.coords || g.polygon || g.vertices || [];
          const latlngs = toLatLngs(coords);
          if (latlngs.length >= 3) {
            L.polygon(latlngs, { color: "#2563eb" }).addTo(groupRef.current);
          }
        });

        // centra
        const layers = groupRef.current.getLayers();
        if (layers.length) {
          const b = groupRef.current.getBounds();
          if (b.isValid()) map.fitBounds(b.pad(0.15));
        } else if (
          typeof paciente?.latitud === "number" &&
          typeof paciente?.longitud === "number"
        ) {
          map.setView([paciente.latitud, paciente.longitud], 15);
        } else {
          map.setView([19.4326, -99.1332], 13);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "No se pudieron cargar las geocercas");
      }
    })();

    return () => { cancelled = true; };
  }, [map, paciente]);

  return error ? <div className="p-2 text-sm text-rose-600">{error}</div> : null;
}

export default function ViewGeocercasModal({ open, onClose, paciente }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000]">
      <div className="bg-white w-[95vw] max-w-[1150px] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="text-lg font-semibold">Geocercas guardadas</h3>
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Cerrar</button>
        </div>
        <div className="p-3">
          <div className="h-[520px] w-full rounded overflow-hidden">
            <MapContainer center={[19.4326, -99.1332]} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Paint paciente={paciente} />
            </MapContainer>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Las geocercas guardadas aparecen en <span className="font-semibold text-blue-600">azul</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
