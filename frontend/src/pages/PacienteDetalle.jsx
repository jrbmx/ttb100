// src/pages/PacienteDetalle.jsx
import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { listarPacientes, actualizarConfiguracionPaciente } from '../services/pacientes';
import { getDatosRelevantes, getHistorial } from '../services/datos';
import PacienteMap from '../components/PacienteMap.jsx';
import HealthChart from '../components/HealthChart.jsx';
import HistoryTable from '../components/HistoryTable.jsx';
import NotificacionPopup from '../components/NotificacionPopup';

// --- ICONOS ---
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
const IconHeart = ({ className }) => (
  <svg className={`w-12 h-12 block ${className}`} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);
const IconOxygen = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-500">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.708 2.372a2.382 2.382 0 0 0 -.71 .686l-4.892 7.26c-1.981 3.314 -1.22 7.466 1.767 9.882c2.969 2.402 7.286 2.402 10.254 0c2.987 -2.416 3.748 -6.569 1.795 -9.836l-4.919 -7.306c-.722 -1.075 -2.192 -1.376 -3.295 -.686z" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);
const IconWarning = () => (
  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
);
const IconXCircle = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);


// --- UTILS ---
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

// Ahora aceptan umbrales dinámicos
function getHeartStatus(bpm, umbrales = { min: 60, max: 100 }) {
  const { min, max } = umbrales;
  if (bpm >= min && bpm <= max) {
    return { color: 'text-[#4dc278ff]', animation: 'animate-pulse-normal', text: 'Ritmo cardíaco normal', Icon: IconCheck };
  }
  if ((bpm >= (min - 15) && bpm < min) || (bpm > max && bpm <= (max + 30))) {
    return { color: 'text-[#eab308]', animation: 'animate-pulse-fast', text: 'Ritmo irregular', Icon: IconWarning };
  }
  return { color: 'text-[#ef4444]', animation: 'animate-ping', text: '¡Ritmo peligroso!', Icon: IconWarning };
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
  const status = getOxygenStatus(value, config);
  const percentage = Math.max(0, Math.min(100, value));
  const strokeWidth = 10;
  const radius = 50 - strokeWidth / 2;
  const circumference = radius * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-40 h-20 overflow-hidden mx-auto">
      <svg className="w-full h-full" viewBox="0 0 100 50">
        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={status.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: status.stroke }}>
        <IconOxygen />
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
    // CAMBIO: Quitamos 'w-full' y usamos 'flex-col' simple.
    <div className="flex flex-col items-center">
      <span className="text-xs font-semibold text-gray-500 mb-1 text-center">{label}</span>
      <div 
        onClick={handleContainerClick} 
        // CAMBIO: Definimos un ancho fijo cómodo (w-36 o w-40) para que se vean uniformes
        className="flex items-center justify-center bg-white border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:border-teal-500 hover:ring-1 hover:ring-teal-500 transition-all shadow-sm group w-36 sm:w-40"
      >
        <input 
          ref={inputRef} 
          type="date" 
          value={value} 
          onChange={onChange} 
          min={min} 
          max={max} 
          className="text-sm text-gray-700 bg-transparent border-none focus:ring-0 p-0 w-full cursor-pointer outline-none font-sans text-center" 
        />
      </div>
    </div>
  );
};

