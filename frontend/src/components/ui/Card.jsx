import React from 'react';
import { cn } from './Button';

export const Card = ({ className, children, glass = false }) => {
  return (
    <div
      className={cn(
        'rounded-3xl border transition-all duration-500 overflow-hidden',
        glass 
          ? 'bg-white/[0.02] backdrop-blur-2xl border-white/[0.08] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)]' 
          : 'bg-[#0a0c14] border-white/5',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children }) => (
  <div className={cn('p-8 border-b border-white/5', className)}>{children}</div>
);

export const CardContent = ({ className, children }) => (
  <div className={cn('p-8', className)}>{children}</div>
);

export const CardFooter = ({ className, children }) => (
  <div className={cn('p-8 border-t border-white/5', className)}>{children}</div>
);
