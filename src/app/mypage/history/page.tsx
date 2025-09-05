"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getViewHistory, 
  removeFromViewHistory, 
  clearViewHistory,
  migrateLocalStorageToFirestore,
  getRelativeTime,
  ViewHistoryItem 
} from '@/utils/viewHistoryUtils';

export default function HistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [viewHistory, setViewHistory] = useState<ViewHistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [sortBy, setSortBy] = useState<'viewCount' | 'recent'>('viewCount');

  // 데이터 로드
  useEffect(() => {
    if (user?.isLoggedIn) {
      loadViewHistory();
    }
  }, [user?.isLoggedIn]);

  const loadViewHistory = async () => {
    setIsLoadingHistory(true);
    try {
      await migrateLocalStorageToFirestore();
      const history = await getViewHistory();
      setViewHistory(history);
    } catch (error) {
      console.error('Error loading view history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // 정렬된 데이터
  const sortedHistory = [...viewHistory].sort((a, b) => {
    if (sortBy === 'viewCount') {
      return (b.viewCount || 1) - (a.viewCount || 1);
    } else {
      return new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime();
    }
  });

  // 페이지네이션
  const totalPages = Math.ceil(sortedHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedHistory.slice(startIndex, endIndex);

  const handleGoToQuery = (queryId: number) => {
    // 화면 중앙에 세로 직사각형 형태로 팝업 열기
    const width = 900;
    const height = 1200;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      `/dashboard-popup?queryId=${queryId}`, 
      '_blank', 
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  };

  const handleRemoveHistoryItem = async (queryId: number) => {
    if (confirm('이 기록을 삭제하시겠습니까?')) {
      try {
        await removeFromViewHistory(queryId);
        await loadViewHistory();
      } catch (error) {
        console.error('Error removing history item:', error);
      }
    }
  };

  const handleClearAllHistory = async () => {
    if (confirm('모든 조회 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        await clearViewHistory();
        setViewHistory([]);
        setCurrentPage(1);
      } catch (error) {
        console.error('Error clearing history:', error);
      }
    }
  };

  const handleSortChange = (newSortBy: 'viewCount' | 'recent') => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border-light">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">내가 본 쿼리</h2>
            <p className="text-sm text-text-muted">{viewHistory.length}개의 기록</p>
          </div>
          <div className="flex items-center gap-4">
            {/* 정렬 버튼 */}
            {viewHistory.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">정렬:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleSortChange('viewCount')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      sortBy === 'viewCount'
                        ? 'bg-white text-primary-main shadow-sm'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    조회수순
                  </button>
                  <button
                    onClick={() => handleSortChange('recent')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      sortBy === 'recent'
                        ? 'bg-white text-primary-main shadow-sm'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    최신순
                  </button>
                </div>
              </div>
            )}
            
            {/* 전체 삭제 버튼 */}
            {viewHistory.length > 0 && (
              <button
                onClick={handleClearAllHistory}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                전체 삭제
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="p-0">
        {isLoadingHistory ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-main border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-text-secondary">조회 기록을 불러오는 중...</p>
          </div>
        ) : viewHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-text-muted text-4xl mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-text-secondary font-medium">아직 조회한 쿼리가 없습니다</p>
            <p className="text-text-muted">쿼리를 조회하면 여기에 기록이 표시됩니다</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {currentItems.map((item, index) => (
              <div
                key={`${item.id}-${item.viewedAt}`}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between"
                onClick={() => handleGoToQuery(item.id)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary truncate">
                        (#{item.id}) {item.name}
                      </h3>
                      {item.runtime && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full flex-shrink-0 flex items-center gap-1">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {item.runtime}
                        </span>
                      )}
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full flex-shrink-0 flex items-center gap-1">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {item.viewCount || 1}회
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-text-muted truncate mb-1">{item.description}</p>
                    )}
                    {item.memo && (
                      <div className="bg-amber-50 border-l-4 border-amber-300 p-2 mb-2 rounded-r">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <p className="text-sm text-amber-800 leading-relaxed">
                            {item.memo}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-text-light">
                      {item.user && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {item.user}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {getRelativeTime(item.viewedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveHistoryItem(item.id);
                    }}
                    className="text-red-500 hover:text-red-600 p-2 rounded transition-colors"
                    title="기록 삭제"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-text-muted mb-4">
              <span>
                {startIndex + 1}-{Math.min(endIndex, viewHistory.length)} / {viewHistory.length}개 표시
              </span>
              <span>
                {currentPage} / {totalPages} 페이지
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                처음
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                이전
              </button>
              
              {/* 페이지 번호들 */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm border border-gray-300 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-primary-main text-white border-primary-main'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                다음
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                마지막
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
