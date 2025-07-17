"use client";

import React, { useState, useEffect } from 'react';

const Graph = ({ data }: { data: { [key: string]: unknown } }) => {
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

  const getTypeStyles = (type: string) => {
    switch (type) {
      case '분석': return 'bg-primary-main text-primary-main border-border-primary bg-primary-pale';
      case '보고서': return 'bg-success-main text-success-main border-border-light bg-success-pale';
      case '대시보드': return 'bg-warning-main text-warning-main border-border-light bg-warning-pale';
      default: return 'bg-secondary-main text-secondary-main border-border-light bg-secondary-pale';
    }
  };

  return (
    <div className={`
      flex-1 
      ${isMobile ? 'p-3' : 'p-6'} 
      bg-background-soft
      h-full
      overflow-y-auto
    `}>
      <div className={`flex items-center gap-3 ${isMobile ? 'mb-5' : 'mb-6'}`}>
        <div className={`w-2 h-8 ${getTypeStyles(data.type as string).split(' ')[0]} rounded`}></div>
        <h2 className={`
          ${isMobile ? 'text-xl' : 'text-2xl'} 
          m-0 text-text-primary font-bold
        `}>
          쿼리 결과
        </h2>
      </div>
      
      {/* 쿼리 정보 카드 */}
      <div className={`
        card
        ${isMobile ? 'p-5' : 'p-6'} 
        ${isMobile ? 'mb-4' : 'mb-5'}
      `}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📊</span>
          <h3 className={`
            ${isMobile ? 'text-base' : 'text-lg'} 
            m-0 text-text-primary font-semibold
          `}>
            쿼리 정보
          </h3>
        </div>
        
        <div className="grid gap-3">
          <div className={`
            p-3 rounded-lg border
            ${getTypeStyles(data.type as string).split(' ')[3]}
            ${getTypeStyles(data.type as string).split(' ')[2]}
          `}>
            <div className={`
              ${isMobile ? 'text-xs' : 'text-sm'} 
              ${getTypeStyles(data.type as string).split(' ')[1]}
              font-semibold mb-1
            `}>
              쿼리명
            </div>
            <div className={`
              ${isMobile ? 'text-sm' : 'text-base'} 
              text-text-primary break-words leading-relaxed
            `}>
              {data.query as string}
            </div>
          </div>
          
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
            <div className="p-3 bg-secondary-pale rounded-lg border border-border-light">
              <div className={`
                ${isMobile ? 'text-xs' : 'text-sm'} 
                text-text-secondary font-semibold mb-1
              `}>
                타입
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${getTypeStyles(data.type as string).split(' ')[0]}`}></span>
                <span className={`
                  ${isMobile ? 'text-sm' : 'text-base'} 
                  ${getTypeStyles(data.type as string).split(' ')[1]}
                  font-semibold
                `}>
                  {data.type as string}
                </span>
              </div>
            </div>
            
            <div className="p-3 bg-info-pale rounded-lg border border-border-light">
              <div className={`
                ${isMobile ? 'text-xs' : 'text-sm'} 
                text-info-main font-semibold mb-1
              `}>
                ID
              </div>
              <div className={`
                ${isMobile ? 'text-sm' : 'text-base'} 
                text-text-primary font-semibold
              `}>
                #{data.id as number}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 상세 데이터 */}
      <div className={`card ${isMobile ? 'p-5' : 'p-6'}`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔍</span>
          <h3 className={`
            ${isMobile ? 'text-base' : 'text-lg'} 
            m-0 text-text-primary font-semibold
          `}>
            상세 데이터
          </h3>
        </div>
        
        <pre className={`
          ${isMobile ? 'text-xs' : 'text-sm'} 
          bg-secondary-pale 
          ${isMobile ? 'p-4' : 'p-5'} 
          rounded-lg overflow-auto
          ${isMobile ? 'max-h-[300px]' : 'max-h-[400px]'}
          font-mono leading-relaxed border border-border-light
          text-text-primary m-0
        `}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Graph; 