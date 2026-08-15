interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  status,
  className = '',
}: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-500',
    away: 'bg-amber-500',
    busy: 'bg-red-500',
  };

  const statusSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`
        ${sizes[size]}
        rounded-full overflow-hidden
        bg-gradient-to-br from-orange-500 to-purple-600
        flex items-center justify-center
        text-white font-semibold
        ring-2 ring-slate-700
      `}>
        {src ? (
          <img 
            src={src} 
            alt={alt || name || 'Avatar'} 
            className="w-full h-full object-cover"
          />
        ) : name ? (
          <span>{getInitials(name)}</span>
        ) : (
          <span>?</span>
        )}
      </div>
      
      {status && (
        <div className={`
          absolute bottom-0 right-0
          ${statusSizes[size]}
          ${statusColors[status]}
          rounded-full
          ring-2 ring-slate-800
        `} />
      )}
    </div>
  );
}
