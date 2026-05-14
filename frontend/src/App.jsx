import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardHome from './pages/DashboardHome';
import SimManagement from './pages/SimManagement';
import GroupsManagement from './pages/GroupsManagement';
import CampaignAutomation from './pages/CampaignAutomation';
import DevicesPage from './pages/DevicesPage';
import IntegrationsPage from './pages/IntegrationsPage';
import SendSMSPage from './pages/SendSMSPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SetupGuidePage from './pages/SetupGuidePage';
import MessageLogs from './pages/MessageLogs';
import SettingsPage from './pages/SettingsPage';
import DatabaseIntegration from './pages/DatabaseIntegration';

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)'
          }
        }} 
      />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Dashboard Routes (Nested) */}
          <Route path="/dashboard" element={<ProtectedLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="sims" element={<SimManagement />} />
            <Route path="devices" element={<DevicesPage />} />
            <Route path="setup" element={<SetupGuidePage />} />
            <Route path="groups" element={<GroupsManagement />} />
            <Route path="campaigns" element={<CampaignAutomation />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="integrations/db" element={<DatabaseIntegration />} />
            <Route path="send-sms" element={<SendSMSPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="logs" element={<MessageLogs />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Legacy Redirects for compatibility */}
          <Route path="/devices" element={<Navigate to="/dashboard/devices" replace />} />
          <Route path="/sims" element={<Navigate to="/dashboard/sims" replace />} />
          <Route path="/groups" element={<Navigate to="/dashboard/groups" replace />} />
          <Route path="/campaigns" element={<Navigate to="/dashboard/campaigns" replace />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
