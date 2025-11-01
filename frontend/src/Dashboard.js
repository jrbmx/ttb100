// src/Dashboard.js
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./auth/AuthContext";
import { 
  listarPacientes, 
  asignarDispositivo,
  liberarDispositivo
} from "./services/pacientes";
import { listarGeocercas } from "./services/geocercas";
import AltaPacienteModal from "./components/AltaPacienteModal";
import GeocerceModal from './components/GeocerceModal.jsx';
import ViewGeocercasModal from './components/ViewGeocercasModal.jsx';
import InfoCuidadorModal from "./components/InfoCuidadorModal.jsx";
import DeleteConfirmModal from "./components/DeleteConfirmModal.jsx";
import LiberarDispositivoModal from "./components/LiberarDispositivoModal.jsx";
import AsignarDispositivoModal from "./components/AsignarDispositivoModal.jsx";
import NotificacionPopup from "./components/NotificacionPopup.jsx";

const IconDevice = () => (
  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IconMapPin = () => (
  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconLink = () => (
  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);
const IconUnlink = () => (
  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244m-9.317 2.025a4.5 4.5 0 01-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757m-13.35.622l-1.757 1.757a4.5 4.5 0 006.364 6.364l4.5-4.5a4.5 4.5 0 00-1.242-7.244" />
  </svg>
);
const IconUserPlus = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
  </svg>
);
const IconInfo = () => (
  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);
const IconLogout = () => (
  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
);

const getInitials = (user) => {
  if (!user || !user.nombre) return "??";
  const nombre = user.nombre.split(' ')[0];
  const apellido = user.apellidoP || '';
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
};

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [datos, setDatos] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellidoP: "",
    apellidoM: "",
    telefono: "",
    email: ""
  });

  // popup
  const [popup, setPopup] = useState({ show: false, success: false, message: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // alta paciente
  const [altaOpen, setAltaOpen] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const API = process.env.REACT_APP_API_URL || "http://localhost:3000";

  // === NUEVO: estado para geocercas ===
  const [geofenceOpen, setGeofenceOpen] = useState(false);
  const [viewGeocercasOpen, setViewGeocercasOpen] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [geofenceCounts, setGeofenceCounts] = useState({}); // { [pacienteId]: n }
  
  // === ESTADO PARA MODALES DE DISPOSITIVO ===
  const [showLiberarConfirm, setShowLiberarConfirm] = useState(false);
  const [pacienteParaLiberar, setPacienteParaLiberar] = useState(null);
  const [isLiberando, setIsLiberando] = useState(false);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [pacienteParaAsignar, setPacienteParaAsignar] = useState(null);
  const [dispositivoIdInput, setDispositivoIdInput] = useState("");
  const [isAsignando, setIsAsignando] = useState(false);

  const cargarPacientes = async () => {
    try {
      const data = await listarPacientes();
      setPacientes(data);
      // también refrescamos el conteo de geocercas por paciente
      const counts = {};
      for (const p of data) {
        try {
          const g = await listarGeocercas(p._id);
          counts[p._id] = Array.isArray(g) ? g.length : 0;
        } catch {
          counts[p._id] = 0;
        }
      }
      setGeofenceCounts(counts);
    } catch (e) {
      console.error("Error al listar pacientes:", e);
      setPopup({ show: true, success: false, message: e.message || "Error al cargar pacientes" });
      setTimeout(() => setPopup({ show: false, success: false, message: "" }), 3000);
    }
  };

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const res = await fetch(`${API}/api/datos`);
        const data = await res.json();
        setDatos(data);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    if (user) {
      setForm({
        nombre: user.nombre,
        apellidoP: user.apellidoP,
        apellidoM: user.apellidoM,
        telefono: user.telefono,
        email: user.email
      });
    }
    fetchDatos();
    cargarPacientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleLogout = () => { logout(); navigate("/auth"); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const actualizarInfo = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/cuidadores/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setPopup({ show: true, success: true, message: "Información actualizada" });
        setTimeout(() => {
          setPopup({ show: false, success: false, message: "" });
          setShowModal(false);
        }, 1500);
      } else {
        setPopup({ show: true, success: false, message: "Error al actualizar" });
        setTimeout(() => setPopup({ show: false, success: false, message: "" }), 1500);
      }
    } catch (err) {
      setPopup({ show: true, success: false, message: "Error de red" });
      setTimeout(() => setPopup({ show: false, success: false, message: "" }), 1500);
    }
  };

  const borrarCuenta = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/cuidadores/${user._id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setPopup({ show: true, success: true, message: "Cuenta eliminada correctamente" });
        setTimeout(() => {
          setPopup({ show: false, success: false, message: "" });
          logout();
          navigate("/");
        }, 1500);
      } else {
        setPopup({ show: true, success: false, message: "Error al eliminar la cuenta" });
        setTimeout(() => setPopup({ show: false, success: false, message: "" }), 1500);
      }
    } catch (err) {
      setPopup({ show: true, success: false, message: "Error de red" });
      setTimeout(() => setPopup({ show: false, success: false, message: "" }), 1500);
    }
  };

  // === NUEVO: abrir/cerrar modal geocerca ===
  const abrirGeocerca = async (paciente) => {
    setPacienteSeleccionado(paciente);
    setGeofenceOpen(true);
    // refresca conteo individual
    try {
      const g = await listarGeocercas(paciente._id);
      setGeofenceCounts((m) => ({ ...m, [paciente._id]: Array.isArray(g) ? g.length : 0 }));
    } catch {
      setGeofenceCounts((m) => ({ ...m, [paciente._id]: 0 }));
    }
  };
  const cerrarGeocerca = () => {
    setGeofenceOpen(false);
    setPacienteSeleccionado(null);
  };

  // === NUEVO: abrir/cerrar modal ver geocercas ===
  const abrirVerGeocercas = async (paciente) => {
    setPacienteSeleccionado(paciente);
    setViewGeocercasOpen(true);
  };
  const cerrarVerGeocercas = () => {
    setViewGeocercasOpen(false);
    setPacienteSeleccionado(null);
  };

  // === Handlers para LIBERAR dispositivo ===
  const handleLiberarClick = (paciente) => {
    setPacienteParaLiberar(paciente);
    setShowLiberarConfirm(true);
  };

  const handleCancelarLiberar = () => {
    if (isLiberando) return;
    setShowLiberarConfirm(false);
    setPacienteParaLiberar(null);
  };

  const handleConfirmarLiberar = async () => {
    if (isLiberando) return;
    setIsLiberando(true);
    
    try {
      await liberarDispositivo(pacienteParaLiberar._id);
      handleCancelarLiberar();
      setPopup({ show: true, success: true, message: "Dispositivo liberado" });
      setTimeout(() => setPopup({ show: false, success: false, message: "" }), 1500);
      await cargarPacientes(); 
    } catch (e) {
      setPopup({ show: true, success: false, message: e.message });
      setTimeout(() => setPopup({ show: false, success: false, message: "" }), 2500);
    } finally {
      setIsLiberando(false);
    }
  };

  // === Handlers para ASIGNAR dispositivo ===
  const handleAsignarClick = (paciente) => {
    setPacienteParaAsignar(paciente);
    setDispositivoIdInput(""); // Limpiar input
    setShowAsignarModal(true);
  };

  const handleCancelarAsignar = () => {
    if (isAsignando) return;
    setShowAsignarModal(false);
    setPacienteParaAsignar(null);
    setDispositivoIdInput("");
  };

  /* Confirma y ejecuta la asignación del dispositivo */
  const handleConfirmarAsignar = async () => {
    if (isAsignando || !dispositivoIdInput.trim()) return;
    setIsAsignando(true);
    try {
      await asignarDispositivo(pacienteParaAsignar._id, dispositivoIdInput);
      handleCancelarAsignar();
      setPopup({ show: true, success: true, message: "Dispositivo asignado" });
      setTimeout(() => setPopup({ show: false, success: false, message: "" }), 1500);
      await cargarPacientes(); 
    } catch (e) {
      setPopup({ show: true, success: false, message: e.message });
      setTimeout(() => setPopup({ show: false, success: false, message: "" }), 3000); 
    } finally {
      setIsAsignando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] to-[#b2ebf2] pb-10">
      {/* HEADER */}
      <header
        className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#3f535e] to-[#06354f] py-4 shadow-lg flex justify-between items-center px-6 animate-fade-in"
        style={{ zIndex: 1000 }}
      >
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-white hidden sm:block">Dashboard</h1>
        </div>
        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            onClick={() => setAltaOpen(true)}
            className="flex items-center bg-[#3A6EA5] hover:bg-[#2E5984] text-white px-4 py-2 rounded-full shadow-md transition-transform transform hover:scale-105"
          >
            <IconUserPlus />
            Dar de alta
          </button>
        </div>
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="flex items-center justify-center w-10 h-10 bg-gray-700 rounded-full text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 transition-transform transform hover:scale-105"
          >
            {getInitials(user)}
          </button>

          {/* --- Menú Desplegable --- */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 animate-slide-down overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700">
                <p className="text-sm text-white">{user?.nombre} {user?.apellidoP}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <nav className="py-1">
                <button
                  onClick={() => { setAltaOpen(true); setMenuOpen(false); }}
                  className="md:hidden flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                >
                  <IconUserPlus className="w-5 h-5 mr-3 text-gray-400" />
                  Dar de alta
                </button>

                <button
                  onClick={() => { setShowModal(true); setMenuOpen(false); }}
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                >
                  <IconInfo />
                  Mi Información
                </button>
                <button
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700 w-full text-left"
                >
                  <IconLogout />
                  Cerrar sesión
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* CONTENIDO */}
      <div className="pt-24 container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 z-1 animate-zoom-in mb-6">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Mis pacientes</h2>
          {pacientes.length === 0 ? (
            <p className="text-center text-gray-500">Aún no has dado de alta pacientes.</p>
          ) : (
            <div className="space-y-4">
              {pacientes.map((p) => (
                <div key={p._id} className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden transition-all hover:shadow-lg">
                  <div className="flex flex-col md:flex-row">
                    
                    {/* --- Columna 1: Info Paciente --- */}
                    <div className="flex-grow p-4 pr-4">
                      <div className="flex items-center flex-wrap gap-x-3">
                        <span className="text-lg font-bold text-gray-800">
                          {p.nombre} {p.apellidoP} {p.apellidoM} ({p.edad})
                        </span>
                        <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                          Geocercas: {geofenceCounts[p._id] ?? 0}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {p.lat_dms && p.lng_dms ? (
                          <>Ubicación (DMS): {p.lat_dms}, {p.lng_dms}</>
                        ) : (p.latitud && p.longitud) ? (
                          <>Ubicación (decimal): {p.latitud}, {p.longitud}</>
                        ) : (
                          "Sin ubicación"
                        )}
                      </div>
                    </div>
                    
                    {/* --- Columna 2: Acciones --- */}
                    <div className="flex-shrink-0 bg-gray-50 md:w-72 border-t md:border-t-0 md:border-l border-gray-200">
                      <div className="p-3 flex space-x-2">
                        <button
                          onClick={() => abrirGeocerca(p)}
                          className="flex-1 text-sm flex items-center justify-center px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          <IconMapPin />
                          Configurar
                        </button>
                        <button
                          onClick={() => abrirVerGeocercas(p)}
                          className="flex-1 text-sm flex items-center justify-center px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          Ver
                        </button>
                      </div>

                      {/* --- SECCIÓN DISPOSITIVO --- */}
                      <div className="border-t border-gray-200 px-3 pt-2 pb-3">
                        <h5 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Dispositivo</h5>
                        <div className="flex items-center justify-between min-h-[34px]"> {/* Altura mínima para evitar saltos */}
                          {p.dispositivo_id ? (
                            // -- Caso 1: Dispositivo ASIGNADO --
                            <>
                              <span className="text-sm font-medium bg-gray-200 text-gray-800 px-2 py-1 rounded-md flex items-center overflow-hidden">
                                <IconDevice />
                                <span className="truncate" title={p.dispositivo_id}>{p.dispositivo_id}</span>
                              </span>
                              <button 
                                onClick={() => handleLiberarClick(p)}
                                className="text-sm flex items-center px-3 py-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 transition-colors"
                              >
                                <IconUnlink />
                                Liberar
                              </button>
                            </>
                          ) : (
                            // -- Caso 2: Dispositivo NO asignado --
                            <>
                              <span className="text-sm italic text-gray-500">No asignado</span>
                              <button 
                                onClick={() => handleAsignarClick(p)}
                                className="text-sm flex items-center px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
                              >
                                <IconLink />
                                Asignar
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Datos Tabla */}
        <div className="bg-white rounded-xl shadow-2xl p-6 z-1 animate-zoom-in">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Datos Recibidos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-center border-collapse">
              <thead className="bg-[#B1E2D5] text-gray-800">
                <tr>
                  <th className="py-3 px-4 border">Fecha</th>
                  <th className="py-3 px-4 border">Frecuencia</th>
                  <th className="py-3 px-4 border">Oxígeno</th>
                  <th className="py-3 px-4 border">Latitud</th>
                  <th className="py-3 px-4 border">Longitud</th>
                </tr>
              </thead>
              <tbody>
                {datos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-gray-500">No hay datos disponibles.</td>
                  </tr>
                ) : (
                  datos.map((dato) => (
                    <tr key={dato._id} className="hover:bg-gray-100 transition-colors duration-200">
                      <td className="py-2 px-4 border">{new Date(dato.fecha).toLocaleString("es-MX")}</td>
                      <td className="py-2 px-4 border">{dato.frecuencia}</td>
                      <td className="py-2 px-4 border">{dato.oxigeno}</td>
                      <td className="py-2 px-4 border">{dato.latitud}</td>
                      <td className="py-2 px-4 border">{dato.longitud}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL: Mi Información */}
        <InfoCuidadorModal
          open={showModal}
          onClose={() => setShowModal(false)}
          form={form}
          onChange={handleChange}
          onUpdate={actualizarInfo}
          onDeleteClick={() => {
            setShowModal(false); // Cierra este modal
            setShowDeleteConfirm(true); // Abre el de confirmación
          }}
        />

        {/* MODAL: Confirmar Borrar Cuenta */}
        <DeleteConfirmModal
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            setShowDeleteConfirm(false);
            borrarCuenta();
          }}
        />
        
        {/* MODAL: Alta Paciente */}
        <AltaPacienteModal open={altaOpen} onClose={() => setAltaOpen(false)} onCreated={cargarPacientes} />
        
        {/* MODAL: Configurar Geocerca */}
        <GeocerceModal 
          open={geofenceOpen} 
          paciente={pacienteSeleccionado} 
          onClose={cerrarGeocerca} 
          onSaved={async () => {
            try {
              await cargarPacientes();
              if (pacienteSeleccionado?._id) {
                const g = await listarGeocercas(pacienteSeleccionado._id);
                setGeofenceCounts(m => ({ ...m, [pacienteSeleccionado._id]: Array.isArray(g) ? g.length : 0 }));
              }
              setPopup({ show: true, success: true, message: "Geocerca(s) guardada(s)" });
              setTimeout(() => setPopup({ show: false, success: false, message: "" }), 1500);
            } catch (e) {
              setPopup({ show: true, success: false, message: e.message || "Error al refrescar geocercas" });
              setTimeout(() => setPopup({ show: false, success: false, message: "" }), 1800);
            } finally {
              cerrarGeocerca();
            }
          }} 
        />
        
        {/* MODAL: Ver Geocercas */}
        <ViewGeocercasModal 
          open={viewGeocercasOpen} 
          paciente={pacienteSeleccionado} 
          onClose={cerrarVerGeocercas} 
        />

        {/* === MODAL: Confirmar Liberar Dispositivo === */}
        <LiberarDispositivoModal
          open={showLiberarConfirm}
          onClose={handleCancelarLiberar}
          onConfirm={handleConfirmarLiberar}
          paciente={pacienteParaLiberar}
          isLiberando={isLiberando}
        />
        
        {/* === MODAL: Asignar Dispositivo === */}
        <AsignarDispositivoModal
          open={showAsignarModal}
          onClose={handleCancelarAsignar}
          onConfirm={handleConfirmarAsignar}
          paciente={pacienteParaAsignar}
          isAsignando={isAsignando}
          idInput={dispositivoIdInput}
          onIdInputChange={(e) => setDispositivoIdInput(e.target.value)}
        />

        {/* POPUP DE NOTIFICACIÓN */}
        <NotificacionPopup
          popup={popup}
          onClose={() => setPopup({ ...popup, show: false })}
        />

        {/* estilos animaciones */}
        <style>{`
          @keyframes zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .animate-zoom-in { animation: zoom-in 0.7s cubic-bezier(.4,0,.2,1) both; }
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fade-in 1s both; }
          @keyframes fade-in-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in-up { animation: fade-in-up 0.7s both; }
          @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-slide-down { animation: slideDown 0.3s ease-out both; }
          @keyframes popup-fade { from { opacity: 0; } to { opacity: 1; } }
          .animate-popup-fade { animation: popup-fade 0.4s both; }
        `}</style>
      </div>
    </div>
  );
}
