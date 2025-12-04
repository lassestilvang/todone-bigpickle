import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-lg';
      case 'rectangular':
      default:
        return 'rounded';
    }
  };

  const getStyles = () => {
    const styles: React.CSSProperties = {};
    if (width) styles.width = typeof width === 'number' ? `${width}px` : width;
    if (height) styles.height = typeof height === 'number' ? `${height}px` : height;
    return styles;
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getVariantClasses()}`}
            style={{
              ...getStyles(),
              width: index === lines - 1 ? '70%' : '100%' // Last line shorter
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={`${baseClasses} ${getVariantClasses()} ${className}`}
      style={getStyles()}
    />
  );
};

// Skeleton components for specific use cases
export const TaskSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-2 p-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
        <Skeleton variant="circular" width={20} height={20} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} />
        </div>
        <Skeleton width={24} height={24} variant="rounded" />
      </div>
    ))}
  </div>
);

export const ProjectSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton variant="circular" width={12} height={12} />
          <Skeleton width="60%" height={20} />
        </div>
        <div className="space-y-2">
          <Skeleton width="40%" height={14} />
          <Skeleton width="30%" height={14} />
        </div>
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="p-6 bg-white rounded-lg border border-gray-200">
    <div className="space-y-4">
      <Skeleton width="30%" height={24} />
      <Skeleton lines={3} />
      <div className="flex gap-2 pt-4">
        <Skeleton width={80} height={36} />
        <Skeleton width={80} height={36} />
      </div>
    </div>
  </div>
);

export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-1 p-4">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center gap-3 p-3 bg-white">
        <Skeleton variant="circular" width={16} height={16} />
        <Skeleton width="80%" height={16} />
      </div>
    ))}
  </div>
);