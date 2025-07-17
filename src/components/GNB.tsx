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
    <nav className="fixed top-0 left-0 right-0 h-15 bg-background-main border-b border-border-main flex items-center justify-between px-4 md:px-6 z-[1002] shadow-soft">
      {/* 로고 */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-main rounded-lg flex items-center justify-center text-white font-bold text-base shadow-button">
          B
        </div>
        <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-text-primary m-0`}>
          바로보드
        </h1>
      </div>

      {/* AInity4 로고 */}
      <div className="relative pr-4">
        <div className="text-2xl md:text-3xl font-black tracking-tighter relative italic transform -skew-x-12">
          {/* 메인 텍스트 */}
          <span className="relative z-10 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            AInity
          </span>
          <span className="relative z-10 bg-gradient-to-r from-primary-main to-orange-600 bg-clip-text text-transparent font-black">
            4
          </span>
          
          {/* 글로우 효과 */}
          <div className="absolute inset-0 text-2xl md:text-3xl font-black tracking-tighter italic">
            <span className="text-blue-500 opacity-30 blur-sm">AInity</span>
            <span className="text-primary-main opacity-30 blur-sm font-black">4</span>
          </div>
          
          {/* 메탈릭 하이라이트 */}
          <div className="absolute inset-0 text-2xl md:text-3xl font-black tracking-tighter italic">
            <span className="bg-gradient-to-b from-white to-transparent bg-clip-text text-transparent opacity-20">
              AInity
            </span>
            <span className="bg-gradient-to-b from-white to-transparent bg-clip-text text-transparent opacity-20 font-black">
              4
            </span>
          </div>
        </div>
        
        {/* 언더라인 효과 */}
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-primary-main opacity-60 transform -skew-x-12"></div>
      </div>
    </nav>
  );
};

export default GNB; 