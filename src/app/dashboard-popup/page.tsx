"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import { useAuth } from '@/contexts/AuthContext';
import ChartRenderer from '@/components/ChartRenderer';
import DataTable from '@/components/DataTable';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import Snackbar from '@/components/Snackbar';
import { extractTableData, analyzeDataTypes, generateChartData } from '@/utils/dataUtils';
import { callPreApi, callDetailApi, callPlainApi } from '@/utils/apiUtils';
import { updateQueryMemo, getQueryMemo, createQueryMemo } from '@/utils/queryMemoUtils';

interface ApiResponse {
  data: string | unknown;
  timestamp: string;
  type: 'detail' | 'plain';
}

function DashboardPopupContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('queryId');
  const openMemo = searchParams.get('openMemo');
  const { user } = useAuth();

  const [detailResponse, setDetailResponse] = useState<ApiResponse | null>(null);
  const [plainResponse, setPlainResponse] = useState<ApiResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingPlain, setIsLoadingPlain] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiQueryTitle, setApiQueryTitle] = useState<string | null>(null);
  const [apiQueryUser, setApiQueryUser] = useState<string | null>(null);
  
  // 차트 렌더링 관련 상태 (대용량 데이터 처리)
  const [shouldRenderChart, setShouldRenderChart] = useState(false);
  const [isLargeDataset, setIsLargeDataset] = useState(false);
  const [snackbar, setSnackbar] = useState({
    message: '',
    isVisible: false,
    type: 'info' as 'info' | 'warning' | 'error' | 'success'
  });
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  
  // 쿼리메모 관련 상태
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [currentMemo, setCurrentMemo] = useState('');

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, isVisible: false }));
  };

  const handleRenderChart = useCallback(() => {
    setShouldRenderChart(true);
  }, []);

  const toggleActionDropdown = () => {
    setIsActionDropdownOpen(prev => !prev);
  };

  const closeActionDropdown = () => {
    setIsActionDropdownOpen(false);
  };

  // 리대시에서 보기 (Redash로 이동)
  const handleOpenRedash = useCallback(() => {
    if (!queryId) return;
    
    const redashUrl = `https://redash.barogo.io/queries/${queryId}`;
    window.open(redashUrl, '_blank', 'noopener,noreferrer');
  }, [queryId]);

  // 슬랙으로 보내기
  const handleSendToSlack = useCallback(async () => {
    if (!queryId) {
      setSnackbar({ message: '보낼 대시보드가 없습니다. 쿼리 ID가 필요합니다.', isVisible: true, type: 'warning' });
      return;
    }
    if (!process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL) {
      setSnackbar({ message: '슬랙 웹훅 URL이 설정되지 않았습니다. .env.local에 NEXT_PUBLIC_SLACK_WEBHOOK_URL을 설정하세요.', isVisible: true, type: 'error' });
      return;
    }

    const popupUrl = `${window.location.origin}/dashboard-popup?queryId=${queryId}`;
    const queryTitle = apiQueryTitle || `쿼리 #${queryId}`;
    let aiSummary = "AI 인사이트가 없습니다.";

    if (detailResponse?.data && typeof detailResponse.data === 'string') {
      // HTML/Markdown을 텍스트로 변환하고 요약
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = detailResponse.data;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      aiSummary = textContent.substring(0, 400) + (textContent.length > 400 ? '...' : '');
    }

    const payload = {
      text: `*새로운 대시보드 공유: ${queryTitle}*\n\n*URL:* ${popupUrl}\n\n*AI 인사이트 요약:*\n${aiSummary}`,
    };

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSnackbar({ message: '✅ 슬랙으로 전송했습니다!', isVisible: true, type: 'success' });
      } else {
        setSnackbar({ message: '❌ 슬랙 전송 중 오류가 발생했습니다.', isVisible: true, type: 'error' });
      }
    } catch (error) {
      console.error('Slack 전송 오류:', error);
      setSnackbar({ message: '❌ 슬랙 전송 중 오류가 발생했습니다.', isVisible: true, type: 'error' });
    }
  }, [queryId, apiQueryTitle, detailResponse]);

  // 쿼리메모 모달 열기
  const handleOpenMemoModal = useCallback(async () => {
    console.log('🔍 handleOpenMemoModal called, queryId:', queryId);
    if (!queryId) return;
    
    try {
      // 기존 메모 불러오기
      const existingMemo = await getQueryMemo(parseInt(queryId));
      console.log('🔍 Existing memo loaded:', existingMemo);
      setCurrentMemo(existingMemo || '');
      setIsMemoModalOpen(true);
      setIsActionDropdownOpen(false);
      console.log('✅ Memo modal opened');
    } catch (error) {
      console.error('Error loading existing memo:', error);
      // 에러가 발생해도 모달은 열기 (빈 상태로)
      setCurrentMemo('');
      setIsMemoModalOpen(true);
      setIsActionDropdownOpen(false);
      console.log('✅ Memo modal opened (with error recovery)');
    }
  }, [queryId]);

  // 쿼리메모 저장
  const handleSaveMemo = useCallback(async () => {
    if (!queryId) return;
    
    console.log('🔍 MEMO SAVE (popup): Using queryMemoUtils functions (user-query-memos collection)');
    
    try {
      if (!currentMemo.trim()) {
        // 빈 메모인 경우 삭제
        await updateQueryMemo(parseInt(queryId), '');
        setSnackbar({ 
          message: '쿼리메모가 삭제되었습니다.', 
          isVisible: true, 
          type: 'success' 
        });
      } else {
        // 기존 메모가 있는지 확인
        const existingMemo = await getQueryMemo(parseInt(queryId));
        
        if (existingMemo) {
          // 기존 메모 업데이트
          await updateQueryMemo(parseInt(queryId), currentMemo);
        } else {
          // 새 메모 생성
          await createQueryMemo({
            queryId: parseInt(queryId),
            queryName: apiQueryTitle || `쿼리 #${queryId}`,
            queryDescription: '',
            queryType: 'unknown',
            queryUser: apiQueryUser || '사용자',
            memo: currentMemo,
          });
        }
        
        setSnackbar({ 
          message: '쿼리메모가 저장되었습니다.', 
          isVisible: true, 
          type: 'success' 
        });
      }
      
      // 팝업은 닫지 않고 메모 내용만 유지
      // setIsMemoModalOpen(false);
      // setCurrentMemo('');
    } catch (error) {
      console.error('Error saving memo:', error);
      setSnackbar({ 
        message: '쿼리메모 저장 중 오류가 발생했습니다.', 
        isVisible: true, 
        type: 'error' 
      });
    }
  }, [queryId, currentMemo, apiQueryTitle, apiQueryUser]);

  // 쿼리메모 모달 닫기
  const handleCloseMemoModal = useCallback(() => {
    setIsMemoModalOpen(false);
    setCurrentMemo('');
  }, []);

  // 캡쳐 함수
  const handleCapture = useCallback(async () => {
    try {
      // 팝업에서는 전체 body를 캡쳐
      const captureElement = document.body;

      // 로딩 상태 표시
      const loadingToast = document.createElement('div');
      loadingToast.innerHTML = `
        <div style="
          position: fixed; 
          top: 20px; 
          right: 20px; 
          z-index: 9999; 
          background: #333; 
          color: white; 
          padding: 12px 16px; 
          border-radius: 8px; 
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <div style="
            width: 16px; 
            height: 16px; 
            border: 2px solid #fff; 
            border-top: 2px solid transparent; 
            border-radius: 50%; 
            animation: spin 1s linear infinite;
          "></div>
          대시보드 캡쳐 중...
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
      document.body.appendChild(loadingToast);

      // 캡쳐 옵션
      const canvas = await html2canvas(captureElement, {
        useCORS: true,
        allowTaint: true,
        height: window.innerHeight,
        width: window.innerWidth,
      });

      // 로딩 토스트 제거
      document.body.removeChild(loadingToast);

      // 캡쳐된 이미지를 다운로드
      const queryTitle = apiQueryTitle || 'dashboard';
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `${queryTitle}_${queryId}_${timestamp}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSnackbar({ message: '✅ 대시보드가 캡쳐되었습니다!', isVisible: true, type: 'success' });
    } catch (error) {
      console.error('캡쳐 오류:', error);
      setSnackbar({ message: '❌ 캡쳐 중 오류가 발생했습니다.', isVisible: true, type: 'error' });
    }
  }, [apiQueryTitle, queryId]);

  // API 호출
  useEffect(() => {
    if (!queryId || !user?.isLoggedIn) return;

    const fetchData = async () => {
      setIsLoadingDetail(true);
      setIsLoadingPlain(true);
      setError(null);

      try {
        const { latestQueryDataId, queryName, queryUser } = await callPreApi(parseInt(queryId));
        
        if (queryName) {
          setApiQueryTitle(queryName);
          document.title = `${queryName} (#${queryId}) - Baro Board`;
        }
        
        if (queryUser) {
          setApiQueryUser(queryUser);
        }

        // 병렬 API 호출
        Promise.allSettled([
          callDetailApi(parseInt(queryId), latestQueryDataId),
          callPlainApi(parseInt(queryId), latestQueryDataId)
        ]).then((results) => {
          if (results[0].status === 'fulfilled') {
            setDetailResponse(results[0].value);
          } else {
            setError(`Detail API 오류: ${results[0].reason}`);
          }
          
          if (results[1].status === 'fulfilled') {
            setPlainResponse(results[1].value);
          } else {
            setError(`Plain API 오류: ${results[1].reason}`);
          }
          
          setIsLoadingDetail(false);
          setIsLoadingPlain(false);
        });

      } catch (error) {
        setError(`API 호출 오류: ${error}`);
        setIsLoadingDetail(false);
        setIsLoadingPlain(false);
      }
    };

    fetchData();
  }, [queryId, user]);

  // openMemo 파라미터가 있으면 자동으로 메모 모달 열기 (데이터 로딩 후)
  useEffect(() => {
    if (openMemo === 'true' && queryId && !isLoadingDetail && !isLoadingPlain) {
      console.log('🔍 Auto-opening memo modal due to openMemo parameter');
      // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 모달 열기
      setTimeout(() => {
        handleOpenMemoModal();
      }, 500);
    }
  }, [openMemo, queryId, isLoadingDetail, isLoadingPlain, handleOpenMemoModal]);

  // plainResponse가 변경될 때 대용량 데이터 확인
  useEffect(() => {
    if (plainResponse) {
      const tableData = extractTableData(plainResponse.data);
      if (tableData) {
        const rowCount = tableData.rows.length;
        const isLarge = rowCount >= 1000;
        
        setIsLargeDataset(isLarge);
        setShouldRenderChart(!isLarge); // 1000개 미만이면 자동 렌더링, 이상이면 수동 렌더링
      }
    }
  }, [plainResponse]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isActionDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('[data-dropdown-container]')) {
          closeActionDropdown();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isActionDropdownOpen]);

  if (!queryId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-soft">
        <div className="text-center p-6 bg-white rounded-lg shadow-md border border-border-light">
          <h1 className="text-xl font-bold text-red-600 mb-3">오류</h1>
          <p className="text-text-secondary">쿼리 ID가 제공되지 않았습니다.</p>
        </div>
      </div>
    );
  }

  if (!user?.isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-soft">
        <div className="text-center p-6 bg-white rounded-lg shadow-md border border-border-light">
          <h1 className="text-xl font-bold text-gray-600 mb-3">인증 필요</h1>
          <p className="text-text-secondary">로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  const tableData = plainResponse ? extractTableData(plainResponse.data) : null;
  const chartData = tableData ? generateChartData(tableData) : null;

  return (
    <div className="min-h-screen bg-background-soft relative w-full max-w-full">
      {/* 헤더 - 반응형 최적화 */}
      <div className="bg-white border-b border-border-light px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="text-left flex-1">
            <h1 className="text-xl font-bold text-text-primary mb-1">
              {apiQueryTitle || `쿼리 #${queryId}`}
            </h1>
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              {apiQueryUser && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {apiQueryUser}
                </span>
              )}
              <span>생성일: {new Date().toLocaleString('ko-KR')}</span>
            </div>
          </div>
          
          {/* 우측 액션 드롭다운 */}
          <div className="relative ml-4" data-dropdown-container>
            <button
              onClick={toggleActionDropdown}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-all duration-200 shadow-sm"
              title="더보기 옵션"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
              더보기
              <svg className={`w-3 h-3 transition-transform duration-200 ${isActionDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isActionDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => { handleCapture(); closeActionDropdown(); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  대시보드 캡쳐
                </button>

                <button
                  onClick={() => { handleOpenRedash(); closeActionDropdown(); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  리대시에서 보기
                </button>

                <div className="border-t border-gray-100 my-1"></div>
                
                <button
                  onClick={() => { handleOpenMemoModal(); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  쿼리메모
                </button>
                
                <button
                  onClick={() => { handleSendToSlack(); closeActionDropdown(); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4-4m0 0l-4-4m4 4H3" />
                  </svg>
                  슬랙으로 보내기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 m-6 rounded-lg">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-red-700 mb-2">연결 오류</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="p-6 space-y-6 min-w-0">
        {/* AI 분석 영역 (메인 대시보드와 동일한 Markdown 렌더링) */}
        <div className="bg-white rounded-lg shadow-sm border border-border-light overflow-hidden" data-testid="ai-analysis-card">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-pale to-white rounded-lg flex items-center justify-center border border-primary-light shadow-soft">
                  <svg className="w-5 h-5 text-primary-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">AI 인사이트</h2>
                  <p className="text-text-secondary text-xs">데이터 분석 및 인사이트</p>
                </div>
              </div>
              <div className="text-text-muted">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <div className="p-0">
            {isLoadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-primary-main border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-text-secondary text-sm">AI 인사이트 생성 중...</p>
                  <p className="text-text-muted text-xs mt-1">데이터를 분석하여 의미있는 인사이트를 추출하고 있습니다</p>
                </div>
              </div>
            ) : detailResponse ? (
              <MarkdownRenderer 
                content={String(detailResponse.data)}
                className="p-4"
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-pale to-primary-main rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="text-text-secondary text-sm">AI 인사이트 준비 중</p>
                  <p className="text-text-muted text-xs mt-1">쿼리를 선택하면 데이터 기반 인사이트를 생성합니다</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 차트 영역 */}
        <div className="bg-white rounded-lg shadow-sm border border-border-light p-6" data-testid="chart-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-main rounded-full"></div>
              데이터 차트
            </h2>
          </div>
          
          {isLoadingPlain ? (
            <div className="flex items-center justify-center py-16" data-testid="chart-loading">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary-main border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-text-secondary font-medium">차트 로딩 중...</p>
                <p className="text-text-muted text-sm mt-1">데이터를 시각화하고 있습니다</p>
              </div>
            </div>
          ) : plainResponse && chartData && isLargeDataset && !shouldRenderChart ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-text-primary font-semibold mb-2">대용량 데이터 감지됨</p>
                <p className="text-text-secondary text-sm mb-1">
                  총 <strong className="text-primary-main">{tableData?.rows.length.toLocaleString()}</strong>개의 데이터가 있습니다.
                </p>
                <p className="text-text-muted text-sm">
                  성능을 위해 수동으로 차트를 그려주세요.
                </p>
              </div>
              <button
                onClick={handleRenderChart}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-main to-primary-light text-white rounded-lg hover:from-primary-dark hover:to-primary-main transition-all duration-200 shadow-glow font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                차트 그리기
              </button>
            </div>
          ) : plainResponse && chartData && shouldRenderChart ? (
            <div>
              {isLargeDataset && (
                <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.3 2.647-1.3 3.412 0l5.734 9.73c.766 1.3-.149 2.97-1.692 2.97H4.215c-1.543 0-2.458-1.67-1.692-2.97l5.734-9.73zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-yellow-800 font-medium">
                      대용량 데이터로 인해 차트 렌더링에 시간이 소요될 수 있습니다.
                    </p>
                  </div>
                </div>
              )}
              <ChartRenderer chartData={chartData} />
            </div>
          ) : (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-text-secondary font-medium">차트 데이터 준비 중</p>
                <p className="text-text-muted text-sm mt-1">데이터를 불러오면 차트가 표시됩니다</p>
              </div>
            </div>
          )}
        </div>

        {/* 테이블 영역 */}
        {tableData && (
          <div className="bg-white rounded-lg shadow-sm border border-border-light p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">📋 데이터 테이블</h2>
            <DataTable 
              tableData={tableData}
              currentPage={1}
              itemsPerPage={50}
              hiddenColumns={new Set()}
              selectedXColumn={null}
              selectedYColumn={null}
              onPageChange={() => {}}
              onColumnClick={() => {}}
              onColumnRightClick={() => {}}
              onShowColumnSettings={() => {}}
              analyzeDataTypes={analyzeDataTypes}
            />
          </div>
        )}

        {/* 로딩 상태 */}
        {isLoadingPlain && !tableData && (
          <div className="bg-white rounded-lg shadow-sm border border-border-light p-6">
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary-main border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-text-secondary font-medium">데이터 로딩 중...</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Snackbar 
        message={snackbar.message} 
        isVisible={snackbar.isVisible} 
        onClose={handleSnackbarClose} 
        type={snackbar.type} 
      />

      {/* 쿼리메모 모달 */}
      {isMemoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
                      <div className="bg-white rounded-lg shadow-xl w-[500px] max-w-[90vw] h-[480px] min-h-[450px] overflow-hidden flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  쿼리메모 <span className="text-sm text-gray-500 font-normal">(ID: {queryId})</span>
                </h3>
              </div>
              <button
                onClick={handleCloseMemoModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="p-3 flex-1 flex flex-col">
              <div className="flex-1 flex flex-col">
                <label htmlFor="memo-textarea" className="block text-sm font-medium text-gray-700 mb-2">
                  메모 내용
                </label>
                <textarea
                  id="memo-textarea"
                  value={currentMemo}
                  onChange={(e) => setCurrentMemo(e.target.value)}
                  placeholder="이 쿼리에 대한 메모를 작성해주세요..."
                  className="w-full flex-1 min-h-[180px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main focus:border-primary-main resize-none"
                  maxLength={1000}
                />
                <div className="mt-2 text-xs text-gray-500 text-right">
                  {currentMemo.length}/1000
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCloseMemoModal}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveMemo}
                className="px-4 py-2 text-sm text-white bg-primary-main border border-primary-main rounded-lg hover:bg-primary-dark transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPopup() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background-soft">
        <div className="text-center p-6 bg-white rounded-lg shadow-md border border-border-light">
          <div className="animate-spin w-12 h-12 border-4 border-primary-main border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-secondary font-medium">로딩 중...</p>
        </div>
      </div>
    }>
      <DashboardPopupContent />
    </Suspense>
  );
}