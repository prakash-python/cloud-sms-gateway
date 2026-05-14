import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Server, Shield, Table, Phone, User, 
  CheckCircle2, AlertCircle, Loader2, Play, 
  Save, RefreshCw, Send, CheckSquare, Square,
  Eye, EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../services/api';
import toast from 'react-hot-toast';

const DatabaseIntegration = () => {
  const [config, setConfig] = useState({
    db_type: 'postgresql',
    host: '',
    port: 5432,
    database_name: '',
    username: '',
    password: '',
    connection_url: '',
    table_name: '',
    phone_column: '',
    first_name_column: '',
    last_name_column: ''
  });

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [externalData, setExternalData] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [availableTables, setAvailableTables] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [fetchingTables, setFetchingTables] = useState(false);
  const [fetchingColumns, setFetchingColumns] = useState(false);
  const [showUrl, setShowUrl] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/integrations/db/config');
      if (res.data) {
        setConfig({ ...res.data, password: '' });
        if (res.data.host) handleFetchTables(res.data);
      }
    } catch (err) { }
  };

  const handleFetchTables = async (customConfig = null) => {
    setFetchingTables(true);
    try {
      const res = await api.post('/integrations/db/tables', customConfig || config);
      setAvailableTables(res.data);
      toast.success('Tables fetched');
    } catch (err) {
      toast.error('Failed to fetch tables. Check connection settings.');
    } finally {
      setFetchingTables(false);
    }
  };

  const handleFetchColumns = async (tableName) => {
    if (!tableName) return;
    setFetchingColumns(true);
    try {
      const res = await api.post('/integrations/db/columns', { ...config, table_name: tableName });
      setAvailableColumns(res.data);
      toast.success('Columns fetched');
    } catch (err) {
      toast.error('Failed to fetch columns');
    } finally {
      setFetchingColumns(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await api.post('/integrations/db/test', config);
      toast.success('Connection Successful!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Connection failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/integrations/db/save', config);
      toast.success('Configuration saved');
      // Automatically fetch data after saving
      handleFetch();
    } catch (err) {
      toast.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async () => {
    setFetching(true);
    try {
      const res = await api.get('/integrations/db/fetch');
      setExternalData(res.data);
      toast.success(`Fetched ${res.data.length} records`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to fetch data');
    } finally {
      setFetching(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedNumbers.length === externalData.length) {
      setSelectedNumbers([]);
    } else {
      setSelectedNumbers(externalData.map(d => d.phone));
    }
  };

  const toggleSelect = (phone) => {
    if (selectedNumbers.includes(phone)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== phone));
    } else {
      setSelectedNumbers([...selectedNumbers, phone]);
    }
  };

  const handleSendSMS = async () => {
    if (!message) return toast.error('Please enter a message');
    if (selectedNumbers.length === 0) return toast.error('No users selected');
    
    setIsSending(true);
    let success = 0;
    let failed = 0;

    // Get an online device
    try {
      const devicesRes = await api.get('/devices/');
      const onlineDevice = devicesRes.data.find(d => d.is_online);
      
      if (!onlineDevice) {
        toast.error('No online devices found');
        setIsSending(false);
        return;
      }

      for (const phone of selectedNumbers) {
        // Find the record to get the name
        const contact = externalData.find(d => d.phone === phone);
        try {
          await api.post('/sms/send', {
            phone_number: phone,
            full_name: contact?.name || 'Unknown',
            message: message,
            device_id: onlineDevice.device_id,
            sim_slot: 0,
            source: 'database'
          });
          success++;
        } catch (e) {
          failed++;
        }
      }
      toast.success(`Bulk Send Complete: ${success} Sent, ${failed} Failed`);
      setMessage('');
      setSelectedNumbers([]);
    } catch (err) {
      toast.error('Failed to start bulk send');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white">Database Integration</h1>
          <p className="text-slate-400 mt-1">Directly sync and message contacts from your external database.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Form */}
        <Card glass className="lg:col-span-1 h-fit">
          <CardHeader>
            <h3 className="text-lg font-bold flex items-center">
              <Server size={18} className="mr-2 text-blue-500" /> Connection Settings
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
               <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">Quick Connect URL (Recommended)</label>
                  <button 
                    type="button" 
                    onClick={() => setShowUrl(!showUrl)}
                    className="text-slate-500 hover:text-blue-500 transition-colors"
                  >
                    {showUrl ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
               </div>
               <div className="relative">
                  <input 
                    type={showUrl ? "text" : "password"}
                    value={config.connection_url}
                    onChange={(e) => setConfig({...config, connection_url: e.target.value})}
                    className="w-full bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 pr-10"
                    placeholder="postgresql://user:pass@host:port/dbname"
                  />
               </div>
               <p className="text-[9px] text-slate-500 italic">Easiest for Render, AWS, and Supabase.</p>
            </div>

            <div className="relative py-4">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
               <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-600 bg-slate-900 px-2">Or Manual Config</div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">DB Type</label>
              <select 
                value={config.db_type}
                onChange={(e) => setConfig({...config, db_type: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Host</label>
                <input 
                  value={config.host}
                  onChange={(e) => setConfig({...config, host: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none"
                  placeholder="localhost"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Port</label>
                <input 
                  type="number"
                  value={config.port}
                  onChange={(e) => setConfig({...config, port: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">DB Name</label>
              <input 
                value={config.database_name}
                onChange={(e) => setConfig({...config, database_name: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">User</label>
                <input 
                  value={config.username}
                  onChange={(e) => setConfig({...config, username: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Password</label>
                <input 
                  type="password"
                  value={config.password}
                  onChange={(e) => setConfig({...config, password: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Table & Column Mapping</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Table Name</label>
                  <button 
                    onClick={() => handleFetchTables()} 
                    disabled={fetchingTables}
                    className="text-[10px] text-blue-500 font-bold hover:underline"
                  >
                    {fetchingTables ? 'Fetching...' : 'Fetch Tables'}
                  </button>
                </div>
                <select 
                  value={config.table_name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfig({...config, table_name: val});
                    handleFetchColumns(val);
                  }}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none"
                >
                  <option value="">Select a table</option>
                  {availableTables.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Phone Column</label>
                <select 
                  value={config.phone_column}
                  onChange={(e) => setConfig({...config, phone_column: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none"
                >
                  <option value="">Select phone column</option>
                  {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">First Name Col</label>
                  <select 
                    value={config.first_name_column}
                    onChange={(e) => setConfig({...config, first_name_column: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none"
                  >
                    <option value="">Optional</option>
                    {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Last Name Col</label>
                  <select 
                    value={config.last_name_column}
                    onChange={(e) => setConfig({...config, last_name_column: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none"
                  >
                    <option value="">Optional</option>
                    {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="secondary" 
                className="flex-1 rounded-xl"
                onClick={handleTest}
                disabled={testing}
              >
                {testing ? <Loader2 size={16} className="animate-spin" /> : 'Test'}
              </Button>
              <Button 
                className="flex-1 rounded-xl"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Save & Sync Data'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data View & Action */}
        <div className="lg:col-span-2 space-y-8">
           <Card glass>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold flex items-center">
                    <Table size={18} className="mr-2 text-emerald-500" /> Database View
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleFetch} 
                    disabled={fetching}
                    className="text-blue-500 font-bold uppercase text-[10px] tracking-widest"
                  >
                    {fetching ? <Loader2 size={14} className="animate-spin mr-2" /> : <RefreshCw size={14} className="mr-2" />}
                    Refresh Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                       <thead className="sticky top-0 bg-slate-900 z-10">
                          <tr className="border-b border-white/5">
                             <th className="p-4 w-12 text-center">
                                <button onClick={toggleSelectAll} className="text-blue-500">
                                   {selectedNumbers.length === externalData.length && externalData.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                </button>
                             </th>
                             <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Name</th>
                             <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Phone</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {externalData.map((row, idx) => (
                             <tr key={idx} className={`hover:bg-white/5 transition-colors ${selectedNumbers.includes(row.phone) ? 'bg-blue-500/5' : ''}`}>
                                <td className="p-4 text-center">
                                   <button onClick={() => toggleSelect(row.phone)} className="text-slate-500 hover:text-blue-500">
                                      {selectedNumbers.includes(row.phone) ? <CheckSquare size={18} className="text-blue-500" /> : <Square size={18} />}
                                   </button>
                                </td>
                                <td className="p-4 font-bold text-white text-sm">{row.name}</td>
                                <td className="p-4 text-slate-400 text-sm">{row.phone}</td>
                             </tr>
                          ))}
                          {externalData.length === 0 && (
                             <tr>
                                <td colSpan="3" className="p-12 text-center text-slate-500 font-bold uppercase text-xs tracking-widest">
                                   No data fetched. Click refresh to sync.
                                </td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </CardContent>
           </Card>

           <Card glass className="border-blue-500/20 bg-blue-600/5">
              <CardContent className="p-8">
                 <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 space-y-4 w-full">
                       <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center">
                             <Send size={16} className="mr-2 text-blue-500" /> Quick Message
                          </h4>
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-full">
                             {selectedNumbers.length} Selected
                          </span>
                       </div>
                       <textarea 
                          rows="3"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition-all"
                          placeholder="Write your broadcast message here..."
                       />
                    </div>
                    <Button 
                      onClick={handleSendSMS}
                      disabled={isSending || selectedNumbers.length === 0}
                      className="h-[60px] px-10 rounded-2xl shadow-xl shadow-blue-600/20"
                    >
                       {isSending ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} className="mr-2 fill-current" />}
                       {isSending ? 'Sending...' : 'Broadcast Now'}
                    </Button>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default DatabaseIntegration;
