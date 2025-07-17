"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  onQuerySelect: (data: { [key: string]: unknown }) => void;
}

const Sidebar = ({ onQuerySelect }: SidebarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 100개의 더미 쿼리 데이터 생성 (배달대행사 관련)
  const deliveryQueries = [
    "배달 기사별 일일 주문 완료율 분석",
    "시간대별 배달 주문량 추이 리포트",
    "음식점 카테고리별 주문 현황 대시보드",
    "배달 지연 원인 분석 및 개선방안",
    "고객 만족도 점수별 주문 분포",
    "배달 거리별 평균 소요시간 분석",
    "요일별 주문량 변화 트렌드",
    "우천시 배달 성과 영향 분석",
    "프로모션 이벤트 효과 측정 리포트",
    "배달 기사 근무시간 최적화 분석",
    "주문 취소율 감소 전략 리포트",
    "신규 고객 유입 경로 분석",
    "재주문률 향상 방안 연구",
    "배달료 정책 변경 영향 분석",
    "앱 사용자 행동 패턴 분석",
    "주요 경쟁사 대비 배달시간 비교",
    "지역별 배달 수요 예측 모델",
    "배달 기사 교육 효과 측정",
    "고객 리뷰 감정 분석 리포트",
    "메뉴 인기도별 주문 패턴 분석",
    "배달팁 금액별 주문 완료율",
    "월별 매출 성장률 추이 분석",
    "배달 앱 다운로드 수 증가율",
    "고객 연령대별 주문 선호도",
    "배달 포장 품질 만족도 조사",
    "실시간 배달 현황 모니터링",
    "주문 집중 시간대 배치 최적화",
    "신메뉴 출시 효과 분석 리포트",
    "배달 사고 발생률 감소 전략",
    "고객 대기시간 단축 방안 연구"
  ];

  const queryList = Array.from({ length: 100 }, (_, index) => {
    const queryIndex = index % deliveryQueries.length;
    const queryNumber = Math.floor(index / deliveryQueries.length) + 1;
    
    return {
      id: index + 1,
      name: queryNumber > 1 ? `${deliveryQueries[queryIndex]} (${queryNumber}차)` : deliveryQueries[queryIndex],
      description: `배달대행사 운영 최적화를 위한 데이터 분석 쿼리 ${index + 1}`,
      type: index % 3 === 0 ? '분석' : index % 3 === 1 ? '보고서' : '대시보드'
    };
  });

  // 검색어로 쿼리 리스트 필터링
  const filteredQueryList = queryList.filter(query =>
    query.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    query.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQueryClick = (query: { id: number; name: string; description: string; type: string }) => {
    const data = { 
      query: query.name, 
      id: query.id,
      type: query.type,
      description: query.description,
      result: Math.random() * 100,
      timestamp: new Date().toISOString()
    };
    
    // URL 변경
    router.push(`/query/${query.id}`);
    
    // 상위 컴포넌트에 데이터 전달
    onQuerySelect(data);
    
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
    <>
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
          pt-20
        `}
      >
        <h2 className={`
          ${isMobile ? 'mt-0 mb-5 text-lg' : 'mt-0 mb-5 text-xl'} 
          text-text-primary font-semibold
        `}>
          쿼리 목록
        </h2>
        
        {/* 검색 입력창 */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="쿼리 검색..."
              className={`
                w-full 
                ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-base'}
                border border-border-light rounded-lg
                bg-background-main text-text-primary
                placeholder:text-text-muted
                focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-primary-main
                transition-all duration-200
              `}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted">
              🔍
            </div>
          </div>
          {searchQuery && (
            <div className={`
              ${isMobile ? 'mt-2 text-xs' : 'mt-2 text-sm'} 
              text-text-secondary
            `}>
              {filteredQueryList.length}개의 결과 찾음
            </div>
          )}
        </div>

        <ul className="list-none p-0 m-0 space-y-2">
          {filteredQueryList.length === 0 ? (
            <li className="text-center py-8">
              <div className="text-text-muted text-4xl mb-2">🔍</div>
              <div className={`
                ${isMobile ? 'text-sm' : 'text-base'} 
                text-text-secondary font-medium mb-1
              `}>
                검색 결과가 없습니다
              </div>
              <div className={`
                ${isMobile ? 'text-xs' : 'text-sm'} 
                text-text-muted
              `}>
                다른 키워드로 검색해보세요
              </div>
            </li>
          ) : (
            filteredQueryList.map((query) => {
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
            })
          )}
        </ul>
      </div>
    </>
  );
};

export default Sidebar; 