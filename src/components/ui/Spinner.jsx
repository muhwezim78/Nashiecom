import React from 'react';

export const Spinner = ({ className = '', size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-5 h-5 border-2' : size === 'lg' ? 'w-12 h-12 border-4' : 'w-10 h-10 border-3';
  return (
    <div className="flex justify-center items-center">
      <div className={`spinner ${sizeClass} ${className}`} />
    </div>
  );
};

export const Spin = ({ children, spinning = false, className = '' }) => {
  if (!spinning) return <>{children}</>;
  return (
    <div className={`relative ${className}`}>
      <div className="opacity-50 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Spinner />
      </div>
    </div>
  );
};
