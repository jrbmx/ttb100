// src/pages/PacienteDetalle.jsx
import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { listarPacientes, actualizarConfiguracionPaciente } from '../services/pacientes';
import { getDatosRelevantes, getHistorial } from '../services/datos';
import { listarAlertas } from '../services/alertas';
import { listarGeocercas } from '../services/geocercas';

import PacienteMap from '../components/PacienteMap.jsx';
import HealthChart from '../components/HealthChart.jsx';
import HistoryTable from '../components/HistoryTable.jsx';
import NotificacionPopup from '../components/NotificacionPopup';
import GeocerceModal from '../components/GeocerceModal';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const playAlertSound = () => {
  try {
    const playBeep = (startTime) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, startTime);
      gainNode.gain.setValueAtTime(0.5, startTime);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.1);
    };
    const now = audioContext.currentTime;
    playBeep(now);
    playBeep(now + 0.2);
  } catch (e) {
    console.error("Error audio:", e);
  }
};

const IconArrowLeft = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);
const IconSettings = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconMapPin = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconHeart = ({ className }) => (
  <svg className={`w-12 h-12 block ${className}`} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);
const IconWarning = () => (
  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
);
const IconXCircle = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const IconSensorOff = () => (
  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);
const IconBed = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-4 h-4 mr-1.5">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M7 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M22 17v-3h-20" /><path d="M2 8v9" />
    <path d="M12 14h10v-2a3 3 0 0 0 -3 -3h-7v5z" />
  </svg>
);
const IconFall = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-5 h-5">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M11 21l1 -5l-1 -4l-3 -4h4l3 -3" />
    <path d="M6 16l-1 -4l3 -4" />
    <path d="M6 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M13.5 12h2.5l4 2" />
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


