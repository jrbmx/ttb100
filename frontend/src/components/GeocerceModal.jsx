// src/components/GeocerceModal.jsx
import { useEffect, useRef, useState, useCallback, memo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import { listarGeocercas, crearGeocerca, actualizarGeocerca, eliminarGeocerca } from "../services/geocercas";

const cdmxCenter = [19.4326, -99.1332]; 
// Límites aproximados (Sur, Oeste, Norte, Este)
const cdmxBounds = L.latLngBounds(
  L.latLng(19.0, -99.5), // Esquina Suroeste
  L.latLng(19.8, -98.7)  // Esquina Noreste
);
const IconLocate = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
  </svg>
);


/* ======================== Capa de dibujo ======================== */
const DrawLayer = memo(function DrawLayer({ paciente, geocercasExistentes, onReady, onError, onPluginOK }) {
  const map = useMap();
  const drawnRef = useRef(null);   
  const existRef = useRef(null);  
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
        const paintExisting = () => {
          existRef.current.clearLayers();
          
          // Usa las geocercas que vienen como prop
          (Array.isArray(geocercasExistentes) ? geocercasExistentes : []).forEach((g) => {
            try {
              const raw = g.coords || g.polygon || g.vertices || [];
              if (Array.isArray(raw) && raw.length >= 3) {
                // Convertir coordenadas a formato [lat, lng]
                const validCoords = raw.map(point => {
                  if (Array.isArray(point) && point.length >= 2) {
                    // Formato [lat, lng]
                    return [point[0], point[1]];
                  } else if (point && typeof point === 'object' && 'lat' in point && 'lng' in point) {
                    // Formato {lat, lng}
                    return [point.lat, point.lng];
                  }
                  return null;
                }).filter(coord => 
                  coord && 
                  typeof coord[0] === 'number' && 
                  typeof coord[1] === 'number'
                );
                
                if (validCoords.length >= 3) {
                  L.polygon(
                    validCoords.map(([lat, lng]) => L.latLng(lat, lng)),
                    { color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.2 }
                  ).addTo(existRef.current);
                }
              }
            } catch (error) {
              console.error("Error procesando geocerca en paintExisting:", error, g);
            }
          });

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

        paintExisting();
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
  }, [map, paciente, geocercasExistentes, onReady, onError, onPluginOK]);

  return null;
});

