import React from 'react';

const Input = ({ label, className = '', error, ...props }) => {
  return (
    <div className="w-full space-y-2">
      {label && <label className="block text-sm font-medium text-slate-400 ml-1">{label}</label>}
      <input
        className={`premium-input ${error ? 'border-rose-500/50 focus:ring-rose-500/50' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-400 mt-1 ml-1">{error}</p>}
    </div>
  );
};

export default Input;
