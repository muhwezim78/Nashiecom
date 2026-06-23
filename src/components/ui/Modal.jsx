import React, { useEffect } from 'react';
import { Card } from './Card';

export const Modal = ({ isOpen, onClose, title, children, footer, className = '' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-lg z-10 fade-in ${className}`}>
        <Card>
          {title && (
            <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-4 mb-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{title}</h2>
              <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          )}
          <div className="py-2">{children}</div>
          {footer && (
            <div className="border-t border-[var(--border-main)] pt-4 mt-4 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
