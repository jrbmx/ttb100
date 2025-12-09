import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import './DoubleSliderForm.css';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialRegisterState = {
  nombre: "", apellidoP: "", apellidoM: "", email: "", telefono: "", password: "", confirmPassword: ""
};

export default function Authentication() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  // UI States
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); 

  // Form States
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginTouched, setLoginTouched] = useState({ email: false, password: false });
  const [loginLoading, setLoginLoading] = useState(false);
  
  const [step, setStep] = useState(1);
  const [registerForm, setRegisterForm] = useState(initialRegisterState);
  const [registerTouched, setRegisterTouched] = useState({});
  const [registerLoading, setRegisterLoading] = useState(false);
  
  const [popup, setPopup] = useState({ show: false, success: false, message: "" });

  const registerPanelRef = useRef(null);
  const loginPanelRef = useRef(null);

  useEffect(() => {
    // Accesibilidad
    if (registerPanelRef.current && loginPanelRef.current) {
        if (isRightPanelActive) {
            loginPanelRef.current.setAttribute('inert', '');
            registerPanelRef.current.removeAttribute('inert');
        } else {
            registerPanelRef.current.setAttribute('inert', '');
            loginPanelRef.current.removeAttribute('inert');
        }
    }
    // Resets
    setLoginForm({ email: "", password: "" });
    setLoginTouched({ email: false, password: false });
    setRegisterForm(initialRegisterState);
    setRegisterTouched({});
    setStep(1);
    setShowPassword(false);
  }, [isRightPanelActive]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  
  const showPopup = (success, message) => {
    setPopup({ show: true, success, message });
    setTimeout(() => setPopup({ show: false, success: false, message: "" }), 2500);
  };

  // --- Handlers ---
  const handleLoginChange = (e) => setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  const handleLoginBlur = (e) => setLoginTouched({ ...loginTouched, [e.target.name]: true });
  const isLoginEmailValid = emailRegex.test(loginForm.email);
  const isLoginEmailEmpty = loginForm.email.trim() === "";
  const isLoginPasswordEmpty = loginForm.password.trim() === "";

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginTouched({ email: true, password: true });
    if (!isLoginEmailValid || isLoginEmailEmpty || isLoginPasswordEmpty) return;

    setLoginLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cuidadores/login`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        showPopup(true, "Inicio de sesión exitoso");
        setTimeout(() => { login(data.cuidador, data.token, rememberMe); navigate("/dashboard"); }, 1500);
      } else {
        showPopup(false, data.mensaje || "Error al iniciar sesión");
      }
    } catch (err) { showPopup(false, "No se pudo conectar al servidor."); } finally { setLoginLoading(false); }
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    if (name === "telefono" && (!/^\d*$/.test(value) || value.length > 10)) return;
    setRegisterForm({ ...registerForm, [name]: value });
  };
  const handleRegisterBlur = (e) => setRegisterTouched({ ...registerTouched, [e.target.name]: true });
  const isEmailValid = emailRegex.test(registerForm.email);
  const passwordsMatch = registerForm.password === registerForm.confirmPassword;
  const passwordCriteria = {
    minLength: registerForm.password.length >= 8,
    lowercase: /[a-z]/.test(registerForm.password),
    uppercase: /[A-Z]/.test(registerForm.password),
    number: /\d/.test(registerForm.password),
    special: /[!@#$%^&*(),.?":{}|<>_\-+]/.test(registerForm.password),
  };
  const passwordValid = Object.values(passwordCriteria).every(v => v);

  const handleRegisterNext = (e) => {
    e.preventDefault();
    setRegisterTouched({ ...registerTouched, email: true, nombre: true, apellidoP: true });
    const isStep1Valid = isEmailValid && registerForm.nombre.trim() !== "" && registerForm.apellidoP.trim() !== "";
    if (isStep1Valid) setStep(2);
    else showPopup(false, "Completa los campos obligatorios (*).");
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch || !passwordValid) return;
    setRegisterLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cuidadores/register`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (res.ok) {
        showPopup(true, "Registro exitoso.");
        setTimeout(() => { setIsRightPanelActive(false); }, 1800);
      } else { showPopup(false, data.mensaje || "Error al registrar"); }
    } catch (err) { showPopup(false, "Error de conexión"); } finally { setRegisterLoading(false); }
  };

  const inputClass = "w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#24E3D6] transition-all duration-300 border-gray-300 bg-white placeholder-gray-400 text-gray-700";
  const errorInputClass = "border-red-500 focus:ring-red-400";
  const primaryButtonClass = "w-full mx-auto bg-[#9BDCFD] hover:bg-[#3f535e] text-gray-800 hover:text-[#e0f7fa] font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:scale-101 focus:outline-none focus:ring-4 focus:ring-[#00DDDD]/40 flex items-center justify-center cursor-pointer uppercase text-xs tracking-wider mt-4";

  const RequirementItem = ({ met, text }) => (
    <div className={`flex items-center space-x-2 text-xs transition-colors duration-300 ${met ? "text-teal-600 font-bold" : "text-gray-400"}`}>
        {met ? <span className="text-[#00DDDD]">✓</span> : <span className="w-2 h-2 rounded-full border border-gray-300"></span>}
        <span>{text}</span>
    </div>
  );

  return (
    <>
    <div className="auth-wrapper">
      <div className="fixed top-5 left-5 z-[1100]">
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 bg-white rounded-md shadow focus:outline-none hover:text-[#00DDDD] transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          {menuOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 animate-slide-down bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <Link to="/infoExtra/acerca" className="block px-4 py-2 hover:bg-gray-50 text-gray-700">Acerca de</Link>
              <Link to="/contacto" className="block px-4 py-2 hover:bg-gray-50 text-gray-700">Contacto</Link>
            </div>
          )}
        </div>
      </div>

      <div className={`auth-container ${isRightPanelActive ? "right-panel-active" : ""} animate-appear`} id="container">
        
        {/* --- PESTAÑAS MÓVILES (Reincorporadas) --- */}
        <div className="mobile-tabs-container">
            <button 
                className={`mobile-tab ${!isRightPanelActive ? 'active' : ''}`} 
                onClick={() => setIsRightPanelActive(false)}
            >
                INICIAR SESIÓN
            </button>
            <button 
                className={`mobile-tab ${isRightPanelActive ? 'active' : ''}`} 
                onClick={() => setIsRightPanelActive(true)}
            >
                REGISTRARSE
            </button>
        </div>

        {/* --- FORMULARIO REGISTRO --- */}
        <div className="form-container sign-up-container" ref={registerPanelRef}>
          <form onSubmit={(e)=>e.preventDefault()} className="h-full flex flex-col justify-center items-center"> 
            <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-4 tracking-tight">AlzhTrack</h1>
            <p className="text-center text-gray-600 mb-8 text-sm">Crea tu cuenta de cuidador.</p>
            
            <div className="w-full max-w-[350px] overflow-hidden">
                <div className="flex w-[200%] transition-transform duration-500 ease-in-out" style={{ transform: step === 1 ? 'translateX(0%)' : 'translateX(-50%)' }}>
                    {/* PASO 1 */}
                    <div className="w-1/2 flex-shrink-0 px-1 py-1">
                        <div className="mb-3">
                            <input type="email" name="email" placeholder="Correo electrónico *" value={registerForm.email} onChange={handleRegisterChange} onBlur={handleRegisterBlur} className={`${inputClass} ${registerTouched.email && (!isEmailValid) ? errorInputClass : ""}`} />
                            {registerTouched.email && !isEmailValid && <p className="text-xs text-red-500 mt-1 text-left">Correo inválido</p>}
                        </div>
                        <input type="text" name="nombre" placeholder="Nombre(s) *" value={registerForm.nombre} onChange={handleRegisterChange} className={`${inputClass} mb-3`} />
                        <input type="text" name="apellidoP" placeholder="Apellido Paterno *" value={registerForm.apellidoP} onChange={handleRegisterChange} className={`${inputClass} mb-3`} />
                        <input type="text" name="apellidoM" placeholder="Apellido Materno (Opcional)" value={registerForm.apellidoM} onChange={handleRegisterChange} className={`${inputClass} mb-3`} />
                        <button type="button" onClick={handleRegisterNext} className={primaryButtonClass}>Siguiente</button>
                    </div>

                    {/* PASO 2 */}
                    <div className="w-1/2 flex-shrink-0 px-1 py-1">
                        <input type="tel" name="telefono" placeholder="Teléfono (10 dígitos)" value={registerForm.telefono} onChange={handleRegisterChange} className={`${inputClass} mb-3`} />
                        <div className="relative mb-3">
                            <input type={showPassword ? "text" : "password"} name="password" placeholder="Contraseña" value={registerForm.password} onChange={handleRegisterChange} className={inputClass} />
                            <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#00DDDD] transition">
                                {showPassword ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
                        </div>
                        <div className="mb-3">
                            <input type="password" name="confirmPassword" placeholder="Confirmar contraseña" value={registerForm.confirmPassword} className={`${inputClass} mb-1`} onChange={handleRegisterChange} />
                            {registerForm.confirmPassword && !passwordsMatch && <p className="text-xs text-red-500 text-left pl-1">Las contraseñas no coinciden</p>}
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 grid grid-cols-2 gap-2 mb-2">
                            <RequirementItem met={passwordCriteria.minLength} text="8+ Caracteres" />
                            <RequirementItem met={passwordCriteria.uppercase} text="Mayúscula" />
                            <RequirementItem met={passwordCriteria.number} text="Número" />
                            <RequirementItem met={passwordCriteria.special} text="Símbolo" />
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setStep(1)} className="w-1/2 bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 focus:outline-none transition-all duration-200 text-xs uppercase tracking-wider mt-2">Atrás</button>
                            <button type="button" onClick={handleRegisterSubmit} disabled={!passwordValid || !passwordsMatch || registerLoading} className={`w-1/2 bg-[#9BDCFD] hover:bg-[#3f535e] text-gray-800 hover:text-[#e0f7fa] font-bold py-3 rounded-lg shadow-md transition-all duration-300 uppercase text-xs tracking-wider mt-2 ${(!passwordValid || !passwordsMatch || registerLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {registerLoading ? "..." : "Registrar"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <p className="mobile-toggle-text text-center mt-6">
              ¿Ya tienes cuenta? <span onClick={() => setIsRightPanelActive(false)} className="text-[#00DDDD] font-bold cursor-pointer hover:underline">Inicia sesión</span>
            </p>
          </form>
        </div>

        {/* --- FORMULARIO LOGIN --- */}
        <div className="form-container sign-in-container" ref={loginPanelRef}>
          <form onSubmit={handleLoginSubmit} className="h-full flex flex-col justify-center items-center">
            <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-4 tracking-tight">AlzhTrack</h1>
            <p className="text-center text-gray-600 mb-8">Ingresa a tu cuenta para acceder.</p>
            
            <div className="w-full max-w-[350px]">
                <div className="mb-5">
                    <label className="block font-semibold text-gray-700 mb-2 text-left text-sm ml-1">Correo electrónico</label>
                    <input type="email" name="email" placeholder="ejemplo@correo.com" value={loginForm.email} onChange={handleLoginChange} onBlur={handleLoginBlur} className={`${inputClass} ${loginTouched.email && (!isLoginEmailValid || isLoginEmailEmpty) ? errorInputClass : ""}`} />
                     {loginTouched.email && isLoginEmailEmpty && <p className="text-xs text-red-500 mt-1 text-left">Campo requerido</p>}
                </div>
                
                <div className="relative mb-5">
                    <label className="block font-semibold text-gray-700 mb-2 text-left text-sm ml-1">Contraseña</label>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} name="password" placeholder="Introduce tu contraseña" value={loginForm.password} onChange={handleLoginChange} onBlur={handleLoginBlur} className={`${inputClass} ${loginTouched.password && isLoginPasswordEmpty ? errorInputClass : ""}`} />
                        <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#00DDDD] transition">
                            {showPassword ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                        </button>
                    </div>
                    {loginTouched.password && isLoginPasswordEmpty && <p className="text-xs text-red-500 mt-1 text-left">Campo requerido</p>}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="mr-2 rounded text-[#00DDDD] focus:ring-[#00DDDD] cursor-pointer" />
                        Mantener sesión iniciada
                    </label>
                </div>

                <button type="submit" disabled={loginLoading} className={`${primaryButtonClass} mt-4`}>
                    {loginLoading ? "Cargando..." : "Iniciar Sesión"}
                </button>
                <div className="text-right mt-4">
                    <Link to="/forgot-password" className="text-sm text-cyan-600 hover:underline">¿Olvidaste tu contraseña?</Link>
                </div>
            </div>

            <p className="mobile-toggle-text text-center mt-6">
              ¿No tienes cuenta? <span onClick={() => setIsRightPanelActive(true)} className="text-[#00DDDD] font-bold cursor-pointer hover:underline">Regístrate</span>
            </p>
          </form>
        </div>

        {/* --- OVERLAY --- */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>¡Bienvenido de nuevo!</h1>
              <p>Accede a tu espacio de monitoreo ingresando tu correo electrónico y contraseña.</p>
              <button className="ghost" onClick={() => setIsRightPanelActive(false)}>Iniciar Sesión</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>¡Bienvenido a la plataforma!</h1>
              <p>Queremos ayudarte a cuidar mejor de tus pacientes. Por favor, ingresa tus datos para comenzar.</p>
              <button className="ghost" onClick={() => { setIsRightPanelActive(true); }}>Registrarse</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* POPUP */}
      {popup.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-[9999] animate-popup-fade" onClick={() => setPopup({ ...popup, show: false })}>
          <div className="bg-white rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center animate-fade-in-up min-w-[280px] scale-105 relative" onClick={e => e.stopPropagation()}>
            <span className={`text-lg font-semibold ${popup.success ? "text-green-600" : "text-red-600"}`}>{popup.message}</span>
          </div>
        </div>
      )}
      </div>
    </>
  );
}