import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverable = false,
  glass = false,
  ...props
}) => {
  const base = glass
    ? 'glass-card p-6'
    : 'bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6';

  const hoverClass = hoverable
    ? 'hover:-translate-y-1 hover:shadow-[var(--shadow-glow)] hover:border-[var(--accent-primary)]/30 transition-all duration-300'
    : '';

  return (
    <div className={`${base} ${hoverClass} ${className}`} {...props}>
      {children}
    </div>
  );
};
