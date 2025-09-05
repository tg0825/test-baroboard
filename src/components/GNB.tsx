"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const GNB = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isInfoTooltipVisible, setIsInfoTooltipVisible] = useState(false);
  const [isTeamTooltipVisible, setIsTeamTooltipVisible] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 로고 클릭시 홈페이지로 이동
  const handleLogoClick = () => {
    router.push('/');
  };

  // 사용자 정보 클릭시 마이페이지로 이동
  const handleUserClick = () => {
    router.push('/mypage/history');
  };

  // 쿼리 만들기 버튼 클릭시 Redash로 이동
  const handleCreateQueryClick = () => {
    window.open('https://redash.barogo.io/queries/new', '_blank');
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
      
                  <nav className={`fixed ${user?.session ? 'top-6' : 'top-0'} left-0 right-0 h-15 bg-gradient-to-r from-primary-main via-primary-light to-primary-main border-b border-primary-dark shadow-soft flex items-center justify-between px-4 md:px-6 z-[1002]`}>
        {/* 좌측 영역: 로고 + 쿼리 만들기 버튼 */}
        <div className="flex items-center gap-4">
          {/* 로고 */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-200"
            title="홈으로 이동"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-50 rounded-lg flex items-center justify-center text-primary-main font-bold text-base shadow-soft border border-primary-pale">
              B
            </div>
            <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white m-0`}>
              BaroBoard
            </h1>
          </div>

          {/* 쿼리 만들기 버튼 + 정보 아이콘 (로그인된 사용자만 표시) */}
          {user?.isLoggedIn && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateQueryClick}
                className="flex items-center gap-2 px-3 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-sm rounded-lg transition-all duration-200 border border-white border-opacity-20 hover:border-opacity-30"
                title="Redash에서 새 쿼리 만들기"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {!isMobile && <span>쿼리 만들기</span>}
              </button>
              
              {/* 정보 아이콘 + 툴팁 */}
              <div className="relative">
                <button
                  onMouseEnter={() => setIsInfoTooltipVisible(true)}
                  onMouseLeave={() => setIsInfoTooltipVisible(false)}
                  className="w-5 h-5 flex items-center justify-center text-white hover:bg-white hover:bg-opacity-10 rounded-full transition-all duration-200"
                  aria-label="쿼리 만들기 정보"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                {/* 툴팁 */}
                {isInfoTooltipVisible && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-50 border border-gray-700">
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-primary-light font-medium">1.</span>
                        <span>리대시로 이동 됩니다.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary-light font-medium">2.</span>
                        <span>리대시에서 만들면 바로보드에 표시 됩니다.</span>
                      </div>
                    </div>
                    {/* 툴팁 화살표 */}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 우측 영역 */}
        <div className="flex items-center gap-4">
          {user?.isLoggedIn && (
            <>
              {/* 사용자 정보 (데스크톱) */}
              <div 
                onClick={handleUserClick}
                className="hidden md:flex items-center gap-2 text-white cursor-pointer hover:bg-white hover:bg-opacity-10 px-3 py-2 rounded-lg transition-all duration-200"
                title="마이페이지로 이동"
              >
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">{user?.email || '사용자'}</span>
              </div>

              {/* 사용자 정보 (모바일) */}
              <button
                onClick={handleUserClick}
                className="md:hidden flex items-center justify-center w-8 h-8 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-lg transition-all duration-200"
                title="마이페이지로 이동"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </button>

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
            </>
          )}

          {/* 로그인 버튼 (로그인하지 않은 경우) */}
          {!user?.isLoggedIn && (
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 px-3 py-1.5 bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-sm rounded-lg transition-all duration-200"
              title="로그인"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              {!isMobile && <span>로그인</span>}
            </button>
          )}

          {/* AInity4 로고 */}
          <div className="relative pl-4 border-l border-white border-opacity-20">
            <div 
              className="text-xl md:text-2xl font-black tracking-tighter relative italic transform -skew-x-12 cursor-pointer transition-all duration-300"
              onMouseEnter={() => setIsTeamTooltipVisible(true)}
              onMouseLeave={() => setIsTeamTooltipVisible(false)}
            >
              {/* 메인 텍스트 */}
              <span className={`relative z-10 transition-all duration-500 ${
                isTeamTooltipVisible 
                  ? 'flowing-gradient-ainity' 
                  : 'text-white'
              }`}>
                AInity
              </span>
              <span className={`relative z-10 font-black transition-all duration-500 ${
                isTeamTooltipVisible 
                  ? 'flowing-gradient-4' 
                  : 'text-white'
              }`}>
                4
              </span>
              
              {/* 부드러운 글로우 효과 (검정색 제거) */}
              {isTeamTooltipVisible && (
                <div className="absolute inset-0 text-xl md:text-2xl font-black tracking-tighter italic opacity-30">
                  <span className="flowing-glow-ainity drop-shadow-lg">AInity</span>
                  <span className="flowing-glow-4 font-black drop-shadow-lg">4</span>
                </div>
              )}
            </div>
            
            {/* 언더라인 효과 (호버 시 그라데이션) */}
            <div className={`absolute -bottom-1 left-4 right-0 h-0.5 transform -skew-x-12 transition-all duration-500 ${
              isTeamTooltipVisible 
                ? 'flowing-underline opacity-80' 
                : 'bg-white opacity-40'
            }`}></div>
            
            {/* 팀원 툴팁 */}
            {isTeamTooltipVisible && (
              <div className="absolute top-full mt-3 right-0 w-56 bg-gray-900 text-white text-sm rounded-lg p-4 shadow-xl z-50 border border-gray-700">
                <div className="text-center">
                  <div className="text-primary-light font-bold mb-2">🌟 AInity4 팀원들</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-yellow-300">✨</span>
                      <span>윤주희</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-pink-300">✨</span>
                      <span>한세민</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-purple-300">✨</span>
                      <span>심항보</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-blue-300">✨</span>
                      <span>김경림</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-cyan-300">✨</span>
                      <span>윤태건</span>
                    </div>
                  </div>
                </div>
                {/* 툴팁 화살표 */}
                <div className="absolute -top-1 right-6 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45"></div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default GNB; 