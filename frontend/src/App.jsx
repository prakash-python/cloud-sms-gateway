import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Send, Devices, History, Settings, LogOut } from 'lucide-react';

// Simplified Components for the demo
const Sidebar = () => (
  <div className="w-64 bg-secondary h-screen p-4 flex flex-col border-r border-slate-700">
    <div className="text-2xl font-bold text-primary mb-8 px-4">CloudSMS</div>
    <nav className="flex-1 space-y-2">
      <Link to="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 text-slate-300">
        <LayoutDashboard size={20} /> <span>Dashboard</span>
      </Link>
      <Link to="/send" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 text-slate-300">
        <Send size={20} /> <span>Send SMS</span>
      </Link>
      <Link to="/devices" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 text-slate-300">
        <Devices size={20} /> <span>Devices</span>
      </Link>
      <Link to="/history" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 text-slate-300">
        <History size={20} /> <span>History</span>
      </Link>
    </nav>
    <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-900/30 text-red-400 mt-auto">
      <LogOut size={20} /> <span>Logout</span>
    </button>
  </div>
);

const Dashboard = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[
        { label: 'Total Sent', value: '1,284', color: 'text-blue-500' },
        { label: 'Active Devices', value: '3', color: 'text-green-500' },
        { label: 'Failed', value: '12', color: 'text-red-500' },
        { label: 'Credits', value: 'Unlimited', color: 'text-yellow-500' },
      ].map((stat, idx) => (
        <div key={idx} className="bg-secondary p-6 rounded-xl border border-slate-700">
          <div className="text-slate-400 text-sm mb-1">{stat.label}</div>
          <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
        </div>
      ))}
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <div className="flex bg-background text-white min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/send" element={<div className="p-8">Send SMS Component</div>} />
            <Route path="/devices" element={<div className="p-8">Device Management Component</div>} />
            <Route path="/history" element={<div className="p-8">History Component</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
