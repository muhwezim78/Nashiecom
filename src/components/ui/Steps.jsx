import React from 'react';

export const Steps = ({ current = 0, items = [], className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {items.map((item, index) => {
        const isCompleted = index < current;
        const isCurrent = index === current;
        
        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                  isCompleted ? 'bg-emerald-500 text-[var(--bg-primary)]' : 
                  isCurrent ? 'bg-cyan-500 text-[var(--bg-primary)] shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 
                  'bg-[var(--bg-glass)] text-[var(--text-muted)]'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className={`mt-2 text-xs font-medium ${isCurrent ? 'text-cyan-500' : isCompleted ? 'text-emerald-500' : 'text-[var(--text-secondary)]'}`}>
                {item.title}
              </div>
            </div>
            {index < items.length - 1 && (
              <div className={`flex-1 h-1 mx-4 rounded ${isCompleted ? 'bg-emerald-500' : 'bg-[var(--bg-glass)]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
