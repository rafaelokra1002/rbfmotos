import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]';
  
  const variants = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="circular" width="48px" height="48px" />
        <Skeleton variant="rectangular" width="80px" height="24px" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="80%" />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width="100px" height="36px" />
        <Skeleton variant="rectangular" width="100px" height="36px" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
          <Skeleton variant="circular" width="40px" height="40px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="60%" />
          </div>
          <Skeleton variant="rectangular" width="80px" height="32px" />
        </div>
      ))}
    </div>
  );
}
