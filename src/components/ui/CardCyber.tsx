import { ReactNode } from 'react';

export interface CardCyberProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  noPadding?: boolean;
  variant?: 'default' | 'highlighted' | 'danger' | 'success';
}

const variantStyles = {
  default: 'border-neon-cyan/30 shadow-neon-cyan/10',
  highlighted: 'border-neon-purple/40 shadow-neon-purple/20 bg-neon-purple/5',
  danger: 'border-neon-pink/40 shadow-neon-pink/20 bg-neon-pink/5',
  success: 'border-neon-green/40 shadow-neon-green/20 bg-neon-green/5',
};

export function CardCyber({
  children,
  title,
  subtitle,
  icon,
  className = '',
  noPadding = false,
  variant = 'default',
}: CardCyberProps) {
  return (
    <div
      className={`
        relative rounded-xl border backdrop-blur-sm shadow-xl
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {/* Cyber grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5 rounded-xl overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #00F0FF 1px, transparent 1px),
            linear-gradient(to bottom, #00F0FF 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Header */}
      {(title || icon) && (
        <div className="relative px-6 py-4 border-b border-neon-cyan/20 bg-slate-800/30">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="text-neon-cyan">{icon}</div>
            )}
            <div className="flex-1">
              {title && (
                <h3 className="text-lg font-semibold text-neon-cyan uppercase tracking-normal">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`relative ${noPadding ? '' : 'p-6'}`}>
        {children}
      </div>

      {/* Neon glow effect */}
      <div className="absolute inset-0 rounded-xl pointer-events-none border border-neon-cyan/0 transition-all" />
    </div>
  );
}
