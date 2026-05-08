import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Send, Shield, Cpu, Zap, BarChart3, Cloud, Layout, 
  ChevronRight, Github, Twitter, Linkedin, Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <Card glass className="p-8 group hover:scale-[1.02] transition-transform">
    <div className="h-14 w-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </Card>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Send className="text-white transform -rotate-45" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">CloudSMS</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</a>
            <a href="#docs" className="text-slate-400 hover:text-white transition-colors">Docs</a>
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm font-semibold border border-blue-500/20 mb-8 inline-block">
              v2.0 is now live!
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
              Production Grade <br />
              <span className="text-blue-500">Cloud SMS Gateway</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Connect your Android devices to the cloud and send SMS programmatically through our robust WebSocket-powered platform. Built for developers, by developers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold">
                  Start Sending Free <ChevronRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg">
                View Documentation
              </Button>
            </div>
          </motion.div>

          {/* Screenshot Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-24 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm max-w-5xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[28px] blur opacity-20 group-hover:opacity-30 transition duration-1000" />
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-white/5">
              <img 
                src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=2070" 
                alt="Dashboard Preview" 
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <Layout size={80} className="text-blue-500 mb-4" />
                 <p className="text-2xl font-bold">Intuitive Dashboard</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for scale</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              A distributed system architecture that handles millions of messages without breaking a sweat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Cpu}
              title="Native Performance"
              description="Uses native Android SmsManager APIs for maximum reliability and speed directly through your SIM network."
            />
            <FeatureCard 
              icon={Zap}
              title="Real-time WebSockets"
              description="Low-latency WebSocket connections ensure your messages reach the device in milliseconds."
            />
            <FeatureCard 
              icon={Shield}
              title="SaaS Grade Security"
              description="JWT Authentication, encrypted WebSocket channels, and strict device authorization keep your data safe."
            />
            <FeatureCard 
              icon={BarChart3}
              title="Deep Analytics"
              description="Track delivery rates, carrier latency, and campaign success with detailed real-time charts."
            />
            <FeatureCard 
              icon={Cloud}
              title="Cloud Native"
              description="Deploy anywhere. Dockerized backend and microservice-inspired architecture for easy scaling."
            />
            <FeatureCard 
              icon={Layout}
              title="Device Fleet"
              description="Connect hundreds of devices and balance your message load across multiple SIM cards and carriers."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Send className="text-white transform -rotate-45" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">CloudSMS</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-400">
             <Twitter className="hover:text-white cursor-pointer transition-colors" size={24} />
             <Github className="hover:text-white cursor-pointer transition-colors" size={24} />
             <Linkedin className="hover:text-white cursor-pointer transition-colors" size={24} />
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 CloudSMS Gateway. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
