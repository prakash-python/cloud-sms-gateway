import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)] border border-blue-400/20 active:bg-blue-700',
    secondary: 'bg-white/[0.03] text-slate-100 hover:bg-white/[0.08] border border-white/[0.08] backdrop-blur-md active:bg-white/[0.12]',
    ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-white/[0.05]',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider',
    md: 'px-5 py-2.5 text-sm font-bold tracking-tight',
    lg: 'px-8 py-3.5 text-base font-bold tracking-tight',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:grayscale',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : null}
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
