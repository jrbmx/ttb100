import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import './DoubleSliderForm.css';
import { Link } from "react-router-dom";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function DoubleSliderForm() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // Nuevo estado para el menú

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginTouched, setLoginTouched] = useState({ email: false, password: false });
  const [loginLoading, setLoginLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, success: false, message: "" });

  const [step, setStep] = useState(1);
  const [registerForm, setRegisterForm] = useState({
    nombre: "",
    apellidoP: "",
    apellidoM: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: ""
  });
  const [registerTouched, setRegisterTouched] = useState({});
  const [registerLoading, setRegisterLoading] = useState(false);

  const [animateEntry, setAnimateEntry] = useState(false);
  useEffect(() => {
    setAnimateEntry(true);
    const timeout = setTimeout(() => setAnimateEntry(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  // Login handlers
  // Login handlers
  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };
  const handleLoginBlur = (e) => {
    setLoginTouched({ ...loginTouched, [e.target.name]: true });
  };
  const isLoginEmailValid = emailRegex.test(loginForm.email);
  const isLoginEmailEmpty = loginForm.email.trim() === "";
  const isLoginPasswordEmpty = loginForm.password.trim() === "";
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginTouched({ email: true, password: true });
    if (!isLoginEmailValid || isLoginEmailEmpty || isLoginPasswordEmpty) return;
  
    setLoginLoading(true);
    setPopup({ show: false, success: false, message: "" });
  
    try {
      const res = await fetch("http://localhost:3000/api/cuidadores/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
    
      const data = await res.json();
    
      if (res.ok) {
        if (!data.token) {
          setPopup({
            show: true,
            success: false,
            message: "El servidor no envió token. Revisa el backend.",
          });
          setLoginLoading(false);
          return;
        }
      
        setPopup({
          show: true,
          success: true,
          message: "Inicio de sesión exitoso",
        });
        setTimeout(() => {
          setPopup({ show: false, success: false, message: "" });
          // 👇 ahora sí guardamos cuidador + token
          login(data.cuidador, data.token);
          navigate("/dashboard");
        }, 1500);
      } else {
        setPopup({
          show: true,
          success: false,
          message: data.mensaje || "Error al iniciar sesión",
        });
        setLoginLoading(false);
        setTimeout(() => {
          setPopup({ show: false, success: false, message: "" });
          navigate("/auth");
        }, 2000);
      }
    } catch (err) {
      setPopup({
        show: true,
        success: false,
        message: "No se pudo conectar al servidor.",
      });
      setLoginLoading(false);
      setTimeout(() => {
        setPopup({ show: false, success: false, message: "" });
        navigate("/auth");
      }, 2000);
    }
  };

  // Registro handlers
  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };
  const handleRegisterBlur = (e) => {
    setRegisterTouched({ ...registerTouched, [e.target.name]: true });
  };

  // Validaciones registro
  const isEmailValid = emailRegex.test(registerForm.email);
  const isEmailEmpty = registerForm.email.trim() === "";
  const isNombreEmpty = registerForm.nombre.trim() === "";
  const isApellidoPEmpty = registerForm.apellidoP.trim() === "";
  const isApellidoMEmpty = registerForm.apellidoM.trim() === "";
  const isTelefonoEmpty = registerForm.telefono.trim() === "";
  const isPasswordEmpty = registerForm.password.trim() === "";
  const isConfirmPasswordEmpty = registerForm.confirmPassword.trim() === "";
  const passwordsMatch = registerForm.password === registerForm.confirmPassword;

  const step1Valid = isEmailValid && !isEmailEmpty && !isNombreEmpty && !isApellidoPEmpty && !isApellidoMEmpty;
  const step2Valid = !isTelefonoEmpty && !isPasswordEmpty && !isConfirmPasswordEmpty && passwordsMatch;

  const handleRegisterNext = (e) => {
    e.preventDefault();
    setRegisterTouched({
      ...registerTouched,
      email: true,
      nombre: true,
      apellidoP: true,
      apellidoM: true,
    });
    if (step1Valid) setStep(2);
  };

  const handleRegisterBack = (e) => {
    e.preventDefault();
    setStep(1);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterTouched({
      ...registerTouched,
      telefono: true,
      password: true,
      confirmPassword: true,
    });
    if (!step2Valid) return;

    setRegisterLoading(true);
    setPopup({ show: false, success: false, message: "" });

    try {
      const res = await fetch("http://localhost:3000/api/cuidadores/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });

      const data = await res.json();

      if (res.ok) {
        setPopup({
          show: true,
          success: true,
          message: "Registro exitoso, inicia sesión",
        });
        setTimeout(() => {
          setPopup({ show: false, success: false, message: "" });
          setIsRightPanelActive(false);
          setStep(1);
          setRegisterForm({
            nombre: "",
            apellidoP: "",
            apellidoM: "",
            email: "",
            telefono: "",
            password: "",
            confirmPassword: ""
          });
        }, 1800);
      } else {
        setPopup({
          show: true,
          success: false,
          message: data.mensaje || "Error al registrar cuidador",
        });
        setRegisterLoading(false);
      }
    } catch (err) {
      setPopup({
        show: true,
        success: false,
        message: "No se pudo conectar al servidor.",
      });
      setRegisterLoading(false);
    }
  };

  const passwordCriteria = {
    lowercase: /[a-z]/.test(registerForm.password),
    uppercase: /[A-Z]/.test(registerForm.password),
    number: /[0-9]/.test(registerForm.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(registerForm.password),
    minLength: registerForm.password.length >= 8,
  };
  const passwordValid = Object.values(passwordCriteria).every(value => value);

  return (
    <>
      <div style={{ position: "fixed", top: "20px", left: "20px", zIndex: 1100 }}>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-md focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 animate-slide-down bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <a href="/infoExtra/acerca" className="block px-2 py-1 hover:underline" onClick={() => setMenuOpen(false)}>Acerca de</a>
              <a href="/contacto" className="block px-2 py-1 hover:underline" onClick={() => setMenuOpen(false)}>Contacto</a>
            </div>
          )}
        </div>
      </div>
      <div
        className={`bg-white w-full max-w-3xl h-[90vh] min-h-[500px] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-fade-in-up container ${isRightPanelActive ? "right-panel-active" : ""} animate-appear`}
        id="container"
        style={{ margin: "5vh auto" }}
      >
        {/* Registro */}
        <div className="form-container sign-up-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form
            className="space-y-2"
            onSubmit={step === 2 ? handleRegisterSubmit : handleRegisterNext}
            style={{ width: "100%", maxWidth: 480, margin: "0 auto" }} // ancho limitado y centrado
          >
            <h1 className="text-3xl font-extrabold text-center text-gray-800 tracking-tight">
              AlzhTrack
            </h1>
            <p className="text-center text-gray-600">
              Crea tu cuenta de cuidador para acceder al sistema de monitoreo.
            </p>
            {step === 1 && (
              <>
                <div>
                  <label className="block text-gray-700 font-medium">Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    onBlur={handleRegisterBlur}
                    className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#24E3D6] transition-all duration-300 ${
                      registerTouched.email && (!isEmailValid || isEmailEmpty)
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="cuidador@correo.com"
                    required
                  />
                  {registerTouched.email && isEmailEmpty && (
                    <p className="text-xs text-red-500 mt-1">El correo es obligatorio.</p>
                  )}
                  {registerTouched.email && !isEmailEmpty && !isEmailValid && (
                    <p className="text-xs text-red-500 mt-1">Introduce un correo electrónico válido.</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={registerForm.nombre}
                    onChange={handleRegisterChange}
                    onBlur={handleRegisterBlur}
                    className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#24E3D6] transition-all duration-300 ${
                      registerTouched.nombre && isNombreEmpty
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Nombre(s)"
                    required
                  />
                  {registerTouched.nombre && isNombreEmpty && (
                    <p className="text-xs text-red-500 mt-1">El nombre es obligatorio.</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Apellido paterno</label>
                  <input
                    type="text"
                    name="apellidoP"
                    value={registerForm.apellidoP}
                    onChange={handleRegisterChange}
                    onBlur={handleRegisterBlur}
                    className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#24E3D6] transition-all duration-300 ${
                      registerTouched.apellidoP && isApellidoPEmpty
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Apellido paterno"
                    required
                  />
                  {registerTouched.apellidoP && isApellidoPEmpty && (
                    <p className="text-xs text-red-500 mt-1">El apellido paterno es obligatorio.</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Apellido materno</label>
                  <input
                    type="text"
                    name="apellidoM"
                    value={registerForm.apellidoM}
                    onChange={handleRegisterChange}
                    onBlur={handleRegisterBlur}
                    className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#24E3D6] transition-all duration-300 ${
                      registerTouched.apellidoM && isApellidoMEmpty
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Apellido materno"
                    required
                  />
                  {registerTouched.apellidoM && isApellidoMEmpty && (
                    <p className="text-xs text-red-500 mt-1">El apellido materno es obligatorio.</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-5/6 mx-auto bg-[#9BDCFD] hover:bg-[#3f535e] text-gray-800 hover:text-[#e0f7fa] font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:scale-101 focus:outline-none focus:ring-4 focus:ring-[#00DDDD]/40 flex items-center justify-center"
                >
                  Siguiente
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-gray-700 font-medium">Número telefónico</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={registerForm.telefono}
                    onChange={handleRegisterChange}
                    onBlur={handleRegisterBlur}
                    className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#24E3D6] transition-all duration-300 ${
                      registerTouched.telefono && isTelefonoEmpty
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="55XXXXXXXX"
                    required
                  />
                  {registerTouched.telefono && isTelefonoEmpty && (
                    <p className="text-xs text-red-500 mt-1">El teléfono es obligatorio.</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    onBlur={handleRegisterBlur}
                    className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#24E3D6] transition-all duration-300 ${
                      registerTouched.password && isPasswordEmpty
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Crea una contraseña"
                    required
                  />
                  {registerTouched.password && isPasswordEmpty && (
                    <p className="text-xs text-red-500 mt-1">La contraseña es obligatoria.</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Confirmar contraseña</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
                    onBlur={handleRegisterBlur}
                    className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#24E3D6] transition-all duration-300 ${
                      registerTouched.confirmPassword && (isConfirmPasswordEmpty || !passwordsMatch)
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Confirma tu contraseña"
                    required
                  />
                  {registerTouched.confirmPassword && isConfirmPasswordEmpty && (
                    <p className="text-xs text-red-500 mt-1">La confirmación es obligatoria.</p>
                  )}
                  {registerTouched.confirmPassword && !isConfirmPasswordEmpty && !passwordsMatch && (
                    <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden.</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">Requisitos de la contraseña:</p>
                  <ul className="text-xs ml-4">
                    <li className={passwordCriteria.lowercase ? "text-green-500" : "text-red-500"}>
                      {passwordCriteria.lowercase ? "✔" : "✖"} Una letra minúscula
                    </li>
                    <li className={passwordCriteria.uppercase ? "text-green-500" : "text-red-500"}>
                      {passwordCriteria.uppercase ? "✔" : "✖"} Una letra mayúscula
                    </li>
                    <li className={passwordCriteria.number ? "text-green-500" : "text-red-500"}>
                      {passwordCriteria.number ? "✔" : "✖"} Un número
                    </li>
                    <li className={passwordCriteria.special ? "text-green-500" : "text-red-500"}>
                      {passwordCriteria.special ? "✔" : "✖"} Un carácter especial
                    </li>
                    <li className={passwordCriteria.minLength ? "text-green-500" : "text-red-500"}>
                      {passwordCriteria.minLength ? "✔" : "✖"} Mínimo 8 caracteres
                    </li>
                  </ul>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleRegisterBack}
                    className="w-1/2 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none transition-all duration-200"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 mx-auto bg-[#9BDCFD] hover:bg-[#3f535e] text-gray-800 font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#00DDDD]/40 flex items-center justify-center"
                    disabled={!passwordValid || registerLoading}
                  >
                    {registerLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-[#00DDDD]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="#00DDDD" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        Registrando...
                      </span>
                    ) : (
                      "Registrarse"
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Login */}
        <div className="form-container sign-in-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form
            className='space-y-2'
            onSubmit={handleLoginSubmit}
          >
            <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-2 tracking-tight">AlzhTrack</h1>
            <p className="text-center text-gray-600 mb-6">
              Ingresa a tu cuenta para acceder a la plataforma de monitoreo
            </p>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                onBlur={handleLoginBlur}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-4 focus:ring-[#00DDDD]/40 transition-all duration-300 shadow-sm hover:shadow-md ${
                  loginTouched.email && (isLoginEmailEmpty || !isLoginEmailValid)
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
                autoComplete="username"
                placeholder="ejemplo@correo.com"
              />
              {loginTouched.email && isLoginEmailEmpty && (
                <p className="text-xs text-red-500 mt-1">El correo es obligatorio.</p>
              )}
              {loginTouched.email && !isLoginEmailEmpty && !isLoginEmailValid && (
                <p className="text-xs text-red-500 mt-1">Introduce un correo electrónico válido.</p>
              )}
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                onBlur={handleLoginBlur}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-4 focus:ring-[#00DDDD]/40 transition-all duration-300 shadow-sm hover:shadow-md ${
                  loginTouched.password && isLoginPasswordEmpty
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
                autoComplete="current-password"
                placeholder="Introduce tu contraseña"
              />
              {loginTouched.password && isLoginPasswordEmpty && (
                <p className="text-xs text-red-500 mt-1">La contraseña es obligatoria.</p>
              )}
            </div>
            <button
              type="submit"
              className="w-5/6 mx-auto bg-[#9BDCFD] hover:bg-[#06354f] text-gray-800 hover:text-[#e0f7fa] font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#00DDDD]/40 flex items-center justify-center mt-6"
              disabled={loginLoading}
            >
              {loginLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-6 w-6 mr-2 text-[#00DDDD]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                    <path className="opacity-75" fill="#00DDDD" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-cyan-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
              </div>
          </form>
        </div>

        {/* Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>¡Bienvenido de nuevo!</h1>
              <p>Accede a tu espacio de monitoreo ingresando tu correo electrónico y contraseña.</p>
              <button className="ghost" onClick={() => { setIsRightPanelActive(false); }}>
                Iniciar sesión
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>¡Bienvenido a la plataforma!</h1>
              <p>Queremos ayudarte a cuidar mejor de tus pacientes. Por favor, ingresa tus datos para comenzar.</p>
              <button className="ghost" onClick={() => { setIsRightPanelActive(true); setStep(1); }}>
                Regístrate
              </button>
            </div>
          </div>
        </div>

        {/* Popup de notificación */}
        {popup.show && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 animate-popup-fade"
            style={{ zIndex: 9999 }} // colocado sobre el overlay
            onClick={() => setPopup({ ...popup, show: false })}
          >
            <div
              className="bg-white rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center animate-fade-in-up min-w-[280px] scale-105 relative"
              onClick={e => e.stopPropagation()}
            >
              {popup.success ? (
                <svg className="w-14 h-14 text-green-500 mb-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#d1fae5"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" stroke="#22c55e"/>
                </svg>
              ) : (
                <svg className="w-14 h-14 text-red-500 mb-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#fee2e2"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9l-6 6m0-6l6 6" stroke="#ef4444"/>
                </svg>
              )}
              <span className={`text-lg font-semibold ${popup.success ? "text-green-600" : "text-red-600"}`}>
                {popup.message}
              </span>
            </div>
          </div>
        )}
        {/* Animaciones personalizadas */}
        <style>
          {`
            @keyframes xd-highlight {
              0% { box-shadow: 0 0 0 0 #00DDDD55; }
              40% { box-shadow: 0 0 40px 10px #00DDDD55; }
              100% { box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);}
            }
            .animate-xd-highlight {
              animation: xd-highlight 1s cubic-bezier(.4,0,.2,1);
            }
            @keyframes appear {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
            .animate-appear {
              animation: appear 0.7s ease-out both;
            }
            @keyframes slideDown {
              0% {
                opacity: 0;
                transform: translateY(-10px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-slide-down {
              animation: slideDown 0.3s ease-out both;
            }
          `}
        </style>
      </div>
    </>
  );
}
