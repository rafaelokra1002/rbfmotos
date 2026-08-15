import React from 'react';
import { CheckCircle, XCircle, Clock, Circle, AlertCircle, Package } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

export function Badge({ 
  children, 
  variant = 'neutral', 
  size = 'md', 
  icon,
  className = '' 
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1.5 rounded-full font-medium border';

  const variantClasses = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
    error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
    primary: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };
  
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {icon && React.cloneElement(icon as React.ReactElement, { size: iconSize })}
      {children}
    </span>
  );
}

// Badge específico para status de ordens
interface StatusBadgeProps {
  status: 'aberta' | 'em_andamento' | 'pronta' | 'entregue' | 'cancelada' | 'aguardando_pecas' | 'aguardando_aprovacao';
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig = {
    aberta: {
      label: 'Aberta',
      variant: 'info' as const,
      icon: <Circle />,
    },
    em_andamento: {
      label: 'Em Andamento',
      variant: 'warning' as const,
      icon: <Clock />,
    },
    pronta: {
      label: 'Pronta',
      variant: 'success' as const,
      icon: <CheckCircle />,
    },
    entregue: {
      label: 'Entregue',
      variant: 'neutral' as const,
      icon: <CheckCircle />,
    },
    cancelada: {
      label: 'Cancelada',
      variant: 'error' as const,
      icon: <XCircle />,
    },
    aguardando_pecas: {
      label: 'Aguardando Peças',
      variant: 'warning' as const,
      icon: <Package />,
    },
    aguardando_aprovacao: {
      label: 'Aguardando Aprovação',
      variant: 'warning' as const,
      icon: <AlertCircle />,
    },
  };
  
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} size={size} icon={config.icon}>
      {config.label}
    </Badge>
  );
}
