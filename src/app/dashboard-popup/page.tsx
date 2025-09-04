"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import { useAuth } from '@/contexts/AuthContext';
import ChartRenderer from '@/components/ChartRenderer';
import DataTable from '@/components/DataTable';
import { extractTableData, analyzeDataTypes, generateChartData } from '@/utils/dataUtils';
import { callPreApi, callDetailApi, callPlainApi } from '@/utils/apiUtils';

interface ApiResponse {
  data: string | unknown;
  timestamp: string;
  type: 'detail' | 'plain';
}

function DashboardPopupContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('queryId');
  const { user } = useAuth();

  const [detailResponse, setDetailResponse] = useState<ApiResponse | null>(null);
  const [plainResponse, setPlainResponse] = useState<ApiResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingPlain, setIsLoadingPlain] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiQueryTitle, setApiQueryTitle] = useState<string | null>(null);
  
  // 차트 렌더링 관련 상태 (대용량 데이터 처리)
  const [shouldRenderChart, setShouldRenderChart] = useState(false);
  const [isLargeDataset, setIsLargeDataset] = useState(false);

  // 리대시에서 보기 (Redash로 이동)
  const handleOpenRedash = useCallback(() => {
    if (!queryId) return;
    
    const redashUrl = `https://redash.barogo.io/queries/${queryId}`;
    window.open(redashUrl, '_blank', 'noopener,noreferrer');
  }, [queryId]);

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

      // 성공 알림
      const successToast = document.createElement('div');
      successToast.innerHTML = `
        <div style="
          position: fixed; 
          top: 20px; 
          right: 70px; 
          z-index: 9999; 
          background: #22c55e; 
          color: white; 
          padding: 12px 16px; 
          border-radius: 8px; 
          font-size: 14px;
        ">
          ✅ 대시보드가 캡쳐되었습니다!
        </div>
      `;
      document.body.appendChild(successToast);
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 3000);

    } catch (error) {
      console.error('캡쳐 오류:', error);
      alert('캡쳐 중 오류가 발생했습니다.');
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
        const { latestQueryDataId, queryName } = await callPreApi(parseInt(queryId));
        
        if (queryName) {
          setApiQueryTitle(queryName);
          document.title = `${queryName} (#${queryId}) - Baro Board`;
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

  if (!queryId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류</h1>
          <p>쿼리 ID가 제공되지 않았습니다.</p>
        </div>
      </div>
    );
  }

  if (!user?.isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">인증 필요</h1>
          <p>로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  const tableData = plainResponse ? extractTableData(plainResponse.data) : null;
  const chartData = tableData ? generateChartData(tableData) : null;

  return (
    <div className="min-h-screen bg-gray-50 relative" style={{ width: '794px', maxWidth: '794px', margin: '0 auto' }}>
      {/* 우측 상단 버튼들 */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={handleOpenRedash}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
          title="리대시에서 보기"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          리대시
        </button>
        <button
          onClick={handleCapture}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg"
          title="대시보드 캡쳐하기"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          캡쳐
        </button>
      </div>

      {/* 헤더 - A4 최적화 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900 mb-1">
            {apiQueryTitle || `쿼리 #${queryId}`}
          </h1>
          <p className="text-gray-500 text-xs">
            생성일: {new Date().toLocaleString('ko-KR')} | A4 대시보드
          </p>
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
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="p-6 space-y-8">
        {/* AI 분석 영역 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🤖 AI 분석</h2>
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">분석 중...</p>
              </div>
            </div>
          ) : detailResponse ? (
            <div>
              <pre 
                className="whitespace-pre-wrap overflow-auto bg-gray-50 p-4 rounded border text-sm"
                dangerouslySetInnerHTML={{ __html: String(detailResponse.data) }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">AI 분석 대기 중</p>
              </div>
            </div>
          )}
        </div>

        {/* 차트 영역 */}
        {chartData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <ChartRenderer chartData={chartData} />
          </div>
        )}

        {/* 테이블 영역 */}
        {tableData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 데이터 테이블</h2>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">데이터 로딩 중...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPopup() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">로딩 중...</p>
        </div>
      </div>
    }>
      <DashboardPopupContent />
    </Suspense>
  );
}