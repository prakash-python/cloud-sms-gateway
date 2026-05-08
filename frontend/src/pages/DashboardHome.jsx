import React from 'react';
import { motion } from 'framer-motion';
import { 
  Send, Smartphone, CheckCircle2, AlertCircle, 
  TrendingUp, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

const data = [
  { name: 'Mon', sent: 400, delivered: 380 },
  { name: 'Tue', sent: 300, delivered: 290 },
  { name: 'Wed', sent: 600, delivered: 550 },
  { name: 'Thu', sent: 800, delivered: 750 },
  { name: 'Fri', sent: 500, delivered: 480 },
  { name: 'Sat', sent: 900, delivered: 880 },
  { name: 'Sun', sent: 700, delivered: 680 },
];

const StatCard = ({ icon: Icon, label, value, change, isPositive, color }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`h-12 w-12 rounded-2xl bg-${color}-500/10 flex items-center justify-center text-${color}-500`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center space-x-1 text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span>{change}%</span>
        </div>
      </div>
      <p className="text-slate-400 text-sm font-medium">{label}</p>
      <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
    </CardContent>
  </Card>
);

const DashboardHome = () => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-3">
           <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center space-x-2">
             <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-sm font-medium">3 Devices Online</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Send}
          label="Total Messages"
          value="12,845"
          change="12.5"
          isPositive={true}
          color="blue"
        />
        <StatCard 
          icon={Smartphone}
          label="Active Devices"
          value="3"
          change="0"
          isPositive={true}
          color="purple"
        />
        <StatCard 
          icon={CheckCircle2}
          label="Success Rate"
          value="98.2%"
          change="2.1"
          isPositive={true}
          color="emerald"
        />
        <StatCard 
          icon={AlertCircle}
          label="Failed"
          value="24"
          change="5.4"
          isPositive={false}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">SMS Activity</h3>
              <select className="bg-slate-800 border-none rounded-lg text-sm px-3 py-1.5 focus:ring-0">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
                <Area type="monotone" dataKey="delivered" stroke="#10b981" strokeWidth={3} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold">Quick Send</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
              <input 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Message</label>
              <textarea 
                rows="4"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" 
                placeholder="Type your message..."
              />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]">
              Send Now
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
