import { InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

export interface InputCyberProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  helperText?: string;
  fullWidth?: boolean;
}

export function InputCyber({
  label,
  error,
  icon: Icon,
  helperText,
  fullWidth = true,
  className = '',
  ...props
}: InputCyberProps) {
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative group">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors"
          />
        )}
        
        <input
          {...props}
          className={`
            w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-lg text-sm text-slate-900 dark:text-slate-100
            placeholder-slate-400 transition-all
            focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-600'}
            ${className}
          `}
        />
      </div>
      
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
