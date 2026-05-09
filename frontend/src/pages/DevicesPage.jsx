import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, RefreshCcw, Wifi, WifiOff, Plus, Trash2, 
  Battery, Cpu, Clock, X, Download, ShieldCheck, Info
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';

const AddDeviceModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-xl font-bold text-white">Add New Device</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center shrink-0 font-bold text-sm">1</div>
              <div>
                <p className="text-white font-bold">Download the App</p>
                <p className="text-sm text-slate-400 mt-1 text-balance">Get the CloudSMS Companion APK from the button below and install it on your Android device.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center shrink-0 font-bold text-sm">2</div>
              <div>
                <p className="text-white font-bold">Enable Permissions</p>
                <p className="text-sm text-slate-400 mt-1">Grant SMS and Phone permissions to allow the gateway to function.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center shrink-0 font-bold text-sm">3</div>
              <div>
                <p className="text-white font-bold">Auto-Connect</p>
                <p className="text-sm text-slate-400 mt-1">The app will automatically register and appear in your dashboard instantly.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl flex items-center space-x-4">
             <ShieldCheck className="text-blue-500" size={32} />
             <div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Secure Connection</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Your device connects using encrypted WebSockets.</p>
             </div>
          </div>

          <div className="pt-4 flex flex-col space-y-3">
             <Button className="w-full h-12 rounded-xl">
                <Download size={18} className="mr-2" /> Download Android App (.APK)
             </Button>
             <button 
               onClick={onClose}
               className="w-full h-12 text-sm font-bold text-slate-500 hover:text-white transition-colors"
             >
                I've installed the app
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const DevicesPage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDevices = async () => {
    try {
      const res = await api.get('/devices/');
      setDevices(res.data);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 5 seconds
  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Device Management</h1>
          <p className="text-slate-400 mt-1 font-medium">Connect and monitor your Android gateway devices.</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={fetchDevices} variant="secondary" className="rounded-xl h-11">
            <RefreshCcw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl h-11 shadow-lg shadow-blue-600/20"
          >
            <Plus size={18} className="mr-2" /> Add Device
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {devices.map((device) => (
            <motion.div 
              key={device.id} 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card glass className={`transition-colors duration-500 ${device.is_online ? 'border-emerald-500/20' : 'border-white/5'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${device.is_online ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px] shadow-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
                      <Smartphone size={24} />
                    </div>
                    <div className={`flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      device.is_online ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {device.is_online ? (
                        <><Wifi size={12} className="mr-1.5" /> Online</>
                      ) : (
                        <><WifiOff size={12} className="mr-1.5" /> Offline</>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-white leading-none">
                        {device.device_name || device.phone_model || 'Unknown Android'}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-widest flex items-center">
                        <Info size={10} className="mr-1 text-blue-500" /> ID: {device.device_id}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center">
                            <Battery size={10} className="mr-1" /> Battery
                          </p>
                          <p className={`text-sm font-bold mt-1 ${device.battery_level < 20 ? 'text-red-500' : 'text-white'}`}>
                            {device.battery_level}%
                          </p>
                       </div>
                       <div className="text-right space-y-1">
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-end">
                            <Cpu size={10} className="mr-1" /> SIMs
                          </p>
                          <p className="text-sm font-bold text-white mt-1">{device.sim_count} Active</p>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                       <div className="flex items-center text-slate-500">
                          <Clock size={12} className="mr-1" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            Seen {getRelativeTime(device.last_seen)}
                          </span>
                       </div>
                       <div className="flex space-x-2">
                          <Button variant="ghost" className="h-8 w-8 rounded-lg p-0 text-slate-400 hover:text-white">
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
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-24 text-center flex flex-col items-center bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[40px]"
        >
           <div className="h-24 w-24 bg-slate-900 rounded-[32px] flex items-center justify-center text-slate-700 mb-8 border border-slate-800 shadow-xl">
              <Plus size={40} className="text-blue-500/50" />
           </div>
           <h3 className="text-2xl font-black text-white mb-3">No devices connected</h3>
           <p className="text-slate-500 max-w-sm mx-auto font-medium">
              Your SMS gateway network is empty. Connect your first Android device to start automating campaigns.
           </p>
           <Button 
            onClick={() => setIsModalOpen(true)}
            className="mt-10 rounded-2xl px-10 h-14 font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20"
           >
              Get Started <Plus className="ml-2" />
           </Button>
        </motion.div>
      )}

      <AddDeviceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default DevicesPage;
