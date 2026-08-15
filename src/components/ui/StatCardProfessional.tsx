import { LucideIcon } from 'lucide-react';

interface StatCardProfessionalProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'slate' | 'zinc' | 'stone' | 'neutral';
  onClick?: () => void;
}

export function StatCardProfessional({
  title,
  value,
  icon: Icon,
  trend,
  color = 'slate',
  onClick,
}: StatCardProfessionalProps) {
  const colorClasses = {
    slate: {
      bg: 'bg-slate-50',
      bgDark: 'dark:bg-slate-800/50',
      border: 'border-slate-200 dark:border-slate-700',
      icon: 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400',
      text: 'text-slate-700 dark:text-slate-300',
      hover: 'hover:border-slate-300 dark:hover:border-slate-600',
      shadow: 'hover:shadow-slate-200/50 dark:hover:shadow-slate-900/30',
    },
    zinc: {
      bg: 'bg-zinc-50',
      bgDark: 'dark:bg-zinc-800/50',
      border: 'border-zinc-200 dark:border-zinc-700',
      icon: 'bg-zinc-100 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400',
      text: 'text-zinc-700 dark:text-zinc-300',
      hover: 'hover:border-zinc-300 dark:hover:border-zinc-600',
      shadow: 'hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/30',
    },
    stone: {
      bg: 'bg-stone-50',
      bgDark: 'dark:bg-stone-800/50',
      border: 'border-stone-200 dark:border-stone-700',
      icon: 'bg-stone-100 dark:bg-stone-700/50 text-stone-600 dark:text-stone-400',
      text: 'text-stone-700 dark:text-stone-300',
      hover: 'hover:border-stone-300 dark:hover:border-stone-600',
      shadow: 'hover:shadow-stone-200/50 dark:hover:shadow-stone-900/30',
    },
    neutral: {
      bg: 'bg-neutral-50',
      bgDark: 'dark:bg-neutral-800/50',
      border: 'border-neutral-200 dark:border-neutral-700',
      icon: 'bg-neutral-100 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-400',
      text: 'text-neutral-700 dark:text-neutral-300',
      hover: 'hover:border-neutral-300 dark:hover:border-neutral-600',
      shadow: 'hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/30',
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden
        ${colors.bg} ${colors.bgDark}
        border ${colors.border}
        rounded-lg p-6
        transition-all duration-200 ease-in-out
        hover:shadow-md ${colors.shadow}
        ${colors.hover}
        ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}
        group
      `}
    >
      {/* Content */}
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
            {title}
          </p>
          <p className={`text-3xl font-semibold ${colors.text} mb-1`}>
            {value}
          </p>
          
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">vs mês anterior</span>
            </div>
          )}
        </div>

        {/* Icon */}
        <div className={`
          flex-shrink-0
          ${colors.icon}
          rounded-md p-3
          transition-transform duration-200
          ${onClick ? 'group-hover:scale-110' : ''}
        `}>
          <Icon size={20} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
