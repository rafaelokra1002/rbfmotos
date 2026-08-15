import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="mb-4 p-4 rounded-full bg-slate-800/50 text-slate-500">
          {icon}
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-6 max-w-md">{description}</p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
