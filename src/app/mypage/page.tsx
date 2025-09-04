"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getViewHistory, 
  removeFromViewHistory, 
  clearViewHistory,
  migrateLocalStorageToFirestore,
  ViewHistoryItem 
} from '@/utils/viewHistoryUtils';
// Firebase 디버깅 도구는 보안 규칙 문제 해결을 위해 유지
import '@/utils/firebaseDebug'; // Firebase 디버깅 함수 로드

const MyPage = () => {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

  // 조회 기록 관련 상태
  const [viewHistory, setViewHistory] = useState<ViewHistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15); // 페이지당 15개
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // 메뉴 상태
  const [activeMenu, setActiveMenu] = useState<'account' | 'history'>('history');

  // 로그인 상태 확인
  useEffect(() => {
    if (!isLoading && !user?.isLoggedIn) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // API 키 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedApiKey = localStorage.getItem('baroboard_api_key') || '';
      setApiKey(storedApiKey);
    }
  }, []);

  // 조회 기록 로드 (Firestore 기반)
  const loadViewHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const history = await getViewHistory();
      setViewHistory(history);
    } catch (error) {
      console.error('Error loading view history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // 초기 조회 기록 로드 및 마이그레이션
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.isLoggedIn) {
      // 기존 localStorage 데이터 마이그레이션 후 로드
      const migrateAndLoad = async () => {
        try {
          // 마이그레이션 시도 (기존 데이터가 있으면)
          await migrateLocalStorageToFirestore();
          // 데이터 로드
          await loadViewHistory();
        } catch (error) {
          console.error('Error during migration and load:', error);
          // 마이그레이션 실패해도 로드는 시도
          await loadViewHistory();
        }
      };
      
      migrateAndLoad();
    }
  }, [user?.isLoggedIn]);

  // 조회 기록이 변경되면 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [viewHistory.length]);

  // API 키 저장
  const handleApiKeySave = () => {
    localStorage.setItem('baroboard_api_key', apiKey);
    // TODO: replace with global toast/snackbar context if available
    console.log('API 키가 저장되었습니다.');
  };

  // API 키 초기화
  const handleApiKeyReset = () => {
    if (confirm('API 키를 초기화하시겠습니까?')) {
      setApiKey('');
      localStorage.removeItem('baroboard_api_key');
      console.log('API 키가 초기화되었습니다.');
    }
  };

  // 특정 조회 기록 삭제 (Firestore 기반)
  const handleRemoveHistoryItem = async (queryId: number) => {
    if (confirm('이 기록을 삭제하시겠습니까?')) {
      try {
        await removeFromViewHistory(queryId);
        await loadViewHistory(); // 재로드
      } catch (error) {
        console.error('Error removing history item:', error);
        alert('기록 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 전체 조회 기록 삭제 (Firestore 기반)
  const handleClearAllHistory = async () => {
    if (confirm('모든 조회 기록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      try {
        await clearViewHistory();
        await loadViewHistory(); // 재로드
      } catch (error) {
        console.error('Error clearing history:', error);
        alert('기록 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 쿼리를 A4 비율 팝업으로 열기
  const handleGoToQuery = (queryId: number) => {
    // A4 비율 (210:297) 팝업 크기 계산
    const a4Width = 794;  // A4 너비 (픽셀)
    const a4Height = 1123; // A4 높이 (픽셀)
    
    const popupUrl = `/dashboard-popup?queryId=${queryId}`;
    const popupFeatures = `width=${a4Width},height=${a4Height},scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no,left=${(screen.width - a4Width) / 2},top=${(screen.height - a4Height) / 2}`;
    
    window.open(popupUrl, `query-popup-${queryId}`, popupFeatures);
  };

  // 페이지네이션 관련
  const totalPages = Math.ceil(viewHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = viewHistory.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-main border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-secondary">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user?.isLoggedIn) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="min-h-screen bg-background-soft" style={{ paddingTop: user?.session ? '84px' : '60px' }}>
      {/* 헤더 */}
      <div className="bg-white border-b border-border-light">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">마이페이지</h1>
            <p className="text-text-secondary mt-1">계정 정보 및 설정을 관리하세요</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* 왼쪽 메뉴 */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-border-light h-fit sticky top-8">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-text-primary">메뉴</h2>
                <p className="text-xs text-text-muted">설정 및 기록</p>
              </div>
              
              <nav className="p-2">
                <button
                  onClick={() => setActiveMenu('history')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 mb-2 ${
                    activeMenu === 'history'
                      ? 'bg-primary-pale text-primary-main border border-primary-light'
                      : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                  }`}
                >
                  <div className="font-medium text-sm">내가 본 쿼리</div>
                  <div className="text-xs opacity-75">{viewHistory.length}개의 기록</div>
                </button>
                
                <button
                  onClick={() => setActiveMenu('account')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                    activeMenu === 'account'
                      ? 'bg-primary-pale text-primary-main border border-primary-light'
                      : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium text-sm">계정 정보</div>
                    <div className="text-xs opacity-75">계정 및 API 설정</div>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* 오른쪽 메인 콘텐츠 */}
          <div className="flex-1">
            {/* 계정 정보 탭 */}
            {activeMenu === 'account' && (
              <div className="space-y-6">
                {/* 계정 정보 */}
                <div className="bg-white rounded-lg shadow-sm border border-border-light p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-main" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  계정 정보
                </h2>
                
                <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">이메일</label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="flex-1 px-3 py-2 border border-border-light rounded-lg bg-gray-50 text-text-primary cursor-not-allowed"
                  />
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">인증됨</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">세션 ID</label>
                <input
                  type="text"
                  value={user?.session || '없음'}
                  disabled
                  className="w-full px-3 py-2 border border-border-light rounded-lg bg-gray-50 text-text-primary cursor-not-allowed font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">로그인 상태</label>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-medium">활성</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* API 설정 */}
          <div className="bg-white rounded-lg shadow-sm border border-border-light p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2-2m2 2H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              API 설정
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">API 키</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type={isApiKeyVisible ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="API 키를 입력하세요"
                      className="flex-1 px-3 py-2 border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-main"
                    />
                    <button
                      onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                      className="px-3 py-2 text-text-secondary hover:text-text-primary border border-border-light rounded-lg transition-colors"
                      title={isApiKeyVisible ? "숨기기" : "보기"}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isApiKeyVisible ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        )}
                      </svg>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleApiKeySave}
                      className="px-4 py-2 bg-gradient-to-r from-primary-main to-primary-light text-white text-sm rounded-lg hover:from-primary-dark hover:to-primary-main transition-all duration-200 shadow-button"
                    >
                      저장
                    </button>
                    <button
                      onClick={handleApiKeyReset}
                      className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      초기화
                    </button>
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  API 키는 브라우저에 안전하게 저장됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* 기타 설정 */}
          <div className="bg-white rounded-lg shadow-sm border border-border-light p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              애플리케이션 설정
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-text-primary">다크 모드</h3>
                  <p className="text-xs text-text-muted">어두운 테마 사용 (추후 지원 예정)</p>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-text-muted">준비 중</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-text-primary">알림</h3>
                  <p className="text-xs text-text-muted">쿼리 실행 완료 알림 (추후 지원 예정)</p>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-text-muted">준비 중</span>
                </div>
              </div>
                </div>
              </div>
              </div>
            )}
            
            {/* 내가 본 리스트 탭 */}
            {activeMenu === 'history' && (
              <div className="bg-white rounded-lg shadow-sm border border-border-light">
                {/* 헤더 */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-text-primary">내가 본 쿼리</h2>
                      <p className="text-sm text-text-muted">{viewHistory.length}개의 기록</p>
                    </div>
                    {viewHistory.length > 0 && (
                      <button
                        onClick={handleClearAllHistory}
                        className="text-sm text-red-500 hover:text-red-600 font-medium"
                      >
                        전체삭제
                      </button>
                    )}
                  </div>
                </div>

                {/* 조회 기록 리스트 */}
                <div className="p-0">
                  {isLoadingHistory ? (
                    <div className="text-center py-12">
                      <div className="animate-spin w-8 h-8 border-4 border-primary-main border-t-transparent rounded-full mx-auto mb-4"></div>
                      <h3 className="text-lg font-medium text-text-primary mb-2">기록을 불러오는 중...</h3>
                      <p className="text-text-muted">잠시만 기다려 주세요</p>
                    </div>
                  ) : viewHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium text-text-primary mb-2">조회 기록이 없습니다</h3>
                      <p className="text-text-muted">쿼리를 선택하면 여기에 기록이 표시됩니다</p>
                    </div>
                  ) : (
                    <>
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
                                    {item.name}
                                  </h3>
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex-shrink-0">
                                    {item.type}
                                  </span>
                                  {item.runtime && (
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full flex-shrink-0">
                                      ⏱️ {item.runtime}
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-sm text-text-muted truncate mb-1">{item.description}</p>
                                )}
                                <p className="text-xs text-text-light">
                                  {new Date(item.viewedAt).toLocaleString('ko-KR')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGoToQuery(item.id);
                                }}
                                className="text-primary-main hover:text-primary-dark p-2 rounded transition-colors"
                                title="팝업으로 보기"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </button>
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
                            
                            <div className="flex gap-1">
                              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 7) {
                                  pageNum = i + 1;
                                } else if (currentPage <= 4) {
                                  pageNum = i + 1;
                                } else if (currentPage >= totalPages - 3) {
                                  pageNum = totalPages - 6 + i;
                                } else {
                                  pageNum = currentPage - 3 + i;
                                }
                                
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`w-10 h-10 text-sm rounded-lg transition-colors ${
                                      currentPage === pageNum
                                        ? 'bg-primary-main text-white'
                                        : 'border border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}
                            </div>
                            
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
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
