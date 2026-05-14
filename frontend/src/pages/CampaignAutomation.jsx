import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, Send, Play, Pause, CheckCircle2, AlertCircle, Clock, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/auth/InputField';
import api from '../services/api';
import toast from 'react-hot-toast';

const CampaignAutomation = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    message_template: '',
    contact_group_id: ''
  });

  const fetchData = async () => {
    try {
      const [campRes, groupRes] = await Promise.all([
        api.get('/campaigns/'),
        api.get('/groups/')
      ]);
      setCampaigns(campRes.data);
      setGroups(groupRes.data);
    } catch (err) {
      toast.error('Failed to fetch campaign data');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      // Use the functional state check to see if polling is needed
      setCampaigns(prev => {
        const isAnyRunning = prev.some(c => c.status === 'RUNNING');
        if (isAnyRunning) {
          fetchData();
        }
        return prev;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      if (editingCampaign) {
        await api.put(`/campaigns/${editingCampaign.id}`, newCampaign);
        toast.success('Campaign updated successfully');
      } else {
        await api.post('/campaigns/', newCampaign);
        toast.success('Campaign created successfully');
      }
      setIsModalOpen(false);
      setEditingCampaign(null);
      setNewCampaign({ name: '', message_template: '', contact_group_id: '' });
      fetchData();
    } catch (err) {
      toast.error(editingCampaign ? 'Failed to update campaign' : 'Failed to create campaign');
    }
  };

  const handleStartCampaign = async (id) => {
    try {
      await api.post(`/campaigns/${id}/start`);
      toast.success('Campaign started!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start campaign');
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await api.delete(`/campaigns/${id}`);
      toast.success('Campaign deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete campaign');
    }
  };

  const openEditModal = (camp) => {
    setEditingCampaign(camp);
    setNewCampaign({
      name: camp.name,
      message_template: camp.message_template,
      contact_group_id: camp.contact_group_id
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">SMS Campaigns</h1>
          <p className="text-slate-400 mt-1">Automate bulk SMS delivery and track real-time performance.</p>
        </div>
        <Button onClick={() => { setEditingCampaign(null); setNewCampaign({ name: '', message_template: '', contact_group_id: '' }); setIsModalOpen(true); }} className="rounded-xl">
          <Plus size={18} className="mr-2" /> Create Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {campaigns.map((camp) => (
          <motion.div key={camp.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card glass className="overflow-hidden">
               <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-8">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                           <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                             camp.status === 'RUNNING' ? 'bg-blue-600 animate-pulse' : 
                             camp.status === 'COMPLETED' ? 'bg-emerald-600' : 'bg-slate-800'
                           }`}>
                              <Zap size={20} className="text-white" />
                           </div>
                           <div>
                              <h3 className="text-xl font-bold text-white">{camp.name}</h3>
                              <div className="flex items-center text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                                 <span className={`h-2 w-2 rounded-full mr-2 ${
                                   camp.status === 'RUNNING' ? 'bg-blue-500' : 
                                   camp.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-slate-500'
                                 }`} />
                                 {camp.status}
                              </div>
                           </div>
                        </div>
                        <div className="flex space-x-2">
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(camp)}>
                              <Edit2 size={14} className="text-slate-400 hover:text-white" />
                           </Button>
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDeleteCampaign(camp.id)}>
                              <Trash2 size={14} className="text-slate-400 hover:text-red-500" />
                           </Button>
                        </div>
                     </div>
                     <p className="text-slate-400 text-sm italic line-clamp-2">"{camp.message_template}"</p>
                  </div>
                  
                  <div className="lg:w-80 bg-white/[0.02] border-l border-white/5 p-8 flex flex-col justify-center space-y-6">
                     <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                           <span>Progress</span>
                           <span>{camp.sent_messages} / {camp.total_messages}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-blue-600 transition-all duration-1000" 
                             style={{ width: `${(camp.sent_messages / camp.total_messages) * 100}%` }} 
                           />
                        </div>
                     </div>
                     
                     <div className="flex gap-3">
                        {(camp.status === 'PENDING' || camp.status === 'FAILED') && (
                          <Button onClick={() => handleStartCampaign(camp.id)} className="flex-1 h-10 rounded-lg">
                            <Play size={16} className="mr-2" /> 
                            {camp.status === 'FAILED' ? 'Retry' : 'Start'}
                          </Button>
                        )}
                        <Button variant="secondary" className="flex-1 h-10 rounded-lg">
                           Analytics
                        </Button>
                     </div>
                  </div>
               </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => { setIsModalOpen(false); setEditingCampaign(null); }} />
           <Card className="w-full max-w-2xl relative z-10 overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6">{editingCampaign ? 'Edit Campaign' : 'Launch New Campaign'}</h2>
                <form onSubmit={handleCreateCampaign} className="space-y-6">
                   <InputField 
                      label="Campaign Name" 
                      placeholder="e.g. Summer Sale 2026" 
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                      required
                   />
                   
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Select Audience Group</label>
                      <select 
                        className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50"
                        value={newCampaign.contact_group_id}
                        onChange={(e) => setNewCampaign({...newCampaign, contact_group_id: e.target.value})}
                        required
                      >
                        <option value="">Select a group</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Message Template</label>
                      <textarea 
                        className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 min-h-[120px]"
                        placeholder="Hello {{name}}, welcome to CloudSMS!"
                        value={newCampaign.message_template}
                        onChange={(e) => setNewCampaign({...newCampaign, message_template: e.target.value})}
                        required
                      />
                      <p className="text-[10px] text-slate-500 font-medium">Use {"{{name}}"} for personalization.</p>
                   </div>

                   <div className="flex space-x-4 pt-4">
                      <Button type="button" variant="secondary" className="flex-1" onClick={() => { setIsModalOpen(false); setEditingCampaign(null); }}>Cancel</Button>
                      <Button type="submit" className="flex-1">{editingCampaign ? 'Update Campaign' : 'Create Campaign'}</Button>
                   </div>
                </form>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
};

export default CampaignAutomation;
