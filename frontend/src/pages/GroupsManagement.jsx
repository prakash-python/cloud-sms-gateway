import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Upload, Search, Trash2, UserPlus, FileText } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/auth/InputField';
import api from '../services/api';
import toast from 'react-hot-toast';

const GroupsManagement = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups/');
      setGroups(res.data);
    } catch (err) {
      toast.error('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/groups/', { name: newGroupName });
      toast.success('Group created successfully');
      setNewGroupName('');
      setIsModalOpen(false);
      fetchGroups();
    } catch (err) {
      toast.error('Failed to create group');
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Contact Groups</h1>
          <p className="text-slate-400 mt-1">Organize your audience into segments for targeted campaigns.</p>
        </div>
        <div className="flex space-x-3">
           <Button onClick={() => setIsModalOpen(true)} className="rounded-xl">
             <Plus size={18} className="mr-2" /> New Group
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <motion.div key={group.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card glass className="hover:border-blue-500/30 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Users size={20} />
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-slate-500 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1">{group.name}</h3>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-6">Source: {group.source_type}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                   <div className="flex items-center text-slate-400 text-sm">
                      <FileText size={14} className="mr-2" />
                      <span className="font-bold">0</span> contacts
                   </div>
                   <Button variant="ghost" size="sm" className="h-8 rounded-lg text-blue-500 hover:text-blue-400">
                      View List
                   </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
           <Card className="w-full max-w-md relative z-10 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Group</h2>
              <form onSubmit={handleCreateGroup} className="space-y-6">
                 <InputField 
                    label="Group Name" 
                    placeholder="e.g. Beta Testers" 
                    value={newGroupName} 
                    onChange={(e) => setNewGroupName(e.target.value)}
                    required
                 />
                 <div className="flex space-x-4">
                    <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1">Create</Button>
                 </div>
              </form>
           </Card>
        </div>
      )}
    </div>
  );
};

export default GroupsManagement;
