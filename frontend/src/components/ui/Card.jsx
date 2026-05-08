import React from 'react';
import { cn } from './Button';

export const Card = ({ className, children, glass = false }) => {
  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-300',
        glass 
          ? 'bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10' 
          : 'bg-slate-900 border-slate-800 hover:border-slate-700',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children }) => (
  <div className={cn('p-6 border-b border-slate-800/50', className)}>{children}</div>
);

export const CardContent = ({ className, children }) => (
  <div className={cn('p-6', className)}>{children}</div>
);

export const CardFooter = ({ className, children }) => (
  <div className={cn('p-6 border-t border-slate-800/50', className)}>{children}</div>
);
