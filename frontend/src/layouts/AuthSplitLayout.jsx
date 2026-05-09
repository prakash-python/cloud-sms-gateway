import React from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Shield, Zap, Globe, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeatureItem = ({ icon: Icon, text }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    className="flex items-center space-x-3 text-slate-300 group"
  >
    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
      <Icon size={18} />
    </div>
    <span className="text-sm font-medium tracking-tight">{text}</span>
  </motion.div>
);

const AuthSplitLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col lg:flex-row overflow-hidden selection:bg-blue-500/30">
      {/* Left Panel: Marketing Content */}
      <div className="hidden lg:flex flex-1 relative bg-slate-950 flex-col p-16 justify-between overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 animated-grid opacity-30" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3 group w-fit">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:scale-110 transition-transform">
              <Send className="text-white transform -rotate-45" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tighter text-white">CloudSMS</span>
          </Link>

          <div className="mt-20 max-w-lg">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold leading-[1.1] premium-gradient-text"
            >
              Powering Real-Time <br />
              SMS Infrastructure <br />
              <span className="text-blue-500">Globally.</span>
            </motion.h1>
            <p className="mt-6 text-slate-400 text-lg font-medium leading-relaxed">
              Connect Android devices to the cloud and send SMS globally using secure WebSocket-powered infrastructure.
            </p>

            <div className="mt-12 space-y-5">
              <FeatureItem icon={Shield} text="Secure WebSocket Architecture" />
              <FeatureItem icon={Zap} text="Real-time Delivery Reports" />
              <FeatureItem icon={Globe} text="Android Cloud Synchronization" />
              <FeatureItem icon={Send} text="Enterprise-grade REST API" />
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto pt-10 border-t border-white/5">
           <div className="flex items-center space-x-12">
              <div>
                <p className="text-2xl font-bold text-white tracking-tighter">99.9%</p>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Uptime SLA</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white tracking-tighter">{"<"} 100ms</p>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Latency</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white tracking-tighter">10k+</p>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Devices Synced</p>
              </div>
           </div>
        </div>
      </div>

      {/* Right Panel: Auth Forms */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        {/* Back to Home Button */}
        <div className="absolute top-8 right-8">
           <Link to="/" className="flex items-center space-x-2 text-slate-500 hover:text-white transition-colors text-sm font-bold tracking-tight">
             <ArrowLeft size={16} />
             <span>Back to Home</span>
           </Link>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden absolute top-8 left-8">
           <Link to="/" className="flex items-center space-x-2">
             <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/40">
                <Send className="text-white transform -rotate-45" size={16} />
             </div>
             <span className="text-lg font-bold tracking-tighter">CloudSMS</span>
           </Link>
        </div>

        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthSplitLayout;