const ConfigModal = ({ open, onClose, initialValues, onSave }) => {
  const [formData, setFormData] = useState({
    hrMin: 60,
    hrMax: 100,
    oxyMin: 90,
    inactivityMin: 30
  });
  
  // Estado para errores de validación
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
    }
    setErrors({}); // Limpiar errores al abrir
  }, [initialValues, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    // Limpiar error del campo al escribir
    if (errors[name] || errors.general) {
       setErrors(prev => ({ ...prev, [name]: null, general: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const { hrMin, hrMax, oxyMin, inactivityMin } = formData;

    // 1. Validaciones de Frecuencia Cardíaca
    if (hrMin < 30) newErrors.hrMin = "Mínimo irreal (< 30)";
    if (hrMax > 250) newErrors.hrMax = "Máximo peligroso (> 250)";
    if (hrMin < 0 || hrMax < 0) newErrors.general = "No se permiten números negativos";
    
    // VALIDACIÓN CLAVE: Mínimo no puede ser mayor al máximo
    if (hrMin >= hrMax) {
        newErrors.hrMin = "Debe ser menor al máximo";
        newErrors.hrMax = "Debe ser mayor al mínimo";
        newErrors.general = "El rango de frecuencia cardíaca es inválido";
    }

    // 2. Validaciones de Oxígeno
    if (oxyMin < 50) newErrors.oxyMin = "Demasiado bajo (< 50%)";
    if (oxyMin > 100) newErrors.oxyMin = "No puede superar 100%";
    
    // 3. Inactividad
    if (inactivityMin < 5) newErrors.inactivityMin = "Mínimo 5 minutos";
    if (inactivityMin > 1440) newErrors.inactivityMin = "Máximo 24 horas"; // 1440 min = 24h

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
        onSave(formData);
        onClose();
    }
  };

  if (!open) return null;

  // Clase auxiliar para input con error
  const inputClass = (fieldName) => `w-full border rounded-xl p-2 text-center focus:outline-none focus:ring-2 transition ${errors[fieldName] ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-500'}`;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[2000] animate-popup-fade"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-500 animate-pop-from-fab"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-center mb-6 text-[#3A6EA5] flex items-center justify-center gap-2">
          <IconSettings />
          Configurar alertas del paciente
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Sección Frecuencia Cardíaca */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 relative">
            <h4 className="text-sm font-bold text-[#3A6EA5] uppercase tracking-wide mb-3 text-center">Frecuencia cardíaca (bpm)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1 font-medium text-xs text-center">Mínimo</label>
                <input 
                  type="number" name="hrMin" value={formData.hrMin} onChange={handleChange}
                  className={inputClass('hrMin')}
                />
                {errors.hrMin && <p className="text-[10px] text-red-500 text-center mt-1 font-bold">{errors.hrMin}</p>}
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium text-xs text-center">Máximo</label>
                <input 
                  type="number" name="hrMax" value={formData.hrMax} onChange={handleChange}
                  className={inputClass('hrMax')}
                />
                {errors.hrMax && <p className="text-[10px] text-red-500 text-center mt-1 font-bold">{errors.hrMax}</p>}
              </div>
            </div>
          </div>

          {/* Sección Oxigenación e Inactividad */}
          <div className="grid grid-cols-2 gap-4">
            {/* Oxigenación */}
            <div>
              <h4 className="text-sm font-bold text-[#3A6EA5] uppercase tracking-wide mb-3 text-center">Nivel oxigenación mínima (%)</h4>
              
              <input 
                type="number" name="oxyMin" value={formData.oxyMin} onChange={handleChange} 
                className={inputClass('oxyMin')}
              />
              {errors.oxyMin && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.oxyMin}</p>}
            </div>
            {/* Inactividad */}
            <div>
              <h4 className="text-sm font-bold text-[#3A6EA5] uppercase tracking-wide mb-3 text-center">Tiempo de inactividad (min)</h4>
              <input 
                type="number" name="inactivityMin" value={formData.inactivityMin} onChange={handleChange}
                className={inputClass('inactivityMin')}
              />
               {errors.inactivityMin && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.inactivityMin}</p>}
            </div>
          </div>
          
          {/* Mensaje General de Error */}
          {errors.general && (
            <div className="text-red-600 text-xs font-bold text-center bg-red-50 p-2 rounded-lg border border-red-200">
                {errors.general}
            </div>
          )}
          
          <div className="text-center text-xs text-gray-400 px-2 pt-2">
             Estos valores determinarán las alertas automáticas.
          </div>

          {/* Botones */}
          <div className="flex justify-around pt-2">
            <button 
              type="submit" 
              className="px-8 py-2 rounded-full text-white bg-[#3A6EA5] hover:bg-[#2E5984] transition transform hover:scale-105 hover:shadow-lg font-medium"
            >
              Guardar
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="border border-gray-300 text-gray-700 px-8 py-2 rounded-full transition transform hover:bg-gray-100 hover:scale-105 hover:shadow font-medium"
            >
              Cancelar
            </button>
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

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  
  // Estado para el modal de configuración
  const [showConfig, setShowConfig] = useState(false);
  // Estado para los valores de configuración (inicialmente valores por defecto)
  const [configAlertas, setConfigAlertas] = useState({
    hrMin: 60,
    hrMax: 100,
    oxyMin: 90,
    inactivityMin: 30
  });
  const [popup, setPopup] = useState({ show: false, message: '', success: true });

  const today = new Date().toLocaleDateString('en-CA'); 
  const handleFechaInicioChange = (e) => setFechaInicio(e.target.value);
  const handleFechaFinChange = (e) => setFechaFin(e.target.value);
  const handleClearFilters = () => { setFechaInicio(""); setFechaFin(""); };

  const fetchHistory = useCallback(async () => {
    if (!pacienteId) return;
    if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) return;
    try {
      const historial = await getHistorial(pacienteId, fechaInicio, fechaFin);
      setHistorialData(historial);
    } catch (e) { console.error("Error historial:", e.message); }
  }, [pacienteId, fechaInicio, fechaFin]);

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

  useEffect(() => { if (paciente) fetchHistory(); }, [fechaInicio, fechaFin, fetchHistory, paciente]);

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
        
        // Si el paciente ya tiene config guardada en BD, la cargamos aquí
        if (pacEncontrado.configuracion) {
            setConfigAlertas(pacEncontrado.configuracion);
        }

        await fetchVitalsAndInitialData();
      } catch (e) { setError(e.message || "Error al cargar."); } 
      finally { setIsLoading(false); }
    };
    fetchPatientInfo();
  }, [pacienteId, user, navigate]);

  useEffect(() => {
    if (paciente) {
      const intervalId = setInterval(fetchVitalsAndInitialData, 15000);
      return () => clearInterval(intervalId);
    }
  }, [paciente, fetchVitalsAndInitialData]);

  // Manejador para guardar la configuración
  const handleSaveConfig = async (newConfig) => {
    try {
      await actualizarConfiguracionPaciente(pacienteId, newConfig);
      setConfigAlertas(newConfig);
      setError(""); 

      setPopup({
        show: true,
        message: 'Configuración guardada correctamente.',
        type: 'info'
      });
    } catch (err) {
      console.error("Error guardando config:", err);
      setPopup({
        show: true,
        message: err.message || "No se pudo guardar la configuración.",
        type: 'error'
      });
    } finally {
      setTimeout(() => {
        setPopup(prev => ({ ...prev, show: false }));
      }, 5000);
    }
  };

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
  
  // Usamos los umbrales configurados para determinar el estatus
  const heartStatus = ultimoDato 
    ? getHeartStatus(ultimoDato.frecuencia, { min: configAlertas.hrMin, max: configAlertas.hrMax }) 
    : null;
    
  const oxygenStatus = ultimoDato 
    ? getOxygenStatus(ultimoDato.oxigeno, { min: configAlertas.oxyMin }) 
    : null;

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
            {/* BOTÓN DE CONFIGURACIÓN AGREGADO */}
            <button
                onClick={() => setShowConfig(true)}
                className="flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg shadow-md hover:bg-emerald-700 transition-all border border-emerald-500"
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
      
      <div className="pt-24 max-w-7xl mx-auto px-4 py-6">
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
                    <OxygenGauge value={ultimoDato.oxigeno} config={{ min: configAlertas.oxyMin }} />
                    <div className={`text-4xl font-semibold mt-2 ${oxygenStatus.color}`}>
                      {ultimoDato.oxigeno} <span className="text-2xl font-normal">%</span>
                    </div>
                     <p className="text-sm text-gray-400 mt-1">
                        Mínimo aceptable: {configAlertas.oxyMin}%
                    </p>
                    <div className={`mt-2 flex items-center justify-center text-lg font-medium ${oxygenStatus.color}`}>
                      <oxygenStatus.Icon /> <span>{oxygenStatus.text}</span>
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
      
      {/* MODAL DE CONFIGURACIÓN */}
      <ConfigModal 
        open={showConfig} 
        onClose={() => setShowConfig(false)}
        initialValues={configAlertas}
        onSave={handleSaveConfig}
      />

      <NotificacionPopup 
        popup={popup} 
        onClose={() => setPopup({ ...popup, show: false })}
        onClick={() => setPopup({ ...popup, show: false })}
      />

      <style>{`
        /* Animaciones existentes del Dashboard */
        @keyframes zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-zoom-in { animation: zoom-in 0.7s cubic-bezier(.4,0,.2,1) both; }
        
        @keyframes pulse-normal { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }
        .animate-pulse-normal { animation: pulse-normal 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        
        @keyframes pulse-fast { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.8; } }
        .animate-pulse-fast { animation: pulse-fast 1s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

        /* --- NUEVAS ANIMACIONES DEL MODAL (Coherencia con AltaPaciente) --- */
        @keyframes popup-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-popup-fade {
          animation: popup-fade 0.3s ease-out forwards;
        }

        @keyframes pop-from-fab {
          from { opacity: 0; transform: scale(0.8) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-pop-from-fab {
          animation: pop-from-fab 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}