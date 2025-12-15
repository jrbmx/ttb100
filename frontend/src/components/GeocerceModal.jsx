// src/components/GeocerceModal.jsx
import { useEffect, useRef, useState, useCallback, memo, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import { listarGeocercas, crearGeocerca, actualizarGeocerca, eliminarGeocerca } from "../services/geocercas";

const cdmxCenter = [19.4326, -99.1332];
const cdmxBounds = L.latLngBounds(
  L.latLng(19.0, -99.5),
  L.latLng(19.8, -98.7)
);

const IconLocate = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
  </svg>
);

/* ======================== Capa de dibujo (Corregida para Zoom Ajustado) ======================== */
const DrawLayer = memo(function DrawLayer({ paciente, geocercasExistentes, onReady, onError, onPluginOK }) {
  const map = useMap();
  const drawnRef = useRef(null);
  const existRef = useRef(null);
  const ctlRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (typeof window !== "undefined") window.L = L;
        if (!L.Draw) {
          await import("leaflet-draw");
        }
        if (!mounted) return;

        onPluginOK?.();

        // Inicializar grupos
        if (!drawnRef.current) drawnRef.current = L.featureGroup().addTo(map);
        if (!existRef.current) existRef.current = L.featureGroup().addTo(map);

        // Configurar controles de dibujo
        if (!ctlRef.current) {
          ctlRef.current = new L.Control.Draw({
            position: "topleft",
            draw: {
              polygon: {
                allowIntersection: false,
                showArea: true,
                shapeOptions: { color: "#10b981" },
              },
              polyline: false, rectangle: false, circle: false, circlemarker: false, marker: false,
            },
            edit: {
              featureGroup: drawnRef.current,
              edit: true,
              remove: true,
            },
          });
          map.addControl(ctlRef.current);
        }

        const onCreated = (e) => {
          drawnRef.current.clearLayers();
          drawnRef.current.addLayer(e.layer);
        };
        map.on(L.Draw.Event.CREATED, onCreated);

        // --- LÓGICA DE PINTADO Y ZOOM MEJORADA ---
        const paintExisting = () => {
          existRef.current.clearLayers();
          let hasLayers = false;

          (Array.isArray(geocercasExistentes) ? geocercasExistentes : []).forEach((g) => {
            try {
              const raw = g.coords || g.polygon || g.vertices || [];
              if (Array.isArray(raw) && raw.length >= 3) {
                const validCoords = raw.map(point => {
                  if (Array.isArray(point) && point.length >= 2) return [point[0], point[1]];
                  else if (point && typeof point === 'object' && 'lat' in point && 'lng' in point) return [point.lat, point.lng];
                  return null;
                }).filter(coord => coord && typeof coord[0] === 'number' && typeof coord[1] === 'number');

                if (validCoords.length >= 3) {
                  L.polygon(
                    validCoords.map(([lat, lng]) => L.latLng(lat, lng)),
                    { color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.2 }
                  ).addTo(existRef.current);
                  hasLayers = true;
                }
              }
            } catch (error) { console.error("Error procesando geocerca:", error); }
          });

          // Usamos setTimeout para asegurar que el Modal ya terminó de abrirse
          // y el contenedor del mapa tiene su tamaño final.
          setTimeout(() => {
            if (!mounted) return;

            // 1. CRUCIAL: Recalcula el tamaño del contenedor del mapa
            map.invalidateSize();

            if (hasLayers) {
              const bounds = existRef.current.getBounds();
              if (bounds.isValid()) {
                map.fitBounds(bounds, {
                  padding: [10, 10], // Margen mínimo (muy ajustado)
                  maxZoom: 18,       // Permitimos acercarse mucho más
                  animate: true
                });
              }
            } else if (paciente?.latitud && paciente?.longitud) {
              map.setView([paciente.latitud, paciente.longitud], 15);
            } else {
              map.setView([19.4326, -99.1332], 12);
            }
          }, 400); // 400ms da tiempo al modal (usualmente 300ms) de animar
        };

        paintExisting();
        onReady?.({ drawnGroup: drawnRef.current });

        return () => {
          map.off(L.Draw.Event.CREATED, onCreated);
          if (ctlRef.current) {
            try { map.removeControl(ctlRef.current); } catch { }
            ctlRef.current = null;
          }
        };
      } catch (e) { onError?.("Leaflet-Draw no está disponible."); }
    })();
    return () => { mounted = false; };
  }, [map, paciente, geocercasExistentes, onReady, onError, onPluginOK]);

  return null;
});

