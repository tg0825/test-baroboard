"use client";

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

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

  const node = (
    <div
      className="fixed top-6 right-6 z-[9999]"
      style={{ zIndex: 9999 }}
    >
      <div
        className={`
          ${getTypeStyles()}
          px-3 py-2 rounded-md shadow-lg border
          max-w-sm min-w-[200px]
          flex items-center gap-2
          transition-all duration-200 ease-out
          translate-y-0 opacity-100
        `}
      >
        <span className="text-xs">{getIcon()}</span>
        <span className="text-sm font-medium leading-5">{message}</span>
        <button
          onClick={onClose}
          className="ml-auto text-white/90 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );

  // Render at body level to avoid parent transforms/layout shifts
  if (typeof window !== 'undefined' && document?.body) {
    return createPortal(node, document.body);
  }
  return node;
};

export default Snackbar;
