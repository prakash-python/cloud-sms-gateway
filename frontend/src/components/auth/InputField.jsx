import React from 'react';

export const InputField = ({ label, icon: Icon, error, isValid, ...props }) => {
  return (
    <div className="space-y-1.5 group">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className={`
            absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300
            ${error ? 'text-red-500' : isValid ? 'text-emerald-500' : 'text-slate-500 group-focus-within:text-blue-500'}
          `}>
            <Icon size={18} />
          </div>
        )}
        <input
          {...props}
          className={`
            w-full bg-slate-900/40 backdrop-blur-sm border rounded-2xl py-3 px-4 text-sm text-white transition-all duration-300
            ${Icon ? 'pl-11' : ''}
            ${error 
              ? 'border-red-500/50 bg-red-500/5 focus:ring-red-500/10' 
              : isValid 
                ? 'border-emerald-500/50 bg-emerald-500/5 focus:ring-emerald-500/10' 
                : 'border-white/5 focus:border-blue-500/50 focus:ring-blue-500/10'}
            focus:outline-none focus:ring-4
          `}
        />
        {isValid && !error && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-fade-in">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
             </svg>
          </div>
        )}
      </div>
      {error && <p className="text-[11px] text-red-500 ml-1 font-bold animate-slide-up">{error}</p>}
    </div>
  );
};
