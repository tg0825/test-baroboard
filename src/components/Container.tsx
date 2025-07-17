"use client";

import React, { useState, useEffect } from 'react';
import Graph from './Graph';

interface ContainerProps {
  selectedData: { [key: string]: unknown } | null;
}

const Container = ({ selectedData }: ContainerProps) => {
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
    <div className="flex-1 h-full flex justify-center">
      <div className="w-full max-w-[1024px] h-full">
        {selectedData ? (
          <Graph data={selectedData} />
        ) : (
          <div className={`
            flex items-center justify-center h-full text-text-secondary
            ${isMobile ? 'text-base' : 'text-lg'}
            text-center p-5
          `}>
            <div className="card p-10 shadow-medium border border-border-light">
              <div className="text-5xl mb-4 text-primary-main">
                📊
              </div>
              <div className="text-text-primary font-semibold mb-2">
                {isMobile ? '상단 메뉴를 눌러 쿼리를 선택하세요' : '좌측에서 쿼리를 선택하세요'}
              </div>
              <div className="text-text-muted text-sm">
                분석하고 싶은 쿼리를 클릭하면 결과를 확인할 수 있습니다
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Container; 