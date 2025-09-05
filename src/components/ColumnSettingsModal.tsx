"use client";

import React, { useEffect } from 'react';

interface ColumnSettingsModalProps {
  isVisible: boolean;
  allColumns: string[];
  hiddenColumns: Set<string>;
  onToggleColumn: (columnName: string) => void;
  onClose: () => void;
}

const ColumnSettingsModal = ({
  isVisible,
  allColumns,
  hiddenColumns,
  onToggleColumn,
  onClose,
}: ColumnSettingsModalProps) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const visibleColumns = allColumns.filter(col => !hiddenColumns.has(col));
  const hiddenColumnsList = allColumns.filter(col => hiddenColumns.has(col));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm h-[80vh] min-h-[500px] mx-4 flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">컬럼 설정</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* 보이는 컬럼 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              보이는 컬럼 ({visibleColumns.length})
            </h4>
            <div className="space-y-1">
              {visibleColumns.map((column) => (
                <div
                  key={column}
                  className="flex items-center justify-between p-2 bg-green-50 rounded border"
                >
                  <span className="text-sm text-gray-700">{column}</span>
                  <button
                    onClick={() => onToggleColumn(column)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    숨기기
                  </button>
                </div>
              ))}
              {visibleColumns.length === 0 && (
                <p className="text-sm text-gray-500">모든 컬럼이 숨겨져 있습니다.</p>
              )}
            </div>
          </div>

          {/* 숨겨진 컬럼 */}
          {hiddenColumnsList.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                숨겨진 컬럼 ({hiddenColumnsList.length})
              </h4>
              <div className="space-y-1">
                {hiddenColumnsList.map((column) => (
                  <div
                    key={column}
                    className="flex items-center justify-between p-2 bg-red-50 rounded border"
                  >
                    <span className="text-sm text-gray-700">{column}</span>
                    <button
                      onClick={() => onToggleColumn(column)}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      보이기
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnSettingsModal;
