"use client";

import React, { useState, useEffect } from 'react';
import Snackbar from './Snackbar';
import { addToViewHistory } from '@/utils/viewHistoryUtils';

interface QueryItem {
  id: number;
  name: string;
  description: string | null;
  type: string;
  user: string;
  updatedAt: string;
  runtime: string;
  runtimeValue: number; // 숫자 값으로 runtime 체크용
  isFavorite: boolean;
  isDraft: boolean;
  isArchived: boolean;
}

interface LNBProps {
  onQuerySelect: (data: { [key: string]: unknown }) => void;
  apiData?: {
    data: unknown;
    loading: boolean;
    error: string | null;
  };
  onPageChange: (page: number) => void;
  selectedQueryId?: number | null;
}

const LNB = ({ onQuerySelect, apiData, onPageChange, selectedQueryId }: LNBProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingPage, setLoadingPage] = useState<number | null>(null); // 로딩 중인 페이지
  const [localCurrentPage, setLocalCurrentPage] = useState<number | null>(null); // 로컬 현재 페이지
  
  // 스낵바 상태
  const [snackbar, setSnackbar] = useState({
    message: '',
    isVisible: false,
    type: 'warning' as 'info' | 'warning' | 'error' | 'success'
  });

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
const queryList = React.useMemo((): QueryItem[] => {
    // API 데이터가 results 배열을 포함하는 객체인 경우 (표준 응답 형태)
    if (apiData?.data && typeof apiData.data === 'object' && 'results' in apiData.data) {
      const data = apiData.data as Record<string, unknown>;
      const results = data.results as Array<Record<string, unknown>>;
      
      return results.map((item) => {
        const runtimeValue = (item.runtime as number) || 0;
        return {
          id: (item.id as number) || 0,
          name: (item.name as string) || (item.title as string) || '제목 없음',
          description: (item.description as string) || null,
          type: 'Query',
          user: (item.user as Record<string, unknown>)?.name as string || '알 수 없는 사용자',
          updatedAt: (item.updated_at as string) || '',
          runtime: runtimeValue.toFixed(2) + 's',
          runtimeValue: runtimeValue, // 숫자 값 저장
          isFavorite: (item.is_favorite as boolean) || false,
          isDraft: (item.is_draft as boolean) || false,
          isArchived: (item.is_archived as boolean) || false,
        };
      });
    }

    // API 데이터가 배열인 경우 (레거시 형태)
    if (apiData?.data && Array.isArray(apiData.data)) {
      return apiData.data.map((item: Record<string, unknown>) => {
        const runtimeValue = (item.runtime as number) || 0;
        return {
          id: (item.id as number) || 0,
          name: (item.name as string) || (item.title as string) || '제목 없음',
          description: (item.description as string) || null,
          type: 'Query',
          user: (item.user as string) || '알 수 없는 사용자',
          updatedAt: (item.updatedAt as string) || '',
          runtime: runtimeValue.toFixed(2) + 's',
          runtimeValue: runtimeValue, // 숫자 값 저장
          isFavorite: (item.isFavorite as boolean) || false,
          isDraft: (item.isDraft as boolean) || false,
          isArchived: (item.isArchived as boolean) || false,
        };
      });
    }

    return [];
  }, [apiData?.data]);

  // 페이지네이션 정보 추출
  const paginationInfo = React.useMemo(() => {
    if (apiData?.data && typeof apiData.data === 'object' && 'count' in apiData.data) {
      const data = apiData.data as Record<string, unknown>;
      return {
        count: (data.count as number) || 0,
        page: (data.page as number) || 1,
        pageSize: (data.page_size as number) || 20
      };
    }
    return null;
  }, [apiData?.data]);

  // API 데이터가 변경되면 로딩 상태 리셋
  useEffect(() => {
    if (paginationInfo) {
      setLoadingPage(null);
      setLocalCurrentPage(paginationInfo.page);
    }
  }, [paginationInfo]);

  // 검색어로 쿼리 리스트 필터링
  const filteredQueryList = queryList.filter((query: QueryItem) =>
    query.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (query.description && query.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleQueryClick = async (query: QueryItem) => {
    // runtime이 0이면 클릭 방지 및 스낵바 표시
    if (query.runtimeValue === 0) {
      setSnackbar({
        message: '해당 쿼리는 실행 불가 합니다.',
        isVisible: true,
        type: 'warning'
      });
      return; // 여기서 함수 종료
    }
    
    // 조회 이력에 추가 (로컬스토리지)
    addToViewHistory({
      id: query.id,
      name: query.name || `쿼리 ID ${query.id}`,
      description: query.description || '',
      type: query.type,
      runtime: query.runtime,
    });
    
    // 기본 쿼리 정보를 상위 컴포넌트에 전달
    const data = { 
      query: query.name || `쿼리 ID ${query.id}`, // name이 없으면 fallback 
      name: query.name || `쿼리 ID ${query.id}`, // name 필드 추가
      id: query.id,
      type: query.type,
      description: query.description || '', // null인 경우 빈 문자열로 처리
      timestamp: new Date().toISOString()
    };
    
    // 상위 컴포넌트에 데이터 전달
    onQuerySelect(data);
    
    // 모바일에서 메뉴 닫기
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // 스낵바 닫기 함수
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, isVisible: false }));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 페이지 변경 핸들러 (즉시 시각적 피드백 제공)
  const handlePageChange = (page: number) => {
    setLoadingPage(page); // 로딩 상태 설정
    setLocalCurrentPage(page); // 즉시 UI 업데이트
    onPageChange(page); // 실제 API 호출
  };



  return (
    <>
      {/* 모바일 햄버거 메뉴 버튼 */}
      {isMobile && (
              <button
        onClick={toggleMobileMenu}
        className="fixed top-[70px] left-5 z-[1001] bg-primary-main text-white border-none rounded-lg p-3 cursor-pointer text-lg shadow-button"
        data-testid="mobile-menu-toggle"
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
          ${isMobile ? 'w-[300px] min-w-[300px]' : 'w-[35%] min-w-[300px]'} 
          bg-background-soft p-4 overflow-y-auto flex-shrink-0
          ${isMobile ? 'fixed' : 'relative'}
          ${isMobile ? 'top-15' : 'top-0'}
          ${isMobile && !isMobileMenuOpen ? '-left-[300px]' : 'left-0'}
          ${isMobile ? 'h-[calc(100vh-92px)]' : 'h-full'}
          z-[1000] transition-all duration-300 ease-in-out
          ${isMobile ? 'shadow-medium' : ''}
          border-r border-border-light mobile-hide-scrollbar
          pt-20 flex flex-col
        `}
        data-testid="lnb-container"
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
              총 {paginationInfo.count}개 • 페이지 {localCurrentPage || paginationInfo.page} • {paginationInfo.pageSize}개씩 표시
              {loadingPage && (
                <span className="ml-2 text-primary-main">
                  로딩 중...
                </span>
              )}
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
            filteredQueryList.map((query: QueryItem) => {
              const isSelected = selectedQueryId === query.id;
              const isDisabled = query.runtimeValue === 0; // runtime이 0이면 비활성화
              
              return (
                <li 
                  key={query.id}
                  onClick={() => handleQueryClick(query)}
                  data-testid={`lnb-item-${query.id}`}
                  data-query-id={query.id}
                  className={`
                    p-2 border-b border-gray-200 last:border-b-0
                    ${isMobile ? 'text-sm' : 'text-base'}
                    transition-all duration-200
                    ${isDisabled 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50' 
                      : isSelected 
                        ? 'bg-primary-main text-white shadow-md hover:bg-primary-dark cursor-pointer' 
                        : 'bg-background-main hover:bg-primary-pale cursor-pointer'
                    }
                    ${query.isArchived ? 'opacity-60' : ''}
                  `}
                >
                  {/* 쿼리 ID */}
                  <div className="mb-1">
                    <span className={`
                      text-xs font-mono px-2 py-1 rounded-full
                      ${isDisabled 
                        ? 'bg-gray-200 text-gray-400'
                        : isSelected 
                          ? 'bg-white bg-opacity-20 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      #{query.id}
                    </span>
          </div>

                  {/* 쿼리 이름, 즐겨찾기, 날짜 */}
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-start gap-1 flex-1">
                      <div className={`
                        font-semibold leading-tight
                        ${isMobile ? 'text-xs' : 'text-sm'}
                        overflow-hidden text-ellipsis
                        ${isDisabled 
                          ? 'text-gray-400'
                          : isSelected 
                            ? 'text-white' 
                            : 'text-text-primary'
                        } flex-1
                      `}
                      style={{ lineClamp: 1, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}
                      >
                        {query.name}
                      </div>
                      {query.isFavorite && (
                        <span className={`text-xs ${
                          isDisabled 
                            ? 'text-gray-300'
                            : isSelected 
                              ? 'text-yellow-200' 
                              : 'text-yellow-500'
                        }`}>⭐</span>
                      )}
                      {isSelected && !isDisabled && (
                        <span className="text-xs text-white">✓</span>
                      )}
                    </div>
                    {query.updatedAt && (
                      <div className={`text-xs leading-none ml-2 flex-shrink-0 ${
                        isDisabled 
                          ? 'text-gray-400'
                          : isSelected 
                            ? 'text-white text-opacity-80' 
                            : 'text-text-muted'
                      }`}>
                        {query.updatedAt}
                      </div>
                    )}
                  </div>
                
                {/* 설명 */}
                  {query.description && (
                    <div className={`text-xs mb-1 line-clamp-1 leading-tight ${
                      isDisabled
                        ? 'text-gray-400'
                        : isSelected 
                          ? 'text-white text-opacity-80' 
                          : 'text-text-muted'
                    }`}>
                      {query.description}
                    </div>
                  )}

                  {/* 작성자와 실행시간 */}
                  <div className={`flex items-center justify-between pt-1 text-xs leading-none ${
                    isDisabled
                      ? 'text-gray-400'
                      : isSelected 
                        ? 'text-white text-opacity-80' 
                        : 'text-text-muted'
                  }`}>
                    <span>👤 {query.user}</span>
                    {query.runtime && (
                      <span className={isDisabled ? 'text-red-400' : ''}>
                        ⏱️ {query.runtime}
                    </span>
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
              const currentPage = localCurrentPage || paginationInfo.page;
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
                      onClick={() => handlePageChange(1)}
                      disabled={loadingPage === 1}
                      className={`
                        w-8 h-8 rounded text-xs font-medium transition-all
                        ${loadingPage === 1 
                          ? 'bg-primary-pale text-primary-main cursor-not-allowed' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
                        }
                      `}
                    >
                      «
                    </button>
                  )}
                  
                  {/* 이전 페이지 */}
                  {currentPage > 1 && (
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={loadingPage === currentPage - 1}
                      className={`
                        w-8 h-8 rounded text-xs font-medium transition-all
                        ${loadingPage === currentPage - 1 
                          ? 'bg-primary-pale text-primary-main cursor-not-allowed' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
                        }
                      `}
                    >
                      ‹
                    </button>
                  )}
                  
                  {/* 시작 부분에 ... 표시 */}
                  {startPage > 1 && (
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={loadingPage === 1}
                        className={`
                          w-8 h-8 rounded text-xs font-medium transition-all
                          ${loadingPage === 1 
                            ? 'bg-primary-pale text-primary-main cursor-not-allowed' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
                          }
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
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loadingPage === pageNum}
                      className={`
                        w-8 h-8 rounded text-xs font-medium transition-all
                        ${pageNum === currentPage
                          ? 'bg-primary-main text-white shadow-md'
                          : loadingPage === pageNum
                          ? 'bg-primary-pale text-primary-main cursor-not-allowed'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
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
                        onClick={() => handlePageChange(totalPages)}
                        disabled={loadingPage === totalPages}
                        className={`
                          w-8 h-8 rounded text-xs font-medium transition-all
                          ${loadingPage === totalPages 
                            ? 'bg-primary-pale text-primary-main cursor-not-allowed' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
                          }
                        `}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  
                  {/* 다음 페이지 */}
                  {currentPage < totalPages && (
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={loadingPage === currentPage + 1}
                      className={`
                        w-8 h-8 rounded text-xs font-medium transition-all
                        ${loadingPage === currentPage + 1 
                          ? 'bg-primary-pale text-primary-main cursor-not-allowed' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
                        }
                      `}
                    >
                      ›
                    </button>
                  )}
                  
                  {/* 마지막 페이지로 이동 */}
                  {currentPage < totalPages && (
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={loadingPage === totalPages}
                      className={`
                        w-8 h-8 rounded text-xs font-medium transition-all
                        ${loadingPage === totalPages 
                          ? 'bg-primary-pale text-primary-main cursor-not-allowed' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
                        }
                      `}
                    >
                      »
                    </button>
                  )}
                </div>
              );
            })()}
            
          </div>
        )}
      </div>

      {/* 스낵바 */}
      <Snackbar 
        message={snackbar.message}
        isVisible={snackbar.isVisible}
        onClose={handleSnackbarClose}
        type={snackbar.type}
        duration={3000}
      />
    </>
  );
};

export default LNB;
