"use client";

import React, { useState } from 'react';

interface ListItem {
  id: string;
  title: string;
  description?: string;
  status?: string;
  type?: string;
}

interface LNBProps {
  items: ListItem[];
  onItemSelect?: (item: ListItem) => void;
  selectedItemId?: string;
  isLoading?: boolean;
}

export default function LNB({ items, onItemSelect, selectedItemId, isLoading = false }: LNBProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // 검색 필터링
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleItemClick = (item: ListItem) => {
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  return (
    <div className="w-80 h-full bg-background-main border-r border-border-light flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b border-border-light">
        <h2 className="text-lg font-semibold text-text-primary mb-3">리스트</h2>
        
        {/* 검색 입력 */}
        <div className="relative">
          <input
            type="text"
            placeholder="검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border-main rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-text-light"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* 리스트 컨테이너 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          /* 로딩 상태 */
          <div className="p-4 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary-main border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-text-secondary">로딩 중...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          /* 빈 상태 */
          <div className="p-4 text-center">
            <svg
              className="w-12 h-12 text-text-light mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm text-text-secondary">
              {searchTerm ? '검색 결과가 없습니다' : '리스트가 비어있습니다'}
            </p>
          </div>
        ) : (
          /* 리스트 아이템들 */
          <div className="p-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 hover:bg-secondary-pale ${
                  selectedItemId === item.id 
                    ? 'bg-primary-pale border-l-4 border-primary-main' 
                    : 'hover:shadow-soft'
                }`}
              >
                {/* 제목 */}
                <h3 className="font-medium text-text-primary text-sm mb-1 line-clamp-2">
                  {item.title}
                </h3>
                
                {/* 설명 */}
                {item.description && (
                  <p className="text-xs text-text-secondary line-clamp-2 mb-2">
                    {item.description}
                  </p>
                )}
                
                {/* 상태/타입 배지 */}
                <div className="flex items-center gap-2">
                  {item.status && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'active' ? 'bg-success-pale text-success-main' :
                      item.status === 'pending' ? 'bg-warning-pale text-warning-main' :
                      item.status === 'completed' ? 'bg-primary-pale text-primary-main' :
                      'bg-secondary-pale text-secondary-main'
                    }`}>
                      {item.status}
                    </span>
                  )}
                  
                  {item.type && (
                    <span className="px-2 py-1 bg-secondary-lighter text-secondary-dark rounded text-xs">
                      {item.type}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 푸터 정보 */}
      <div className="p-3 border-t border-border-light bg-background-soft">
        <p className="text-xs text-text-light text-center">
          총 {items.length}개 항목
          {searchTerm && ` · ${filteredItems.length}개 검색됨`}
        </p>
      </div>
    </div>
  );
}