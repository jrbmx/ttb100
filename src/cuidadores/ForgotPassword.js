import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const API = process.env.REACT_APP_API_URL || "http://localhost:3000";

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch(`${API}/api/cuidadores/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMsg(data.mensaje || "Revisa tu correo si existe en el sistema.");
    } catch {
      setMsg("Error de red. Inténtalo más tarde.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">¿Olvidaste tu contraseña?</h2>
        <p className="text-sm text-gray-600 mb-4">
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            className="w-full border rounded-md p-2"
            placeholder="tu@correo.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-md"
          >
            Enviar enlace
          </button>
        </form>
        {msg && <p className="mt-4 text-sm">{msg}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
