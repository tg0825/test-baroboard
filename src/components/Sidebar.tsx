"use client";

import React, { useState, useEffect } from 'react';
import Graph from './Graph';

const Sidebar = () => {
  const [selectedData, setSelectedData] = useState<{ [key: string]: unknown } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // 100개의 더미 쿼리 데이터 생성 (한글 긴 텍스트)
  const queryList = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    name: `사용자 행동 분석 및 매출 성과 보고서 생성을 위한 데이터 추출 쿼리 ${index + 1}번`,
    description: `매출 데이터와 사용자 행동 패턴을 분석하여 비즈니스 인사이트를 도출하는 쿼리 ${index + 1}`,
    type: index % 3 === 0 ? '분석' : index % 3 === 1 ? '보고서' : '대시보드'
  }));

  const handleQueryClick = (query: { id: number; name: string; description: string; type: string }) => {
    const data = { 
      query: query.name, 
      id: query.id,
      type: query.type,
      description: query.description,
      result: Math.random() * 100,
      timestamp: new Date().toISOString()
    };
    setSelectedData(data);
    
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case '분석': return 'border-primary-main text-primary-main bg-primary-main';
      case '보고서': return 'border-success-main text-success-main bg-success-main';
      case '대시보드': return 'border-warning-main text-warning-main bg-warning-main';
      default: return 'border-secondary-main text-secondary-main bg-secondary-main';
    }
  };

  return (
    <div className="flex h-full relative">
      {/* 모바일 햄버거 메뉴 버튼 */}
      {isMobile && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-[70px] left-5 z-[1001] bg-primary-main text-white border-none rounded-lg p-3 cursor-pointer text-lg shadow-button"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      )}

      {/* 모바일 오버레이 */}
      {isMobile && isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed top-15 left-0 right-0 bottom-8 bg-black bg-opacity-50 z-[999]"
        />
      )}

      {/* 사이드바 */}
      <div 
        className={`
          ${isMobile ? 'w-[280px]' : 'w-[300px]'} 
          bg-background-soft p-4 overflow-y-auto
          ${isMobile ? 'fixed' : 'relative'}
          ${isMobile ? 'top-15' : 'top-0'}
          ${isMobile && !isMobileMenuOpen ? '-left-[280px]' : 'left-0'}
          ${isMobile ? 'h-[calc(100vh-92px)]' : 'h-full'}
          z-[1000] transition-all duration-300 ease-in-out
          ${isMobile ? 'shadow-medium' : ''}
          border-r border-border-light mobile-hide-scrollbar
        `}
      >
        <h2 className={`
          ${isMobile ? 'mt-0 mb-5 text-lg' : 'mt-4 mb-5 text-xl'} 
          text-text-primary font-semibold
        `}>
          쿼리 목록
        </h2>
        
        <ul className="list-none p-0 m-0 space-y-2">
          {queryList.map((query) => {
            const typeStyles = getTypeStyles(query.type);
            return (
              <li 
                key={query.id}
                onClick={() => handleQueryClick(query)}
                className={`
                  p-3 bg-background-main rounded-lg cursor-pointer
                  border-l-4 ${typeStyles.split(' ')[0]}
                  ${isMobile ? 'text-sm' : 'text-base'}
                  transition-all duration-200 shadow-soft card-hover
                  hover:bg-primary-pale
                `}
              >
                <div className={`
                  font-semibold 
                  ${isMobile ? 'text-xs' : 'text-sm'}
                  overflow-hidden text-ellipsis whitespace-nowrap
                  mb-1.5 text-text-primary
                `}>
                  {query.name}
                </div>
                <div className={`
                  ${isMobile ? 'text-[11px]' : 'text-xs'} 
                  ${typeStyles.split(' ')[1]}
                  font-medium flex items-center gap-1
                `}>
                  <span className={`w-1.5 h-1.5 rounded-full ${typeStyles.split(' ')[2]}`}></span>
                  {query.type}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 h-full bg-background-main">
        {selectedData ? (
          <Graph data={selectedData} />
        ) : (
          <div className={`
            flex items-center justify-center h-full text-text-secondary
            ${isMobile ? 'text-base' : 'text-lg'}
            text-center p-5 bg-gradient-soft
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

export default Sidebar; 