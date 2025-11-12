import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Home from './Home';
import Dashboard from './Dashboard';
import Acerca from './infoExtra/acerca';
import Authentication from './cuidadores/Authentication';
import ForgotPassword from './cuidadores/ForgotPassword';
import ResetPassword from './cuidadores/ResetPassword';
import PacienteDetalle from './pages/PacienteDetalle'; 


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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