/* ======================== Modal Principal ======================== */
export default function GeocerceModal({ open, onClose, paciente, onSaved }) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [geocercasExistentes, setGeocercasExistentes] = useState([]);
  const [editandoGeocerca, setEditandoGeocerca] = useState(null);
  const [nombreGeocerca, setNombreGeocerca] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Mobile UI state: false = viendo mapa, true = viendo lista
  const [showListMobile, setShowListMobile] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const tourSteps = useMemo(() => {
    const hayGeocercas = geocercasExistentes.length > 0;

    const pasosBasicos = [
      {
        target: '.tour-modal-container',
        title: 'Editor de zonas seguras',
        content: 'Aquí puedes crear cercas virtuales. Si el paciente sale de estas áreas, recibirás una alerta.',
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: '.leaflet-draw-toolbar',
        title: 'Paso 1: Dibujar',
        content: 'Haz clic en el PENTÁGONO en esta barra. Luego, haz clic en el mapa para ir marcando los puntos de tu zona segura.',
        placement: 'right',
      },
      {
        target: '.tour-geocerca-input',
        title: 'Paso 2: Nombrar',
        content: 'Una vez cerrado el dibujo, escribe un nombre aquí (ej. "Casa", "Parque") para identificar la zona.',
        placement: 'top',
      },
      {
        target: '.tour-geocerca-save',
        title: 'Paso 3: Guardar',
        content: 'Pulsa este botón para registrar la zona en el sistema.',
        placement: 'top',
      },
    ];

    if (hayGeocercas) {
      return [
        ...pasosBasicos,
        {
          target: '.tour-geocerca-lista',
          title: 'Tus zonas guardadas',
          content: 'Aquí verás la lista de tus zonas activas.',
          placement: 'right',
        },
        {
          target: '.tour-edit-item-0', // Apunta al PRIMER botón de editar
          title: '¿Cómo editar una zona?',
          content: 'IMPORTANTE: Al hacer clic en Editar, la zona actual se borrará del mapa de dibujo. DEBES DIBUJARLA NUEVAMENTE con la nueva forma que desees y luego dar clic en "Actualizar".',
          placement: 'right',
          styles: {
            options: { width: 400 }, // Hacemos la tarjeta más ancha para que quepa el texto
            tooltipTitle: { color: '#d97706' } // Color ámbar para denotar advertencia/atención
          }
        }
      ];
    }

    else {
      return [
        ...pasosBasicos,
        {
          target: '.tour-geocerca-lista',
          title: '¡Inténtalo ahora!',
          content: 'Aún no tienes zonas seguras registradas. Crea una geocerca de "Prueba" ahora mismo siguiendo los pasos anteriores para ver cómo funciona.',
          placement: 'right',
        }
      ];
    }
  }, [geocercasExistentes.length]); // Se recalcula si agregan o borran zonas

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;

    // Si el tour termina o se salta
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      if (index >= 4) {
        localStorage.setItem('tour_geocercas_visto', 'true');
      }
    }
    // Si el usuario da clic en Siguiente, Atrás, o el paso termina automáticamente
    else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Calculamos el siguiente índice basado en la acción (Next +1, Prev -1)
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      setStepIndex(nextStepIndex);
    }
  };

  const drawnRef = useRef(null);
  const handleReady = useCallback(({ drawnGroup }) => { drawnRef.current = drawnGroup; }, []);
  const handlePluginOK = useCallback(() => { setError(""); }, []);
  const handleError = useCallback((msg) => { setError(msg); }, []);

  const cargarGeocercasExistentes = useCallback(async () => {
    if (!paciente?._id) return;
    try {
      const geocercas = await listarGeocercas(paciente._id);
      const geocercasConNombres = (Array.isArray(geocercas) ? geocercas : []).map((geocerca, index) => ({
        ...geocerca,
        nombre: geocerca.nombre || `Geocerca #${index + 1}`
      }));
      setGeocercasExistentes(geocercasConNombres);
    } catch (e) {
      setGeocercasExistentes([]);
    }
  }, [paciente?._id]);

  useEffect(() => {
    if (open) {
      setError("");
      setIsLocating(false);
      cargarGeocercasExistentes();
      const tourVisto = localStorage.getItem('tour_geocercas_visto');
      if (!tourVisto) {
        setTimeout(() => setRunTour(true), 1000);
      }
    } else {
      setRunTour(false);
    }
  }, [open, paciente, cargarGeocercasExistentes]);

  // ... Lógica de guardado (handleSave, handleEdit, handleDelete, etc.) igual que antes ...
  const handleSave = async () => {
    try {
      if (!paciente?._id) { setError("Paciente inválido."); return; }
      const grp = drawnRef.current;
      if (!grp) { setError("No hay polígono dibujado."); return; }

      let polygonCoords = null;
      grp.eachLayer((layer) => {
        if (layer instanceof L.Polygon) {
          const ll = layer.getLatLngs();
          const ring = Array.isArray(ll[0]) ? ll[0] : ll;
          const coords = ring.map((p) => [p.lat, p.lng]);
          if (coords.length >= 3) polygonCoords = coords;
        }
      });

      if (!polygonCoords) { setError("Dibuja un polígono para poder guardarlo."); return; }
      const esLaPrimeraGeocerca = geocercasExistentes.length === 0;

      setSaving(true);
      setError("");

      if (editandoGeocerca) {
        await actualizarGeocerca(editandoGeocerca._id, polygonCoords, nombreGeocerca || editandoGeocerca.nombre);
        setEditandoGeocerca(null);
        setNombreGeocerca("");
      } else {
        if (!nombreGeocerca.trim()) { setError("El nombre de la geocerca es obligatorio"); return; }
        await crearGeocerca(paciente._id, polygonCoords, nombreGeocerca);
        setNombreGeocerca("");
      }

      grp.clearLayers();
      await cargarGeocercasExistentes();
      onSaved?.();

      if (esLaPrimeraGeocerca && !editandoGeocerca) {
        setTimeout(() => {
          setStepIndex(4); 
          setRunTour(true);
        }, 600);
      }
      
    } catch (e) { setError(e.message || "Error guardando geocerca."); } finally { setSaving(false); }
  };

  const handleEdit = (geocerca) => {
    setEditandoGeocerca(geocerca);
    setNombreGeocerca(geocerca.nombre || "");
    setShowListMobile(false); // En móvil, volver al mapa al editar
  };

  const handleConfirmDelete = async (geocerca) => {
    try {
      setSaving(true);
      await eliminarGeocerca(geocerca._id);
      await cargarGeocercasExistentes();
      onSaved?.();
    } catch (e) { setError(e.message || "Error eliminando."); } finally { setSaving(false); setConfirmingDelete(null); }
  };

  const handleDeleteClick = (geocerca) => {
    setConfirmingDelete(geocerca._id);
    setEditandoGeocerca(null);
    setNombreGeocerca("");
  };

  const handleCancelDelete = () => setConfirmingDelete(null);

  const handleCancelEdit = () => {
    setEditandoGeocerca(null);
    setNombreGeocerca("");
    if (drawnRef.current) drawnRef.current.clearLayers();
  };

  const handleLocate = useCallback(() => {
    if (!mapInstance) { setError("Mapa no listo."); return; }
    setIsLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latLng = [position.coords.latitude, position.coords.longitude];
        if (cdmxBounds.contains(latLng)) mapInstance.flyTo(latLng, 16);
        else { setError("Fuera de CDMX."); mapInstance.flyTo(latLng, 16); }
        setIsLocating(false);
      },
      (err) => { setError("Error de ubicación."); setIsLocating(false); },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [mapInstance]);

  if (!open) return null;

  /* ======================== RENDER OPTIMIZADO ======================== */
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-2 sm:p-4">
      <Joyride
        steps={tourSteps}
        run={runTour}
        stepIndex={stepIndex}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        callback={handleJoyrideCallback}
        disableScrollParentFix={true}
        styles={{
          options: {
            primaryColor: '#0F3D56',
            zIndex: 3000, // <--- MUY IMPORTANTE: Mayor que el modal
          },
          tooltipTitle: {
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#0F3D56',
            textAlign: 'center',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          buttonNext: {
            backgroundColor: '#0F3D56',
          }
        }}
        locale={{ back: 'Atrás', close: 'Cerrar', last: 'Finalizar', next: 'Siguiente', skip: 'Saltar' }}
      />
      {/* Contenedor Principal: Responsivo (Columna en móvil, Fila en Desktop) */}
      <div className="tour-modal-container bg-white w-full max-w-[1400px] h-[95vh] sm:h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row relative">

        {/* --- PANEL LATERAL (LISTA) --- */}
        {/* En Desktop: Sidebar izquierdo fijo. En Móvil: Capa superpuesta o sección oculta controlada por showListMobile */}
        <div className={`
            tour-geocerca-lista lg:w-80 lg:border-r bg-gray-50 flex flex-col transition-all duration-300
            ${showListMobile ? 'absolute inset-0 z-20' : 'hidden lg:flex'}
            lg:static lg:h-full
        `}>
          <div className="p-4 border-b bg-white lg:bg-gray-50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Geocercas</h3>
              <p className="text-xs text-gray-500">
                {geocercasExistentes.length} registradas
              </p>
            </div>
            {/* Botón cerrar lista solo en móvil */}
            <button onClick={() => setShowListMobile(false)} className="lg:hidden p-2 text-gray-500">
              <IconX />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {geocercasExistentes.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">No hay geocercas guardadas</p>
            ) : (
              geocercasExistentes.map((geocerca, index) => (
                <div key={geocerca._id || index} className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 truncate max-w-[120px]">
                      {geocerca.nombre || `Geocerca #${index + 1}`}
                    </h4>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(geocerca)} className={`p-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 ${index === 0 ? 'tour-edit-item-0' : ''}`}>Editar</button>
                      <button onClick={() => handleDeleteClick(geocerca)} className="p-1.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Borrar</button>
                    </div>
                  </div>

                  {/* Alertas de edición/borrado */}
                  {editandoGeocerca?._id === geocerca._id && (
                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-1 rounded">Editando...</div>
                  )}
                  {confirmingDelete === geocerca._id && (
                    <div className="mt-2 pt-2 border-t flex justify-between items-center animate-fade-in">
                      <span className="text-xs text-red-600 font-bold">¿Borrar?</span>
                      <div className="flex gap-2">
                        <button onClick={handleCancelDelete} className="text-xs text-gray-500 underline">No</button>
                        <button onClick={() => handleConfirmDelete(geocerca)} className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">Sí</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- PANEL PRINCIPAL (MAPA + FORMULARIO) --- */}
        <div className="flex-1 flex flex-col h-full relative">

          {/* HEADER DEL MAPA */}
          <div className="p-3 sm:p-4 border-b flex justify-between items-center bg-white z-10 shadow-sm shrink-0">
            <div className="flex items-center gap-2">
              {/* Botón hamburguesa para ver lista en móvil */}
              <button onClick={() => setShowListMobile(true)} className="lg:hidden p-2 bg-gray-100 rounded-md">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                {editandoGeocerca ? "Editar zona" : "Nueva geocerca"}
              </h3>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  localStorage.removeItem('tour_geocercas_visto'); // Borramos memoria
                  setRunTour(true); // Iniciamos tour
                }}
                className="hidden sm:flex items-center justify-center w-9 h-9 text-sm font-bold text-blue-800 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors border border-blue-200"
                title="Ver ayuda"
              >
                ?
              </button>
              <button
                onClick={handleLocate}
                disabled={isLocating || !mapInstance}
                className="tour-geocerca-locate p-2 sm:px-3 sm:py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                title="Mi ubicación"
              >
                {isLocating ? <span className="animate-spin">⌛</span> : <IconLocate />}
              </button>
              <button onClick={onClose} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded">
                <IconX />
              </button>
            </div>
          </div>

          {/* AREA DEL MAPA (Flexible) */}
          <div className="flex-1 relative w-full min-h-[300px] bg-gray-100">
            <MapContainer
              center={cdmxCenter}
              zoom={10}
              minZoom={10}
              maxBounds={cdmxBounds}
              zoomAnimation={false}
              ref={setMapInstance}
              className="h-full w-full z-0" // IMPORTANTE: h-full ocupa el espacio flexible
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
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

            {/* Mensaje flotante de instrucción */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full shadow text-xs sm:text-sm text-gray-600 pointer-events-none z-[400]">
              {editandoGeocerca ? "Modificando zona..." : "Dibuja el polígono"}
            </div>
          </div>

          {/* FOOTER (INPUTS Y BOTONES) - SIEMPRE VISIBLE */}
          <div className="p-3 sm:p-4 bg-white border-t z-10 shrink-0">
            <div className="max-w-3xl mx-auto w-full">

              {/* Input y Error */}
              <div className="mb-3 tour-geocerca-input">
                <input
                  type="text"
                  value={nombreGeocerca}
                  onChange={(e) => setNombreGeocerca(e.target.value)}
                  placeholder="Nombre (ej: Casa, Parque...)"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  disabled={saving}
                />
                {error && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{error}</p>}
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 justify-end items-center">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>

                {editandoGeocerca && (
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Descartar cambios
                  </button>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="tour-geocerca-save flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                >
                  {saving ? "Guardando..." : editandoGeocerca ? "Actualizar" : "Guardar zona"}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Estilos adicionales */}
      <style>{`
        .leaflet-draw-toolbar { border: none !important; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important; }
        .leaflet-draw-toolbar a { background-color: white !important; color: #374151 !important; border-bottom: 1px solid #f3f4f6 !important; }
        .leaflet-draw-toolbar a:hover { background-color: #f9fafb !important; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out both; }
      `}</style>
    </div>
  );
}

// Icono simple para cerrar
const IconX = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);