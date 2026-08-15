import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface AlertProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({ variant, title, children, onClose, className = '' }: AlertProps) {
  const config = {
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      icon: <CheckCircle size={20} />,
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: <XCircle size={20} />,
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      icon: <AlertCircle size={20} />,
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      icon: <Info size={20} />,
    },
  };
  
  const style = config[variant];
  
  return (
    <div className={`p-4 rounded-lg border flex items-start gap-3 ${style.bg} ${style.border} ${style.text} ${className}`}>
      <div className="flex-shrink-0 mt-0.5">
        {style.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold mb-1">{title}</h4>
        )}
        <div className="text-sm opacity-90">
          {children}
        </div>
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity"
          aria-label="Fechar alerta"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
