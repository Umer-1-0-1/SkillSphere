import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'default',
  fullWidth,
  loading,
  children, 
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[var(--primary)] text-black hover:opacity-90 hover:shadow-lg',
    secondary: 'bg-[var(--card-fill)] text-[var(--primary)] border-2 border-[var(--primary)] hover:bg-[var(--primary)] hover:text-black',
    outline: 'border-2 border-[var(--border)] hover:bg-[var(--muted)] text-foreground',
    ghost: 'hover:bg-[var(--muted)] text-foreground',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    default: 'px-6 py-2.5',
    lg: 'px-8 py-3 text-lg',
  };
  
  return (
    <button
      ref={ref}
      className={cn(
        baseStyles, 
        variants[variant], 
        sizes[size], 
        fullWidth && 'w-full',
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
