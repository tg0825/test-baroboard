"use client";

import React, { useState, useEffect } from 'react';

const GNB = () => {
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
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: '#fff',
      borderBottom: '1px solid #e9ecef',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0 16px' : '0 24px',
      zIndex: 1002,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      {/* 로고 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          backgroundColor: '#007bff',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          B
        </div>
        <h1 style={{
          fontSize: isMobile ? '18px' : '20px',
          fontWeight: 'bold',
          color: '#333',
          margin: 0
        }}>
          바로보드
        </h1>
      </div>

      {/* 네비게이션 메뉴 (데스크탑) */}
      {!isMobile && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px'
        }}>
          <a href="#" style={{
            color: '#007bff',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '14px',
            borderBottom: '2px solid #007bff',
            paddingBottom: '4px'
          }}>
            대시보드
          </a>
          <a href="#" style={{
            color: '#6c757d',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#007bff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#6c757d'}
          >
            쿼리 관리
          </a>
          <a href="#" style={{
            color: '#6c757d',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#007bff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#6c757d'}
          >
            설정
          </a>
        </div>
      )}

      {/* 우측 메뉴 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '12px' : '16px'
      }}>
        {/* 알림 버튼 */}
        <button style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '1px solid #e9ecef',
          backgroundColor: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          color: '#6c757d',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
          e.currentTarget.style.borderColor = '#007bff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#fff';
          e.currentTarget.style.borderColor = '#e9ecef';
        }}
        >
          🔔
        </button>

        {/* 사용자 프로필 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: '8px',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#28a745',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            관
          </div>
          {!isMobile && (
            <span style={{
              fontSize: '14px',
              color: '#333',
              fontWeight: '500'
            }}>
              관리자
            </span>
          )}
        </div>
      </div>
    </nav>
  );
};

export default GNB; 