// --- UTILS DE ESTADO ---
function formatTimeAgo(isoDate) {
  if (!isoDate) return "N/A";
  const now = new Date();
  const past = new Date(isoDate);
  const seconds = Math.floor((now - past) / 1000);
  let interval = seconds / 3600;
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
      color: "bg-red-100 text-red-800 border border-red-200 font-bold"
    });
  }

  if (ultimoDato.contacto_cardiaco === false) {
    statuses.push({ status: "Sensor cardíaco desconectado", icon: IconSensorOff, color: "bg-orange-100 text-orange-800 border border-orange-200" });
  }

  if (ultimoDato.inactividad_detectada === true) {
    statuses.push({ status: "Inactividad prolongada detectada", icon: IconBed, color: "bg-yellow-100 text-yellow-800 border border-yellow-200" });
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

// Función auxiliar para determinar el color/icono del popup según alerta
const getPopupType = (tipoAlerta) => {
  switch (tipoAlerta) {
    case 'caida':
    case 'ritmo_anormal':
    case 'oxigeno_bajo':
      return 'error'; // Rojo
    case 'salida_geocerca':
    case 'inactividad':
    case 'sensor_desconectado':
      return 'warning'; // Naranja
    case 'entrada_geocerca':
      return 'success'; // Verde
    default:
      return 'info';
  }
};

function getHeartStatus(bpm, umbrales = { min: 60, max: 100 }) {
  const { min, max } = umbrales;
  
  if (bpm >= min && bpm <= max) {
    return { 
      color: 'text-[#4dc278ff]', 
      animation: 'animate-heartbeat-normal',
      text: 'Ritmo cardíaco normal', 
      Icon: IconCheck 
    };
  }
  
  if ((bpm >= (min - 15) && bpm < min) || (bpm > max && bpm <= (max + 30))) {
    const anim = bpm > max ? 'animate-heartbeat-fast' : 'animate-heartbeat-slow';
    
    return { 
      color: 'text-[#eab308]', 
      animation: anim,
      text: 'Ritmo irregular', 
      Icon: IconWarning 
    };
  }
  
  return { 
    color: 'text-[#ef4444]',
    animation: bpm > max ? 'animate-heartbeat-fast' : 'animate-heartbeat-slow', 
    text: '¡Ritmo peligroso!', 
    Icon: IconWarning 
  };
}

function getOxygenStatus(spo2, umbrales = { min: 90 }) {
  const { min } = umbrales;
  if (spo2 >= (min + 5)) {
    return { color: 'text-green-500', stroke: '#4dc278ff', text: 'Nivel normal', Icon: IconCheck };
  }
  if (spo2 >= min && spo2 < (min + 5)) {
    return { color: 'text-yellow-500', stroke: '#eab308', text: 'Nivel bajo', Icon: IconWarning };
  }
  return { color: 'text-red-500', stroke: '#ef4444', text: '¡Nivel crítico!', Icon: IconWarning };
}

const OxygenGauge = ({ value, config }) => {
  const percentage = Math.max(0, Math.min(100, value));

  const getColor = (val) => {
    const min = config?.oxyMin ?? 90;

    if (val >= (min + 5)) return '#10b981'; // Verde (Normal)
    if (val >= min) return '#eab308';       // Amarillo (Advertencia)
    return '#ef4444';                       // Rojo (Peligro)
  };

  const currentColor = getColor(percentage);

  const radius = 80;
  const stroke = 12;
  const center = 100;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const renderTicks = () => {
    const ticks = [];
    for (let i = 0; i <= 100; i += 10) {
      const angle = Math.PI * (1 - i / 100);
      const x1 = center + (radius - 20) * Math.cos(angle);
      const y1 = center - (radius - 20) * Math.sin(angle);
      const x2 = center + (radius - 10) * Math.cos(angle);
      const y2 = center - (radius - 10) * Math.sin(angle);

      ticks.push(
        <g key={i}>
          <line
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#9ca3af"
            strokeWidth={i % 20 === 0 ? 2 : 1}
          />
          {i % 20 === 0 && (
            <text
              x={center + (radius - 32) * Math.cos(angle)}
              y={center - (radius - 32) * Math.sin(angle)}
              textAnchor="middle"
              alignmentBaseline="middle"
              className="text-[8px] fill-gray-400 font-medium"
              style={{ fontSize: '8px' }}
            >
              {i}
            </text>
          )}
        </g>
      );
    }
    return ticks;
  };

  return (
    <div className="relative w-52 h-32 mx-auto flex flex-col items-center justify-end">
      <svg className="w-full h-full overflow-visible" viewBox="0 -10 200 120">
        {renderTicks()}

        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
          strokeLinecap="round"
        />

        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke={currentColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />

      </svg>

      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="text-3xl font-bold text-gray-800 leading-none">
          {value}<span className="text-sm font-normal text-gray-500 ml-1">%</span>
        </span>
      </div>
    </div>
  );
};

const CustomDatePicker = ({ label, value, onChange, min, max }) => {
  const inputRef = useRef(null);
  const handleContainerClick = () => {
    try {
      if (inputRef.current && typeof inputRef.current.showPicker === 'function') {
        inputRef.current.showPicker();
      } else {
        inputRef.current.focus();
      }
    } catch (e) { console.log("Error opening picker", e); }
  };

  return (
    <div className="flex flex-col items-center">
      <span className="text-xs font-semibold text-gray-500 mb-1 text-center">{label}</span>
      <div onClick={handleContainerClick} className="flex items-center justify-center bg-white border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:border-teal-500 hover:ring-1 hover:ring-teal-500 transition-all shadow-sm group w-36 sm:w-40">
        <input ref={inputRef} type="date" value={value} onChange={onChange} min={min} max={max} className="text-sm text-gray-700 bg-transparent border-none focus:ring-0 p-0 w-full cursor-pointer outline-none font-sans text-center" />
      </div>
    </div>
  );
};

const ConfigModal = ({ open, onClose, initialValues, onSave }) => {
  const [formData, setFormData] = useState({
    hrMin: 60, hrMax: 100, oxyMin: 90, inactivityMin: 30
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) setFormData(initialValues);
    setErrors({});
  }, [initialValues, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    if (errors[name] || errors.general) setErrors(prev => ({ ...prev, [name]: null, general: null }));
  };

  const validate = () => {
    const newErrors = {};
    const { hrMin, hrMax, oxyMin, inactivityMin } = formData;
    if (hrMin < 30) newErrors.hrMin = "Mínimo irreal (< 30)";
    if (hrMax > 250) newErrors.hrMax = "Máximo peligroso (> 250)";
    if (hrMin < 0 || hrMax < 0) newErrors.general = "No se permiten números negativos";
    if (hrMin >= hrMax) {
      newErrors.hrMin = "Debe ser menor al máximo";
      newErrors.hrMax = "Debe ser mayor al mínimo";
      newErrors.general = "Rango cardíaco inválido";
    }
    if (oxyMin < 50) newErrors.oxyMin = "Demasiado bajo (< 50%)";
    if (oxyMin > 100) newErrors.oxyMin = "No puede superar 100%";
    if (inactivityMin < 5) newErrors.inactivityMin = "Mínimo 5 minutos";
    if (inactivityMin > 1440) newErrors.inactivityMin = "Máximo 24 horas";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) { onSave(formData); onClose(); }
  };

  if (!open) return null;
  const inputClass = (fieldName) => `w-full border rounded-xl p-2 text-center focus:outline-none focus:ring-2 transition ${errors[fieldName] ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-500'}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[2000] animate-popup-fade" onClick={onClose}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-500 animate-pop-from-fab" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-center mb-6 text-[#3A6EA5] flex items-center justify-center gap-2">
          <IconSettings /> Configurar Alertas
        </h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 relative">
            <h4 className="text-sm font-bold text-[#3A6EA5] uppercase tracking-wide mb-3 text-center">Frecuencia cardíaca (bpm)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1 font-medium text-xs text-center">Mínimo</label>
                <input type="number" name="hrMin" value={formData.hrMin} onChange={handleChange} className={inputClass('hrMin')} />
                {errors.hrMin && <p className="text-[10px] text-red-500 text-center mt-1 font-bold">{errors.hrMin}</p>}
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium text-xs text-center">Máximo</label>
                <input type="number" name="hrMax" value={formData.hrMax} onChange={handleChange} className={inputClass('hrMax')} />
                {errors.hrMax && <p className="text-[10px] text-red-500 text-center mt-1 font-bold">{errors.hrMax}</p>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-bold text-[#3A6EA5] uppercase tracking-wide mb-3 text-center">Oxigenación Mín (%)</h4>
              <input type="number" name="oxyMin" value={formData.oxyMin} onChange={handleChange} className={inputClass('oxyMin')} />
              {errors.oxyMin && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.oxyMin}</p>}
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#3A6EA5] uppercase tracking-wide mb-3 text-center">Inactividad (min)</h4>
              <input type="number" name="inactivityMin" value={formData.inactivityMin} onChange={handleChange} className={inputClass('inactivityMin')} />
              {errors.inactivityMin && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.inactivityMin}</p>}
            </div>
          </div>
          {errors.general && <div className="text-red-600 text-xs font-bold text-center bg-red-50 p-2 rounded-lg border border-red-200">{errors.general}</div>}
          <div className="flex justify-around pt-2">
            <button type="submit" className="px-8 py-2 rounded-full text-white bg-[#3A6EA5] hover:bg-[#2E5984] transition transform hover:scale-105 hover:shadow-lg font-medium">Guardar</button>
            <button type="button" onClick={onClose} className="border border-gray-300 text-gray-700 px-8 py-2 rounded-full transition transform hover:bg-gray-100 hover:scale-105 hover:shadow font-medium">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function PacienteDetalle() {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [paciente, setPaciente] = useState(null);
  const [datosRelevantes, setDatosRelevantes] = useState({ ultimoDato: null, ultimoGpsValido: null });
  const [historialData, setHistorialData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [geocercas, setGeocercas] = useState([]);
  const [listaAlertas, setListaAlertas] = useState([]);

  // Filtros de fecha
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Modals y Popups
  const [showConfig, setShowConfig] = useState(false);
  const [showGeocerca, setShowGeocerca] = useState(false); // <--- NUEVO
  const [configAlertas, setConfigAlertas] = useState({ hrMin: 60, hrMax: 100, oxyMin: 90, inactivityMin: 30 });
  const [popup, setPopup] = useState({ show: false, message: '', success: true });

  // Control de Alertas en Tiempo Real
  const toastedAlertIds = useRef(new Set()); // Para no repetir notificaciones

  const today = new Date().toLocaleDateString('en-CA');
  const handleFechaInicioChange = (e) => setFechaInicio(e.target.value);
  const handleFechaFinChange = (e) => setFechaFin(e.target.value);
  const handleClearFilters = () => { setFechaInicio(""); setFechaFin(""); };

  const checkNewAlerts = useCallback(async () => {
    if (!pacienteId) return;
    try {
      const allAlerts = await listarAlertas();
      const pacienteAlerts = allAlerts.filter(a =>
        (a.paciente._id === pacienteId || a.paciente === pacienteId)
      );
      setListaAlertas(pacienteAlerts);
      const newAlerts = pacienteAlerts.filter(a => !a.vista && !toastedAlertIds.current.has(a._id));

      if (newAlerts.length > 0) {
        const mostRecent = newAlerts[0];
        newAlerts.forEach(a => toastedAlertIds.current.add(a._id));
        const popupType = getPopupType(mostRecent.tipo);

        if (popupType === 'error' || popupType === 'warning') {
          playAlertSound();
        }

        setPopup({
          show: true,
          type: popupType,
          message: mostRecent.mensaje
        });

        setTimeout(() => setPopup(prev => ({ ...prev, show: false })), 5000);
      }
    } catch (e) {
      console.error("Error checking alerts:", e);
    }
  }, [pacienteId]);

  const cargarGeocercas = useCallback(async () => {
    if (!pacienteId) return;
    try {
      const g = await listarGeocercas(pacienteId);
      setGeocercas(Array.isArray(g) ? g : []);
    } catch (e) { setGeocercas([]); }
  }, [pacienteId]);

  const fetchVitalsAndInitialData = useCallback(async () => {
    if (!pacienteId) return;
    try {
      const [datos, historial] = await Promise.all([
        getDatosRelevantes(pacienteId),
        getHistorial(pacienteId, fechaInicio, fechaFin)
      ]);
      setDatosRelevantes(datos);
      setHistorialData(historial);
    } catch (e) { console.error("Error refrescar:", e.message); }
  }, [pacienteId, fechaInicio, fechaFin]);

  // Carga inicial
  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    if (!pacienteId) { setError("No ID."); setIsLoading(false); return; }

    const fetchPatientInfo = async () => {
      setIsLoading(true);
      setError("");
      try {
        const todosLosPacientes = await listarPacientes();
        const pacEncontrado = todosLosPacientes.find(p => p._id === pacienteId);
        if (!pacEncontrado) throw new Error("Paciente no encontrado.");
        setPaciente(pacEncontrado);

        if (pacEncontrado.configuracion) {
          setConfigAlertas(pacEncontrado.configuracion);
        }

        toastedAlertIds.current = new Set();

        await Promise.all([
          fetchVitalsAndInitialData(),
          checkNewAlerts(),
          cargarGeocercas()
        ]);
      } catch (e) { setError(e.message || "Error al cargar."); }
      finally { setIsLoading(false); }
    };
    fetchPatientInfo();
  }, [pacienteId, user, navigate, checkNewAlerts, cargarGeocercas]);

  useEffect(() => {
    if (paciente) {
      const intervalId = setInterval(() => {
        fetchVitalsAndInitialData();
        checkNewAlerts();
      }, 15000);
      return () => clearInterval(intervalId);
    }
  }, [paciente, fetchVitalsAndInitialData, checkNewAlerts]);

  // Guardar configuración de alertas
  const handleSaveConfig = async (newConfig) => {
    try {
      await actualizarConfiguracionPaciente(pacienteId, newConfig);
      setConfigAlertas(newConfig);
      setPopup({ show: true, message: 'Configuración guardada correctamente.', type: 'info' });
    } catch (err) {
      setPopup({ show: true, message: err.message || "Error al guardar.", type: 'error' });
    } finally {
      setTimeout(() => setPopup(prev => ({ ...prev, show: false })), 4000);
    }
  };

  const fetchHistory = useCallback(async () => {
    if (!pacienteId) return;
    if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) return;
    try {
      const historial = await getHistorial(pacienteId, fechaInicio, fechaFin);
      setHistorialData(historial);
    } catch (e) { console.error("Error historial:", e.message); }
  }, [pacienteId, fechaInicio, fechaFin]);

  useEffect(() => { if (paciente) { fetchHistory(); } }, [fechaInicio, fechaFin, paciente, fetchHistory]);

  const statuses = getLocationStatus(datosRelevantes, geocercas, listaAlertas);

  const renderStatus = (message) => (
    <div className="min-h-screen bg-[#EEF6F8] pt-24">
      <header className="fixed top-0 left-0 w-full bg-[#0F3D56] py-4 shadow-lg flex justify-between items-center px-6" style={{ zIndex: 1000 }}>
        <h1 className="text-2xl font-bold text-white hidden sm:block">Detalles</h1>
        <button onClick={() => navigate("/dashboard")} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg">
          <IconArrowLeft /> Regresar
        </button>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500 bg-white rounded-xl shadow p-10">{message}</div>
    </div>
  );

  if (isLoading) return renderStatus("Cargando...");
  if (error) return renderStatus(<span className="text-red-500">{error}</span>);
  if (!paciente) return renderStatus("No encontrado.");

  const { ultimoDato } = datosRelevantes;
  const heartStatus = ultimoDato ? getHeartStatus(ultimoDato.frecuencia, { min: configAlertas.hrMin, max: configAlertas.hrMax }) : null;
  const oxygenStatus = ultimoDato ? getOxygenStatus(ultimoDato.oxigeno, { min: configAlertas.oxyMin }) : null;

  return (
    <div className="min-h-screen bg-[#EEF6F8] pb-10">
      <header className="fixed top-0 left-0 w-full bg-[#0F3D56] py-4 shadow-lg flex justify-between items-center px-6" style={{ zIndex: 1000 }}>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {paciente.nombre} {paciente.apellidoP} {paciente.apellidoM}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">Edad: {paciente.edad} años</p>
        </div>

        <div className="flex gap-2">
          {/* BOTÓN GEOCERCAS (NUEVO) */}
          <button
            onClick={() => setShowGeocerca(true)}
            className="flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-all border border-blue-500"
            title="Configurar Zonas Seguras"
          >
            <IconMapPin />
            <span className="hidden sm:inline">Zonas</span>
          </button>

          {/* BOTÓN ALERTAS */}
          <button
            onClick={() => setShowConfig(true)}
            className="flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg shadow-md hover:bg-emerald-700 transition-all border border-emerald-500"
            title="Configurar Umbrales"
          >
            <IconSettings />
            <span className="hidden sm:inline">Alertas</span>
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-100 border transition-all"
          >
            <IconArrowLeft />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </header>

      <div className="pt-24 max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-wrap gap-4 items-center justify-between animate-zoom-in">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 font-bold text-lg">
                {paciente.nombre.charAt(0)}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 leading-tight">Resumen de estado</h2>
              <p className="text-xs text-gray-500">Alertas activas y ubicación</p>
            </div>
          </div>

          {/* Lista de Estados (Pill Badges) */}
          <div className="flex flex-wrap gap-2">
            {statuses.map((item, idx) => (
              <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-all ${item.color.includes('bg-') ? item.color : 'bg-gray-100 text-gray-700'}`}>
                <item.icon />
                <span>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-2xl overflow-hidden animate-zoom-in">
            <div className="p-6">
              <PacienteMap paciente={paciente} />
            </div>
          </div>

          {/* Signos Vitales */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-2xl animate-zoom-in flex flex-col overflow-hidden">
            {ultimoDato ? (
              <div className="p-6 flex flex-col flex-grow justify-between">
                <div className="space-y-8">
                  {/* Frecuencia */}
                  <div className="text-center">
                    <IconHeart className={`mx-auto ${heartStatus.color} ${heartStatus.animation}`} />
                    <div className={`text-4xl font-semibold mt-2 ${heartStatus.color}`}>
                      {ultimoDato.frecuencia} <span className="text-2xl font-normal">bpm</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Meta: {configAlertas.hrMin} - {configAlertas.hrMax} bpm
                    </p>
                    <div className={`mt-2 flex items-center justify-center text-lg font-medium ${heartStatus.color}`}>
                      <heartStatus.Icon /> <span>{heartStatus.text}</span>
                    </div>
                  </div>

                  {/* Oxígeno */}
                  <div className="text-center">
                    <OxygenGauge value={ultimoDato.oxigeno} config={configAlertas} />

                    <p className="text-sm text-gray-400 mt-4">
                      Mínimo aceptable: {configAlertas.oxyMin}%
                    </p>

                    <div className={`mt-2 flex items-center justify-center text-sm font-medium ${oxygenStatus.color}`}>
                      <oxygenStatus.Icon />
                      <span className="ml-1 text-xl">{oxygenStatus.text}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center pt-4 border-t mt-6">
                  Última actualización: {formatTimeAgo(ultimoDato.fecha)}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 p-6">No hay datos vitales disponibles.</p>
            )}
          </div>

          {/* Historial */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-2xl animate-zoom-in overflow-visible">
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-center items-center gap-4">
              <div className="flex flex-row flex-wrap sm:flex-nowrap items-end justify-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <CustomDatePicker label="Desde" value={fechaInicio} onChange={handleFechaInicioChange} max={fechaFin || today} />
                <CustomDatePicker label="Hasta" value={fechaFin} onChange={handleFechaFinChange} min={fechaInicio} max={today} />
                {(fechaInicio || fechaFin) && (
                  <button onClick={handleClearFilters} className="flex items-center gap-1 h-[38px] px-4 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg mb-[1px]">
                    <IconXCircle /> Limpiar
                  </button>
                )}
              </div>
            </div>
            <div className="p-6 space-y-8">
              <div><HealthChart data={historialData} /></div>
              <div><HistoryTable data={historialData} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE ALERTAS */}
      <ConfigModal
        open={showConfig}
        onClose={() => setShowConfig(false)}
        initialValues={configAlertas}
        onSave={handleSaveConfig}
      />

      {/* MODAL DE GEOCERCAS (NUEVO) */}
      <GeocerceModal
        open={showGeocerca}
        paciente={paciente}
        onClose={() => setShowGeocerca(false)}
        onSaved={() => {
          setPopup({ show: true, message: "Geocercas actualizadas correctamente", type: 'success' });
          setTimeout(() => setPopup(prev => ({ ...prev, show: false })), 3000);
          setShowGeocerca(false);
          // Si el mapa necesita refrescarse, PacienteMap debería manejarlo al cambiar el prop paciente
          // o puedes forzar un reload aquí si es crítico.
        }}
      />

      {/* POPUP GLOBAL */}
      <NotificacionPopup
        popup={popup}
        onClose={() => setPopup({ ...popup, show: false })}
        onClick={() => setPopup({ ...popup, show: false })}
      />

      <style>{`
        /* Animaciones existentes del Dashboard */
        @keyframes zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-zoom-in { animation: zoom-in 0.7s cubic-bezier(.4,0,.2,1) both; }
        
        @keyframes heartbeat {
          0%   { transform: scale(1); }
          14%  { transform: scale(1.15); } /* Primer latido fuerte */
          28%  { transform: scale(1); }
          42%  { transform: scale(1.15); } /* Segundo latido (eco) */
          70%  { transform: scale(1); }
          100% { transform: scale(1); }    /* Pausa antes del siguiente ciclo */
        }

        .animate-heartbeat-normal {
          animation: heartbeat 1.2s infinite ease-in-out;
        }

        .animate-heartbeat-fast {
          animation: heartbeat 0.6s infinite ease-in-out;
        }

        .animate-heartbeat-slow {
          animation: heartbeat 2s infinite ease-in-out;
        }

        @keyframes popup-fade { from { opacity: 0; } to { opacity: 1; } }
        .animate-popup-fade { animation: popup-fade 0.3s ease-out forwards; }
        @keyframes pop-from-fab { from { opacity: 0; transform: scale(0.8) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-pop-from-fab { animation: pop-from-fab 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </div>
  );
}