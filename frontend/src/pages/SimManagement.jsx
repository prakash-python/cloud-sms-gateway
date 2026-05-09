import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, RefreshCcw, AlertTriangle, CheckCircle2, Sliders } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';

const SimManagement = () => {
  const [sims, setSims] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSims = async () => {
    try {
      const res = await api.get('/sims/usage/analytics');
      setSims(res.data);
    } catch (err) {
      toast.error('Failed to fetch SIM analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSims();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">SIM Management</h1>
          <p className="text-slate-400 mt-1">Monitor carrier usage and daily SMS quotas across all devices.</p>
        </div>
        <Button onClick={fetchSims} variant="secondary" className="rounded-xl">
          <RefreshCcw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh Status
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sims.map((sim) => (
          <motion.div key={sim.sim_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card glass className={sim.status === 'DANGER' ? 'border-red-500/30' : sim.status === 'WARNING' ? 'border-yellow-500/30' : 'border-white/5'}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-12 w-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                    <Cpu size={24} />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    sim.status === 'DANGER' ? 'bg-red-500/10 text-red-500' : 
                    sim.status === 'WARNING' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {sim.status}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Phone Number</h3>
                    <p className="text-xl font-bold text-white mt-1">{sim.phone || 'Unknown'}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{sim.carrier || 'Standard Carrier'}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">DAILY USAGE</span>
                      <span className="text-white">{sim.sent} / {sim.limit} SMS</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${sim.usage_pct}%` }}
                        className={`h-full ${
                          sim.status === 'DANGER' ? 'bg-red-500' : 
                          sim.status === 'WARNING' ? 'bg-yellow-500' : 'bg-blue-600'
                        }`} 
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                     <div className="flex items-center text-xs font-medium text-slate-400">
                        {sim.status === 'OK' ? <CheckCircle2 size={14} className="text-emerald-500 mr-2" /> : <AlertTriangle size={14} className="text-yellow-500 mr-2" />}
                        {sim.usage_pct > 95 ? 'Exhausted' : 'Healthy Status'}
                     </div>
                     <Button variant="ghost" size="sm" className="h-8 rounded-lg px-2 text-blue-500 hover:text-blue-400">
                        <Sliders size={14} />
                     </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {sims.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-slate-500 font-medium">No SIM cards detected. Ensure your Android devices are connected and SIM details are synced.</p>
        </div>
      )}
    </div>
  );
};

export default SimManagement;
