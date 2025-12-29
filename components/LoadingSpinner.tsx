
import React from 'react';

interface LoadingSpinnerProps {
  message: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-accent-secondary border-t-accent-primary rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-text-primary">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
