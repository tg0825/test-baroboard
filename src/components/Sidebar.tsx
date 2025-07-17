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
    // 임시 데이터 설정
    const data = { 
      query: query.name, 
      id: query.id,
      type: query.type,
      description: query.description,
      result: Math.random() * 100,
      timestamp: new Date().toISOString()
    };
    setSelectedData(data);
    
    // 모바일에서 쿼리 선택 시 사이드바 자동 닫기
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative' }}>
      {/* 모바일 햄버거 메뉴 버튼 */}
      {isMobile && (
        <button
          onClick={toggleMobileMenu}
          style={{
            position: 'fixed',
            top: '70px',
            left: '20px',
            zIndex: 1001,
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            cursor: 'pointer',
            fontSize: '18px',
            boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)',
          }}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      )}

      {/* 모바일 오버레이 */}
      {isMobile && isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: '60px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
        />
      )}

      {/* 사이드바 */}
      <div 
        style={{ 
          width: isMobile ? '280px' : '300px',
          background: '#f4f4f4', 
          padding: '10px', 
          overflowY: 'auto',
          position: isMobile ? 'fixed' : 'relative',
          top: isMobile ? '60px' : '0',
          left: isMobile && !isMobileMenuOpen ? '-280px' : '0',
          height: isMobile ? 'calc(100vh - 60px)' : '100vh',
          zIndex: 1000,
          transition: isMobile ? 'left 0.3s ease' : 'none',
          boxShadow: isMobile ? '2px 0 8px rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        <h2 style={{ 
          marginTop: isMobile ? '60px' : '0',
          fontSize: isMobile ? '18px' : '20px'
        }}>
          쿼리 목록
        </h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {queryList.map((query) => (
            <li 
              key={query.id}
              onClick={() => handleQueryClick(query)}
              style={{ 
                padding: isMobile ? '12px 8px' : '8px', 
                margin: '4px 0', 
                background: '#fff', 
                borderRadius: '4px',
                cursor: 'pointer',
                borderLeft: `4px solid ${query.type === '분석' ? '#007bff' : query.type === '보고서' ? '#28a745' : '#ffc107'}`,
                fontSize: isMobile ? '14px' : '16px',
              }}
            >
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: isMobile ? '13px' : '14px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginBottom: '4px'
              }}>
                {query.name}
              </div>
              <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#666' }}>
                {query.type}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div style={{ 
        flexGrow: 1,
        marginLeft: isMobile ? '0' : '0',
        minHeight: '100vh',
        background: '#ffffff'
      }}>
        {selectedData ? (
          <Graph data={selectedData} />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            color: '#666',
            fontSize: isMobile ? '16px' : '18px',
            textAlign: 'center',
            padding: '20px'
          }}>
            {isMobile ? '상단 메뉴를 눌러 쿼리를 선택하세요' : '좌측에서 쿼리를 선택하세요'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 