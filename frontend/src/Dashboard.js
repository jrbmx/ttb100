// src/Dashboard.js
import React, { useContext, useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./auth/AuthContext";
import {
  listarPacientes,
  asignarDispositivo,
  liberarDispositivo,
  editarAliasDispositivo
} from "./services/pacientes";
import { listarGeocercas } from "./services/geocercas";
import { getDatosRelevantes } from "./services/datos";
import AltaPacienteModal from "./components/AltaPacienteModal";
import GeocerceModal from './components/GeocerceModal.jsx';
import InfoCuidadorModal from "./components/InfoCuidadorModal.jsx";
import DeleteConfirmModal from "./components/DeleteConfirmModal.jsx";
import LiberarDispositivoModal from "./components/LiberarDispositivoModal.jsx";
import AsignarDispositivoModal from "./components/AsignarDispositivoModal.jsx";
import EditarAliasModal from "./components/EditarAliasModal.jsx";
import NotificacionPopup from "./components/NotificacionPopup.jsx";
import { listarAlertas } from "./services/alertas";
import AlertasView from "./components/AlertasView.jsx";
import MapaGeneralView from "./components/MapaGeneralView.jsx";
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import logoImg from './logo.png';

const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);
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
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1.5"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 15l6 -6" /><path d="M11 6l.463 -.536a5 5 0 0 1 7.072 0a4.993 4.993 0 0 1 -.001 7.072" /><path d="M12.603 18.534a5.07 5.07 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>
);
const IconUnlink = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1.5"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M17 22v-2" /><path d="M9 15l6 -6" /><path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" /><path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" /><path d="M20 17h2" /><path d="M2 7h2" /><path d="M7 2v2" /></svg>
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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.708 2.372a2.382 2.382 0 0 0 -.71 .686l-4.892 7.26c-1.981 3.314 -1.22 7.466 1.767 9.882c2.969 2.402 7.286 2.402 10.254 0c2.987 -2.416 3.748 -6.569 1.795 -9.836l-4.919 -7.306c-.722 -1.075 -2.192 -1.376 -3.295 -.686z" />
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
const IconMap = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-map-pin-2"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 18.5l-3 -1.5l-6 3v-13l6 -3l6 3l6 -3v7" /><path d="M9 4v13" /><path d="M15 7v5" /><path d="M21.121 20.121a3 3 0 1 0 -4.242 0c.418 .419 1.125 1.045 2.121 1.879c1.051 -.89 1.759 -1.516 2.121 -1.879z" /><path d="M19 18v.01" /></svg>
);
const IconSensorOff = () => (
  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);
const IconBed = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1.5">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M7 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M22 17v-3h-20" /><path d="M2 8v9" />
    <path d="M12 14h10v-2a3 3 0 0 0 -3 -3h-7v5z" />
  </svg>
);
const IconFall = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M11 21l1 -5l-1 -4l-3 -4h4l3 -3" />
    <path d="M6 16l-1 -4l3 -4" />
    <path d="M6 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M13.5 12h2.5l4 2" />
  </svg>
);
const audioContext = new (window.AudioContext || window.webkitAudioContext)();


const ITEMS_PER_PAGE = 5;
const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';


