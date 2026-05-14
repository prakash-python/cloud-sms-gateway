import React from 'react';
import { motion } from 'framer-motion';
import { Database, Link as LinkIcon, Globe, Shield, Cpu, Code } from 'lucide-react';
import { Link } from 'react-router-dom';

const IntegrationCard = ({ icon: Icon, title, description, status, link }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="h-12 w-12 bg-slate-800 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
        <Icon size={24} />
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
        status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'
      }`}>
        {status}
      </span>
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed mb-6">{description}</p>
    {link ? (
      <Link to={link} className="text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors flex items-center">
        Configure <LinkIcon size={14} className="ml-2" />
      </Link>
    ) : (
      <button className="text-sm font-bold text-slate-500 cursor-not-allowed flex items-center">
        Coming Soon <LinkIcon size={14} className="ml-2" />
      </button>
    )}
  </motion.div>
);

const IntegrationsPage = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white tracking-tight">Integrations</h1>
        <p className="text-slate-400 mt-2 font-medium">Connect your favorite tools and external databases to CloudSMS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <IntegrationCard 
          icon={Database}
          title="External Databases"
          description="Connect PostgreSQL, MySQL or MongoDB to automatically fetch contacts for your campaigns."
          status="Active"
          link="/dashboard/integrations/db"
        />
        <IntegrationCard 
          icon={Globe}
          title="Webhooks"
          description="Send real-time delivery reports and incoming SMS notifications to your external servers."
        />
        <IntegrationCard 
          icon={Code}
          title="REST API"
          description="Full access to send messages and manage devices programmatically via our secure API."
        />
        <IntegrationCard 
          icon={Shield}
          title="Zapier"
          description="Automate your SMS workflows by connecting with 5,000+ apps on Zapier."
          status="Coming Soon"
        />
        <IntegrationCard 
          icon={Cpu}
          title="IoT Gateway"
          description="Direct hardware integration for industrial monitoring and alert systems."
          status="Coming Soon"
        />
      </div>

      <div className="mt-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 p-8 rounded-3xl backdrop-blur-md">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">Looking for a custom integration?</h2>
          <p className="text-slate-300 mb-6 leading-relaxed">
            Our engineering team can help you build custom connectors for your specific enterprise needs. 
            From legacy mainframes to modern serverless architectures.
          </p>
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-600/30">
            Contact Enterprise Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
