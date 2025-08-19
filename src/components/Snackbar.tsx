"use client";

import React, { useEffect } from 'react';

interface SnackbarProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  type?: 'info' | 'warning' | 'error' | 'success';
}

const Snackbar = ({ 
  message, 
  isVisible, 
  onClose, 
  duration = 3000, 
  type = 'info' 
}: SnackbarProps) => {
  
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-500 text-white border-red-600';
      case 'warning':
        return 'bg-orange-500 text-white border-orange-600';
      case 'success':
        return 'bg-green-500 text-white border-green-600';
      case 'info':
      default:
        return 'bg-blue-500 text-white border-blue-600';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div 
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999]"
      style={{ zIndex: 9999 }}
    >
      <div className={`
        ${getTypeStyles()}
        px-4 py-3 rounded-lg shadow-lg border-2
        animate-[slideInDown_0.3s_ease-out]
        max-w-md min-w-[200px]
        flex items-center gap-2
      `}>
        <span className="text-sm">{getIcon()}</span>
        <span className="text-sm font-medium">{message}</span>
        <button 
          onClick={onClose}
          className="ml-auto text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Snackbar;