const playAlertSound = () => {
  try {
    const playBeep = (startTime) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine'; // Un "beep" simple
      oscillator.frequency.setValueAtTime(880, startTime); // Tono
      gainNode.gain.setValueAtTime(0.5, startTime); // Volumen

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.1); // Duración de 100ms
    };

    // Programar los beeps
    const now = audioContext.currentTime;
    playBeep(now);
    playBeep(now + 0.2); // Segundo beep 200ms después

  } catch (e) {
    console.error("Error al reproducir sonido:", e, audioContext.state);
  }
};

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
  const [filtroNombre, setFiltroNombre] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'ascending' });
  const [ultimosDatos, setUltimosDatos] = useState({});

  // === NUEVO: estado para geocercas ===
  const [geofenceOpen, setGeofenceOpen] = useState(false);
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
  const [showEditAlias, setShowEditAlias] = useState(false);
  const [pacienteParaEditarAlias, setPacienteParaEditarAlias] = useState(null);
  const [isGuardandoAlias, setIsGuardandoAlias] = useState(false);

  // === ESTADO PARA ALERTAS ===
  const [currentView, setCurrentView] = useState('pacientes'); // 'pacientes' o 'alertas'
  const [alertas, setAlertas] = useState([]);
  const [isLoadingAlertas, setIsLoadingAlertas] = useState(true);
  const [unseenAlertsCount, setUnseenAlertsCount] = useState(0); // Para el "9+"
  const toastedAlertIds = useRef(new Set());

  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const tourSteps = useMemo(() => {
    const hayPacientes = pacientes.length > 0;

    // 1. Pasos Comunes (Se muestran siempre)
    const pasosComunes = [
      {
        target: 'body',
        title: 'Bienvenido a tu panel de control',
        content: 'Desde aquí podrás monitorear a todos tus pacientes, ver sus signos vitales y gestionar sus dispositivos.',
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: '.tour-views-controls',
        title: 'Vistas y alertas',
        content: 'Alterna entre la lista, el mapa general o revisa el historial de notificaciones desde esta barra.',
      },
      {
        target: '.tour-profile-menu',
        title: 'Tu perfil',
        content: 'Aquí puedes actualizar tus datos o cerrar sesión.',
      },
    ];

    // 2. Escenario A: SI HAY PACIENTES (Tutorial Completo)
    if (hayPacientes) {
      return [
        ...pasosComunes,
        {
          target: '.tour-search-bar',
          title: 'Búsqueda de pacientes',
          content: 'Filtra rápidamente por nombre del paciente o ID del dispositivo.',
        },
        {
          target: '.tour-sort-buttons',
          title: 'Ordenamiento de pacientes',
          content: 'Organiza tu lista de pacientes por nombre, edad o geocercas asignadas.',
        },
        {
          target: '.tour-patient-card-0', // Apunta al primer paciente real
          title: 'Tarjeta del paciente',
          content: 'Los iconos te alertarán sobre caídas, desconexiones, inactividad y signos vitales anormales.',
        },
        {
          target: '.tour-patient-actions-0',
          title: 'Configuración individual',
          content: 'Entra aquí para ver el historial médico, gráficas y dibujar las geocercas de este paciente.',
        },
        {
          target: '.tour-device-status-0',
          title: 'Dispositivo',
          content: 'Gestiona, asigna o libera el dispositivo asociado.',
        },
        {
          target: '.tour-add-fab',
          title: 'Agregar otro paciente',
          content: 'Usa este botón flotante para registrar nuevos pacientes en cualquier momento.',
        },
      ];
    }

    // 3. Escenario B: NO HAY PACIENTES (Tutorial de Bienvenida / Onboarding)
    else {
      return [
        ...pasosComunes,
        {
          target: '.tour-empty-state', // Apuntaremos al texto de "No hay pacientes"
          title: 'Lista de pacientes',
          content: 'Actualmente tu lista está vacía. Aquí aparecerán las personas que cuidas una vez que las registres.',
          placement: 'center',
        },
        {
          target: '.tour-add-fab',
          title: '¡Comencemos!',
          content: 'Haz clic en este botón para registrar a tu PRIMER PACIENTE ahora mismo.',
          placement: 'top-end',
        },
      ];
    }
  }, [pacientes.length]); // Se recalcula si la lista cambia

  const handleJoyrideCallback = (data) => {
  const { action, index, status, type } = data;

  if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
    setRunTour(false);
    
    if (pacientes.length > 0) {
       localStorage.setItem('tour_dashboard_full_visto', 'true');
    } else {
       localStorage.setItem('tour_dashboard_empty_visto', 'true');
    }
  } 
  
  else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
    const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
    setStepIndex(nextStepIndex);
  }
};

  // INICIAR TOUR AUTOMÁTICAMENTE (Si no se ha visto)
  useEffect(() => {
    if (currentView === 'pacientes' && !isLoadingAlertas) {
      
      const fullVisto = localStorage.getItem('tour_dashboard_full_visto');
      const emptyVisto = localStorage.getItem('tour_dashboard_empty_visto');
      const hayPacientes = pacientes.length > 0;

      // Escenario 1: TIENE PACIENTES
      if (hayPacientes) {
        if (!fullVisto) {
          if (emptyVisto) {
            setStepIndex(5); 
          } else {
            setStepIndex(0);
          }
          
          const timer = setTimeout(() => setRunTour(true), 1500);
          return () => clearTimeout(timer);
        }
      } 
      
      else {
        if (!emptyVisto) {
          setStepIndex(0);
          const timer = setTimeout(() => setRunTour(true), 1500);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [currentView, pacientes.length, isLoadingAlertas]);

  const cargarPacientes = useCallback(async () => {
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
  }, []);

  const { pacientesPaginados, totalPages } = useMemo(() => {
    const lowerFiltro = filtroNombre.toLowerCase();

    const filtrados = filtroNombre
      ? pacientes.filter(p => {
        const nombreCompleto = `${p.nombre} ${p.apellidoP} ${p.apellidoM}`.toLowerCase();
        const idDispositivo = p.dispositivo_id ? p.dispositivo_id.toLowerCase() : '';
        return nombreCompleto.includes(lowerFiltro) || idDispositivo.includes(lowerFiltro);
      })
      : [...pacientes];

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

  // Función para mapear el tipo de alerta de la BD al estilo del Popup
  const getPopupType = (tipoAlerta) => {
    switch (tipoAlerta) {
      case 'caida':
      case 'ritmo_anormal':
      case 'oxigeno_bajo':
        return 'error';

      case 'salida_geocerca':
      case 'inactividad':
      case 'sensor_desconectado':
        return 'warning';

      case 'entrada_geocerca':
        return 'success';

      default:
        return 'info';
    }
  };

  const cargarAlertas = useCallback(async () => {
    try {
      const data = await listarAlertas();
      setAlertas(data);

      const unseenCount = data.filter(a => !a.vista).length;
      setUnseenAlertsCount(unseenCount);

      const newUnseenAlerts = data.filter(a => !a.vista && !toastedAlertIds.current.has(a._id));

      if (newUnseenAlerts.length > 0) {
        const mostRecentAlert = newUnseenAlerts[0];
        newUnseenAlerts.forEach(a => toastedAlertIds.current.add(a._id));

        const popupType = getPopupType(mostRecentAlert.tipo);
        const popupMessage = mostRecentAlert.mensaje;

        if (popupType === 'error' || popupType === 'warning') {
          playAlertSound();
        }

        setPopup({
          show: true,
          type: popupType,
          message: popupMessage
        });
        setTimeout(() => {
          setPopup(prev => ({ ...prev, show: false }));
        }, 5000);

        if (popupType === 'error') {
          cargarPacientes();
        }
      }

    } catch (e) {
      console.error("Error al listar alertas:", e);
    } finally {
      setIsLoadingAlertas(false);
    }
  }, [cargarPacientes]);

  useEffect(() => {
    if (user) {
      setForm({
        nombre: user.nombre,
        apellidoP: user.apellidoP,
        apellidoM: user.apellidoM,
        telefono: user.telefono,
        email: user.email
      });

      toastedAlertIds.current = new Set();
      cargarPacientes();
      cargarAlertas();
    }
  }, [user, cargarPacientes, cargarAlertas]);

  useEffect(() => {
    if (user) {
      const intervalId = setInterval(() => {
        cargarAlertas();
        cargarPacientes();
      }, 30000); // 30 segundos

      return () => clearInterval(intervalId);
    }
  }, [user, cargarAlertas, cargarPacientes]);

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

  useEffect(() => {
    const unlockAudio = () => {
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log("AudioContext desbloqueado.");
        });
      }
      // Quitar el listener después del primer clic
      document.removeEventListener('click', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
    };
  }, []);

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
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${API}/api/cuidadores/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (res.status === 401) {
        logout();
        navigate("/auth");
        return;
      }

      const updatedUser = await res.json();
      if (res.ok) {
        updateUser(updatedUser);
        setPopup({ show: true, type: 'info', message: "Información actualizada" });
        setTimeout(() => {
          setPopup({ show: false, success: false, message: "" });
          setShowModal(false);
        }, 5000);
      } else {
        setPopup({ show: true, type: 'error', message: "Error al actualizar" });
        setTimeout(() => setPopup({ show: false, success: false, message: "" }), 5000);
      }
    } catch (err) {
      setPopup({ show: true, type: 'error', message: "Error de red" });
      setTimeout(() => setPopup({ show: false, success: false, message: "" }), 5000);
    }
  };

  const borrarCuenta = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${API}/api/cuidadores/${user._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        logout();
        navigate("/auth");
        return;
      }

      if (res.ok) {
        setPopup({ show: true, type: 'info', message: "Cuenta eliminada correctamente" });
        setTimeout(() => {
          setPopup({ show: false, success: false, message: "" });
          logout();
          navigate("/");
        }, 3000);
      } else {
        setPopup({ show: true, type: 'error', message: "Error al eliminar la cuenta" });
        setTimeout(() => setPopup({ show: false, success: false, message: "" }), 5000);
      }
    } catch (err) {
      setPopup({ show: true, type: 'error', message: "Error de red" });
      setTimeout(() => setPopup({ show: false, success: false, message: "" }), 5000);
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
      setPopup({ show: true, type: 'info', message: "Dispositivo liberado" });
      setTimeout(() => setPopup({ show: false, success: false, message: "" }), 5000);
      await cargarPacientes();
    } catch (e) {
      setPopup({ show: true, type: 'error', message: e.message });
      setTimeout(() => setPopup({ show: false, success: false, message: "" }), 5000);
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

  const handleConfirmarAsignar = async (id, alias) => {
    if (isAsignando || !id) return;

    setIsAsignando(true);
    try {
      await asignarDispositivo(pacienteParaAsignar._id, id, alias);

      handleCancelarAsignar();
      setPopup({ show: true, type: 'info', message: "Dispositivo asignado correctamente" });
      setTimeout(() => setPopup({ show: false, success: false, message: "" }), 5000);

      await cargarPacientes();

    } catch (e) {
      setPopup({ show: true, type: 'error', message: e.message });
      setTimeout(() => setPopup({ show: false, success: false, message: "" }), 5000);
    } finally {
      setIsAsignando(false);
    }
  };

  // Abrir modal
  const handleEditAliasClick = (paciente) => {
    setPacienteParaEditarAlias(paciente);
    setShowEditAlias(true);
  };

  // Confirmar guardado
  const handleConfirmarAlias = async (nuevoAlias) => {
    if (isGuardandoAlias || !pacienteParaEditarAlias) return;
    setIsGuardandoAlias(true);
    try {
      await editarAliasDispositivo(pacienteParaEditarAlias._id, nuevoAlias);
      setPopup({ show: true, type: 'info', message: "Alias actualizado" });
      setShowEditAlias(false);
      setPacienteParaEditarAlias(null);
      await cargarPacientes(); // Refrescar lista
    } catch (e) {
      setPopup({ show: true, type: 'error', message: "Error al actualizar alias" });
    } finally {
      setIsGuardandoAlias(false);
      setTimeout(() => setPopup(prev => ({ ...prev, show: false })), 5000);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  const handleToastClick = () => {
    setCurrentView('alertas'); // Cambia a la vista de alertas
    setPopup({ ...popup, show: false }); // Cierra el toast
  };

  const getLocationStatus = (datosRelevantes, geocercas, alertasDelPaciente = []) => {
    const { ultimoDato, ultimoGpsValido } = datosRelevantes;
    const statuses = [];

    if (!ultimoDato) {
      return [{ status: "Sin ubicación", icon: IconLocationOff, color: "text-gray-400" }];
    }

    const MINUTOS_MEMORIA = 60;
    const ahora = new Date();

    const alertaCaidaReciente = alertasDelPaciente.find(a => {
      const fechaAlerta = new Date(a.createdAt);
      const diffMins = (ahora - fechaAlerta) / 1000 / 60;
      return a.tipo === 'caida' && diffMins < MINUTOS_MEMORIA && !a.vista;
    });

    if (ultimoDato.caida_detectada === true || alertaCaidaReciente) {
      statuses.push({
        status: "¡CAÍDA DETECTADA!",
        icon: IconFall,
        color: "text-red-700 font-bold"
      });
    }

    if (ultimoDato.contacto_cardiaco === false) {
      statuses.push({ status: "Sensor cardíaco desconectado", icon: IconSensorOff, color: "text-orange-500" });
    }

    if (ultimoDato.inactividad_detectada === true) {
      statuses.push({ status: "Inactividad prolongada detectada", icon: IconBed, color: "text-yellow-600" });
    }

    const geocercasDisponibles = geocercas || [];
    let locationPoint = null;
    let locationStatusPrefix = "";

    const isWifi = (ultimoDato.latitud === 91.0 || ultimoDato.longitud === 181.0);
    const isNullIsland = (ultimoDato.latitud === 0 && ultimoDato.longitud === 0);
    const isGpsValido = !isWifi && !isNullIsland;

    if (isGpsValido) {
      locationPoint = { lat: ultimoDato.latitud, lng: ultimoDato.longitud };
    } else {
      locationPoint = ultimoGpsValido ? { lat: ultimoGpsValido.latitud, lng: ultimoGpsValido.longitud } : null;
      if (isWifi) locationStatusPrefix = "WiFi: ";
      if (isNullIsland) locationStatusPrefix = "Sin GPS: ";
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

    if (enGeocerca) {
      statuses.push({
        status: `${locationStatusPrefix}En ${nombreGeocerca}`,
        icon: IconHome,
        color: "text-green-600"
      });
    } else if (locationPoint) {
      statuses.push({
        status: `${locationStatusPrefix}Fuera de zona segura`,
        icon: IconAlert,
        color: "text-red-600"
      });
    } else {
      statuses.push({
        status: isWifi ? "Conectado a WiFi" : "Sin señal GPS",
        icon: isWifi ? IconWifi : IconLocationOff,
        color: "text-gray-500"
      });
    }

    return statuses;
  };


  return (
    <div className="min-h-screen bg-[#EEF6F8] pb-10">
      {/* HEADER */}
      <header
        className="fixed top-0 left-0 w-full bg-oscuro py-4 shadow-lg flex justify-between items-center px-6 animate-fade-in"
        style={{ zIndex: 1000 }}
      >
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-white hidden sm:block">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView('mapa')}
            className={`relative ${currentView === 'mapa' ? 'text-white' : 'text-gray-300'} hover:text-white focus:outline-none`}
            title="Ver Mapa General"
          >
            <IconMap />
          </button>
          {/* Botón de Alerta */}
          <button
            onClick={() => setCurrentView('alertas')}
            className={`relative ${currentView === 'alertas' ? 'text-white' : 'text-gray-300'} hover:text-white focus:outline-none`}
            title="Ver alertas"
          >
            <IconBell />
            {unseenAlertsCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {unseenAlertsCount > 9 ? '9+' : unseenAlertsCount}
              </span>
            )}
          </button>

          <div className="relative tour-profile-menu" ref={menuRef}>
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
                    Mi información
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
              <div className="relative mb-6 max-w-lg mx-auto tour-search-bar">
                <input
                  type="text"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  placeholder="Buscar paciente por nombre o ID del dispositivo..."
                  className="w-full border border-gray-300 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <IconSearch />
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-6 tour-sort-buttons">
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
                <p className="text-center text-gray-500 tour-empty-state">Aún no has dado de alta pacientes.</p>
              ) : (
                <div className="space-y-4">
                  {pacientesPaginados.map((p, index) => {
                    const datosRelevantes = ultimosDatos[p._id] || { ultimoDato: null, ultimoGpsValido: null };
                    const geocercasDelPaciente = geocercasCompletas[p._id] || [];
                    const ultimoDato = datosRelevantes.ultimoDato;

                    const alertasDelPaciente = alertas.filter(alerta => {
                      const idEnAlerta = alerta.paciente._id || alerta.paciente;
                      return idEnAlerta === p._id;
                    });

                    const statuses = getLocationStatus(datosRelevantes, geocercasDelPaciente, alertasDelPaciente);

                    return (
                      <div key={p._id} className={`bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden transition-all hover:shadow-lg ${index === 0 ? 'tour-patient-card-0' : ''}`}>
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

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                              {statuses.map((status, index) => (
                                <div key={index} className={`text-sm font-medium flex items-center ${status.color}`}>
                                  <status.icon />
                                  <span className="ml-1">{status.status}</span>
                                </div>
                              ))}
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
                            <div className={`p-3 flex space-x-2 ${index === 0 ? 'tour-patient-actions-0' : ''}`}>
                              <button
                                onClick={() => abrirGeocerca(p)}
                                className="flex-1 text-sm flex items-center justify-center px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                              >
                                <IconMapPin />
                                Configurar
                              </button>
                              <button
                                onClick={() => navigate(`/paciente/${p._id}`)}
                                className="flex-1 text-sm flex items-center justify-center px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                              >
                                Ver detalles
                              </button>
                            </div>

                            {/* --- SECCIÓN DISPOSITIVO --- */}
                            <div className={`border-t border-gray-200 px-3 pt-2 pb-3 ${index === 0 ? 'tour-device-status-0' : ''}`}>
                              <h5 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Dispositivo</h5>
                              <div className="flex items-center justify-between min-h-[34px]">
                                {p.dispositivo_id ? (
                                  <>
                                    <div className="flex flex-col min-w-0 mr-2 relative group">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className="text-sm font-bold text-teal-800 truncate cursor-default"
                                          title={`ID MAC: ${p.dispositivo_id}`}
                                        >
                                          {p.dispositivo_alias || "Sin nombre"}
                                        </span>

                                        <button
                                          onClick={() => handleEditAliasClick(p)}
                                          className="text-gray-400 hover:text-teal-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                                          title="Editar nombre"
                                        >
                                          <IconEdit />
                                        </button>
                                      </div>

                                      <span className="text-[10px] text-gray-400 font-mono flex items-center">
                                        <IconDevice />
                                        {p.dispositivo_id}
                                      </span>
                                    </div>

                                    <button
                                      onClick={() => handleLiberarClick(p)}
                                      className="text-xs flex items-center px-2 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100"
                                      title="Liberar dispositivo"
                                    >
                                      <IconUnlink />
                                      Liberar
                                    </button>
                                  </>
                                ) : (
                                  // -- Caso 2: Dispositivo NO asignado --
                                  <>
                                    <span className="text-sm italic text-gray-400">No asignado</span>
                                    <button
                                      onClick={() => handleAsignarClick(p)}
                                      className="text-sm flex items-center px-3 py-1.5 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
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

        {currentView === 'mapa' && (
          <MapaGeneralView
            pacientes={pacientes}
            ultimosDatos={ultimosDatos}
            onBackClick={() => setCurrentView('pacientes')}
          />
        )}
      </div>


      <button
        onClick={() => setAltaOpen(true)}
        className="tour-add-fab fixed bottom-8 right-8 z-50 w-16 h-16 bg-[#0F3D56] hover:bg-[#3A6EA5] text-white rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2"
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
            setPopup({ show: true, type: 'info', message: "Geocerca(s) guardada(s)" });
            setTimeout(() => setPopup({ show: false, success: false, message: "" }), 5000);
          } catch (e) {
            setPopup({ show: true, type: 'error', message: e.message || "Error al refrescar geocercas" });
            setTimeout(() => setPopup({ show: false, success: false, message: "" }), 5000);
          } finally {

          }
        }}
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

      <Joyride
        steps={tourSteps}
        run={runTour}
        stepIndex={stepIndex}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        callback={handleJoyrideCallback}
        scrollOffset={100} // Para que el header no tape las tarjetas
        disableScrollParentFix={true}
        styles={{
          options: {
            primaryColor: '#0F3D56',
            zIndex: 2000, // Z-Index alto para ganar al Header fijo
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

      {/* POPUP DE NOTIFICACIÓN */}
      <NotificacionPopup
        popup={popup}
        onClose={() => setPopup({ ...popup, show: false })}
        onClick={handleToastClick}
      />

      <EditarAliasModal
        open={showEditAlias}
        onClose={() => setShowEditAlias(false)}
        onConfirm={handleConfirmarAlias}
        paciente={pacienteParaEditarAlias}
        isGuardando={isGuardandoAlias}
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
    </div>
  );
}
