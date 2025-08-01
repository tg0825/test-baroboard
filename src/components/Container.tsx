"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Graph from './Graph';

interface ListItem {
  id: string;
  title: string;
  description?: string;
  status?: string;
  type?: string;
}

interface ContainerProps {
  selectedItem?: ListItem | null;
  apiError?: string | null;
}

const Container = ({ selectedItem, apiError }: ContainerProps) => {
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* 헤더 */}
      <div className="border-b border-border-light p-4 bg-background-main">
        <h1 className="text-2xl font-bold text-text-primary">
          대시보드
        </h1>
        <p className="text-text-secondary mt-1">
          {selectedItem ? `선택된 항목: ${selectedItem.title}` : "항목을 선택해주세요"}
        </p>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 p-6">
        {apiError ? (
          /* API 에러 상태 */
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-700 mb-2">연결 오류</h3>
              <p className="text-red-600">{apiError}</p>
            </div>
          </div>
        ) : selectedItem ? (
          /* 선택된 항목 표시 */
          <div>
            <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-2">
                    {selectedItem.title}
                  </h2>
                  {selectedItem.description && (
                    <p className="text-text-secondary">
                      {selectedItem.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {selectedItem.status && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedItem.status === 'active' ? 'bg-success-pale text-success-main' :
                      selectedItem.status === 'pending' ? 'bg-warning-pale text-warning-main' :
                      selectedItem.status === 'completed' ? 'bg-primary-pale text-primary-main' :
                      'bg-secondary-pale text-secondary-main'
                    }`}>
                      {selectedItem.status}
                    </span>
                  )}
                  {selectedItem.type && (
                    <span className="px-3 py-1 bg-secondary-lighter text-secondary-dark rounded-full text-sm">
                      {selectedItem.type}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* 그래프 영역 */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">데이터 시각화</h3>
              <Graph data={{}} />
            </div>
          </div>
        ) : (
          /* 기본 상태 */
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Image 
                src="/logo-bb.png" 
                alt="BaroBoard Logo" 
                width={isMobile ? 192 : 256} 
                height={isMobile ? 192 : 256} 
                className="mx-auto mb-4 opacity-20 object-contain"
                priority
              />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                BaroBoard에 오신 것을 환영합니다
              </h3>
              <p className="text-text-light">
                좌측 리스트에서 항목을 선택하면 상세 정보를 확인할 수 있습니다
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Container;