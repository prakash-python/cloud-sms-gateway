import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, Smartphone, MessageSquare, Info, History, Loader2, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import api from '../services/api';
import toast from 'react-hot-toast';

const SendSMSPage = () => {
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingDevices, setFetchingDevices] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await api.get('/devices/');
        setDevices(res.data.filter(d => d.is_online));
      } catch (err) {
        console.error('Failed to fetch devices:', err);
      } finally {
        setFetchingDevices(false);
      }
    };
    fetchDevices();
  }, []);

  const handleSend = async () => {
    if (!selectedDeviceId) return toast.error('Please select an active gateway');
    if (!recipient) return toast.error('Recipient number is required');
    if (!message) return toast.error('Message body is empty');

    setLoading(true);
    try {
      await api.post('/sms/send', {
        device_id: selectedDeviceId,
        phone_number: recipient,
        message: message
      });
      toast.success('Message dispatched successfully');
      setMessage('');
      setRecipient('');
    } catch (err) {
      toast.error('Dispatch failed. Please check device connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Quick Dispatch</h1>
          <p className="text-slate-400 mt-2 font-medium">Global SMS routing via your secure Android gateway network.</p>
        </div>
        <div className="flex items-center space-x-4 bg-slate-900/50 p-2 pr-6 rounded-2xl border border-slate-800">
           <div className="h-10 w-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
              <Zap size={20} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none">Status</p>
              <p className="text-xs font-bold text-emerald-500 mt-1 uppercase">Instant Routing Active</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card glass className="border-white/5 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <CardContent className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center">
                  <Users size={12} className="mr-2 text-blue-500" /> Destination Number
                </label>
                <input 
                  type="text"
                  placeholder="+1 000 000 0000"
                  className="w-full h-16 bg-slate-950/50 border border-slate-800 rounded-2xl px-8 text-xl font-bold text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none placeholder:text-slate-800"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center">
                      <Smartphone size={12} className="mr-2 text-blue-500" /> Dispatch Gateway
                    </label>
                    <select 
                      className="w-full h-14 bg-slate-950/50 border border-slate-800 rounded-2xl px-6 text-white focus:border-blue-500 transition-all outline-none appearance-none font-bold"
                      value={selectedDeviceId}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                    >
                      {fetchingDevices ? (
                        <option>Loading systems...</option>
                      ) : devices.length === 0 ? (
                        <option>No active gateways</option>
                      ) : (
                        <>
                          <option value="">Select Gateway</option>
                          {devices.map(d => (
                            <option key={d.device_id} value={d.device_id}>
                              {d.device_name || d.phone_model} ({d.device_id.slice(-6).toUpperCase()})
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center">
                      <ShieldCheck size={12} className="mr-2 text-blue-500" /> Security
                    </label>
                    <div className="h-14 bg-slate-900/30 border border-slate-800 rounded-2xl px-6 flex items-center">
                       <span className="text-xs font-bold text-slate-400">Encrypted Tunnel</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center">
                    <MessageSquare size={12} className="mr-2 text-blue-500" /> Message Payload
                  </label>
                  <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">
                    {message.length} Characters
                  </span>
                </div>
                <textarea 
                  placeholder="Enter your message payload..."
                  rows={6}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-3xl p-8 text-white focus:border-blue-500 transition-all outline-none resize-none font-medium leading-relaxed"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleSend}
                disabled={loading || fetchingDevices || devices.length === 0}
                className="w-full h-16 text-xs font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-blue-600/20 bg-blue-600 hover:bg-blue-500 transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Initiate Dispatch"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card glass className="border-white/5 bg-gradient-to-b from-blue-600/5 to-transparent">
            <CardContent className="p-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6 flex items-center">
                <Info size={16} className="mr-2 text-blue-500" /> Routing Rules
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                   <div className="h-6 w-6 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                   <p className="text-xs text-slate-400 leading-relaxed">Messages are encrypted before leaving your secure dashboard.</p>
                </li>
                <li className="flex gap-4">
                   <div className="h-6 w-6 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                   <p className="text-xs text-slate-400 leading-relaxed">Real-time status tracking via secure hardware heartbeat monitor.</p>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card glass className="border-white/5">
             <CardContent className="p-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center">
                   <History size={16} className="mr-2" /> Live Dispatch Log
                </h3>
                <div className="space-y-4">
                   <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest text-center py-8 border border-dashed border-slate-800 rounded-3xl">
                      Awaiting payload...
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SendSMSPage;
