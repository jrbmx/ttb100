import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import logoImg from './logo.png';
import logoAcceder from './acceder.png';
import imgGPS from './assets/geolocalizacion.jpg';
import imgOxFrec from './assets/frec_oxig.jpg';
import imgCaidas from './assets/caida.jpg';
import imgCuidados from './assets/cuidado.jpg'; 
import imgMonitoreo from './assets/monitoreo.jpg';
import imgProyecto from './assets/proyecto.jpg';

export default function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const carruselImagenes = [
    {
      id: 1, src: imgCuidados, alt: 'Cuidado personalizado para tu familiar'
    },
    {
      id: 2, src: imgGPS, alt: 'Obtención de ubicación en tiempo concreto'
    },
    {
      id: 3, src: imgCaidas, alt: 'Detección de caídas y envío de alertas'
    },
    {
      id: 4, src: imgMonitoreo, alt: 'Monitoreo desde cualquier dispositivo'
    },
    {
      id: 5, src: imgOxFrec, alt: 'Envío de variables fisiológicas'
    },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMenuOpen(false); // Cierra el menú móvil si se usa
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-alz-light font-sans text-gray-800">
      <header className="bg-oscuro text-white fixed w-full top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center relative">
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className="text-white focus:outline-none p-2 hover:bg-white/10 rounded-md transition-colors"
              >
                {menuOpen ? (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
              )}
              </button>
            </div>
            <button 
              onClick={() => scrollToSection('significado')} 
              className="absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none group text-left">
              <div className="flex items-center justify-center gap-3 transition-transform duration-300 group-hover:scale-105">                <img 
                  src={logoImg} 
                  alt="Logo"
                  className="w-8 h-8 md:w-10 md:h-10 object-contain"
                />
                <span className="text-xl font-bold tracking-wide whitespace-nowrap">Overvak</span>
              </div>
            </button>

            <nav className="hidden md:flex items-center space-x-8 ml-auto mr-6">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-gray-300 hover:text-white hover:underline transition-all">Inicio</button>
              <button onClick={() => scrollToSection('nosotros')} className="text-gray-300 hover:text-white hover:underline transition-all">Acerca de nosotros</button>
            </nav>

            <div className="flex items-center">
              <button
                onClick={() => navigate("/auth")}
                className="hidden md:flex bg-botones hover:bg-emerald-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-transform hover:scale-105 items-center gap-2"
              >
                <img src={logoAcceder} alt="Icono" className="w-8 h-8 object-contain" />
                <span>Acceder</span>
              </button>

              <button 
                onClick={() => navigate("/auth")}
                className="md:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <img src={logoAcceder} alt="Icono" className="w-8 h-8 object-contain" />
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#f2f2f2] text-gray-800 shadow-xl border-t border-gray-300 animate-fade-in-down">
            <div className="flex flex-col">
              <button 
                onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMenuOpen(false); }}
                className="text-left px-6 py-4 border-b border-gray-300 hover:bg-white transition-colors font-medium text-lg"
              >
                Inicio
              </button>

              <button 
                onClick={() => scrollToSection('nosotros')}
                className="text-left px-6 py-4 border-b border-gray-300 hover:bg-white transition-colors font-medium text-lg"
              >
                Acerca de nosotros
              </button>
            </div>
          </div>
        )}
      </header>

      {/*CUERPO */}
      <main className="flex-grow pt-28 pb-10 px-6">
        
        {/* SECCIÓN HERO (Principal) */}
        <section className="container mx-auto text-center max-w-5xl py-10 md:py-20 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-extrabold text-black mb-6 md:mb-8 leading-tight">
            Tecnología que cuida, <br/>
            <span className="text-black">cuando tú no puedes estar cerca</span>
          </h1>
          
          <p className="text-black sm:text-lg md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            <b>Overvak</b>, un sistema para brindar tranquilidad a las familias y seguridad a quienes más queremos.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            {/* Botón Conocer Proyecto */}
            <button 
              onClick={() => scrollToSection('proyecto')}
              className="bg-oscuro hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:-translate-y-1"
            >
              ¡Conoce el proyecto!
            </button>
            
            {/* Botón Cómo funciona */}
            <button 
              onClick={() => scrollToSection('funcionamiento')}
              className="bg-white border-2 border-alz-primary text-alz-primary hover:bg-green-50 font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:-translate-y-1"
            >
              ¿Cómo funciona el sistema?
            </button>
          </div>

          {/* --- Carrusel de fotos*/}
          <div className="relative w-screen left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] mt-10 mb-10 bg-gray-50 overflow-hidden group">  
            <style>
              {`
                @keyframes scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); } /* Se mueve exactamente la mitad (un set de fotos) */
                }
                .animate-marquee {
                  animation: scroll 30s linear infinite; /* 30s para una vuelta completa suave */
                }
              `}
            </style>
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
              {[...carruselImagenes, ...carruselImagenes].map((image, index) => (
                <div key={index} className="relative h-80 md:h-[550px] w-auto shrink-0 group/item cursor-pointer">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-auto max-w-none object-contain block"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                    <p className="text-white text-center font-bold text-lg">
                      {image.alt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Significado (nombre y símbolo) */}
        <section id="significado" className="w-full py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
              {/* --- COLUMNA IZQUIERDA --- */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-blue-100 rounded-2xl opacity-50 blur-lg group-hover:opacity-75 transition duration-500"></div>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                    <img 
                      src={logoImg}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
                {/* --- COLUMNA DERECHA --- */}
                <div className="space-y-10">
                  <div>
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                      Nuestra identidad
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Cada detalle de nuestro proyecto se ha sido elegido con un propósito: unir la tecnología con la empatía.
                    </p>
                  </div>
                  {/* Nombre */}
                  <div className="flex gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        ¿Qué significa?
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        <p className="text-gray-600 leading-relaxed">
                          La palabra <strong>Overvak</strong> proviene del sueco y significa <strong>supervisión</strong> o <strong>monitoreo</strong>.
                          Elegimos este nombre porque representa el propósito central de nuestro proyecto: acompañar y cuidar de forma constante y 
                          respetuosa a personas que viven con la Enfermedad del Alzheimer.
                      </p>
                      </p>
                    </div>
                  </div>
                  {/* Logo */}
                  <div className="flex gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        La flor <span className="text-alz-accent">"No Me Olvides"</span>
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        Nuestro símbolo es la flor <strong>Myosotis</strong>, internacionalmente asociado con la memoria y el Alzheimer.
                        Representa el compromiso de no olvidar a quienes enfrentan esta enfermedad y de acompañarlos con empatía, respeto y dignidad.
                        Un enfoque que nuestro proyecto busca reflejar en cada aspecto del sistema. 
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Proyecto */}
          <section id="proyecto" className="w-full py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
              {/* --- Contexto e imagen --- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">      
                <div className="order-2 lg:order-1">
                  <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
                    Sobre el proyecto <br />
                  </h2>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    <strong>Overvak</strong> es un sistema de supervisión diseñado para apoyar a familiares y cuidadores en el cuidado diario de personas
                    con Alzheimer. A través de un dispositivo wearable, Overvak permite monitorear de forma continua el estado y la actividad del paciente,
                    brindando información oportuna que ayuda a reducir riesgos y aumentar la tranquilidad de quienes están a cargo de su cuidado.
                  </p>
                </div>
                <div className="order-1 lg:order-2 relative">
                  <div className="absolute inset-0 border-2 border-gray-200 rounded-2xl transform translate-x-3 translate-y-3"></div>
                    <img 
                      src={imgProyecto}
                      className="relative rounded-2xl shadow-lg w-full object-cover bg-white"
                    />
                </div>
              </div>
                
              {/* --- CARDS FLOTANTES --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {/* Card 1: Sobre el Alzheimer */}
                <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Sobre el Alzheimer</h3>
                  <p className="text-gray-600 text-sm leading-relaxed"> Es una enfermedad neurodegenerativa progresiva que afecta la memoria,
                    la orientación y la capacidad para realizar actividades cotidianas. Con el tiempo, las personas pueden experimentar desorientación,
                    pérdida de autonomía y dificultades para reconocer entornos familiares, lo que incrementa el riesgo de extravíos, caídas y situaciones de peligro.
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed"> Esta condición no solo impacta a quien la padece, sino también a las familias y 
                    cuidadores, quienes enfrentan una carga física y emocional constante.
                  </p>
                </div>
                  
                {/* Card 2: La Problemática */}
                <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">La Problemática</h3>
                  <p className="text-gray-600 text-sm leading-relaxed"> El cuidado de una persona con Alzheimer implica una supervisión continua.
                    Sin embargo, no siempre es posible que un familiar o cuidador esté presente en todo momento. Esta situación genera preocupación constante ante riesgos como:
                  </p>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Desorientación fuera del domicilio</li>
                    <li>Caídas accidentales</li>
                    <li>Cambios en el estado de salud</li>
                  </ul>
                    <p className="text-gray-600 text-sm leading-relaxed">La ausencia de herramientas accesibles que apoyen esta supervisión incrementa el estrés del cuidador y limita la autonomía del paciente.</p>
                </div>

                {/* Card 3: Justificación */}
                <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Justificación</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">El proyecto surge como respuesta a la necesidad de mejorar la supervisión y el cuidado de personas con Alzheimer mediante el uso de tecnología wearable.
                    El proyecto busca aprovechar sensores y comunicación inalámbrica en un entorno de sistemas embebidos para proporcionar información relevante en tiempo concreto, permitiendo una reacción más rápida ante eventos de riesgo.
                  </p>
                </div>

                {/* Card 4: Alcance */}
                <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Alcance del Proyecto</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Overvak es un prototipo funcional de carácter académico, enfocado en:</p>
                  <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Monitoreo de ubicación y actividad del paciente</li>
                    <li>Detección de eventos (caídas y estados de inactividad)</li>
                    <li>Supervisión del estado del paciente</li>
                    <li>Envío de alertas</li>
                  </ul>
                  <p className="text-gray-600 text-sm leading-relaxed">El sistema no reemplaza la atención médica ni el cuidado humano, sino que actúa como una herramienta de apoyo para minimizar la carga de trabajo para el cuidador.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Funcionamiento */}
          <section id="funcionamiento" className="w-full py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
              
              {/* ENCABEZADO */}
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
                  Funcionamiento del sistema
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Overvak funciona como un sistema de supervisión continua que conecta al paciente, 
                  el dispositivo wearable y al cuidador a través de una plataforma web.
                </p>
              </div>

              {/* Flujo funcionamiento */}
              <div className="relative mb-20">
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 transform -translate-y-1/2"></div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  
                  {/* Paso 1: Monitoreo */}
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center relative hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-14 h-14 mx-auto bg-sky-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg ring-4 ring-blue-50">
                      1
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Detección</h3>
                    <p className="text-sm text-gray-500">El wearable recopila signos vitales, ubicación y movimiento en tiempo concreto.</p>
                  </div>

                  {/* Paso 2: Análisis */}
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center relative hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-14 h-14 mx-auto bg-violet-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg ring-4 ring-blue-50">
                      2
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Análisis</h3>
                    <p className="text-sm text-gray-500">El sistema procesa los datos e identifica patrones anómalos.</p>
                  </div>

                  {/* Paso 3: Alerta */}
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center relative hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-14 h-14 mx-auto bg-amber-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg ring-4 ring-blue-50">
                      3
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Alerta</h3>
                    <p className="text-sm text-gray-500">El sistma notifica al cuidador ante cualquier evento de riesgo.</p>
                  </div>

                  {/* Paso 4: Acción */}
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center relative hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-14 h-14 mx-auto bg-emerald-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg ring-4 ring-green-50">
                      4
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Acción</h3>
                    <p className="text-sm text-gray-500">El familiar recibe la ubicación y actúa oportunamente.</p>
                  </div>
                </div>
              </div>

              {/*¿QUÉ DETECTA?*/}
              <div className="bg-gray-50 rounded-3xl p-8 md:p-12 mb-12">
                <div className="text-center mb-10">
                  <h3 className="text-2xl font-bold text-gray-900">¿Qué ocurre cuando se detecta un evento?</h3>
                  <p className="text-gray-500 mt-2">Cuando el sistema detecta una situación fuera de los rangos configurables, genera una alerta y notifica al cuidador para que pueda actuar.</p>
                </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-8 justify-items-center">
                {/* GPS */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                <span className="font-semibold text-gray-700 text-sm">Ubicación GPS</span>
                </div>

                {/* Frecuencia */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </div>
                  <span className="font-semibold text-gray-700 text-sm">Frecuencia cardíaca</span>
                </div>

                {/*Oxígeno */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-cyan-500 shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5c-4 4.5-6 8-6 10a6 6 0 1 0 12 0c0-2-2-5.5-6-10z"/></svg>
                  </div>
                  <span className="font-semibold text-gray-700 text-sm">Nivel de oxígeno</span>
                </div>

                {/* Movimiento */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <span className="font-semibold text-gray-700 text-sm">Movimiento e inactividad</span>
                </div>

                {/* Caídas */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <span className="font-semibold text-gray-700 text-sm">Anomalías</span>
                </div>
              </div>
            </div>

            {/*EJEMPLO DE USO*/}
            <div className="bg-blue-500 rounded-2xl p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center gap-6">
              <div className="bg-white/20 p-4 rounded-full flex-shrink-0">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">Ejemplo de uso</h4>
                <p className="text-blue-100 text-lg leading-relaxed">
                  "Si el paciente sufre una caída, se mantiene inactivo durante un tiempo prolongado, sale de una zona segura o el dispositivo se desconectó, 
                  Overvak detecta el evento, registra la anomalía y envía una notificación inmediata al celular del familiar para que pueda actuar al instante,
                  además de mostrar las alertas en el panel web."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Acerca de Nosotros */}
        <section id="nosotros" className="w-full py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Nuestro equipo
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Somos un equipo de tres estudiantes de la Escuela Superior de Cómputo (ESCOM) en la ingeniería de Sistemas Computacionales, comprometidos 
                con el desarrollo de soluciones tecnológicas con impacto social. Overvak nace de nuestro interés por aplicar la ingeniería y la tecnología 
                para apoyar el cuidado de personas con Alzheimer y brindar tranquilidad a sus familias.
              </p>
            </div>

            {/* TARJETAS DEL EQUIPO*/}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col items-center text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Joshua Levi Rodríguez Vázquez</h3>
                <span className="text-blue-600 font-medium text-sm mb-4 block">Frontend y documentación</span>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Diseño de la interfaz web intuitiva para los cuidadores, documentación del proyecto e investigación general.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col items-center text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Jonathan Rubén Romero Barrientos</h3>
                <span className="text-blue-600 font-medium text-sm mb-4 block">Backend y pruebas</span>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Encargado de la arquitectura del servidor, migración a la nube y pruebas del sistema.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col items-center text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Alberto Vega Monterrubio</h3>
                <span className="text-blue-600 font-medium text-sm mb-4 block">Desarrollo de hardware y procesamiento de datos</span>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Responsable de la integración de sensores, procesamiento de datos y lógica del servidor.
                </p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto text-center border-t border-gray-200 pt-10">
              <p className="text-gray-500 italic text-base md:text-lg">
                "Overvak forma parte de nuestro Trabajo Terminal, integrando conocimientos técnicos, 
                investigación y responsabilidad social en una solución orientada al cuidado de personas con Alzheimer."
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER (Pendiente) --- */}
      {/* =========================================
    FOOTER FINAL (ULTRA-COMPACTO & PERSONALIZADO)
    Estilo: Altura Mínima | Logo Imagen | Texto Centrado
   ========================================= */}
<footer className="bg-oscuro text-slate-100 py-6 border-t border-slate-800 text-sm">
  <div className="max-w-7xl mx-auto px-6 md:px-12">
    
    {/* Contenedor flexible horizontal */}
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      
      {/* 1. IZQUIERDA: Logo (Imagen) y Copyright */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Usamos la variable logoImg importada arriba */}
        <img 
          src={logoImg} 
          alt="Overvak Logo" 
          className="h-9 w-auto object-contain" // Altura ajustada para que se vea bien
        />
        <span className="text-xs">
          © {new Date().getFullYear()} Overvak
        </span>
      </div>

      {/* 2. CENTRO: Disclaimer Académico (Perfectamente Centrado) */}
      {/* 'flex-1' hace que ocupe el espacio central y 'text-center' alinea el texto */}
      <div className="text-center flex-1 mx-4 order-last md:order-none">
        <p className="text-xs text-slate-200 leading-tight">
          Proyecto académico sin fines de lucro. <br className="hidden lg:block"/>
          Este prototipo no sustituye el asesoramiento médico profesional.
        </p>
      </div>

      {/* 3. DERECHA: Enlaces (GitHub y Contacto) */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <a 
          href="https://github.com/jrbmx/ttb100" // Pon aquí el link real a tu repositorio
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-white transition-colors"
        >
          GitHub
        </a>
        <span className="text-slate-700">|</span>
        {/* Enlace a la página de contacto */}
        <a 
          href="/contacto"
          className="hover:text-white transition-colors"
        >
          Contacto
        </a>
      </div>

    </div>
  </div>
</footer>
      
    </div>
  );
}