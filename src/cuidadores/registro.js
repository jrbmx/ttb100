import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellidoP: "",
    apellidoM: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: ""
  });

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (form.password !== form.confirmPassword) {
    alert("Las contraseñas no coinciden");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/cuidadores/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Registro exitoso, inicia sesión");
      navigate("/cuidadores/login");
    } else {
      alert(data.mensaje || "Error al registrar cuidador");
    }
  } catch (err) {
    console.error("Error de red:", err);
    alert("No se pudo conectar al servidor.");
  }
};


  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Encabezado */}
      <header className="bg-[#00DDDD] py-4 shadow-md flex justify-end items-center px-4">
        <div className="relative">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor"
              viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <button onClick={() => navigate("/acerca")} className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
                Acerca de
              </button>
              <button onClick={() => navigate("/contacto")} className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
                Contacto
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-8 md:px-8">
        <div className="mb-6 text-center">
          <img
            src={require("../logo.png")} // Ruta del logo
            alt="MentESCOM Logo"
            className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-gray-300 cursor-pointer"
            onClick={() => navigate(-1)} // Regresa a la página anterior
          />
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">AlzhTrack</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Crea tu cuenta de cuidador para acceder al sistema de monitoreo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#24E3D6]"
              placeholder="cuidador@correo.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#24E3D6]"
              placeholder="Nombre(s)"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Apellido paterno</label>
            <input
              type="text"
              name="apellidoP"
              value={form.apellidoP}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#24E3D6]"
              placeholder="Apellido paterno"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Apellido materno</label>
            <input
              type="text"
              name="apellidoM"
              value={form.apellidoM}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#24E3D6]"
              placeholder="Apellido materno"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Número telefónico</label>
            <input
              type="tel"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#24E3D6]"
              placeholder="55XXXXXXXX"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#24E3D6]"
              placeholder="Crea una contraseña"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Confirmar contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#24E3D6]"
              placeholder="Confirma tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#9BDCFD] hover:bg-[#00DDDD] text-gray-800 font-bold py-2 px-4 rounded-md transition duration-200"
          >
            Registrarse
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          ¿Ya tienes una cuenta?{" "}
          <span
            className="text-blue-500 hover:underline cursor-pointer"
            onClick={() => navigate("/cuidadores/login")}
          >
            Inicia sesión aquí
          </span>
        </p>
      </main>
    </div>
  );
};

export default Register;
