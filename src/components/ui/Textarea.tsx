import { TextareaHTMLAttributes, forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helpText, required, className = '', ...props }, ref) => {
    const textareaId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaId}
            className={`block text-sm font-medium text-slate-300 mb-2 ${required ? 'after:content-["*"] after:ml-1 after:text-red-400' : ''}`}
          >
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-4 py-2.5 bg-slate-700 border rounded-lg text-slate-100 placeholder-slate-400
            focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-250
            disabled:opacity-50 disabled:cursor-not-allowed resize-none
            ${error ? 'border-red-500 focus:ring-red-400' : 'border-slate-600 focus:ring-amber-400'}
            ${className}
          `}
          {...props}
        />
        
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

Textarea.displayName = 'Textarea';
