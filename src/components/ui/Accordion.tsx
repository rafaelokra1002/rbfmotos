import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function Accordion({ title, isOpen, onToggle, children }: AccordionProps) {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-left transition-colors"
      >
        <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">{title}</span>
        {isOpen ? (
          <ChevronUp size={18} className="text-slate-600 dark:text-slate-400" />
        ) : (
          <ChevronDown size={18} className="text-slate-600 dark:text-slate-400" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-4 space-y-4 bg-white dark:bg-slate-900/20">
          {children}
        </div>
      )}
    </div>
  );
}
