import React from 'react';
import { motion } from 'framer-motion';
import { 
  Download, Smartphone, ShieldCheck, CheckCircle2, 
  ArrowRight, Info, AlertTriangle, Zap, Settings,
  MessageSquare, Bell, BatteryCharging
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const SetupGuidePage = () => {
  const steps = [
    {
      title: "Download & Install",
      icon: <Download className="text-blue-500" />,
      desc: "Install the CloudSMS Gateway engine on your Android device.",
      details: [
        "Download the latest APK from the button below.",
        "Enable 'Install from Unknown Sources' in your phone settings.",
        "Open the downloaded file and click Install."
      ]
    },
    {
      title: "Secure Authentication",
      icon: <ShieldCheck className="text-emerald-500" />,
      desc: "Pair your hardware with your enterprise account.",
      details: [
        "Launch the CloudSMS app on your phone.",
        "Sign in using your dashboard credentials.",
        "The app will automatically generate a unique Gateway ID."
      ]
    },
    {
      title: "System Permissions",
      icon: <Settings className="text-orange-500" />,
      desc: "Grant mandatory hardware access for the gateway.",
      details: [
        "Allow SMS permission to send and receive messages.",
        "Allow Notification access to maintain background sync.",
        "Allow Phone State to monitor SIM and network health."
      ]
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400"
        >
          Hardware Onboarding
        </motion.div>
        <h1 className="text-5xl font-black text-white tracking-tight">Setup your Gateway</h1>
        <p className="text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
          Follow these steps to transform your Android device into a production-grade SMS infrastructure node.
        </p>
      </div>

      {/* Main Steps */}
      <div className="grid grid-cols-1 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card glass className="border-white/5 overflow-hidden group">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-64 bg-slate-900/50 p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
                    <div className="h-20 w-20 rounded-[32px] bg-slate-950 flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                      {React.cloneElement(step.icon, { size: 32 })}
                    </div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Step 0{i + 1}</span>
                  </div>
                  <div className="flex-1 p-10 space-y-6">
                    <div>
                      <h3 className="text-2xl font-black text-white">{step.title}</h3>
                      <p className="text-slate-400 mt-2 font-medium">{step.desc}</p>
                    </div>
                    <ul className="space-y-4">
                      {step.details.map((detail, j) => (
                        <li key={j} className="flex items-start gap-4">
                          <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-300 font-medium">{detail}</span>
                        </li>
                      ))}
                    </ul>
                    {i === 0 && (
                      <div className="pt-4">
                        <Button 
                          onClick={() => toast.success('Enterprise Gateway binary is being prepared for your account.')}
                          className="rounded-2xl h-14 px-8 bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/20 text-xs font-black uppercase tracking-widest"
                        >
                          Download Gateway APK <Download size={18} className="ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Permissions Deep Dive */}
      <div className="space-y-8 pt-12">
        <div className="flex items-center gap-4">
          <div className="h-px bg-white/5 flex-1" />
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-600">Permissions Required</h2>
          <div className="h-px bg-white/5 flex-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <MessageSquare size={20} />, name: "SMS Access", desc: "Required to send and receive text messages via your hardware SIM." },
            { icon: <Bell size={20} />, name: "Notifications", desc: "Ensures the gateway service remains active and synchronized in the background." },
            { icon: <Smartphone size={20} />, name: "Phone State", desc: "Used to monitor carrier signal quality and SIM slot availability." }
          ].map((p, i) => (
            <div key={i} className="p-8 rounded-[32px] bg-slate-900/30 border border-white/5 space-y-4">
              <div className="text-blue-500">{p.icon}</div>
              <h4 className="text-sm font-black text-white uppercase tracking-widest">{p.name}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Warning */}
      <Card glass className="bg-orange-500/5 border-orange-500/20 rounded-[40px]">
        <CardContent className="p-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-16 w-16 rounded-[24px] bg-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
              <BatteryCharging size={32} />
            </div>
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-black text-white">Critical: Battery Optimization</h3>
              <p className="text-sm text-slate-400 font-medium">
                To ensure 100% uptime, you must disable Battery Optimization for CloudSMS in your phone settings. This prevents Android from putting the gateway to sleep.
              </p>
            </div>
            <div className="md:ml-auto">
              <Button variant="secondary" className="rounded-2xl border-orange-500/30 text-orange-500 text-[10px] font-black uppercase tracking-widest">
                Learn How
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Footer */}
      <div className="text-center pt-12 pb-20">
         <p className="text-sm text-slate-500 font-medium mb-6">Still having trouble connecting?</p>
         <div className="flex justify-center gap-4">
            <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white">
              Watch Setup Video
            </Button>
            <div className="w-px h-10 bg-white/5" />
            <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white">
              Contact Support
            </Button>
         </div>
      </div>
    </div>
  );
};

export default SetupGuidePage;
