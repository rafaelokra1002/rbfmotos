import React, { InputHTMLAttributes, forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, icon, required, className = '', ...props }, ref) => {
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className={`block text-sm font-medium text-slate-300 mb-2 ${required ? 'after:content-["*"] after:ml-1 after:text-red-400' : ''}`}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-2.5 bg-slate-700 border rounded-lg text-slate-100 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-250
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-500 focus:ring-red-400' : 'border-slate-600 focus:ring-amber-400'}
              ${className}
            `}
            {...props}
          />
          
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
              <AlertCircle size={20} />
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
            <AlertCircle size={14} />
            {error}
          </p>
        )}
        
        {helpText && !error && (
          <p className="mt-1.5 text-sm text-slate-400">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
