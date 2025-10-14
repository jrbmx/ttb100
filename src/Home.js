import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#e0f7fa] to-[#b2ebf2]">
      <header className="bg-gradient-to-r from-[#3f535e] to-[#06354f] py-4 shadow-md">
        <nav className="max-w-4xl mx-auto flex justify-between items-center px-6 md:px-8">
          <div className="text-white font-bold text-2xl">AlzhTrack</div>
          <div className="relative md:hidden">
            <button onClick={toggleMenu} className="text-white focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <button onClick={() => { setMenuOpen(false); navigate("/infoExtra/acerca"); }} className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
                  Acerca de
                </button>
                <button onClick={() => { setMenuOpen(false); navigate("/infoExtra/contacto"); }} className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
                  Contacto
                </button>
              </div>
            )}
          </div>
          <div className="hidden md:flex space-x-6">
            <button onClick={() => navigate("/infoExtra/acerca")} className="text-white font-medium hover:underline">
              Acerca de
            </button>
            <button onClick={() => navigate("/infoExtra/contacto")} className="text-white font-medium hover:underline">
              Contacto
            </button>
          </div>
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center flex-1 px-6 py-8 md:px-8">
        <div className="mb-6 animate-zoom-in">
          <img src={require("./logo.png")} alt="Logo AlzhTrack" className="w-32 h-32 mx-auto" />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 text-center mb-4 animate-fade-in">
          AlzhTrack
        </h1>
        <p className="text-center text-gray-600 text-base md:text-xl mb-8 max-w-md animate-fade-in delay-200">
          Uniendo tecnología y cuidado para brindar monitoreo remoto y tranquilidad.
        </p>
        <div className="animate-bounce-in">
          <button
            onClick={() => navigate("/auth")}
            className="bg-[#9BDCFD] hover:bg-[#00DDDD] text-black font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:-translate-y-1 hover:scale-105"
          >
            Accede a la plataforma
          </button>
        </div>
      </main>

      <style>
        {`
          @keyframes zoom-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-zoom-in {
            animation: zoom-in 0.7s cubic-bezier(.4,0,.2,1) both;
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 1s both;
          }
          .delay-200 {
            animation-delay: 0.2s;
          }
          @keyframes bounce-in {
            0% { transform: scale(0.7); opacity: 0; }
            60% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); }
          }
          .animate-bounce-in {
            animation: bounce-in 0.5s both;
          }
        `}
      </style>
    </div>
  );
}
