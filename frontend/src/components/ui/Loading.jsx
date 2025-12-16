import React from 'react';

export const LoadingSpinner = ({ size = 'default' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    default: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };
  
  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} border-[var(--primary)] border-t-transparent rounded-full animate-spin`} />
    </div>
  );
};

export const LoadingPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
};
