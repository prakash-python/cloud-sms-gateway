import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardHome from './pages/DashboardHome';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  
  return <DashboardLayout>{children}</DashboardLayout>;
};

const App = () => {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155'
          }
        }} 
      />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<div className="bg-slate-950 min-h-screen flex items-center justify-center text-white">Register Page Implementation</div>} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardHome />
            </ProtectedRoute>
          } />
          
          <Route path="/devices" element={
            <ProtectedRoute>
              <div className="p-8"><h1 className="text-2xl font-bold">Device Management</h1></div>
            </ProtectedRoute>
          } />
          
          <Route path="/send-sms" element={
            <ProtectedRoute>
              <div className="p-8"><h1 className="text-2xl font-bold">Send SMS</h1></div>
            </ProtectedRoute>
          } />

          <Route path="/campaigns" element={
            <ProtectedRoute>
              <div className="p-8"><h1 className="text-2xl font-bold">Campaigns</h1></div>
            </ProtectedRoute>
          } />

          <Route path="/logs" element={
            <ProtectedRoute>
              <div className="p-8"><h1 className="text-2xl font-bold">Message Logs</h1></div>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <div className="p-8"><h1 className="text-2xl font-bold">Settings</h1></div>
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
