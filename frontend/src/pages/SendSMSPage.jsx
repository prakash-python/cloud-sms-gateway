import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Users, Smartphone, MessageSquare, Info, History, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
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
        // Only show online devices
        setDevices(res.data.filter(d => d.is_online));
      } catch (err) {
        console.error('Failed to fetch devices:', err);
        toast.error('Could not load online devices');
      } finally {
        setFetchingDevices(false);
      }
    };
    fetchDevices();
  }, []);

  const handleSend = async () => {
    if (!selectedDeviceId) return toast.error('Please select an online device');
    if (!recipient) return toast.error('Please enter a recipient number');
    if (!message) return toast.error('Message body cannot be empty');

    setLoading(true);
    try {
      await api.post('/sms/send', {
        device_id: selectedDeviceId,
        phone_number: recipient,
        message: message
      });
      toast.success('Message dispatched to gateway!');
      setMessage('');
      setRecipient('');
    } catch (err) {
      console.error('Send error:', err);
      toast.error(err.response?.data?.detail || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = loading || fetchingDevices || devices.length === 0 || !recipient || !message || !selectedDeviceId;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white tracking-tight">Send Quick SMS</h1>
        <p className="text-slate-400 mt-2 font-medium">Compose and dispatch a single message to any destination instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composer Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center">
                <Users size={14} className="mr-2 text-blue-500" /> Recipient Number
              </label>
              <input 
                type="text"
                placeholder="+1 234 567 8900"
                className="w-full h-14 bg-slate-950 border border-slate-800 rounded-2xl px-6 text-white focus:border-blue-500 transition-all outline-none"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center">
                <Smartphone size={14} className="mr-2 text-blue-500" /> Select Online Device
              </label>
              <div className="relative">
                <select 
                  className="w-full h-14 bg-slate-950 border border-slate-800 rounded-2xl px-6 text-white focus:border-blue-500 transition-all outline-none appearance-none disabled:opacity-50"
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  disabled={fetchingDevices || devices.length === 0}
                >
                  {fetchingDevices ? (
                    <option>Loading devices...</option>
                  ) : devices.length === 0 ? (
                    <option>No online devices available</option>
                  ) : (
                    <>
                      <option value="">Select a connected device...</option>
                      {devices.map(device => (
                        <option key={device.device_id} value={device.device_id}>
                          {device.device_name || device.phone_model} (SIM 1) - {device.device_id.slice(-6)}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  {fetchingDevices ? <Loader2 size={16} className="animate-spin" /> : <Smartphone size={16} />}
                </div>
              </div>
              {devices.length === 0 && !fetchingDevices && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-2 px-1">
                  Connect your Android app to enable sending
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center">
                  <MessageSquare size={14} className="mr-2 text-blue-500" /> Message Body
                </label>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  {message.length} / 160 Characters (1 SMS)
                </span>
              </div>
              <textarea 
                placeholder="Type your message here..."
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white focus:border-blue-500 transition-all outline-none resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleSend}
              disabled={isButtonDisabled}
              className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <>Sending... <Loader2 className="ml-2 animate-spin" size={18} /></>
              ) : (
                <>Dispatch Message <Send className="ml-2" size={18} /></>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar / Tips Section */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4 flex items-center">
              <Info size={16} className="mr-2 text-blue-500" /> System Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Online Gateways</span>
                <span className={`text-xs font-black ${devices.length > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {devices.length} Available
                </span>
              </div>
              <div className="h-px bg-slate-800 w-full" />
              <ul className="space-y-3">
                <li className="flex items-start space-x-3 text-[11px] text-slate-500 leading-relaxed">
                  <div className="h-1 w-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <p>Ensure your Android device has a stable Wi-Fi/Data connection.</p>
                </li>
                <li className="flex items-start space-x-3 text-[11px] text-slate-500 leading-relaxed">
                  <div className="h-1 w-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <p>Messages are routed in real-time via persistent WebSockets.</p>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-3xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-blue-400 mb-4 flex items-center">
              <History size={16} className="mr-2" /> Live Queue
            </h3>
            <div className="space-y-3">
              <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center py-4 border border-dashed border-slate-800 rounded-2xl">
                Waiting for dispatch...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendSMSPage;
