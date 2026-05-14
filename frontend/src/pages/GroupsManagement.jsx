import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Upload, Search, Trash2, UserPlus, FileText, Check, X } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/auth/InputField';
import api from '../services/api';
import toast from 'react-hot-toast';

const GroupsManagement = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupContacts, setGroupContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [editingContact, setEditingContact] = useState(null);

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

  const fetchGroupContacts = async (groupId) => {
    try {
      const res = await api.get(`/groups/${groupId}`);
      setGroupContacts(res.data.contacts);
      setSelectedGroup(res.data);
      setIsContactsModalOpen(true);
    } catch (err) {
      toast.error('Failed to fetch group contacts');
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

  const handleImportCSV = async (e) => {
    e.preventDefault();
    if (!csvFile) return toast.error('Please select a CSV file');
    
    const formData = new FormData();
    formData.append('name', newGroupName);
    formData.append('file', csvFile);
    
    try {
      await api.post('/groups/import/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Group imported successfully');
      setNewGroupName('');
      setCsvFile(null);
      setIsImportModalOpen(false);
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to import CSV');
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await api.put(`/groups/contacts/${editingContact.id}`, {
          full_name: newContact.name,
          phone_number: newContact.phone
        });
        toast.success('Contact updated successfully');
        setEditingContact(null);
      } else {
        await api.post(`/groups/${selectedGroup.id}/contacts`, {
          full_name: newContact.name,
          phone_number: newContact.phone
        });
        toast.success('Contact added successfully');
      }
      setNewContact({ name: '', phone: '' });
      fetchGroupContacts(selectedGroup.id);
      fetchGroups();
    } catch (err) {
      toast.error(editingContact ? 'Failed to update contact' : 'Failed to add contact');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to remove this contact?')) return;
    try {
      await api.delete(`/groups/contacts/${contactId}`);
      toast.success('Contact removed');
      fetchGroupContacts(selectedGroup.id);
      fetchGroups();
    } catch (err) {
      toast.error('Failed to remove contact');
    }
  };

  const startEditContact = (contact) => {
    setEditingContact(contact);
    setNewContact({ name: contact.full_name, phone: contact.phone_number });
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Contact Groups</h1>
          <p className="text-slate-400 mt-1">Organize your audience into segments for targeted campaigns.</p>
        </div>
        <div className="flex space-x-3">
           <Button variant="secondary" onClick={() => setIsImportModalOpen(true)} className="rounded-xl">
             <Upload size={18} className="mr-2" /> Import CSV
           </Button>
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
                      <span className="font-bold">{group.contact_count || 0}</span> contacts
                   </div>
                   <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 rounded-lg text-blue-500 hover:text-blue-400"
                      onClick={() => fetchGroupContacts(group.id)}
                   >
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

      {isContactsModalOpen && selectedGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsContactsModalOpen(false)} />
           <Card className="w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedGroup.name}</h2>
                  <p className="text-xs text-slate-500">Manage contacts in this group</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsContactsModalOpen(false)}>Close</Button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <form onSubmit={handleAddContact} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-950/50 p-4 rounded-xl border border-white/5">
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Name (Optional)</label>
                    <input 
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                      placeholder="User Name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Phone Number</label>
                    <input 
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                      placeholder="+91..."
                      required
                      value={newContact.phone}
                      onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" size="sm" className="h-9 w-9 p-0 rounded-lg" title={editingContact ? 'Update' : 'Add Contact'}>
                      {editingContact ? <Check size={18} /> : <Plus size={18} />}
                    </Button>
                    {editingContact && (
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm" 
                        className="h-9 w-9 p-0 rounded-lg"
                        title="Cancel"
                        onClick={() => {
                          setEditingContact(null);
                          setNewContact({ name: '', phone: '' });
                        }}
                      >
                        <X size={18} />
                      </Button>
                    )}
                  </div>
                </form>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contact List ({groupContacts.length})</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {groupContacts.map(contact => (
                      <div key={contact.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-white/5">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-500 text-xs font-bold">
                            {contact.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{contact.full_name || 'No Name'}</p>
                            <p className="text-xs text-slate-500">{contact.phone_number}</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => startEditContact(contact)}
                            className="text-slate-600 hover:text-blue-500 transition-colors p-1"
                          >
                            <UserPlus size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-slate-600 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {groupContacts.length === 0 && (
                      <p className="text-center py-10 text-slate-600 text-sm italic">No contacts added yet.</p>
                    )}
                  </div>
                </div>
              </div>
           </Card>
        </div>
      )}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsImportModalOpen(false)} />
           <Card className="w-full max-w-md relative z-10 p-8">
              <h2 className="text-2xl font-bold text-white mb-2">Import CSV</h2>
              <p className="text-xs text-slate-500 mb-6 uppercase tracking-widest font-bold">Bulk upload contacts from a file</p>
              
              <form onSubmit={handleImportCSV} className="space-y-6">
                 <InputField 
                    label="Group Name" 
                    placeholder="e.g. Website Leads" 
                    value={newGroupName} 
                    onChange={(e) => setNewGroupName(e.target.value)}
                    required
                 />
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Select CSV File</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept=".csv, .xlsx, .xls"
                        className="hidden" 
                        id="csv-upload"
                        onChange={(e) => setCsvFile(e.target.files[0])}
                      />
                      <label 
                        htmlFor="csv-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-800 rounded-2xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group"
                      >
                        <Upload size={24} className="text-slate-600 group-hover:text-blue-500 mb-2" />
                        <span className="text-xs text-slate-500 group-hover:text-slate-300">
                          {csvFile ? csvFile.name : 'Click to select CSV or Excel file'}
                        </span>
                      </label>
                    </div>
                    <p className="text-[10px] text-slate-600 italic mt-1">Both .csv and .xlsx files are supported.</p>
                 </div>

                 <div className="bg-slate-950/50 rounded-2xl p-4 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expected Format (CSV)</span>
                       <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">Example</span>
                    </div>
                    <div className="grid grid-cols-2 gap-px bg-slate-800 rounded-lg overflow-hidden border border-slate-800">
                       <div className="bg-slate-900 p-2 text-[10px] font-bold text-slate-300">name</div>
                       <div className="bg-slate-900 p-2 text-[10px] font-bold text-slate-300">phone</div>
                       <div className="bg-slate-950/50 p-2 text-[10px] text-slate-500">John Doe</div>
                       <div className="bg-slate-950/50 p-2 text-[10px] text-slate-500">+919876543210</div>
                       <div className="bg-slate-950/50 p-2 text-[10px] text-slate-500">Jane Smith</div>
                       <div className="bg-slate-950/50 p-2 text-[10px] text-slate-500">+919988776655</div>
                    </div>
                    <p className="text-[9px] text-slate-600 leading-tight">Headers are required. The system will auto-detect "name" and "phone" columns.</p>
                 </div>

                 <div className="flex space-x-4 pt-2">
                    <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1">Start Import</Button>
                 </div>
              </form>
           </Card>
        </div>
      )}
    </div>
  );
};

export default GroupsManagement;
