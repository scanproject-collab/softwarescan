import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  color?: 'primary' | 'secondary' | 'orange' | 'blue' | 'gray';
  inline?: boolean;
  className?: string;
}

/**
 * Standardized loading spinner component that can be used across the application
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  fullScreen = false,
  color = 'primary',
  inline = false,
  className = ''
}) => {
  // Size mapping
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  // Color mapping
  const colorMap = {
    primary: 'text-orange-500',
    secondary: 'text-blue-600',
    orange: 'text-orange-500',
    blue: 'text-blue-600',
    gray: 'text-gray-500'
  };

  // Container classes
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50'
    : inline
      ? 'inline-flex items-center'
      : 'flex items-center justify-center p-4';

  return (
    <div className={`${containerClasses} ${className}`}>
      <Loader2 className={`${sizeMap[size]} ${colorMap[color]} animate-spin`} />
      {text && <span className={`ml-2 ${colorMap[color].replace('text-', 'text-')}`}>{text}</span>}
    </div>
  );
};

export default LoadingSpinner; 