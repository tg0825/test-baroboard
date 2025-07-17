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

  return (
    <div style={{ 
      flexGrow: 1, 
      padding: isMobile ? '16px 12px' : '20px', 
      background: '#fff',
      height: isMobile ? 'calc(100vh - 60px)' : '100vh',
      overflowY: 'auto'
    }}>
      <h2 style={{
        fontSize: isMobile ? '20px' : '24px',
        marginBottom: isMobile ? '16px' : '20px',
        color: '#333'
      }}>
        쿼리 결과
      </h2>
      
      {/* 쿼리 정보 카드 */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: isMobile ? '16px' : '20px',
        borderRadius: '8px',
        marginBottom: isMobile ? '16px' : '20px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{
          fontSize: isMobile ? '16px' : '18px',
          marginBottom: '8px',
          color: '#495057'
        }}>
          쿼리 정보
        </h3>
        <p style={{
          fontSize: isMobile ? '14px' : '16px',
          margin: '4px 0',
          wordBreak: 'break-word'
        }}>
          <strong>이름:</strong> {data.query as string}
        </p>
        <p style={{
          fontSize: isMobile ? '14px' : '16px',
          margin: '4px 0'
        }}>
          <strong>타입:</strong> {data.type as string}
        </p>
        <p style={{
          fontSize: isMobile ? '14px' : '16px',
          margin: '4px 0'
        }}>
          <strong>ID:</strong> {data.id as number}
        </p>
      </div>

      {/* 상세 데이터 */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: isMobile ? '16px' : '20px',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{
          fontSize: isMobile ? '16px' : '18px',
          marginBottom: '12px',
          color: '#495057'
        }}>
          상세 데이터
        </h3>
        <pre style={{
          fontSize: isMobile ? '12px' : '14px',
          background: '#f8f9fa',
          padding: isMobile ? '12px' : '16px',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: isMobile ? '300px' : '400px',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          lineHeight: '1.4',
          border: '1px solid #e9ecef'
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Graph; 