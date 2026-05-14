import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Send, Smartphone, History, Settings, LogOut, 
  Menu, X, Bell, User, MessageSquare, BarChart3,
  Cpu, Users, Zap, Database, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => (
  <Link
    to={path}
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: Cpu, label: 'SIM Cards', path: '/dashboard/sims' },
    { icon: Smartphone, label: 'Devices', path: '/dashboard/devices' },
    { icon: Users, label: 'Contact Groups', path: '/dashboard/groups' },
    { icon: Zap, label: 'Campaigns', path: '/dashboard/campaigns' },
    { icon: Database, label: 'Integrations', path: '/dashboard/integrations' },
    { icon: Send, label: 'Send SMS', path: '/dashboard/send-sms' },
    { icon: History, label: 'Message Logs', path: '/dashboard/logs' },
    { icon: ShieldCheck, label: 'Setup Guide', path: '/dashboard/setup' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Send className="text-white transform -rotate-45" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">CloudSMS</span>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <SidebarItem 
                key={item.path} 
                {...item} 
                active={pathname === item.path}
                onClick={() => setIsSidebarOpen(false)}
              />
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all w-full"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center space-x-4 ml-auto">
            <button className="h-10 w-10 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors">
              <Bell size={20} />
            </button>
            <div className="h-8 w-[1px] bg-slate-800 mx-2" />
            <div className="flex items-center space-x-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">
                  {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username || 'User'}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-500">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
