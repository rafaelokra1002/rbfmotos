import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

export function Loading({ size = 'md', text, fullScreen = false }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };
  
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full border-4 border-slate-700`}></div>
        <div className={`${sizeClasses[size]} rounded-full border-4 border-amber-400 border-t-transparent animate-spin absolute inset-0`}></div>
      </div>
      {text && (
        <p className="text-slate-300 font-medium text-center">{text}</p>
      )}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }
  
  return content;
}

// Loading inline para botões
export function LoadingSpinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} />;
}

// Loading para skeleton
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-700 rounded ${className}`}></div>
  );
}
