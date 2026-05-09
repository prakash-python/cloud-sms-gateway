import React, { useState, useEffect } from 'react';
import { UserCircle } from 'lucide-react';
import api from '../../services/api';

export const RoleSelect = ({ label, value, onChange, error }) => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get('/roles/');
        setRoles(res.data);
      } catch (err) {
        console.error('Failed to fetch roles');
      }
    };
    fetchRoles();
  }, []);

  return (
    <div className="space-y-1.5 group">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
          <UserCircle size={18} />
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full bg-slate-900/50 border rounded-xl py-2.5 px-10 text-sm text-white transition-all appearance-none
            ${error ? 'border-red-500/50 focus:ring-red-500/20' : 'border-slate-800 focus:border-blue-500/50 focus:ring-blue-500/20'}
            focus:outline-none focus:ring-4
          `}
        >
          <option value="" disabled className="bg-slate-950">Select Role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id} className="bg-slate-950">
              {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
      {error && <p className="text-[11px] text-red-500 ml-1 font-medium">{error}</p>}
    </div>
  );
};
