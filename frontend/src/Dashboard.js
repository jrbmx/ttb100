// src/Dashboard.js
import React, { useContext, useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./auth/AuthContext";
import {
  listarPacientes,
  asignarDispositivo,
  liberarDispositivo
} from "./services/pacientes";
import { listarGeocercas } from "./services/geocercas";
import { getDatosRelevantes } from "./services/datos";
import AltaPacienteModal from "./components/AltaPacienteModal";
import GeocerceModal from './components/GeocerceModal.jsx';
import ViewGeocercasModal from './components/ViewGeocercasModal.jsx';
import InfoCuidadorModal from "./components/InfoCuidadorModal.jsx";
import DeleteConfirmModal from "./components/DeleteConfirmModal.jsx";
import LiberarDispositivoModal from "./components/LiberarDispositivoModal.jsx";
import AsignarDispositivoModal from "./components/AsignarDispositivoModal.jsx";
import NotificacionPopup from "./components/NotificacionPopup.jsx";
import { listarAlertas } from "./services/alertas";
import AlertasView from "./components/AlertasView.jsx";

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
const IconInfo = () => (
  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);
const IconLogout = () => (
  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
);
const IconSearch = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const IconPrev = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);
const IconNext = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
const IconArrowUp = () => (
  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);
const IconArrowDown = () => (
  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
const IconHeart = () => (
  <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);
const IconOxygen = () => (
  <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);
const IconClock = () => (
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconHome = () => (
  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const IconAlert = () => (
  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const IconLocationOff = () => (
  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6" />
  </svg>
);
const IconWifi = () => (
  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.071-7.071a10 10 0 0114.142 0M1.393 9.393a15 15 0 0121.214 0" />
  </svg>
);
const IconPlus = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);
const IconBell = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const ITEMS_PER_PAGE = 5;

const getInitials = (user) => {
  if (!user || !user.nombre) return "??";
  const nombre = user.nombre.split(' ')[0];
  const apellido = user.apellidoP || '';
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
};

function formatTimeAgo(isoDate) {
  if (!isoDate) return "N/A";
  const now = new Date();
  const past = new Date(isoDate);
  const seconds = Math.floor((now - past) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return `hace ${Math.floor(interval)} años`;
  interval = seconds / 2592000;
  if (interval > 1) return `hace ${Math.floor(interval)} meses`;
  interval = seconds / 86400;
  if (interval > 1) return `hace ${Math.floor(interval)} días`;
  interval = seconds / 3600;
  if (interval > 1) return `hace ${Math.floor(interval)} horas`;
  interval = seconds / 60;
  if (interval > 1) return `hace ${Math.floor(interval)} min.`;
  return `hace ${Math.floor(seconds)} seg.`;
}

function isPointInPolygon(point, polygon) {
  let isInside = false;
  const { lat, lng } = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat, yi = polygon[i].lng;
    const xj = polygon[j].lat, yj = polygon[j].lng;

    const intersect = ((yi > lng) !== (yj > lng))
      && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
}

export default function Dashboard() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const menuRef = useRef(null);

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
  const [filtroNombre, setFiltroNombre] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'ascending' });
  const [ultimosDatos, setUltimosDatos] = useState({});

  // === NUEVO: estado para geocercas ===
  const [geofenceOpen, setGeofenceOpen] = useState(false);
  const [viewGeocercasOpen, setViewGeocercasOpen] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [geofenceCounts, setGeofenceCounts] = useState({});
  const [geocercasCompletas, setGeocercasCompletas] = useState({});

  // === ESTADO PARA MODALES DE DISPOSITIVO ===
  const [showLiberarConfirm, setShowLiberarConfirm] = useState(false);
  const [pacienteParaLiberar, setPacienteParaLiberar] = useState(null);
  const [isLiberando, setIsLiberando] = useState(false);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [pacienteParaAsignar, setPacienteParaAsignar] = useState(null);
  const [dispositivoIdInput, setDispositivoIdInput] = useState("");
  const [isAsignando, setIsAsignando] = useState(false);

  // === ESTADO PARA ALERTAS ===
  const [currentView, setCurrentView] = useState('pacientes'); // 'pacientes' o 'alertas'
  const [alertas, setAlertas] = useState([]);
  const [isLoadingAlertas, setIsLoadingAlertas] = useState(true);
  const [unseenAlertsCount, setUnseenAlertsCount] = useState(0); // Para el "9+"
  const toastedAlertIds = useRef(new Set());

  const cargarPacientes = async () => {
    try {
      const data = await listarPacientes();
      setPacientes(data);

      const geocercaPromises = [];
      const datosPromises = [];

      for (const p of data) {
        geocercaPromises.push(
          listarGeocercas(p._id)
            .then(g => ({ id: p._id, geocercas: Array.isArray(g) ? g : [] }))
            .catch(() => ({ id: p._id, geocercas: [] }))
        );

        datosPromises.push(
          getDatosRelevantes(p._id)
            .then(datos => ({ id: p._id, datos })) // datos = { ultimoDato, ultimoGpsValido }
            .catch(() => ({ id: p._id, datos: { ultimoDato: null, ultimoGpsValido: null } }))
        );
      }

      const [geocercaResults, datosResults] = await Promise.all([
        Promise.all(geocercaPromises),
        Promise.all(datosPromises)
      ]);

      const geocercasMap = geocercaResults.reduce((acc, res) => ({ ...acc, [res.id]: res.geocercas }), {});
      const geocercaCountMap = geocercaResults.reduce((acc, res) => ({ ...acc, [res.id]: res.geocercas.length }), {});
      const datosMap = datosResults.reduce((acc, res) => ({ ...acc, [res.id]: res.datos }), {});

      setGeocercasCompletas(geocercasMap);
      setGeofenceCounts(geocercaCountMap);
      setUltimosDatos(datosMap);

    } catch (e) {
      console.error("Error al listar pacientes:", e);
    }
  };

  const { pacientesPaginados, totalPages } = useMemo(() => {
    const lowerFiltro = filtroNombre.toLowerCase();
    const filtrados = filtroNombre
      ? pacientes.filter(p => `${p.nombre} ${p.apellidoP} ${p.apellidoM}`.toLowerCase().includes(lowerFiltro))
      : [...pacientes]; // Usar una copia para no mutar el estado original


    filtrados.sort((a, b) => {
      let aValue;
      let bValue;

      if (sortConfig.key === 'nombre') {
        aValue = `${a.nombre} ${a.apellidoP}`.toLowerCase();
        bValue = `${b.nombre} ${b.apellidoP}`.toLowerCase();
      } else if (sortConfig.key === 'edad') {
        aValue = a.edad;
        bValue = b.edad;
      } else if (sortConfig.key === 'geofenceCounts') {
        aValue = geofenceCounts[a._id] ?? 0;
        bValue = geofenceCounts[b._id] ?? 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    const total = Math.ceil(filtrados.length / ITEMS_PER_PAGE);
    const lastIndex = currentPage * ITEMS_PER_PAGE;
    const firstIndex = lastIndex - ITEMS_PER_PAGE;
    const paginados = filtrados.slice(firstIndex, lastIndex);
    return { pacientesPaginados: paginados, totalPages: total };
  }, [pacientes, filtroNombre, currentPage, sortConfig, geofenceCounts]);

  const cargarAlertas = async () => {
    try {
      const data = await listarAlertas();
      setAlertas(data);
      
      const unseenCount = data.filter(a => !a.vista).length;
      setUnseenAlertsCount(unseenCount);

      const newUnseenAlerts = data.filter(a => !a.vista && !toastedAlertIds.current.has(a._id));

      if (newUnseenAlerts.length > 0) {
        const mostRecentAlert = newUnseenAlerts[0]; 
        newUnseenAlerts.forEach(a => toastedAlertIds.current.add(a._id));
        
        const isSalida = mostRecentAlert.tipo === 'salida_geocerca';
        const popupMessage = mostRecentAlert.mensaje;

        setPopup({
          show: true,
          success: !isSalida,
          message: popupMessage
        });
        setTimeout(() => setPopup({ show: false, success: false, message: "" }), 3000); // 3 seg
      }

    } catch (e) {
      console.error("Error al listar alertas:", e);
    } finally {
      setIsLoadingAlertas(false);
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

      toastedAlertIds.current = new Set();
      fetchDatos();
      cargarPacientes();
      cargarAlertas();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const intervalId = setInterval(() => {
        console.log("Buscando nuevas alertas...");
        cargarAlertas();
      }, 60000); // 60 segundos

      return () => clearInterval(intervalId);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false); // Cierra el menú
    };

    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [menuOpen]);

  useEffect(() => {
    setCurrentPage(1); // Vuelve a la página 1 cada vez que se busca
  }, [filtroNombre]);

  const handleLogout = () => { logout(); navigate("/auth"); };

  const handleCloseInfoModal = () => {
    setShowModal(false);
    setForm({
      nombre: user.nombre,
      apellidoP: user.apellidoP,
      apellidoM: user.apellidoM,
      telefono: user.telefono,
      email: user.email
    });
  };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const actualizarInfo = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/cuidadores/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const updatedUser = await res.json();
      if (res.ok) {
        updateUser(updatedUser);
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

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const getLocationStatus = (datosRelevantes, geocercas) => {
    const { ultimoDato, ultimoGpsValido } = datosRelevantes;

    if (!ultimoDato) {
      return { status: "Sin ubicación", icon: IconLocationOff, color: "text-gray-400" };
    }

    const geocercasDisponibles = geocercas || [];
    let locationPoint = null;
    let locationStatus = "";

    const isWifi = (ultimoDato.latitud === 91.0 || ultimoDato.longitud === 181.0);
    if (isWifi) {
      locationStatus = "Conectado a WiFi";
      if (ultimoGpsValido) {
        locationPoint = { lat: ultimoGpsValido.latitud, lng: ultimoGpsValido.longitud };
      }
    } else {
      locationPoint = { lat: ultimoDato.latitud, lng: ultimoDato.longitud };
    }

    let enGeocerca = false;
    let nombreGeocerca = "";

    if (locationPoint && geocercasDisponibles.length > 0) {
      for (const geofence of geocercasDisponibles) {
        if (geofence.coords && isPointInPolygon(locationPoint, geofence.coords)) {
          enGeocerca = true;
          nombreGeocerca = geofence.nombre;
          break;
        }
      }
    }

    if (locationStatus === "Conectado a WiFi") {
      if (enGeocerca) {
        return { status: `Conectado a WiFi (Última ubicación en ${nombreGeocerca})`, icon: IconWifi, color: "text-green-600" };
      } else if (locationPoint) {
        // Está en WiFi, pero su último GPS válido estaba "Fuera"
        return { status: `Conectado a WiFi (Fuera de zona)`, icon: IconWifi, color: "text-yellow-600" };
      } else {
        // Está en WiFi, pero NO tenemos historial de GPS
        return { status: "Conectado a WiFi", icon: IconWifi, color: "text-gray-500" };
      }
    }

    if (locationPoint) {
      if (enGeocerca) {
        return { status: `En ${nombreGeocerca}`, icon: IconHome, color: "text-green-600" };
      } else {
        return { status: "Fuera de zona segura", icon: IconAlert, color: "text-red-600" };
      }
    }

    return { status: "Sin ubicación", icon: IconLocationOff, color: "text-gray-400" };
  };


  return (
    <div className="min-h-screen bg-[#EEF6F8] pb-10">
      {/* HEADER */}
      <header
        className="fixed top-0 left-0 w-full bg-[#0F3D56] py-4 shadow-lg flex justify-between items-center px-6 animate-fade-in"
        style={{ zIndex: 1000 }}
      >
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-white hidden sm:block">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Botón de Alerta */}
          <button
            onClick={() => setCurrentView('alertas')}
            className="relative text-gray-300 hover:text-white focus:outline-none"
            title="Ver alertas"
          >
            <IconBell />
            {unseenAlertsCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {unseenAlertsCount > 9 ? '9+' : unseenAlertsCount}
              </span> 
            )}
          </button>
      
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center w-10 h-10 bg-white rounded-full text-gray-700 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 transition-transform transform hover:scale-105"
            >
              {getInitials(user)}
            </button>

            {/* --- Menú Desplegable --- */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 animate-slide-down overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-700">
                  <p className="text-sm text-white">{user?.nombre} {user?.apellidoP} {user?.apellidoM}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
                <nav className="py-1">
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
        </div>
      </header>

      {/* CONTENIDO */}
      <div className="pt-24 max-w-6xl mx-auto">
        {currentView === 'pacientes' && (
          <>
            <div className="bg-white rounded-xl shadow-2xl p-6 z-1 animate-zoom-in mb-6">
              <h2 className="text-3xl font-bold tracking-tight text-center text-gray-800 mb-6">PANEL DE PACIENTES</h2>
              <div className="relative mb-6 max-w-lg mx-auto">
                <input
                  type="text"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  placeholder="Buscar paciente por nombre..."
                  className="w-full border border-gray-300 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <IconSearch />
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-sm font-medium text-gray-600">Ordenar por:</span>
                <button
                  onClick={() => handleSort('nombre')}
                  className={`flex items-center px-3 py-1 text-sm rounded-full ${sortConfig.key === 'nombre' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Nombre
                  {sortConfig.key === 'nombre' && (
                    sortConfig.direction === 'ascending' ? <IconArrowUp /> : <IconArrowDown />
                  )}
                </button>
                <button
                  onClick={() => handleSort('edad')}
                  className={`flex items-center px-3 py-1 text-sm rounded-full ${sortConfig.key === 'edad' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Edad
                  {sortConfig.key === 'edad' && (
                    sortConfig.direction === 'ascending' ? <IconArrowUp /> : <IconArrowDown />
                  )}
                </button>
                <button
                  onClick={() => handleSort('geofenceCounts')}
                  className={`flex items-center px-3 py-1 text-sm rounded-full ${sortConfig.key === 'geofenceCounts' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Geocercas
                  {sortConfig.key === 'geofenceCounts' && (
                    sortConfig.direction === 'ascending' ? <IconArrowUp /> : <IconArrowDown />
                  )}
                </button>
              </div>

              {pacientes.length > 0 && pacientesPaginados.length === 0 && (
                <p className="text-center text-gray-500">
                  No se encontraron pacientes con ese nombre.
                </p>
              )}

              {pacientes.length === 0 ? (
                <p className="text-center text-gray-500">Aún no has dado de alta pacientes.</p>
              ) : (
                <div className="space-y-4">
                  {pacientesPaginados.map((p) => {
                    const datosRelevantes = ultimosDatos[p._id] || { ultimoDato: null, ultimoGpsValido: null };
                    const geocercasDelPaciente = geocercasCompletas[p._id] || [];
                    const ultimoDato = datosRelevantes.ultimoDato;

                    const location = getLocationStatus(datosRelevantes, geocercasDelPaciente);

                    return (
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
                            <div className={`text-sm mt-2 font-medium flex items-center ${location.color}`}>
                              <location.icon />
                              {location.status}
                            </div>

                            <div className="border-t border-gray-100 mt-3 pt-3">
                              {ultimoDato ? (
                                <>
                                  <div className="flex items-center text-sm text-gray-700 mb-1">
                                    <span className="flex items-center mr-4">
                                      <IconHeart /> {ultimoDato.frecuencia} bpm
                                    </span>
                                    <span className="flex items-center">
                                      <IconOxygen /> {ultimoDato.oxigeno} %
                                    </span>
                                  </div>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <IconClock /> {formatTimeAgo(ultimoDato.fecha)}
                                  </div>
                                </>
                              ) : (
                                <span className="text-sm italic text-gray-400">
                                  Sin datos vitales aún.
                                </span>
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
                                Ver datos
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
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-6">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <IconPrev />
                    <span className="ml-2">Anterior</span>
                  </button>

                  <span className="text-sm text-gray-700">
                    Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
                  </span>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="mr-2">Siguiente</span>
                    <IconNext />
                  </button>
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
          </>
        )}

        {currentView === 'alertas' && (
          <AlertasView
            alertas={alertas}
            isLoading={isLoadingAlertas}
            onBackClick={() => setCurrentView('pacientes')}
            onRefreshAlerts={cargarAlertas} 
          />
        )}
      </div>


      <button
        onClick={() => setAltaOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-[#0F3D56] hover:bg-[#3A6EA5] text-white rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2"
        title="Dar de alta a un paciente"
      >
        <IconPlus />
      </button>

      {/* MODAL: Mi Información */}
      <InfoCuidadorModal
        open={showModal}
        onClose={handleCloseInfoModal}
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
      <AltaPacienteModal
        open={altaOpen}
        onClose={() => setAltaOpen(false)}
        onCreated={cargarPacientes} />

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

          @keyframes pop-from-fab {
            0% {
              transform: scale(0) translateX(50vw) translateY(50vh);
              opacity: 0;
              transform-origin: bottom right;
            }
            100% {
              transform: scale(1) translateX(0) translateY(0);
              opacity: 1;
              transform-origin: bottom right;
            }
          }
          .animate-pop-from-fab {
            animation: pop-from-fab 0.5s cubic-bezier(.4,0,.2,1) both;
          }

          @keyframes fade-in-down {
            from { 
              opacity: 0; 
              transform: translateY(-40px);
            } 
            to { 
              opacity: 1; 
              transform: translateY(0);
            } 
          }
          .animate-fade-in-down {
            animation: fade-in-down 0.5s cubic-bezier(.4,0,.2,1) both;
          }
        `}</style>
    </div>
  );
}
