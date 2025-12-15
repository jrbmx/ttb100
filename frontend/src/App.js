import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Home from './Home';
import Dashboard from './Dashboard';
import Acerca from './infoExtra/acerca';
import Authentication from './cuidadores/Authentication';
import ForgotPassword from './cuidadores/ForgotPassword';
import ResetPassword from './cuidadores/ResetPassword';
import PacienteDetalle from './pages/PacienteDetalle'; 
import AdminDashboard from './pages/AdminDashboard';

const AdminRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  
  console.log("Usuario actual:", user); 
  // -------------------------------

  if (!user) return <Navigate to="/auth" replace />;
  
  // Verifica exactamente qué rol está leyendo
  if (user.rol !== 'admin') {
      console.log("Acceso denegado. Rol detectado:", user.rol);
      return <Navigate to="/dashboard" replace />;
  }

  // Si es admin, déjalo pasar
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/infoExtra/acerca" element={<Acerca />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Protected route for the dashboard */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/paciente/:pacienteId"
            element={
              <ProtectedRoute>
                <PacienteDetalle />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
