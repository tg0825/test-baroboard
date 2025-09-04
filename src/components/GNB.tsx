"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const GNB = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 로고 클릭시 홈페이지로 이동
  const handleLogoClick = () => {
    router.push('/');
  };

  // 화면 크기 감지 (항상 호출되어야 함)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 팝업 페이지에서는 GNB 숨김 (Hook 호출 이후에 체크)
  if (pathname === '/dashboard-popup') {
    return null;
  }

  return (
    <>
      {/* 개발용: 세션 정보 표시 */}
      {user?.session && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-black text-xs px-2 py-1 z-[1003] font-mono flex justify-between">
          <span>🔧 DEV: Session = {user.session}</span>
          <span>🚦 API 중복 요청 방지 활성화</span>
        </div>
      )}
      
      <nav className={`fixed ${user?.session ? 'top-6' : 'top-0'} left-0 right-0 h-15 bg-primary-main border-b border-primary-dark flex items-center justify-between px-4 md:px-6 z-[1002]`}>
        {/* 로고 */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-200"
          title="홈으로 이동"
        >
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary-main font-bold text-base">
            B
          </div>
          <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white m-0`}>
            BaroBoard
          </h1>
        </div>

        {/* 우측 영역 */}
        <div className="flex items-center gap-4">
          {/* 사용자 정보 */}
          <div className="hidden md:flex items-center gap-2 text-white">
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium">{user?.email || '사용자'}</span>
          </div>

          {/* 로그아웃 버튼 */}
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-3 py-1.5 bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-sm rounded-lg transition-all duration-200"
            title="로그아웃"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isMobile && <span>로그아웃</span>}
          </button>

          {/* AInity4 로고 */}
          <div className="relative pl-4 border-l border-white border-opacity-20">
            <div className="text-xl md:text-2xl font-black tracking-tighter relative italic transform -skew-x-12">
              {/* 메인 텍스트 */}
              <span className="relative z-10 text-white">
                AInity
              </span>
              <span className="relative z-10 text-white font-black">
                4
              </span>
              
              {/* 글로우 효과 */}
              <div className="absolute inset-0 text-xl md:text-2xl font-black tracking-tighter italic">
                <span className="text-white opacity-20 blur-sm">AInity</span>
                <span className="text-white opacity-20 blur-sm font-black">4</span>
              </div>
              
              {/* 메탈릭 하이라이트 */}
              <div className="absolute inset-0 text-xl md:text-2xl font-black tracking-tighter italic">
                <span className="bg-gradient-to-b from-white to-transparent bg-clip-text text-transparent opacity-30">
                  AInity
                </span>
                <span className="bg-gradient-to-b from-white to-transparent bg-clip-text text-transparent opacity-30 font-black">
                  4
                </span>
              </div>
            </div>
            
            {/* 언더라인 효과 */}
            <div className="absolute -bottom-1 left-4 right-0 h-0.5 bg-white opacity-40 transform -skew-x-12"></div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default GNB; 