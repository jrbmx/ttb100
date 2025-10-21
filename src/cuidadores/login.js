import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // función login del contexto
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const API = process.env.REACT_APP_API_URL || "http://localhost:3000";

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/api/cuidadores/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (!data.token) {
          alert("El servidor no envió token. Verifica el backend.");
          return;
        }
        login(data.cuidador, data.token); // pasar token al contexto
        alert("Inicio de sesión exitoso");
        navigate("/dashboard");
      }

    } catch (err) {
      console.error("Error de red:", err);
      alert("No se pudo conectar al servidor.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-[#00DDDD] py-4 shadow-md flex justify-between items-center px-4">
        <img
          src={require("../logo.png")}
          alt="Logo"
          className="w-12 h-12 rounded-full"
        />
        <div className="relative">
          <button onClick={toggleMenu} className="text-gray-800 focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50">
              <button
                onClick={() => navigate("/acerca")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Acerca de
              </button>
              <button
                onClick={() => navigate("/contacto")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Contacto
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex flex-1 justify-center items-center px-4">
        <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            AlzhTrack
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Ingresa a tu cuenta para acceder a la plataforma de monitoreo
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold text-gray-700">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00DDDD]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00DDDD]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#9BDCFD] hover:bg-[#82d1fb] text-gray-800 font-bold py-2 px-4 rounded-md transition duration-200"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="text-center text-sm text-gray-600 mt-4">
            <p
              className="mb-1 hover:underline cursor-pointer"
              onClick={() => navigate("/forgot-password")}
            >
              ¿Olvidaste tu contraseña?
            </p>
            <p>
              ¿No tienes una cuenta?{" "}
              <span
                className="font-bold text-gray-800 hover:underline cursor-pointer"
                onClick={() => navigate("/cuidadores/registro")}
              >
                Regístrate Aquí
              </span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