/* ======================== Modal ======================== */
export default function GeocerceModal({ open, onClose, paciente, onSaved }) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [geocercasExistentes, setGeocercasExistentes] = useState([]);
  const [editandoGeocerca, setEditandoGeocerca] = useState(null);
  const [nombreGeocerca, setNombreGeocerca] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const drawnRef = useRef(null);
  const handleReady = useCallback(({ drawnGroup }) => {
    drawnRef.current = drawnGroup;
  }, []); // El array vacío significa que NUNCA se volverá a crear

  const handlePluginOK = useCallback(() => {
    setError("");
  }, []); // Nunca se recrea

  const handleError = useCallback((msg) => {
    setError(msg);
  }, []); // Nunca se recrea

  const cargarGeocercasExistentes = useCallback(async () => {
    if (!paciente?._id) return;
    try {
      const geocercas = await listarGeocercas(paciente._id);
      console.log("Geocercas cargadas:", geocercas);
      
      // Agregar nombres por defecto si no existen
      const geocercasConNombres = (Array.isArray(geocercas) ? geocercas : []).map((geocerca, index) => ({
        ...geocerca,
        nombre: geocerca.nombre || `Geocerca #${index + 1}`
      }));
      
      setGeocercasExistentes(geocercasConNombres);
    } catch (e) {
      console.error("Error cargando geocercas:", e);
      setGeocercasExistentes([]);
    }
  }, [paciente?._id]);

  useEffect(() => {
    if (open) {
      setError("");
      setIsLocating(false);
      cargarGeocercasExistentes();
    }
  }, [open, paciente, cargarGeocercasExistentes]);


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

      if (editandoGeocerca) {
        // Actualizar geocerca existente
        await actualizarGeocerca(editandoGeocerca._id, polygonCoords, nombreGeocerca || editandoGeocerca.nombre);
        setEditandoGeocerca(null);
        setNombreGeocerca("");
      } else {
        // Crear nueva geocerca
        if (!nombreGeocerca.trim()) {
          setError("El nombre de la geocerca es obligatorio");
          return;
        }
        await crearGeocerca(paciente._id, polygonCoords, nombreGeocerca);
        setNombreGeocerca("");
      }

      // Limpia nuevos y notifica
      grp.clearLayers();
      await cargarGeocercasExistentes();
      onSaved?.();
      onClose?.();
    } catch (e) {
      setError(e.message || "Error guardando geocerca.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (geocerca) => {
    setEditandoGeocerca(geocerca);
    setNombreGeocerca(geocerca.nombre || "");
    // Aquí podrías cargar las coordenadas en el mapa para edición
  };

  const handleConfirmDelete = async (geocerca) => {
    try {
      setSaving(true);
      await eliminarGeocerca(geocerca._id);
      await cargarGeocercasExistentes(); // Recarga la lista
      onSaved?.(); // Notifica al dashboard
    } catch (e) {
      setError(e.message || "Error eliminando geocerca.");
    } finally {
      setSaving(false);
      setConfirmingDelete(null); // Oculta la confirmación
    }
  };

  const handleDeleteClick = (geocerca) => {
    setConfirmingDelete(geocerca._id); // Muestra la confirmación para esta geocerca
    setEditandoGeocerca(null); // Cancela cualquier edición en curso
    setNombreGeocerca("");
  };

  const handleCancelDelete = () => {
    setConfirmingDelete(null); // Oculta la confirmación
  };

  const handleCancelEdit = () => {
    setEditandoGeocerca(null);
    setNombreGeocerca("");
    if (drawnRef.current) {
      drawnRef.current.clearLayers();
    }
  };

  const handleLocate = useCallback(() => {
    if (!mapInstance) {
      setError("El mapa no está listo. Intenta de nuevo.");
      return;
    }

    setIsLocating(true);
    setError(""); 

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latLng = [position.coords.latitude, position.coords.longitude];
        
        if (cdmxBounds.contains(latLng)) {
          mapInstance.flyTo(latLng, 16);
        } else {
          setError("Tu ubicación actual está fuera del área permitida (CDMX).");
          mapInstance.flyTo(latLng, 16); 
        }
        setIsLocating(false);
      },
      (err) => {
        if (err.code === 1) { 
          setError("Permiso de ubicación denegado.");
        } else {
          setError("No se pudo obtener la ubicación.");
        }
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [mapInstance]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white w-full max-w-[1400px] h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Panel lateral con geocercas existentes */}
        <div className="w-80 border-r bg-gray-50 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">
              {editandoGeocerca ? "Editando geocerca" : "Gestionar geocercas"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {editandoGeocerca 
                ? "Dibuja el nuevo polígono para actualizar esta geocerca"
                : "Las geocercas existentes aparecen en azul en el mapa"
              }
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {geocercasExistentes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay geocercas guardadas para este paciente
              </p>
            ) : (
              <div className="space-y-3">
                {geocercasExistentes.map((geocerca, index) => (
                  <div key={geocerca._id || index} className="bg-white border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {geocerca.nombre || `Geocerca #${index + 1}`}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {geocerca.coords?.length || 0} puntos
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(geocerca)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          disabled={saving || (editandoGeocerca && editandoGeocerca._id !== geocerca._id) || confirmingDelete}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(geocerca)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                          disabled={saving || editandoGeocerca || confirmingDelete}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    {editandoGeocerca?._id === geocerca._id && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs text-blue-700">Modo edición activo</p>
                        <button
                          onClick={handleCancelEdit}
                          className="text-xs text-blue-600 hover:underline mt-1"
                        >
                          Cancelar edición
                        </button>
                      </div>
                    )}

                    {confirmingDelete === geocerca._id && (
                      <div className="mt-3 pt-3 border-t border-red-200 bg-red-50 p-3 rounded-b-lg animate-fade-in">
                        <p className="text-sm font-medium text-red-800 text-center">
                          ¿Estás seguro?
                        </p>
                        <div className="flex justify-center gap-2 mt-2">
                          <button
                            onClick={handleCancelDelete}
                            className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleConfirmDelete(geocerca)}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Confirmar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel principal con mapa */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {editandoGeocerca ? "Editar geocerca" : "Agregar nueva geocerca"}
            </h3>
            <button
              onClick={handleLocate}
              disabled={isLocating || !mapInstance}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
              title="Usar mi ubicación actual"
            >
              {isLocating ? (
                <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <IconLocate />
              )}
              <span className="ml-2 hidden sm:block">Mi ubicación</span>
            </button>
          </div>

          <div className="flex-1 p-4 flex flex-col">
            <div className="h-[350px] w-full rounded overflow-hidden flex-shrink-0">
              <MapContainer
                center={cdmxCenter}
                zoom={10}
                minZoom={10}
                maxBounds={cdmxBounds}
                zoomAnimation={false}
                fadeAnimation={false}
                markerZoomAnimation={false}
                ref={setMapInstance}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DrawLayer
                  paciente={paciente}
                  geocercasExistentes={geocercasExistentes}
                  onReady={handleReady}
                  onPluginOK={handlePluginOK}
                  onError={handleError}
                />
              </MapContainer>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la geocerca
                  </label>
                  <input
                    type="text"
                    value={nombreGeocerca}
                    onChange={(e) => setNombreGeocerca(e.target.value)}
                    placeholder={editandoGeocerca ? "Nuevo nombre (opcional)" : "Ej: Casa, Hospital, Trabajo..."}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={saving}
                  />
                </div>

                <p className="text-sm text-gray-600 mt-3">
                  {editandoGeocerca 
                    ? "Dibuja el nuevo polígono para actualizar esta geocerca"
                    : "Dibuja un polígono (geocerca). Las geocercas existentes aparecen en azul."
                  }
                </p>
                {error && <p className="text-sm text-rose-600 mt-1">{error}</p>}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                {editandoGeocerca && (
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    Cancelar edición
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saving 
                    ? "Guardando..." 
                    : editandoGeocerca 
                      ? "Actualizar geocerca" 
                      : "Guardar geocerca"
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asegura que la barra de draw quede encima del modal */}
      <style>{`
        @keyframes fade-in { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        .animate-fade-in { 
          animation: fade-in 0.3s ease-out both; 
        }
      `}</style>
    </div>
  );
}
