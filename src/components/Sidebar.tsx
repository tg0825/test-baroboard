"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  onQuerySelect: (data: { [key: string]: unknown }) => void;
  apiData?: {
    data: any;
    loading: boolean;
    error: string | null;
  };
}

const Sidebar = ({ onQuerySelect, apiData }: SidebarProps) => {
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



  // API 데이터에서 쿼리 리스트 생성 (baroboard.mdc 응답 형태 기준)
  const queryList = React.useMemo(() => {
    // API 데이터가 results 배열을 포함하는 객체인 경우 (표준 응답 형태)
    if (apiData?.data && typeof apiData.data === 'object' && 'results' in apiData.data) {
      const data = apiData.data as any;
      if (data.results && Array.isArray(data.results)) {
        return data.results.map((item: any) => ({
          id: item.id,
          name: item.name || `쿼리 ${item.id}`,
          description: item.description || null,
          type: item.is_favorite ? '즐겨찾기' : item.is_draft ? '임시저장' : '분석',
          user: item.user?.name || '알 수 없음',
          updatedAt: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '',
          runtime: item.runtime ? `${item.runtime.toFixed(2)}초` : '',
          isFavorite: item.is_favorite,
          isDraft: item.is_draft,
          isArchived: item.is_archived
        }));
      }
    }
    
    // 기존 호환성을 위한 fallback 처리
    if (apiData?.data && Array.isArray(apiData.data)) {
      return apiData.data.map((item: any, index: number) => ({
        id: item.id || index + 1,
        name: item.name || item.title || `쿼리 ${index + 1}`,
        description: item.description || item.summary || `API에서 받은 쿼리 ${index + 1}`,
        type: item.type || item.category || '분석',
        user: '알 수 없음',
        updatedAt: '',
        runtime: '',
        isFavorite: false,
        isDraft: false,
        isArchived: false
      }));
    }
    
    // API 데이터가 없거나 형식이 맞지 않으면 빈 배열 반환
    return [];
  }, [apiData?.data]);

  // 페이지네이션 정보 추출
  const paginationInfo = React.useMemo(() => {
    if (apiData?.data && typeof apiData.data === 'object' && 'count' in apiData.data) {
      const data = apiData.data as any;
      return {
        count: data.count || 0,
        page: data.page || 1,
        pageSize: data.page_size || 20
      };
    }
    return null;
  }, [apiData?.data]);

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
      case '즐겨찾기': return 'border-yellow-500 text-yellow-700 bg-yellow-500';
      case '임시저장': return 'border-orange-500 text-orange-700 bg-orange-500';
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
          ${isMobile ? 'w-[280px]' : 'w-[30%]'} 
          bg-background-soft p-4 overflow-y-auto
          ${isMobile ? 'fixed' : 'relative'}
          ${isMobile ? 'top-15' : 'top-0'}
          ${isMobile && !isMobileMenuOpen ? '-left-[280px]' : 'left-0'}
          ${isMobile ? 'h-[calc(100vh-92px)]' : 'h-full'}
          z-[1000] transition-all duration-300 ease-in-out
          ${isMobile ? 'shadow-medium' : ''}
          border-r border-border-light mobile-hide-scrollbar
          pt-20 flex flex-col
        `}
      >
        <div className="mb-5">
          <h2 className={`
            ${isMobile ? 'mt-0 mb-2 text-lg' : 'mt-0 mb-2 text-xl'} 
            text-text-primary font-semibold
          `}>
            쿼리 목록
          </h2>
          {paginationInfo && (
            <div className={`
              ${isMobile ? 'text-xs' : 'text-sm'} 
              text-text-muted
            `}>
              총 {paginationInfo.count}개 • 페이지 {paginationInfo.page} • {paginationInfo.pageSize}개씩 표시
            </div>
          )}
        </div>
        
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

        <ul className="list-none p-0 m-0 flex-1 overflow-y-auto border border-border-light rounded-lg overflow-hidden">
          {apiData?.loading ? (
            <li className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary-main border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className={`
                ${isMobile ? 'text-sm' : 'text-base'} 
                text-text-secondary font-medium
              `}>
                쿼리 목록 로딩 중...
              </div>
            </li>
          ) : apiData?.error ? (
            <li className="text-center py-8">
              <div className="text-text-muted text-4xl mb-2">⚠️</div>
              <div className={`
                ${isMobile ? 'text-sm' : 'text-base'} 
                text-text-secondary font-medium mb-1
              `}>
                데이터 로딩 실패
              </div>
              <div className={`
                ${isMobile ? 'text-xs' : 'text-sm'} 
                text-text-muted
              `}>
                {apiData.error}
              </div>
            </li>
          ) : filteredQueryList.length === 0 ? (
            <li className="text-center py-8">
              <div className="text-text-muted text-4xl mb-2">
                {queryList.length === 0 ? '📭' : '🔍'}
              </div>
              <div className={`
                ${isMobile ? 'text-sm' : 'text-base'} 
                text-text-secondary font-medium mb-1
              `}>
                {queryList.length === 0 ? '쿼리 목록이 없습니다' : '검색 결과가 없습니다'}
              </div>
              <div className={`
                ${isMobile ? 'text-xs' : 'text-sm'} 
                text-text-muted
              `}>
                {queryList.length === 0 ? 'API에서 쿼리 데이터를 받아오지 못했습니다' : '다른 키워드로 검색해보세요'}
              </div>
            </li>
          ) : (
            filteredQueryList.map((query) => {
              return (
                <li 
                  key={query.id}
                  onClick={() => handleQueryClick(query)}
                  className={`
                    p-2 bg-background-main cursor-pointer
                    border-b border-gray-200 last:border-b-0
                    ${isMobile ? 'text-sm' : 'text-base'}
                    transition-all duration-200
                    hover:bg-primary-pale
                    ${query.isArchived ? 'opacity-60' : ''}
                  `}
                >
                  {/* 쿼리 이름, 즐겨찾기, 날짜 */}
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-start gap-1 flex-1">
                      <div className={`
                        font-semibold leading-tight
                        ${isMobile ? 'text-xs' : 'text-sm'}
                        overflow-hidden text-ellipsis
                        text-text-primary flex-1
                      `}
                      style={{ lineClamp: 1, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}
                      >
                        {query.name}
                      </div>
                      {query.isFavorite && (
                        <span className="text-yellow-500 text-xs">⭐</span>
                      )}
                    </div>
                    {query.updatedAt && (
                      <div className="text-xs text-text-muted leading-none ml-2 flex-shrink-0">
                        {query.updatedAt}
                      </div>
                    )}
                  </div>

                  {/* 설명 */}
                  {query.description && (
                    <div className="text-xs text-text-muted mb-1 line-clamp-1 leading-tight">
                      {query.description}
                    </div>
                  )}

                  {/* 작성자와 실행시간 */}
                  <div className="flex items-center justify-between pt-1 text-xs text-text-muted leading-none">
                    <span>👤 {query.user}</span>
                    {query.runtime && (
                      <span>⏱️ {query.runtime}</span>
                    )}
                  </div>
                </li>
              );
            })
          )}
        </ul>

        {/* 페이지네이션 */}
        {paginationInfo && filteredQueryList.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border-light">
            {(() => {
              const currentPage = paginationInfo.page;
              const totalPages = Math.ceil(paginationInfo.count / paginationInfo.pageSize);
              const maxVisiblePages = isMobile ? 5 : 7;
              
              // 페이지 번호 범위 계산
              let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
              const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
              
              // 끝 페이지가 조정되면 시작 페이지도 다시 조정
              if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
              }
              
              const pageNumbers = [];
              for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
              }
              
              return (
                <div className="flex items-center justify-center gap-1 flex-wrap">
                  {/* 첫 페이지로 이동 */}
                  {currentPage > 1 && (
                    <button
                      onClick={() => {/* TODO: 첫 페이지로 이동 */}}
                      className={`
                        w-8 h-8 rounded text-xs font-medium transition-all
                        bg-gray-100 text-gray-600 hover:bg-gray-200
                      `}
                    >
                      «
                    </button>
                  )}
                  
                  {/* 이전 페이지 */}
                  {currentPage > 1 && (
                    <button
                      onClick={() => {/* TODO: 이전 페이지 */}}
                      className={`
                        w-8 h-8 rounded text-xs font-medium transition-all
                        bg-gray-100 text-gray-600 hover:bg-gray-200
                      `}
                    >
                      ‹
                    </button>
                  )}
                  
                  {/* 시작 부분에 ... 표시 */}
                  {startPage > 1 && (
                    <>
                      <button
                        onClick={() => {/* TODO: 1페이지로 이동 */}}
                        className={`
                          w-8 h-8 rounded text-xs font-medium transition-all
                          bg-gray-100 text-gray-600 hover:bg-gray-200
                        `}
                      >
                        1
                      </button>
                      {startPage > 2 && (
                        <span className="text-gray-400 text-xs">...</span>
                      )}
                    </>
                  )}
                  
                  {/* 페이지 번호들 */}
                  {pageNumbers.map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => {/* TODO: 해당 페이지로 이동 */}}
                      className={`
                        w-8 h-8 rounded text-xs font-medium transition-all
                        ${pageNum === currentPage
                          ? 'bg-primary-main text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  {/* 끝 부분에 ... 표시 */}
                  {endPage < totalPages && (
                    <>
                      {endPage < totalPages - 1 && (
                        <span className="text-gray-400 text-xs">...</span>
                      )}
                      <button
                        onClick={() => {/* TODO: 마지막 페이지로 이동 */}}
                        className={`
                          w-8 h-8 rounded text-xs font-medium transition-all
                          bg-gray-100 text-gray-600 hover:bg-gray-200
                        `}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  
                  {/* 다음 페이지 */}
                  {currentPage < totalPages && (
                    <button
                      onClick={() => {/* TODO: 다음 페이지 */}}
                      className={`
                        w-8 h-8 rounded text-xs font-medium transition-all
                        bg-gray-100 text-gray-600 hover:bg-gray-200
                      `}
                    >
                      ›
                    </button>
                  )}
                  
                  {/* 마지막 페이지로 이동 */}
                  {currentPage < totalPages && (
                    <button
                      onClick={() => {/* TODO: 마지막 페이지로 이동 */}}
                      className={`
                        w-8 h-8 rounded text-xs font-medium transition-all
                        bg-gray-100 text-gray-600 hover:bg-gray-200
                      `}
                    >
                      »
                    </button>
                  )}
                </div>
              );
            })()}
            
            {/* 페이지 정보 */}
            <div className={`
              mt-3 text-center
              ${isMobile ? 'text-xs' : 'text-sm'} 
              text-text-muted
            `}>
              총 {paginationInfo.count}개 중 {((paginationInfo.page - 1) * paginationInfo.pageSize) + 1}-{Math.min(paginationInfo.page * paginationInfo.pageSize, paginationInfo.count)}번째 표시
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar; 