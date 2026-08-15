import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  options: Array<{ value: string | number; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helpText, options, className = '', required, ...props }, ref) => {
    const selectId = props.id || `select-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId}
            className={`block text-sm font-medium text-slate-300 mb-2 ${required ? 'after:content-["*"] after:ml-1 after:text-red-400' : ''}`}
          >
            {label}
          </label>
        )}
        
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-4 py-2.5 bg-slate-700 border rounded-lg text-slate-100
            focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-250
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-400' : 'border-slate-600 focus:ring-amber-400'}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <p className="mt-1.5 text-sm text-red-400">{error}</p>
        )}
        
        {helpText && !error && (
          <p className="mt-1.5 text-sm text-slate-400">{helpText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
