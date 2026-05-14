import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, RefreshCcw, Plus, Trash2, 
  Battery, Cpu, Clock, Activity, Zap, ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';

const DevicesPage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([
    { id: 1, type: 'info', msg: 'System monitor active', time: 'Just now' }
  ]);

  const fetchDevices = async () => {
    try {
      const res = await api.get('/devices/');
      const newDevices = res.data;
      
      if (devices.length > 0) {
        newDevices.forEach(nd => {
          const old = devices.find(d => d.device_id === nd.device_id);
          if (old && old.is_online !== nd.is_online) {
            const statusMsg = nd.is_online ? 'connected' : 'disconnected';
            setActivities(prev => [{
              id: Date.now(),
              type: nd.is_online ? 'success' : 'warn',
              msg: `${nd.device_name || nd.phone_model} ${statusMsg}`,
              time: 'Just now'
            }, ...prev].slice(0, 5));
          }
        });
      }
      
      setDevices(newDevices);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">Gateways</h1>
          <p className="text-slate-400 mt-2 font-medium">Manage and monitor your global SMS delivery network.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/setup">
            <Button variant="secondary" className="rounded-2xl h-12 px-6 border-blue-500/20 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 transition-all">
              Setup Guide <ArrowUpRight size={16} className="ml-2" />
            </Button>
          </Link>
          <Button onClick={fetchDevices} variant="secondary" className="rounded-2xl h-12 px-6">
            <RefreshCcw size={18} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {devices.map((device) => (
                <motion.div 
                  key={device.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card glass className={`group transition-all duration-500 relative overflow-hidden ${device.is_online ? 'border-emerald-500/20' : 'border-white/5'}`}>
                    {device.is_online && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-all" />
                    )}
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div className={`h-14 w-14 rounded-[20px] flex items-center justify-center transition-all ${device.is_online ? 'bg-emerald-500/10 text-emerald-500 shadow-xl shadow-emerald-500/10' : 'bg-slate-800 text-slate-500'}`}>
                          <Smartphone size={28} />
                        </div>
                        <div className={`flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          device.is_online ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-white/5'
                        }`}>
                          <div className={`h-1.5 w-1.5 rounded-full mr-2 ${device.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                          {device.is_online ? 'Active' : 'Offline'}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-black text-white leading-tight group-hover:text-blue-400 transition-colors">
                            {device.device_name || device.phone_model}
                          </h3>
                          <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-widest flex items-center">
                            ID: {device.device_id.slice(0, 12)}...
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/5">
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center">
                                <Battery size={10} className="mr-1.5" /> Power
                              </p>
                              <p className={`text-sm font-bold mt-1 ${device.battery_level < 20 ? 'text-red-500' : 'text-white'}`}>
                                {device.battery_level}%
                              </p>
                           </div>
                           <div className="text-right space-y-1">
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-end">
                                <Cpu size={10} className="mr-1.5" /> Capacity
                              </p>
                              <p className="text-sm font-bold text-white mt-1">{device.sim_count} SIM Channel</p>
                           </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                           <div className="flex items-center text-slate-500">
                              <Clock size={12} className="mr-1.5" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">
                                {device.is_online ? 'Active Connection' : 'Disconnected'}
                              </span>
                           </div>
                           <div className="flex space-x-2">
                             {!device.owner_id && (
                               <Button 
                                 size="sm" 
                                 className="h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-bold uppercase px-3"
                                 onClick={async () => {
                                   try {
                                     await api.post(`/devices/${device.id}/claim`);
                                     toast.success('Gateway claimed successfully');
                                     fetchDevices();
                                   } catch (err) {
                                     toast.error('Failed to claim gateway');
                                   }
                                 }}
                               >
                                 Claim Gateway
                               </Button>
                             )}
                             <Button variant="ghost" className="h-8 w-8 rounded-lg p-0 text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all">
                               <Trash2 size={14} />
                             </Button>
                           </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {devices.length === 0 && !loading && (
            <div className="py-32 text-center bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[48px] flex flex-col items-center">
               <div className="h-24 w-24 bg-slate-900 rounded-[32px] flex items-center justify-center text-slate-800 mb-8 shadow-2xl">
                  <Smartphone size={40} className="text-slate-700" />
               </div>
               <h3 className="text-2xl font-black text-white">Awaiting Connection</h3>
               <p className="text-slate-500 mt-3 max-w-sm font-medium">
                 Your gateway network is ready. Launch the CloudSMS app on your Android device to begin.
               </p>
               <Link to="/dashboard/setup" className="mt-8">
                  <Button className="rounded-2xl h-14 px-10 bg-white text-slate-900 hover:bg-slate-100 font-black uppercase tracking-widest text-[10px]">
                    Get Started Guide
                  </Button>
               </Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card glass className="border-white/5">
            <CardContent className="p-6">
               <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6 flex items-center">
                 <Activity size={16} className="mr-2 text-blue-500" /> Activity Stream
               </h3>
               <div className="space-y-6">
                  {activities.map(act => (
                    <div key={act.id} className="flex gap-4">
                       <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                         act.type === 'success' ? 'bg-emerald-500' : act.type === 'warn' ? 'bg-red-500' : 'bg-blue-500'
                       }`} />
                       <div className="space-y-1">
                          <p className="text-[11px] text-slate-300 font-medium leading-tight">{act.msg}</p>
                          <p className="text-[9px] text-slate-600 uppercase font-black">{act.time}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>

          <Card glass className="bg-blue-600/5 border-blue-500/10">
            <CardContent className="p-6">
               <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-4 flex items-center">
                 <Zap size={16} className="mr-2" /> Global Coverage
               </h3>
               <p className="text-[11px] text-slate-500 leading-relaxed">
                 All connected devices are synchronized via encrypted WebSocket tunnels. You can dispatch messages across multiple carriers globally.
               </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DevicesPage;
