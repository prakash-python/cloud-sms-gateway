import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, CheckCircle2, AlertCircle, 
  Clock, Calendar, Filter, Download 
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
    <div className={`absolute top-0 right-0 h-24 w-24 -mr-8 -mt-8 bg-${color}-500/5 rounded-full blur-2xl group-hover:bg-${color}-500/10 transition-colors`} />
    <div className="flex justify-between items-start mb-4">
      <div className={`h-10 w-10 bg-${color}-500/10 rounded-xl flex items-center justify-center text-${color}-500`}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500`}>
          +{trend}%
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
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Analytics</h1>
          <p className="text-slate-400 mt-2 font-medium">Real-time performance metrics and message delivery insights.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={TrendingUp} label="Total Sent" value="128,432" trend="12.5" color="blue" />
        <StatCard icon={CheckCircle2} label="Delivered" value="126,902" trend="11.2" color="emerald" />
        <StatCard icon={AlertCircle} label="Failed" value="1,530" color="red" />
        <StatCard icon={Clock} label="Avg. Latency" value="1.2s" color="purple" />
      </div>

      {/* Chart Placeholder */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl h-96 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center">
            <BarChart3 size={16} className="mr-2 text-blue-500" /> Message Volume
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Success</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Failed</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-end justify-between space-x-4 px-4 pb-4">
          {[40, 70, 45, 90, 65, 80, 50, 60, 85, 30, 55, 75].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center group">
              <div className="w-full relative">
                 <motion.div 
                   initial={{ height: 0 }}
                   animate={{ height: `${h}%` }}
                   className="w-full bg-blue-600/20 rounded-t-lg group-hover:bg-blue-600/40 transition-all border-t-2 border-blue-500/50"
                 />
                 <motion.div 
                   initial={{ height: 0 }}
                   animate={{ height: `${h * 0.1}%` }}
                   className="w-full bg-red-600/40 rounded-t-lg absolute bottom-0 border-t border-red-500/50"
                 />
              </div>
              <span className="text-[8px] font-bold text-slate-600 mt-4 uppercase tracking-tighter">Day {i+1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
