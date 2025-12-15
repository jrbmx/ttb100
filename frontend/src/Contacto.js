import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from './logo.png'; 

const Contacto = () => {
  const teamMembers = [
    {
      name: "Joshua Levi Rodríguez Vázquez",
      role: "Frontend y Documentación",
      email: "jrodriguezv1801@alumno.ipn.mx",
      telefono: "55 4189 0551",
      image: "https://placehold.co/150x150/e2e8f0/475569?text=JL" 
    },
    {
      name: "Jonathan Rubén Romero Barrientos",
      role: "Backend y Pruebas",
      email: "jromerob1800@alumno.ipn.mx",
      telefono: "55 2514 0985",
      image: "https://placehold.co/150x150/e2e8f0/475569?text=JR"
    },
    {
      name: "Alberto Vega Monterrubio",
      role: "Hardware y Datos",
      email: "avegam1801@alumno.ipn.mx",
      telefono: "56 4000 8479",
      image: "https://placehold.co/150x150/e2e8f0/475569?text=AV"
    }
  ];

  return (
    // CAMBIO CLAVE 1: 'min-h-screen' permite scroll. 'w-full' asegura ancho completo.
    <div className="min-h-screen w-full bg-gray-50 font-sans flex flex-col relative">
      
      {/* HEADER FIJO */}
      <header className="bg-oscuro text-white fixed w-full top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 select-none">
              <img src={logoImg} alt="Logo Overvak" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
              <span className="text-xl font-bold tracking-wide">Overvak</span>
            </div>
            <Link to="/" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-transform hover:scale-105">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span className="hidden md:inline">Volver al inicio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      {/* CAMBIO CLAVE 2: Ajuste de padding para móviles (pt-24) y 'flex-grow' para empujar footer */}
      <main className="w-full container mx-auto px-4 pt-24 pb-12 flex-grow">
        
        <div className="text-center mb-10 md:mb-16 mt-4">
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">
            ¿Tienes dudas sobre el proyecto?
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Estamos disponibles para responder preguntas técnicas sobre el funcionamiento del prototipo.
          </p>
        </div>

        {/* Grid de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div 
              key={index} 
              // 1. IMPORTANTE: Aquí agregamos la clase 'group' al padre
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center h-full group hover:shadow-lg transition-all duration-300"
            >
              
              {/* Nombre y Rol */}
              <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>
              <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-6">
                {member.role}
              </span>
              
              {/* Info de Contacto */}
              <div className="w-full mt-auto space-y-3 border-t border-gray-100 pt-4">
                
                {/* 2. EMAIL: Se vuelve AZUL cuando haces hover en el grupo */}
                <div className="flex flex-col xl:flex-row items-center justify-center gap-2 text-slate-600 group-hover:text-red-600 transition-colors duration-300">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span className="text-xs font-medium break-all">{member.email}</span>
                </div>

                {/* 3. TELÉFONO: Se vuelve VERDE cuando haces hover en el grupo */}
                <div className="flex items-center justify-center gap-2 text-slate-600 group-hover:text-emerald-500 transition-colors duration-300">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span className="text-sm font-medium tracking-wide">{member.telefono}</span>
                </div>

              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER RESPONSIVO */}
      {/* CAMBIO CLAVE 3: z-10 para asegurar que se vea encima de todo */}
      <footer className="bg-oscuro text-white py-6 mt-auto border-t border-slate-800 relative z-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-3 opacity-90 text-center">
          <img src={logoImg} alt="Logo Overvak" className="w-6 h-6 object-contain" />
          <span className="text-sm font-medium tracking-wide">
            © {new Date().getFullYear()} Overvak
          </span>
        </div>
      </footer>

    </div>
  );
};

export default Contacto;