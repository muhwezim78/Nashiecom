import React from 'react';
import toast from 'react-hot-toast';

const baseConfig = {
  style: {
    borderRadius: '12px',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-main)',
    backdropFilter: 'blur(10px)',
  },
};

export const message = {
  success: (msg) => toast.success(msg, baseConfig),
  error: (msg) => toast.error(msg, baseConfig),
  info: (msg) => toast(msg, { icon: 'ℹ️', ...baseConfig }),
  warning: (msg) => toast(msg, { icon: '⚠️', ...baseConfig }),
  loading: (msg) => toast.loading(msg, baseConfig),
};

export const notification = {
  success: ({ message: title, description }) => toast.success(
    <div><strong>{title}</strong><br/><span className="text-sm opacity-80">{description}</span></div>, 
    { ...baseConfig, duration: 5000 }
  ),
  error: ({ message: title, description }) => toast.error(
    <div><strong>{title}</strong><br/><span className="text-sm opacity-80">{description}</span></div>, 
    { ...baseConfig, duration: 5000 }
  ),
  info: ({ message: title, description }) => toast(
    <div><strong>{title}</strong><br/><span className="text-sm opacity-80">{description}</span></div>, 
    { icon: 'ℹ️', ...baseConfig, duration: 5000 }
  ),
  warning: ({ message: title, description }) => toast(
    <div><strong>{title}</strong><br/><span className="text-sm opacity-80">{description}</span></div>, 
    { icon: '⚠️', ...baseConfig, duration: 5000 }
  ),
};
