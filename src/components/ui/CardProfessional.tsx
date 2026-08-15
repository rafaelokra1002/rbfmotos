import { ReactNode } from 'react';

interface CardProfessionalProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'flat';
  className?: string;
  onClick?: () => void;
}

export function CardProfessional({ 
  children, 
  variant = 'default', 
  className = '', 
  onClick 
}: CardProfessionalProps) {
  const baseClasses = 'bg-white dark:bg-slate-800/50 rounded-lg border transition-all duration-200';
  
  const variantClasses = {
    default: 'border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600',
    elevated: 'border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:-translate-y-0.5',
    flat: 'border-slate-200 dark:border-slate-700',
  };
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  return (
    <div className={`px-6 py-4 border-b border-slate-200 dark:border-slate-700 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string 
}) {
  return (
    <div className={`px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 ${className}`}>
      {children}
    </div>
  );
}
