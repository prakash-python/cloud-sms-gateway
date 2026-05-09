import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Send, Shield, Cpu, Zap, BarChart3, Cloud, Layout, 
  ChevronRight, Github, Twitter, Linkedin, Check, 
  Smartphone, Code, Play, Plus, Minus, Mail, Lock, Globe, Server, User, ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

// Reusable Components
const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/50 transition-all duration-500 overflow-hidden"
  >
    <div className={`absolute -inset-px bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div className="relative z-10">
      <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
    </div>
  </motion.div>
);

const StepItem = ({ step, title, description, isLast }) => (
  <div className="relative flex flex-col items-center text-center group">
    <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-blue-500 mb-6 group-hover:border-blue-500/50 group-hover:scale-110 transition-all duration-500 relative z-10">
      <span className="text-2xl font-bold italic font-mono">{step}</span>
      <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm max-w-[200px]">{description}</p>
    {!isLast && (
      <div className="hidden lg:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-blue-500/50 to-transparent" />
    )}
  </div>
);

const CodeSnippet = ({ language, code }) => (
  <div className="rounded-2xl border border-white/5 bg-[#0a0c14] overflow-hidden font-mono text-sm leading-relaxed shadow-2xl">
    <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
       <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-red-500/50" />
          <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
          <div className="h-2 w-2 rounded-full bg-green-500/50" />
       </div>
       <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{language}</span>
    </div>
    <pre className="p-6 text-slate-300 overflow-x-auto">
      <code>{code}</code>
    </pre>
  </div>
);

const PricingCard = ({ plan, price, features, highlighted }) => (
  <Card glass className={`p-8 relative ${highlighted ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-white/5'}`}>
    {highlighted && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
        Most Popular
      </div>
    )}
    <h3 className="text-xl font-bold text-white mb-2">{plan}</h3>
    <div className="flex items-baseline space-x-1 mb-8">
      <span className="text-4xl font-bold text-white">${price}</span>
      <span className="text-slate-500">/month</span>
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((f, i) => (
        <li key={i} className="flex items-center text-sm text-slate-400">
          <Check size={14} className="text-emerald-500 mr-3 shrink-0" /> {f}
        </li>
      ))}
    </ul>
    <Button variant={highlighted ? 'primary' : 'secondary'} className="w-full rounded-xl py-3">
      Choose {plan}
    </Button>
  </Card>
);

