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
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const node = (
    <div
      className="fixed top-6 right-6 z-[10001]"
      style={{ zIndex: 10001 }}
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
        <span className="flex-shrink-0">{getIcon()}</span>
        <span className="text-sm font-medium leading-5">{message}</span>
        <button
          onClick={onClose}
          className="ml-auto text-white/90 hover:text-white transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
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
