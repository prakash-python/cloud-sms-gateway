import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Search, Filter, RefreshCcw, 
  CheckCircle2, AlertCircle, Clock, Users, 
  User, FileText, Database, ChevronRight, X 
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../services/api';

const MessageLogs = () => {
  const [activeTab, setActiveTab] = useState('individual');
  const [logs, setLogs] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [recipientDetails, setRecipientDetails] = useState([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const limit = 10;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      if (activeTab === 'individual' || activeTab === 'database') {
        const skip = (currentPage - 1) * limit;
        const source = activeTab === 'database' ? 'database' : 'individual';
        const res = await api.get('/sms/history', { params: { skip, limit, source } });
        setLogs(res.data.logs);
        setTotalLogs(res.data.total);
      } else if (activeTab === 'manual_group' || activeTab === 'csv_group') {
        const res = await api.get('/campaigns/');
        setCampaigns(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeTab, currentPage]);

  const fetchRecipientDetails = async (campaignId, statusFilter) => {
    try {
      const res = await api.get(`/campaigns/${campaignId}/recipients`, {
        params: { status: statusFilter }
      });
      setRecipientDetails(res.data);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch recipient details', err);
    }
  };

  const tabs = [
    { id: 'individual', label: 'Individual', icon: User },
    { id: 'manual_group', label: 'Manual Group', icon: Users },
    { id: 'csv_group', label: 'CSV Group', icon: FileText },
    { id: 'database', label: 'Database', icon: Database },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'text-emerald-500 bg-emerald-500/10';
      case 'SENT': return 'text-blue-500 bg-blue-500/10';
      case 'FAILED': return 'text-rose-500 bg-rose-500/10';
      case 'PENDING': return 'text-amber-500 bg-amber-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white">Message Logs</h1>
          <p className="text-slate-400 mt-1">Monitor delivery status across all messaging channels.</p>
        </div>
        <Button onClick={fetchLogs} variant="secondary" className="rounded-2xl h-12">
          <RefreshCcw size={18} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="flex bg-slate-900/50 p-1.5 rounded-[20px] w-fit border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
            className={`flex items-center px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <tab.icon size={14} className="mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'individual' && (
          <Card glass className="overflow-hidden border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-white/5">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Recipient</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Message</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-6">
                      <p className="text-sm font-bold text-white">{log.phone_number}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Gateway #{log.device_id}</p>
                    </td>
                    <td className="p-6">
                      <p className="text-sm text-slate-300 max-w-md truncate">{log.message}</p>
                    </td>
                    <td className="p-6">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(log.status)}`}>
                        {log.status}
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-xs text-slate-400 font-medium">{new Date(log.created_at).toLocaleString()}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 border-t border-white/5 flex items-center justify-between bg-slate-900/30">
               <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                  Showing {(currentPage-1)*limit + 1} - {Math.min(currentPage*limit, totalLogs)} of {totalLogs} Logs
               </div>
               <div className="flex space-x-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-8 rounded-lg text-[10px] font-black uppercase px-4"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-8 rounded-lg text-[10px] font-black uppercase px-4"
                    disabled={currentPage * limit >= totalLogs}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
               </div>
            </div>
          </Card>
        )}

        {activeTab === 'manual_group' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.filter(c => (c.source_type || 'MANUAL') === 'MANUAL').map((camp) => (
              <Card glass key={camp.id} className="group hover:border-blue-500/30 transition-all duration-500">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">{camp.name}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Group ID: {camp.contact_group_id}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      camp.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {camp.status}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Numbers</span>
                      <span className="text-sm font-black text-white">{camp.total_messages}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => fetchRecipientDetails(camp.id, 'SENT')}
                        className="flex flex-col items-center p-4 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 rounded-2xl transition-all"
                      >
                        <span className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest mb-1">Success</span>
                        <span className="text-lg font-black text-emerald-500">{camp.sent_messages}</span>
                      </button>
                      <button 
                        onClick={() => fetchRecipientDetails(camp.id, 'FAILED')}
                        className="flex flex-col items-center p-4 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-2xl transition-all"
                      >
                        <span className="text-[9px] font-black text-rose-500/50 uppercase tracking-widest mb-1">Failure</span>
                        <span className="text-lg font-black text-rose-500">{camp.failed_messages}</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'csv_group' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.filter(c => c.source_type === 'CSV').map((camp) => (
              <Card glass key={camp.id} className="group hover:border-blue-500/30 transition-all duration-500">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">{camp.name}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">CSV Import ID: {camp.contact_group_id}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      camp.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {camp.status}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Numbers</span>
                      <span className="text-sm font-black text-white">{camp.total_messages}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => fetchRecipientDetails(camp.id, 'SENT')}
                        className="flex flex-col items-center p-4 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 rounded-2xl transition-all"
                      >
                        <span className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest mb-1">Success</span>
                        <span className="text-lg font-black text-emerald-500">{camp.sent_messages}</span>
                      </button>
                      <button 
                        onClick={() => fetchRecipientDetails(camp.id, 'FAILED')}
                        className="flex flex-col items-center p-4 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-2xl transition-all"
                      >
                        <span className="text-[9px] font-black text-rose-500/50 uppercase tracking-widest mb-1">Failure</span>
                        <span className="text-lg font-black text-rose-500">{camp.failed_messages}</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {campaigns.filter(c => c.source_type === 'CSV').length === 0 && (
               <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase text-xs tracking-widest">
                  No CSV-imported campaigns found.
               </div>
            )}
          </div>
        )}
        {activeTab === 'database' && (
          <Card glass className="overflow-hidden border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-white/5">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Name</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Recipient</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Message</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-6">
                      <p className="text-sm font-bold text-white">{log.full_name || 'N/A'}</p>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-bold text-slate-300">{log.phone_number}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Gateway #{log.device_id}</p>
                    </td>
                    <td className="p-6">
                      <p className="text-sm text-slate-300 max-w-md truncate">{log.message}</p>
                    </td>
                    <td className="p-6">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(log.status)}`}>
                        {log.status}
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-xs text-slate-400 font-medium">{new Date(log.created_at).toLocaleString()}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 border-t border-white/5 flex items-center justify-between bg-slate-900/30">
               <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                  Showing {(currentPage-1)*limit + 1} - {Math.min(currentPage*limit, totalLogs)} of {totalLogs} Logs
               </div>
               <div className="flex space-x-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-8 rounded-lg text-[10px] font-black uppercase px-4"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-8 rounded-lg text-[10px] font-black uppercase px-4"
                    disabled={currentPage * limit >= totalLogs}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
               </div>
            </div>
          </Card>
        )}
      </div>

      <AnimatePresence>
        {isDetailsModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" 
              onClick={() => setIsDetailsModalOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-full max-w-4xl relative z-10"
            >
              <Card glass className="max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-white">Recipient Details</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Detailed list for campaign broadcast</p>
                  </div>
                  <Button variant="ghost" className="h-10 w-10 rounded-xl p-0" onClick={() => setIsDetailsModalOpen(false)}>
                    <X size={20} className="text-slate-400" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-0">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-900 z-20">
                      <tr className="border-b border-white/10">
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Name</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Phone Number</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recipientDetails.map((rec) => (
                        <tr key={rec.id} className="hover:bg-white/5">
                          <td className="p-6">
                            <span className="text-sm font-bold text-white">{rec.full_name || 'N/A'}</span>
                          </td>
                          <td className="p-6">
                            <span className="text-sm font-medium text-slate-300">{rec.phone_number}</span>
                          </td>
                          <td className="p-6">
                            <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(rec.status)}`}>
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {recipientDetails.length === 0 && (
                        <tr>
                          <td colSpan="3" className="p-20 text-center text-slate-500 font-bold uppercase text-xs tracking-widest">
                            No records found for this status.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageLogs;
