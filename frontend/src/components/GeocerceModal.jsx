// src/components/GeocerceModal.jsx
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// OJO: el JS de leaflet-draw se carga dinámicamente en el efecto.
import { listarGeocercas } from "../services/geocercas";

/* --------- Controles de dibujo dentro del mapa (compatible con react-leaflet v4) --------- */
function DrawControls({ paciente, onReady, onError, onLoadedOK }) {
  const map = useMap();
  const drawnRef = useRef(null);     // nuevas (editables)
  const existRef = useRef(null);     // existentes (solo lectura)
  const drawCtlRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (typeof window !== "undefined") window.L = L;
        if (!L.Draw) {
          await import("leaflet-draw"); // registra L.Draw
        }
        if (!mounted || !map) return;

        // Notifica que el plugin cargó OK (para borrar posibles mensajes de error)
        onLoadedOK?.();

        // Grupos
        if (!drawnRef.current) drawnRef.current = L.featureGroup().addTo(map);
        if (!existRef.current) existRef.current = L.featureGroup().addTo(map);

        // Control de dibujo
        if (!drawCtlRef.current) {
          drawCtlRef.current = new L.Control.Draw({
            position: "topleft",
            draw: {
              polygon: {
                allowIntersection: false,
                showArea: true,
                shapeOptions: { color: "#10b981" }, // verde para nuevos
              },
              polyline: false,
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
            },
            edit: {
              featureGroup: drawnRef.current,
              edit: true,
              remove: true,
            },
          });
          map.addControl(drawCtlRef.current);
        }

        // Cuando crean un polígono, lo agregamos al grupo editable
        const onCreated = (e) => drawnRef.current.addLayer(e.layer);
        map.on(L.Draw.Event.CREATED, onCreated);

        // Pintar geocercas existentes (AZUL)
        const paintExisting = async () => {
          existRef.current.clearLayers();
          if (!paciente?._id) return;

          const raw = await listarGeocercas(paciente._id);
          const arr = Array.isArray(raw) ? raw : [];
          arr.forEach((g) => {
            const coords = g.coords || g.polygon || g.vertices || [];
            if (Array.isArray(coords) && coords.length >= 3) {
              L.polygon(
                coords.map(([lat, lng]) => L.latLng(lat, lng)),
                { color: "#2563eb" }
              ).addTo(existRef.current);
            }
          });

          // Centrado
          const layers = existRef.current.getLayers();
          if (layers.length) {
            map.fitBounds(existRef.current.getBounds().pad(0.15));
          } else if (
            typeof paciente?.latitud === "number" &&
            typeof paciente?.longitud === "number"
          ) {
            map.setView([paciente.latitud, paciente.longitud], 15);
          } else {
            map.setView([19.4326, -99.1332], 13); // CDMX
          }
        };

        await paintExisting();

        // Entregamos refs al padre
        onReady?.({ drawnGroup: drawnRef.current });

        // Limpieza
        return () => {
          map.off(L.Draw.Event.CREATED, onCreated);
          if (drawCtlRef.current) {
            try { map.removeControl(drawCtlRef.current); } catch {}
            drawCtlRef.current = null;
          }
        };
      } catch (e) {
        onError?.("Leaflet-Draw no está disponible.");
      }
    })();

    return () => { mounted = false; };
  }, [map, paciente, onReady, onError, onLoadedOK]);

  return null;
}

/* -------------------------------------- Modal -------------------------------------- */
export default function GeocerceModal({ open, onClose, onSaved, paciente }) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const drawnRef = useRef(null); // lo llena DrawControls

  const handleReady = ({ drawnGroup }) => {
    drawnRef.current = drawnGroup;
  };

  const handleSave = async () => {
    try {
      if (!paciente?._id) {
        setError("Paciente inválido.");
        return;
      }
      const drawn = drawnRef.current;
      if (!drawn) {
        setError("No hay polígonos dibujados.");
        return;
      }

      // Extrae TODOS los polígonos dibujados y arma el payload
      const polygons = [];
      drawn.eachLayer((layer) => {
        if (layer instanceof L.Polygon) {
          const ll = layer.getLatLngs();
          const ring = Array.isArray(ll[0]) ? ll[0] : ll;
          const coords = ring.map((p) => [p.lat, p.lng]);
          if (coords.length >= 3) polygons.push(coords);
        }
      });

      if (polygons.length === 0) {
        setError("Dibuja al menos un polígono nuevo para poder guardarlo.");
        return;
      }

      setSaving(true);
      setError("");

      // ✅ Delega el guardado al Dashboard (tu onSaved ya llama guardarGeocerca)
      await onSaved?.(polygons);

      // Limpia y cierra
      drawn.clearLayers();
      onClose?.();
    } catch (e) {
      setError(e.message || "Error guardando geocerca.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000]">
      <div className="bg-white w-[95vw] max-w-[1150px] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="text-lg font-semibold">Agregar geocerca</h3>
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">
            Cerrar
          </button>
        </div>

        <div className="p-3">
          <div className="h-[520px] w-full rounded overflow-hidden">
            <MapContainer center={[19.4326, -99.1332]} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <DrawControls
                paciente={paciente}
                onReady={handleReady}
                onLoadedOK={() => setError("")}
                onError={(msg) => setError(msg)}
              />
            </MapContainer>
          </div>

          <p className="text-sm text-gray-600 mt-3">
            Dibuja uno o más polígonos (geocercas). Las geocercas existentes aparecen en{" "}
            <span className="font-semibold text-blue-600">azul</span>. Los nuevos se pueden editar/eliminar con la
            barra de herramientas del mapa antes de guardar.
          </p>
          {error && <p className="text-sm text-rose-600 mt-1">{error}</p>}

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar geocerca"}
            </button>
          </div>
        </div>
      </div>

      {/* Asegura que los botones del plugin estén por encima del modal */}
      <style>{`
        .leaflet-draw { z-index: 1400; }
        .leaflet-top, .leaflet-bottom { z-index: 1400; }
      `}</style>
    </div>
  );
}
