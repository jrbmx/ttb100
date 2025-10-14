import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
  const [msg, setMsg] = useState("");
  const API = process.env.REACT_APP_API_URL || "http://localhost:3000";

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (password.length < 6) return setMsg("La contraseña debe tener al menos 6 caracteres.");
    if (password !== password2) return setMsg("Las contraseñas no coinciden.");

    try {
      const res = await fetch(`${API}/api/cuidadores/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(data.mensaje || "Contraseña actualizada.");
        setTimeout(() => navigate("/auth"), 1500);
      } else {
        setMsg(data.mensaje || "No se pudo actualizar la contraseña.");
      }
    } catch {
      setMsg("Error de red. Inténtalo más tarde.");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
          <p className="text-red-600">Token no encontrado. Revisa tu enlace.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Restablecer contraseña</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="password"
            className="w-full border rounded-md p-2"
            placeholder="Nueva contraseña"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            className="w-full border rounded-md p-2"
            placeholder="Confirmar contraseña"
            required
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-md"
          >
            Guardar contraseña
          </button>
        </form>
        {msg && <p className="mt-4 text-sm">{msg}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
