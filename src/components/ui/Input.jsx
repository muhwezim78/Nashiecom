import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = React.forwardRef(({ className = '', error, iconLeft, ...props }, ref) => {
  const iconClass = iconLeft ? 'input-icon-left' : '';
  return (
    <input
      ref={ref}
      className={`input ${iconClass} ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export const PasswordInput = React.forwardRef(({ className = '', error, iconLeft, ...props }, ref) => {
  const [show, setShow] = useState(false);
  const iconClass = iconLeft ? 'input-icon-left' : '';
  return (
    <div className="relative">
      <input
        ref={ref}
        type={show ? 'text' : 'password'}
        className={`input input-icon-right ${iconClass} ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        tabIndex={-1}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

export const TextArea = React.forwardRef(({ className = '', error, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`input resize-none ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
      {...props}
    />
  );
});
TextArea.displayName = 'TextArea';
