import React from 'react';

export type BadgeVariant = 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info' 
  | 'pending'
  | 'default';

export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeCyberProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
  warning: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30',
  error: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30',
  info: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
  pending: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
  default: 'bg-slate-100 dark:bg-slate-700/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-600/30',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export function BadgeCyber({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  pulse = false,
}: BadgeCyberProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-lg font-medium
        border transition-all
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {pulse && (
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
          variant === 'success' ? 'bg-emerald-500' :
          variant === 'warning' ? 'bg-yellow-500' :
          variant === 'error' ? 'bg-red-500' :
          variant === 'info' ? 'bg-blue-500' :
          variant === 'pending' ? 'bg-purple-500' :
          'bg-slate-500'
        }`} />
      )}
      {children}
    </span>
  );
}
