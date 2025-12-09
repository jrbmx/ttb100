import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import './DoubleSliderForm.css'; // Importante

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const ResetPassword = () => {
  const query = useQuery();
  const token = query.get("token") || "";
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [msg, setMsg] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const API = process.env.REACT_APP_API_URL || "http://localhost:3000";

  const inputClass = "w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#24E3D6] transition-all duration-300 border-gray-300 bg-white placeholder-gray-400 text-gray-700";
  const buttonClass = "w-full bg-[#9BDCFD] hover:bg-[#3f535e] text-gray-800 hover:text-[#e0f7fa] font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:scale-101 focus:outline-none focus:ring-4 focus:ring-[#00DDDD]/40 uppercase text-xs tracking-wider mt-4";

  const passwordCriteria = {
    minLength: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_\-+]/.test(password),
  };
  const passwordValid = Object.values(passwordCriteria).every(v => v);
  const passwordsMatch = password === password2;

  // Componente interno con transición de color suave
  const RequirementItem = ({ met, text }) => (
    <div className={`flex items-center space-x-2 text-xs transition-colors duration-500 ease-in-out ${met ? "text-teal-600 font-bold" : "text-gray-400"}`}>
        {met ? (
             <svg className="w-4 h-4 text-[#00DDDD] animate-appear" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        ) : (
             <div className="w-3 h-3 rounded-full border-2 border-gray-300 ml-0.5 transition-all duration-300"></div>
        )}
        <span>{text}</span>
    </div>
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError(false);

    if (!passwordValid || !passwordsMatch) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/cuidadores/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMsg(data.mensaje || "¡Contraseña actualizada con éxito!");
        setError(false);
        setTimeout(() => navigate("/auth"), 2500); 
      } else {
        setMsg(data.mensaje || "El enlace ha expirado o es inválido.");
        setError(true);
      }
    } catch {
      setMsg("Error de red. Inténtalo más tarde.");
      setError(true);
    } finally {
        setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-sans" style={{ background: "linear-gradient(to bottom right, #e0f7fa, #b2ebf2)" }}>
        <div className="bg-white p-8 rounded-[25px] shadow-2xl w-full max-w-md text-center animate-fade-in-up">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-appear">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Enlace inválido</h2>
            <p className="text-gray-500 mb-6 text-sm">No se encontró el token de seguridad. Es posible que el enlace haya expirado.</p>
            <button onClick={() => navigate("/auth")} className={buttonClass}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans" style={{ background: "linear-gradient(to bottom right, #e0f7fa, #b2ebf2)" }}>
      <div className="bg-white p-8 rounded-[25px] shadow-2xl w-full max-w-md animate-fade-in-up">
        
        <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Nueva contraseña</h2>
            <p className="text-gray-500 text-sm">Crea una contraseña segura para tu cuenta.</p>
        </div>

        <form onSubmit={onSubmit}>
          
          <div className="relative mb-4">
            <label className="block font-semibold text-gray-700 mb-2 text-left text-sm ml-1">Contraseña</label>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    className={inputClass}
                    placeholder="Mínimo 8 caracteres"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#00DDDD] transition duration-200">
                    {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block font-semibold text-gray-700 mb-2 text-left text-sm ml-1">Confirmar Contraseña</label>
            <input
                type="password"
                className={`${inputClass} mb-1`}
                placeholder="Repite tu contraseña"
                required
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
            />
            {password2 && !passwordsMatch && <p className="text-xs text-red-500 pl-1 animate-appear">Las contraseñas no coinciden</p>}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 grid grid-cols-2 gap-2 mb-4">
                <RequirementItem met={passwordCriteria.minLength} text="8+ Caracteres" />
                <RequirementItem met={passwordCriteria.uppercase} text="Mayúscula" />
                <RequirementItem met={passwordCriteria.number} text="Número" />
                <RequirementItem met={passwordCriteria.special} text="Símbolo" />
          </div>

          <button
            type="submit"
            disabled={!passwordValid || !passwordsMatch || loading}
            className={`${buttonClass} ${(!passwordValid || !passwordsMatch || loading) ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                    Actualizando...
                </span>
            ) : "Guardar contraseña"}
          </button>
        </form>

        {msg && (
          <div className={`mt-6 p-3 rounded-lg text-sm font-medium text-center animate-appear ${error ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"}`}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;