const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left hover:text-blue-500 transition-colors"
      >
        <span className="text-lg font-semibold tracking-tight">{question}</span>
        {isOpen ? <Minus size={20} /> : <Plus size={20} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-slate-400 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('js');

  const codeExamples = {
    js: `const cloudSms = require('cloud-sms');\n\nawait cloudSms.send({\n  to: "+1234567890",\n  message: "Hello World!",\n  deviceId: "my-pixel-7"\n});`,
    python: `import cloudsms\n\ncloudsms.send(\n  to="+1234567890",\n  message="Hello World!",\n  device_id="my-pixel-7"\n)`,
    curl: `curl -X POST https://api.cloudsms.io/v1/send \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -d '{\n    "to": "+1234567890",\n    "message": "Hello World!"\n  }'`
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-blue-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 animated-grid opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-blue-600/5 via-transparent to-transparent pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 h-16 bg-slate-950/50 backdrop-blur-xl border-b border-white/5 px-6">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <button onClick={scrollToTop} className="flex items-center space-x-2 group">
            <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:scale-110 transition-transform">
              <Send className="text-white transform -rotate-45" size={18} />
            </div>
            <span className="text-lg font-bold tracking-tighter">CloudSMS</span>
          </button>
          <div className="hidden lg:flex items-center space-x-10">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#developers" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Developers</a>
            <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</a>
            <a href="#docs" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Docs</a>
          </div>
          <div className="flex items-center space-x-4">
             <Link to="/login">
               <Button variant="ghost" className="text-sm font-bold">Log in</Button>
             </Link>
             <Link to="/register">
               <Button className="rounded-full px-6 text-sm font-bold shadow-lg shadow-blue-600/20">Get Started</Button>
             </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold mb-8">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span>v2.4.0 is now live</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-bold tracking-tighter premium-gradient-text leading-[1.05] mb-8">
              The Enterprise SMS Gateway <br />
              for Modern Developers.
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
              Connect Android devices to the cloud and send SMS globally using secure WebSocket-powered infrastructure. Built for reliability, speed, and scale.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Link to="/register">
                 <Button size="lg" className="rounded-full h-14 px-10 text-lg font-bold w-full sm:w-auto shadow-2xl shadow-blue-600/30">
                   Start Sending Free
                 </Button>
               </Link>
               <Button variant="secondary" size="lg" className="rounded-full h-14 px-10 text-lg font-bold w-full sm:w-auto bg-white/5 border-white/10">
                 <Play size={18} className="mr-2 fill-current" /> Watch Demo
               </Button>
            </div>
          </motion.div>

          {/* Dashboard Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-32 relative perspective-1000 group"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[40px] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-2xl p-4 overflow-hidden shadow-2xl rotate-x-6 hover:rotate-x-0 transition-transform duration-700">
               <div className="bg-slate-950 rounded-2xl aspect-video relative flex flex-col p-6 overflow-hidden">
                  {/* Fake UI Header */}
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center space-x-6">
                        <div className="h-8 w-24 bg-white/5 rounded-lg shimmer" />
                        <div className="h-8 w-24 bg-white/5 rounded-lg" />
                     </div>
                     <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center"><User size={20} /></div>
                  </div>
                  {/* Fake Stat Cards */}
                  <div className="grid grid-cols-3 gap-6 mb-12">
                     {[1,2,3].map(i => (
                       <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                          <div className="h-4 w-12 bg-slate-700 rounded mb-4" />
                          <div className="h-8 w-20 bg-white/10 rounded" />
                       </div>
                     ))}
                  </div>
                  {/* Fake Chart */}
                  <div className="flex-1 rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                     <div className="h-full w-full flex items-end justify-between space-x-2">
                        {[40,70,50,90,60,80,100,60,70,90,50].map((h, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ height: 0 }}
                            whileInView={{ height: `${h}%` }}
                            className="flex-1 bg-blue-600/30 rounded-t-lg border-t-2 border-blue-500" 
                          />
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 px-6 border-y border-white/5 bg-white/[0.01]">
         <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {['VERCEL', 'STRIPE', 'TWILIO', 'REPLIT', 'CLERK'].map(l => (
              <span key={l} className="text-2xl font-black tracking-tighter italic">{l}</span>
            ))}
         </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">Built for mission-critical scale.</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">Our infrastructure handles millions of messages with military-grade precision and millisecond latency.</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard icon={Zap} title="Real-time Dispatch" description="Low-latency WebSocket connections ensure your messages reach the device in under 100ms." />
          <FeatureCard icon={Smartphone} title="Android Sync" description="Automatic synchronization with any Android device running our native companion app." />
          <FeatureCard icon={Server} title="WebSocket Infrastructure" description="Enterprise-grade WebSocket server built to handle persistent connections at scale." />
          <FeatureCard icon={BarChart3} title="Campaign Management" description="Run bulk SMS campaigns with detailed tracking and automated retry logic." />
          <FeatureCard icon={Shield} title="JWT Security" description="State-of-the-art security with JWT authentication and encrypted data transmission." />
          <FeatureCard icon={Cloud} title="Cloud Native" description="Deploy your own instance using Docker or use our managed high-availability cloud." />
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 px-6 bg-slate-950/50 relative">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Get connected in 3 minutes.</h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-0">
          <StepItem step="01" title="Connect Device" description="Install our native Android app and pair it with your dashboard account." />
          <StepItem step="02" title="Cloud Sync" description="Your device establishes a secure, persistent WebSocket link to our cloud." />
          <StepItem step="03" title="Send SMS" description="Send SMS via our REST API, SDKs, or directly from the dashboard." isLast />
        </div>
      </section>

      {/* API Showcase */}
      <section id="developers" className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-8">Developer-first API infrastructure.</h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              Integrate global SMS capabilities into your existing workflow with just a few lines of code. Our SDKs and REST API are built for maximum flexibility.
            </p>
            <div className="space-y-4">
              {['Simple REST endpoints', 'Native JS and Python SDKs', 'Webhooks for delivery reports', 'Rich API documentation'].map((item, i) => (
                <div key={i} className="flex items-center space-x-3 text-slate-300">
                   <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Check size={12} />
                   </div>
                   <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
             <div className="flex space-x-4 mb-4">
               {['js', 'python', 'curl'].map(tab => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500 hover:text-slate-300'}`}
                 >
                   {tab}
                 </button>
               ))}
             </div>
             <CodeSnippet language={activeTab} code={codeExamples[activeTab]} />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 bg-slate-950">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-4xl font-bold tracking-tight mb-6">Simple, transparent pricing.</h2>
          <p className="text-slate-400">Scale from 1 to 1,000,000 messages with no hidden fees.</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard 
            plan="Starter" price="0" 
            features={['1 Device Connection', '50 SMS per Day', 'Basic Logs', 'Community Support']} 
          />
          <PricingCard 
            plan="Professional" price="49" highlighted
            features={['5 Device Connections', 'Unlimited SMS', 'Campaign Manager', 'API Access', 'Priority Support']} 
          />
          <PricingCard 
            plan="Enterprise" price="199" 
            features={['Unlimited Devices', 'Dedicated Instance', 'SLA Guarantee', 'SSO & Audit Logs', '24/7 Account Manager']} 
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tight mb-12 text-center">Frequently asked questions</h2>
          <div className="space-y-4">
            <AccordionItem question="How does CloudSMS work?" answer="CloudSMS connects your Android phone's native SMS capabilities to our cloud servers via a secure WebSocket. You can then trigger SMS sends from anywhere in the world using our dashboard or API." />
            <AccordionItem question="Is Android required?" answer="Yes, currently our companion app is native to Android to leverage the powerful SmsManager APIs. We support Android 8.0 and above." />
            <AccordionItem question="Is delivery tracking supported?" answer="Absolutely. We provide real-time delivery reports via WebSockets and Webhooks, so you know exactly when your message is delivered." />
            <AccordionItem question="Can I deploy my own infrastructure?" answer="Yes! For Enterprise customers, we offer a fully dockerized version of our backend that you can deploy on your own VPC for maximum privacy and compliance." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center"><Send className="text-white transform -rotate-45" size={16} /></div>
              <span className="text-lg font-bold tracking-tighter">CloudSMS</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">The modern infrastructure for global SMS dispatching and device synchronization.</p>
            <div className="flex space-x-4">
              <Twitter className="text-slate-500 hover:text-white cursor-pointer" size={20} />
              <Github className="text-slate-500 hover:text-white cursor-pointer" size={20} />
              <Linkedin className="text-slate-500 hover:text-white cursor-pointer" size={20} />
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li className="hover:text-white cursor-pointer">Features</li>
              <li className="hover:text-white cursor-pointer">Security</li>
              <li className="hover:text-white cursor-pointer">Enterprise</li>
              <li className="hover:text-white cursor-pointer">Changelog</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Developers</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li className="hover:text-white cursor-pointer">Documentation</li>
              <li className="hover:text-white cursor-pointer">API Reference</li>
              <li className="hover:text-white cursor-pointer">SDKs</li>
              <li className="hover:text-white cursor-pointer">Guides</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li className="hover:text-white cursor-pointer">Privacy Policy</li>
              <li className="hover:text-white cursor-pointer">Terms of Service</li>
              <li className="hover:text-white cursor-pointer">GDPR</li>
              <li className="hover:text-white cursor-pointer">Contact</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-xs">© 2026 CloudSMS Gateway Platform. All rights reserved.</p>
          <div className="flex items-center space-x-2 text-xs text-slate-600">
             <div className="h-2 w-2 rounded-full bg-emerald-500" />
             <span>All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
