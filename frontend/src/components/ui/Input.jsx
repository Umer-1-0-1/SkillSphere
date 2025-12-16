import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(({ 
  className, 
  type = 'text',
  label,
  error,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-lg',
          'text-foreground placeholder:text-[var(--text-secondary)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent',
          'transition-all duration-300',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export const TextArea = React.forwardRef(({ 
  className, 
  label,
  error,
  rows = 4,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'w-full px-4 py-3 bg-[var(--input)] border border-[var(--border)] rounded-lg',
          'text-foreground placeholder:text-[var(--text-secondary)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent',
          'transition-all duration-300 resize-vertical',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';
