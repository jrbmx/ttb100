// src/pages/PacienteDetalle.jsx
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { listarPacientes } from '../services/pacientes';
import { getDatosRelevantes } from '../services/datos';
import PacienteMap from '../components/PacienteMap.jsx';

const IconArrowLeft = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);
const IconHeart = ({ className }) => (
  <svg className={`w-12 h-12 block ${className}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);
const IconOxygen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-500"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.708 2.372a2.382 2.382 0 0 0 -.71 .686l-4.892 7.26c-1.981 3.314 -1.22 7.466 1.767 9.882c2.969 2.402 7.286 2.402 10.254 0c2.987 -2.416 3.748 -6.569 1.795 -9.836l-4.919 -7.306c-.722 -1.075 -2.192 -1.376 -3.295 -.686z" /></svg>
);
const IconCheck = () => (
  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);
const IconWarning = () => (
  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
);

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

function getHeartStatus(bpm) {
  if (bpm >= 60 && bpm <= 100) {
    return { color: 'text-[#4dc278ff]', animation: 'animate-pulse-normal', text: 'Ritmo cardíaco normal', Icon: IconCheck };
  }
  if ((bpm >= 40 && bpm < 60) || (bpm > 100 && bpm <= 130)) {
    return { color: 'text-[#eab308]', animation: 'animate-pulse-fast', text: 'Ritmo cardíaco irregular', Icon: IconWarning };
  }
  if (bpm < 40 || bpm > 130) {
    return { color: 'text-[#ef4444]', animation: 'animate-ping', text: '¡Ritmo cardíaco peligroso!', Icon: IconWarning };
  }
  return { color: 'text-[#6b7280]', animation: '', text: 'Dato no concluyente', Icon: IconWarning };
}

function getOxygenStatus(spo2) {
  if (spo2 >= 95) {
    return { color: 'text-green-500', stroke: '#4dc278ff', text: 'Nivel de oxígeno normal', Icon: IconCheck };
  }
  if (spo2 >= 90 && spo2 < 95) {
    return { color: 'text-yellow-500', stroke: '#eab308', text: 'Nivel de oxígeno bajo', Icon: IconWarning };
  }
  if (spo2 < 90) {
    return { color: 'text-red-500', stroke: '#ef4444', text: '¡Nivel de oxígeno peligroso!', Icon: IconWarning };
  }
  return { color: 'text-gray-500', stroke: '#6b7280', text: 'Dato no concluyente', Icon: IconWarning };
}

const OxygenGauge = ({ value }) => {
  const status = getOxygenStatus(value);
  const percentage = Math.max(0, Math.min(100, value));
  
  // Cálculo para el arco del medidor (SVG)
  // El medidor va de 0 a 100. El arco es de 180 grados (media vuelta).
  const strokeWidth = 10;
  const radius = 50 - strokeWidth / 2;
  const circumference = radius * Math.PI; // Media circunferencia
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-40 h-20 overflow-hidden mx-auto">
      <svg className="w-full h-full" viewBox="0 0 100 50">
        {/* Pista gris de fondo */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="#e5e7eb" // gris claro
          strokeWidth={strokeWidth}
        />
        {/* Medidor de color */}
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
      {/* Círculo central con el icono */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: status.stroke }}
      >
        <IconOxygen />
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVitals = useCallback(async () => {
    if (!pacienteId) return;

    try {
      console.log(`Refrescando vitales para ${pacienteId}...`);
      const datos = await getDatosRelevantes(pacienteId);
      setDatosRelevantes(datos);
    } catch (e) {
      // No seteamos un error de página completa, solo falló el refresco
      console.error("Error al refrescar vitales:", e.message);
    }
  }, [pacienteId]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!pacienteId) {
      setError("No se especificó un ID de paciente.");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const todosLosPacientes = await listarPacientes();
        const pacEncontrado = todosLosPacientes.find(p => p._id === pacienteId);

        if (!pacEncontrado) {
          throw new Error("Paciente no encontrado o no autorizado.");
        }
        setPaciente(pacEncontrado);
        await fetchVitals();

      } catch (e) {
        setError(e.message || "Error al cargar los datos del paciente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pacienteId, user, navigate, fetchVitals]);

  useEffect(() => {
    if (paciente) {
      console.log("Iniciando poller de vitales...");
      const intervalId = setInterval(() => {
        fetchVitals(); // Llama a la función de refresco
      }, 15000); // Cada 15 segundos

      // Limpia el intervalo cuando el usuario sale de esta página
      return () => {
        console.log("Deteniendo poller de vitales.");
        clearInterval(intervalId);
      };
    }
  }, [paciente, fetchVitals]);

  // --- VISTAS DE ESTADO ---
  const renderStatus = (message) => (
    <div className="min-h-screen bg-[#EEF6F8] pt-24">
      {/* Header Falso para consistencia */}
      <header
        className="fixed top-0 left-0 w-full bg-[#0F3D56] py-4 shadow-lg flex justify-between items-center px-6"
        style={{ zIndex: 1000 }}
      >
        <h1 className="text-2xl font-bold text-white hidden sm:block">Detalles del Paciente</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-100"
        >
          <IconArrowLeft />
          Regresar
        </button>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-2xl p-10 text-center text-gray-500">
          {message}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return renderStatus("Cargando datos del paciente...");
  }

  if (error) {
    return renderStatus(<span className="text-red-500">{error}</span>);
  }

  if (!paciente) {
    return renderStatus("No se encontró al paciente.");
  }

  const { ultimoDato } = datosRelevantes;
  const heartStatus = ultimoDato ? getHeartStatus(ultimoDato.frecuencia) : null;
  const oxygenStatus = ultimoDato ? getOxygenStatus(ultimoDato.oxigeno) : null;

  return (
    <div className="min-h-screen bg-[#EEF6F8] pb-10">
      <header
        className="fixed top-0 left-0 w-full bg-[#0F3D56] py-4 shadow-lg flex justify-between items-center px-6"
        style={{ zIndex: 1000 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-white">
            {paciente.nombre} {paciente.apellidoP} {paciente.apellidoM || ''}
          </h1>
          <p className="text-sm text-gray-300">Edad: {paciente.edad} años</p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:bg-gray-100 border transition-all"
        >
          <IconArrowLeft />
          Dashboard
        </button>
      </header>
      
      <div className="pt-24 max-w-7xl mx-auto px-4 py-6">
        
        {/* --- 2. GRID LAYOUT REDISTRIBUIDO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Fila 1 (Izquierda): Mapa */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-2xl overflow-hidden animate-zoom-in">
            <div className="p-6">
              {/* Mapa con límites */}
              <PacienteMap paciente={paciente} />
            </div>
          </div>

          {/* Fila 1 (Derecha): Signos Vitales */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-2xl animate-zoom-in flex flex-col overflow-hidden">
            
            
            {ultimoDato ? (
              // --- 3. LAYOUT CORREGIDO (flex-grow) ---
              <div className="p-6 flex flex-col flex-grow justify-between">
                
                {/* Contenido principal (vitales) */}
                <div className="space-y-8">
                  
                  {/* Frecuencia Cardíaca */}
                  <div className="text-center">
                    <IconHeart className={`mx-auto ${heartStatus.color} ${heartStatus.animation}`} />
                    <div className={`text-4xl font-semibold mt-2 ${heartStatus.color}`}>
                      {ultimoDato.frecuencia} <span className="text-2xl font-normal">bpm</span>
                    </div>
                    <p className="text-sm text-gray-500">Frecuencia Cardíaca</p>
                    {/* Barra de Estado */}
                    <div className={`mt-2 flex items-center justify-center text-sm font-medium ${heartStatus.color}`}>
                      <heartStatus.Icon />
                      <span>{heartStatus.text}</span>
                    </div>
                  </div>
                  
                  {/* Oxígeno en Sangre */}
                  <div className="text-center">
                    <OxygenGauge value={ultimoDato.oxigeno} />
                    <div className={`text-4xl font-semibold mt-2 ${oxygenStatus.color}`}>
                      {ultimoDato.oxigeno} <span className="text-2xl font-normal">%</span>
                    </div>
                    <p className="text-sm text-gray-500">Oxígeno en Sangre (SpO2)</p>
                    {/* Barra de Estado */}
                    <div className={`mt-2 flex items-center justify-center text-sm font-medium ${oxygenStatus.color}`}>
                      <oxygenStatus.Icon />
                      <span>{oxygenStatus.text}</span>
                    </div>
                  </div>
                </div>
                
                {/* Footer de la tarjeta (empujado al fondo) */}
                <p className="text-sm text-gray-500 text-center pt-4 border-t mt-6">
                  Última actualización: {formatTimeAgo(ultimoDato.fecha)}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 p-6">No hay datos vitales disponibles.</p>
            )}
          </div>
          {/* --- FIN TARJETA SIGNOS VITALES --- */}


          {/* Fila 2: Historial */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-2xl animate-zoom-in overflow-hidden">
             <h2 className="text-xl font-semibold text-gray-800 p-6 border-b border-gray-200">
               Historial de Datos
             </h2>
             <div className="p-6">
               <p className="text-gray-500 text-sm">
                 (Aquí irá tu tabla o gráfica de datos históricos...)
               </p>
             </div>
          </div>

        </div>
      </div>
      
      <style>{`
        @keyframes zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-zoom-in { animation: zoom-in 0.7s cubic-bezier(.4,0,.2,1) both; }

        /* --- Animaciones de Pulso (Se quedan) --- */
        @keyframes pulse-normal {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        .animate-pulse-normal {
          animation: pulse-normal 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse-fast {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
        .animate-pulse-fast {
          animation: pulse-fast 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}