"use client";

import React, { useEffect, useRef } from 'react';

interface ColumnContextMenuProps {
  isVisible: boolean;
  position: { x: number; y: number };
  columnName: string;
  onHideColumn: (columnName: string) => void;
  onClose: () => void;
}

const ColumnContextMenu = ({
  isVisible,
  position,
  columnName,
  onHideColumn,
  onClose,
}: ColumnContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[180px]"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
        컬럼: {columnName}
      </div>
      <button
        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
        onClick={() => {
          onHideColumn(columnName);
          onClose();
        }}
      >
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
        </svg>
        컬럼 숨기기
      </button>
    </div>
  );
};

export default ColumnContextMenu;
