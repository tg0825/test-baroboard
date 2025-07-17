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

      {/* 데이터 테이블 */}
      <div className={`card ${isMobile ? 'p-5' : 'p-6'}`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📊</span>
          <h3 className={`
            ${isMobile ? 'text-base' : 'text-lg'} 
            m-0 text-text-primary font-semibold
          `}>
            쿼리 결과 테이블
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary-pale border-b-2 border-primary-main">
                <th className={`
                  ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} 
                  text-left font-semibold text-text-primary border-r border-border-light
                `}>
                  ID
                </th>
                <th className={`
                  ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} 
                  text-left font-semibold text-text-primary border-r border-border-light
                `}>
                  주문번호
                </th>
                <th className={`
                  ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} 
                  text-left font-semibold text-text-primary border-r border-border-light
                `}>
                  배달기사
                </th>
                <th className={`
                  ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} 
                  text-left font-semibold text-text-primary border-r border-border-light
                `}>
                  음식점
                </th>
                <th className={`
                  ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} 
                  text-left font-semibold text-text-primary border-r border-border-light
                `}>
                  주문금액
                </th>
                <th className={`
                  ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} 
                  text-left font-semibold text-text-primary border-r border-border-light
                `}>
                  배달시간
                </th>
                <th className={`
                  ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} 
                  text-left font-semibold text-text-primary
                `}>
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 15 }, (_, index) => {
                const orderStatuses = ['완료', '배달중', '준비중', '취소'];
                const restaurants = ['맥도날드', '버거킹', 'KFC', '피자헛', '도미노피자', '치킨플러스', '한솥도시락', '김밥천국'];
                const drivers = ['김철수', '이영희', '박민수', '정수연', '최동혁', '임현정', '송지훈', '한미래'];
                
                return (
                  <tr key={index} className={`
                    ${index % 2 === 0 ? 'bg-background-main' : 'bg-secondary-pale'} 
                    border-b border-border-light hover:bg-primary-pale transition-colors duration-200
                  `}>
                    <td className={`
                      ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} 
                      border-r border-border-light text-text-primary
                    `}>
                      {1000 + index + 1}
                    </td>
                    <td className={`
                      ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} 
                      border-r border-border-light text-text-primary font-mono
                    `}>
                      ORD-{(Math.random() * 100000).toFixed(0).padStart(5, '0')}
                    </td>
                    <td className={`
                      ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} 
                      border-r border-border-light text-text-primary
                    `}>
                      {drivers[index % drivers.length]}
                    </td>
                    <td className={`
                      ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} 
                      border-r border-border-light text-text-primary
                    `}>
                      {restaurants[index % restaurants.length]}
                    </td>
                    <td className={`
                      ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} 
                      border-r border-border-light text-text-primary font-mono text-right
                    `}>
                      {(Math.random() * 50000 + 10000).toLocaleString()}원
                    </td>
                    <td className={`
                      ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} 
                      border-r border-border-light text-text-primary
                    `}>
                      {Math.floor(Math.random() * 30 + 15)}분
                    </td>
                    <td className={`
                      ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} 
                      text-text-primary
                    `}>
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${orderStatuses[index % orderStatuses.length] === '완료' ? 'bg-success-pale text-success-main' :
                          orderStatuses[index % orderStatuses.length] === '배달중' ? 'bg-info-pale text-info-main' :
                          orderStatuses[index % orderStatuses.length] === '준비중' ? 'bg-warning-pale text-warning-main' :
                          'bg-secondary-pale text-secondary-main'}
                      `}>
                        {orderStatuses[index % orderStatuses.length]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* 테이블 푸터 - 페이지네이션 힌트 */}
        <div className={`
          mt-4 pt-4 border-t border-border-light flex justify-between items-center
          ${isMobile ? 'text-xs' : 'text-sm'} text-text-secondary
        `}>
          <span>총 {Math.floor(Math.random() * 1000 + 500)}건의 결과</span>
          <span>페이지 1 / {Math.floor(Math.random() * 20 + 5)}</span>
        </div>
      </div>
    </div>
  );
};

export default Graph; 