import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './DoubleSliderForm.css'; // Importante para las animaciones

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const API = process.env.REACT_APP_API_URL || "http://localhost:3000";

  const inputClass = "w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#24E3D6] transition-all duration-300 border-gray-300 bg-white placeholder-gray-400 text-gray-700 mb-4";
  const buttonClass = "w-full bg-[#9BDCFD] hover:bg-[#3f535e] text-gray-800 hover:text-[#e0f7fa] font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:scale-101 focus:outline-none focus:ring-4 focus:ring-[#00DDDD]/40 uppercase text-xs tracking-wider";

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError(false);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/cuidadores/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMsg(data.mensaje || "Revisa tu correo, hemos enviado un enlace.");
        setError(false);
      } else {
        setMsg(data.mensaje || "No se encontró una cuenta con este correo.");
        setError(true);
      }
    } catch {
      setMsg("Error de red. Inténtalo más tarde.");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans" style={{ background: "linear-gradient(to bottom right, #e0f7fa, #b2ebf2)" }}>
      {/* TARJETA CON ANIMACIÓN DE ENTRADA (animate-fade-in-up) */}
      <div className="bg-white p-8 rounded-[25px] shadow-2xl w-full max-w-md relative animate-fade-in-up">
        
        {/* Botón Volver con Micro-interacción (hover:-translate-x-1) */}
        <button 
            onClick={() => navigate(-1)} 
            className="absolute top-5 left-5 text-gray-400 hover:text-[#00DDDD] transition-all duration-300 transform hover:-translate-x-1"
            title="Volver"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>

        <div className="text-center mb-8 mt-2">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Recuperar contraseña</h2>
            <p className="text-gray-500 text-sm">
            Ingresa tu correo para recibir las instrucciones.
            </p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="mb-2">
            <label className="block font-semibold text-gray-700 mb-2 text-left text-sm ml-1">Correo electrónico</label>
            <input
                type="email"
                className={inputClass}
                placeholder="ejemplo@correo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${buttonClass} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                    Enviando...
                </span>
            ) : "Enviar enlace"}
          </button>
        </form>

        {/* Mensaje con animación de aparición suave */}
        {msg && (
          <div className={`mt-6 p-3 rounded-lg text-sm font-medium text-center animate-appear ${error ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"}`}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;