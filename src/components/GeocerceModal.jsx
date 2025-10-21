// src/components/GeocerceModal.jsx
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import { listarGeocercas, crearGeocerca } from "../services/geocercas";

/* ======================== Capa de dibujo ======================== */
function DrawLayer({ paciente, onReady, onError, onPluginOK }) {
  const map = useMap();
  const drawnRef = useRef(null);   // NUEVOS (editables)
  const existRef = useRef(null);   // EXISTENTES (solo lectura)
  const ctlRef   = useRef(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Asegura L en window y registra leaflet-draw (una vez)
        if (typeof window !== "undefined") window.L = L;
        if (!L.Draw) {
          await import("leaflet-draw");
        }
        if (!mounted) return;

        onPluginOK?.();

        // Grupos
        if (!drawnRef.current) drawnRef.current = L.featureGroup().addTo(map);
        if (!existRef.current) existRef.current = L.featureGroup().addTo(map);

        // Control de dibujo
        if (!ctlRef.current) {
          ctlRef.current = new L.Control.Draw({
            position: "topleft",
            draw: {
              polygon: {
                allowIntersection: false,
                showArea: true,
                shapeOptions: { color: "#10b981" }, // verde (nuevos)
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
          map.addControl(ctlRef.current);
        }

        // Solo 1 polígono por guardado: si ya hay uno, se reemplaza
        const onCreated = (e) => {
          drawnRef.current.clearLayers();
          drawnRef.current.addLayer(e.layer);
        };
        map.on(L.Draw.Event.CREATED, onCreated);

        // Pinta existentes (AZUL)
        const paintExisting = async () => {
          existRef.current.clearLayers();
          try {
            const arr = paciente?._id ? await listarGeocercas(paciente._id) : [];
            (Array.isArray(arr) ? arr : []).forEach((g) => {
              const raw = g.coords || g.polygon || g.vertices || [];
              if (Array.isArray(raw) && raw.length >= 3) {
                L.polygon(
                  raw.map(([lat, lng]) => L.latLng(lat, lng)),
                  { color: "#2563eb" }
                ).addTo(existRef.current);
              }
            });
          } catch (_) {
            // si falla la carga (404/401, etc), no tiramos el plugin
          }

          const layers = existRef.current.getLayers();
          if (layers.length) {
            map.fitBounds(existRef.current.getBounds().pad(0.15));
          } else if (
            typeof paciente?.latitud === "number" &&
            typeof paciente?.longitud === "number"
          ) {
            map.setView([paciente.latitud, paciente.longitud], 15, { animate: false });
          } else {
            map.setView([19.4326, -99.1332], 13, { animate: false });
          }
        };

        await paintExisting();
        onReady?.({ drawnGroup: drawnRef.current });

        // Limpieza
        return () => {
          map.off(L.Draw.Event.CREATED, onCreated);
          if (ctlRef.current) {
            try { map.removeControl(ctlRef.current); } catch {}
            ctlRef.current = null;
          }
        };
      } catch (e) {
        onError?.("Leaflet-Draw no está disponible.");
      }
    })();

    return () => { mounted = false; };
  }, [map, paciente, onReady, onError, onPluginOK]);

  return null;
}

/* ======================== Modal ======================== */
export default function GeocerceModal({ open, onClose, paciente, onSaved }) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [mountKey, setMountKey] = useState(0); // remount del mapa por apertura

  const mapRef   = useRef(null);
  const drawnRef = useRef(null);

  useEffect(() => {
    if (open) {
      setError("");
      setMountKey((k) => k + 1);
    }
  }, [open]);

  const handleReady = ({ drawnGroup }) => (drawnRef.current = drawnGroup);

  const handleSave = async () => {
    try {
      if (!paciente?._id) {
        setError("Paciente inválido.");
        return;
      }
      const grp = drawnRef.current;
      if (!grp) {
        setError("No hay polígono dibujado.");
        return;
      }

      let polygonCoords = null;
      grp.eachLayer((layer) => {
        if (layer instanceof L.Polygon) {
          const ll = layer.getLatLngs();
          const ring = Array.isArray(ll[0]) ? ll[0] : ll; // multipolígono simple
          const coords = ring.map((p) => [p.lat, p.lng]);
          if (coords.length >= 3) polygonCoords = coords;
        }
      });

      if (!polygonCoords) {
        setError("Dibuja un polígono para poder guardarlo.");
        return;
      }

      setSaving(true);
      setError("");

      // Guarda UNA geocerca
      await crearGeocerca(paciente._id, polygonCoords);

      // Evita errores de animación al cerrar
      if (mapRef.current) {
        try { mapRef.current.stop(); } catch {}
      }

      // Limpia nuevos y notifica
      grp.clearLayers();
      onSaved?.();
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
            <MapContainer
              key={mountKey}
              center={[19.4326, -99.1332]}
              zoom={13}
              zoomAnimation={false}
              fadeAnimation={false}
              markerZoomAnimation={false}
              whenCreated={(m) => (mapRef.current = m)}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <DrawLayer
                paciente={paciente}
                onReady={handleReady}
                onPluginOK={() => setError("")}
                onError={(msg) => setError(msg)}
              />
            </MapContainer>
          </div>

          <p className="text-sm text-gray-600 mt-3">
            Dibuja <strong>un</strong> polígono (geocerca). Las geocercas existentes aparecen en{" "}
            <span className="font-semibold text-blue-600">azul</span>.
          </p>
          {error && <p className="text-sm text-rose-600 mt-1">{error}</p>}

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
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

      {/* Asegura que la barra de draw quede encima del modal */}
      <style>{`
        .leaflet-draw { z-index: 1400; }
        .leaflet-top, .leaflet-bottom { z-index: 1400; }
      `}</style>
    </div>
  );
}
