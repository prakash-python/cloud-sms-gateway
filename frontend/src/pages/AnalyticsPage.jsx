import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, TrendingUp, CheckCircle2, AlertCircle, 
  Clock, Calendar, Filter, Download, Activity
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import api from '../services/api';

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
    <div className={`absolute top-0 right-0 h-24 w-24 -mr-8 -mt-8 bg-${color}-500/5 rounded-full blur-2xl group-hover:bg-${color}-500/10 transition-colors`} />
    <div className="flex justify-between items-start mb-4">
      <div className={`h-10 w-10 bg-${color}-500/10 rounded-xl flex items-center justify-center text-${color}-500`}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500`}>
          {trend}
        </span>
      )}
    </div>
    <div className="space-y-1">
      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</h4>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  </div>
);

const AnalyticsPage = () => {
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    sent: 0,
    failed: 0,
    success_rate: '0%',
    activity: []
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/sms/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  // Calculate SVG Points for Line Graph
  const getLinePoints = () => {
    if (stats.activity.length === 0) return "";
    const maxVal = Math.max(...stats.activity.map(a => a.sent), 1);
    const width = 800;
    const height = 200;
    const padding = 40;
    
    return stats.activity.map((day, i) => {
      const x = (i / (stats.activity.length - 1)) * (width - padding * 2) + padding;
      const y = height - (day.sent / maxVal) * (height - padding * 2) - padding;
      return `${x},${y}`;
    }).join(" ");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Analytics Dashboard</h1>
          <p className="text-slate-400 mt-2 font-medium">Strategic insights into your messaging performance and gateway health.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="h-10 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center">
            <Calendar size={14} className="mr-2" /> Last 30 Days
          </button>
          <button className="h-10 px-4 bg-blue-600 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-blue-500 transition-all flex items-center shadow-lg shadow-blue-600/20">
            <Download size={14} className="mr-2" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Activity} label="Messages Sent" value={stats.total.toLocaleString()} trend="Live" color="blue" />
        <StatCard icon={CheckCircle2} label="Delivered" value={stats.delivered.toLocaleString()} trend={stats.success_rate} color="emerald" />
        <StatCard icon={AlertCircle} label="Failures" value={stats.failed.toLocaleString()} color="red" />
        <StatCard icon={Clock} label="Avg. Latency" value="0.8s" color="purple" />
      </div>

      <Card glass className="p-8 space-y-8 border-white/5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-white flex items-center uppercase tracking-widest">
              <TrendingUp size={20} className="mr-3 text-blue-500" /> Delivery Trends
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Message volume distribution over time</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Success Volume</span>
            </div>
          </div>
        </div>
        
        <div className="h-80 w-full relative">
          <svg viewBox="0 0 800 200" className="w-full h-full overflow-visible">
            {/* Grid Lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line key={i} x1="40" y1={40 + i * 30} x2="760" y2={40 + i * 30} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            ))}
            
            {/* The Line */}
            <motion.polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={getLinePoints()}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' }}
            />
            
            {/* Points */}
            {stats.activity.map((day, i) => {
              const maxVal = Math.max(...stats.activity.map(a => a.sent), 1);
              const x = (i / (stats.activity.length - 1)) * (800 - 80) + 40;
              const y = 200 - (day.sent / maxVal) * (200 - 80) - 40;
              return (
                <g key={i} className="group">
                  <circle cx={x} cy={y} r="4" fill="#3b82f6" className="group-hover:r-6 transition-all" />
                  <text x={x} y="195" textAnchor="middle" className="text-[8px] fill-slate-600 font-bold uppercase tracking-tighter">
                    {day.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card glass className="p-6">
           <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Why Analytics Matter?</h4>
           <p className="text-sm text-slate-400 leading-relaxed">
             While <strong>Message Logs</strong> show you the <i>who</i> and <i>what</i>, the <strong>Analytics</strong> dashboard shows you the <i>how</i> and <i>why</i>. 
             It helps you identify peak traffic hours, detect network latency spikes, and monitor the overall health of your Android Gateways at a strategic level.
           </p>
        </Card>
        <Card glass className="p-6">
           <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Performance Insight</h4>
           <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Stability is Excellent</p>
                <p className="text-xs text-slate-500">Your average delivery rate is {stats.success_rate} across all SIMs.</p>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
