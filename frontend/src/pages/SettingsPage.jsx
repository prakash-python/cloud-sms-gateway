import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Globe, Key, Database, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const SettingsItem = ({ icon: Icon, title, description, action }) => (
  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all">
    <div className="flex items-center space-x-4">
      <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
    <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400">
      {action || 'Configure'}
    </Button>
  </div>
);

const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account preferences and system configurations.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card glass>
          <CardHeader>
            <h3 className="text-lg font-bold">Profile Information</h3>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6 pb-6 border-b border-white/5">
              <div className="h-20 w-20 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl font-black text-white">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">{user?.first_name} {user?.last_name}</h4>
                <p className="text-slate-400">{user?.email}</p>
                <div className="mt-2 inline-flex items-center px-2 py-1 bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-500/20">
                  {user?.role?.name || 'Customer'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingsItem icon={User} title="Account Details" description="Update your personal info and email." />
              <SettingsItem icon={Shield} title="Security" description="Change password and 2FA settings." action="Update" />
              <SettingsItem icon={Bell} title="Notifications" description="Manage email and SMS alerts." />
              <SettingsItem icon={Globe} title="Regional Settings" description="Timezone: {user?.country || 'UTC'}" action="Edit" />
            </div>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <h3 className="text-lg font-bold">Developer & API</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingsItem icon={Key} title="API Keys" description="Manage secret keys for REST API access." action="View Keys" />
            <SettingsItem icon={Database} title="Webhooks" description="Configure endpoint for delivery reports." />
            <SettingsItem icon={Smartphone} title="Device Sync" description="Manage hardware connection protocols." />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
