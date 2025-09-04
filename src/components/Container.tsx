"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import ColumnContextMenu from './ColumnContextMenu';
import ColumnSettingsModal from './ColumnSettingsModal';
import ChartRenderer from './ChartRenderer';
import DataTable from './DataTable';
import MarkdownRenderer from './MarkdownRenderer';
import { extractTableData, analyzeDataTypes, generateChartData } from '@/utils/dataUtils';
import { callPreApi, callDetailApi, callPlainApi } from '@/utils/apiUtils';

interface ApiResponse {
  data: string | unknown;
  timestamp: string;
  type: 'detail' | 'plain';
}

interface SelectedQuery {
  id: number;
  query: string;
  name: string;
  type: string;
  description: string;
  timestamp: string;
}

interface ContainerProps {
  selectedQuery?: SelectedQuery | null;
  apiError?: string | null;
}

const Container = ({ selectedQuery, apiError }: ContainerProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [detailResponse, setDetailResponse] = useState<ApiResponse | null>(null);
  const [plainResponse, setPlainResponse] = useState<ApiResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingPlain, setIsLoadingPlain] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [selectedXColumn, setSelectedXColumn] = useState<string | null>(null);
  const [selectedYColumn, setSelectedYColumn] = useState<string | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    isVisible: boolean;
    position: { x: number; y: number };
    columnName: string;
  }>({
    isVisible: false,
    position: { x: 0, y: 0 },
    columnName: '',
  });
  const [isColumnSettingsVisible, setIsColumnSettingsVisible] = useState(false);

  // 차트 렌더링 관련 상태 (대용량 데이터 처리)
  const [shouldRenderChart, setShouldRenderChart] = useState(false); // 차트 렌더링 여부
  const [isLargeDataset, setIsLargeDataset] = useState(false); // 대용량 데이터 여부 (1000행 이상)
  const [apiQueryTitle, setApiQueryTitle] = useState<string | null>(null);

  // 차트 그리기 버튼 클릭 핸들러
  const handleRenderChart = useCallback(() => {
    setShouldRenderChart(true);
  }, []);

  // 이벤트 핸들러들
  const handleColumnRightClick = (e: React.MouseEvent, columnName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      isVisible: true,
      position: { x: e.clientX, y: e.clientY },
      columnName,
    });
  };

  const handleHideColumn = (columnName: string) => {
    setHiddenColumns(prev => new Set([...prev, columnName]));
    if (selectedXColumn === columnName) setSelectedXColumn(null);
    if (selectedYColumn === columnName) setSelectedYColumn(null);
  };

  const handleToggleColumn = (columnName: string) => {
    setHiddenColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnName)) {
        newSet.delete(columnName);
      } else {
        newSet.add(columnName);
        if (selectedXColumn === columnName) setSelectedXColumn(null);
        if (selectedYColumn === columnName) setSelectedYColumn(null);
      }
      return newSet;
    });
  };

  const handleColumnClick = (columnName: string, isShiftClick: boolean) => {
    const tableData = plainResponse ? extractTableData(plainResponse.data) : null;
    if (!tableData) return;
    
    if (isShiftClick) {
      const columnTypes = analyzeDataTypes(tableData);
      if (columnTypes[columnName] === 'number') {
        setSelectedYColumn(columnName === selectedYColumn ? null : columnName);
      }
    } else {
      setSelectedXColumn(columnName === selectedXColumn ? null : columnName);
    }
  };

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isVisible: false }));
  };

  const extractQueryTitle = useCallback((): string | null => {
    return apiQueryTitle || selectedQuery?.name || null;
  }, [apiQueryTitle, selectedQuery?.name]);

  // 팝업으로 대시보드 열기 (태블릿 사이즈: 768x1024)
  const handleOpenPopup = useCallback(() => {
    if (!selectedQuery) return;
    
    const popupUrl = `/dashboard-popup?queryId=${selectedQuery.id}`;
    const popupFeatures = 'width=768,height=1024,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no';
    
    window.open(popupUrl, 'dashboard-popup', popupFeatures);
  }, [selectedQuery]);

  // 리대시에서 보기 (Redash로 이동)
  const handleOpenRedash = useCallback(() => {
    if (!selectedQuery) return;
    
    const redashUrl = `https://redash.barogo.io/queries/${selectedQuery.id}`;
    window.open(redashUrl, '_blank', 'noopener,noreferrer');
  }, [selectedQuery]);

  // 대시보드 캡쳐 함수
  const handleCapture = useCallback(async () => {
    if (!selectedQuery) return;

    try {
      // 캡쳐할 영역 찾기 (대시보드 컨테이너)
      const dashboardElement = document.querySelector('[data-testid="main-container"]') as HTMLElement;
      
      if (!dashboardElement) {
        alert('캡쳐할 영역을 찾을 수 없습니다.');
        return;
      }

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
      const canvas = await html2canvas(dashboardElement, {
        useCORS: true,
        allowTaint: true,
        height: dashboardElement.scrollHeight,
        width: dashboardElement.scrollWidth,
      });

      // 로딩 토스트 제거
      document.body.removeChild(loadingToast);

      // 캡쳐된 이미지를 다운로드
      const queryTitle = extractQueryTitle() || 'dashboard';
      const queryId = selectedQuery.id;
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `${queryTitle}_${queryId}_${timestamp}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      
      // 다운로드 실행
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 성공 알림
      const successToast = document.createElement('div');
      successToast.innerHTML = `
        <div style="
          position: fixed; 
          top: 20px; 
          right: 20px; 
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
  }, [selectedQuery, extractQueryTitle]);





  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 새로운 쿼리가 선택되면 페이지를 1로 리셋하고 축 선택 초기화, 숨겨진 컬럼 초기화
  useEffect(() => {
    setCurrentPage(1);
    setSelectedXColumn(null);
    setSelectedYColumn(null);
    setHiddenColumns(new Set()); // 숨겨진 컬럼들 초기화
    setContextMenu(prev => ({ ...prev, isVisible: false })); // 컨텍스트 메뉴 닫기
    setApiQueryTitle(null); // API에서 가져온 제목 초기화
    // 차트 렌더링 상태 초기화
    setShouldRenderChart(false);
    setIsLargeDataset(false);
  }, [selectedQuery?.id]);

  // 상세 API 응답이 로드되면 페이지 제목 업데이트
  useEffect(() => {
    const queryTitle = extractQueryTitle();
    const queryId = selectedQuery?.id;
    
    if (queryTitle && queryId) {
      document.title = `${queryTitle} (#${queryId}) - Baro Board`;
    } else if (queryTitle) {
      document.title = `${queryTitle} - Baro Board`;
    } else if (queryId) {
      document.title = `쿼리 #${queryId} - Baro Board`;
    } else {
      document.title = 'Baro Board';
    }
  }, [apiQueryTitle, selectedQuery?.id, extractQueryTitle]);

  // API 호출 함수
  const fetchDetailAndPlainApi = useCallback(async (id: number) => {
    setIsLoadingDetail(true);
    setIsLoadingPlain(true);
    setError(null);
    
    try {
      const { latestQueryDataId, queryName } = await callPreApi(id);
      
      if (queryName) {
        setApiQueryTitle(queryName);
      }

      // 병렬 API 호출
      Promise.allSettled([
        callDetailApi(id, latestQueryDataId),
        callPlainApi(id, latestQueryDataId)
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

    } catch (err) {
      setError(`API 호출 중 오류가 발생했습니다: ${err}`);
      setIsLoadingDetail(false);
      setIsLoadingPlain(false);
    }
  }, []);

  // 선택된 쿼리가 변경될 때 API 호출
  useEffect(() => {
    if (selectedQuery && selectedQuery.id) {
      setDetailResponse(null);
      setPlainResponse(null);
      setSelectedXColumn(null); // 차트 축 초기화
      setSelectedYColumn(null); // 차트 축 초기화
      setCurrentPage(1); // 페이지네이션 초기화
      fetchDetailAndPlainApi(selectedQuery.id);
    }
  }, [selectedQuery, fetchDetailAndPlainApi]);

  // plainResponse가 변경될 때 기본 선택된 축을 상태에 반영 및 대용량 데이터 확인
  useEffect(() => {
    if (plainResponse) {
      const tableData = extractTableData(plainResponse.data);
      if (tableData) {
        // 데이터 행 개수 확인 (1000개 이상이면 대용량 데이터)
        const rowCount = tableData.rows.length;
        const isLarge = rowCount >= 1000;
        
        setIsLargeDataset(isLarge);
        setShouldRenderChart(!isLarge); // 1000개 미만이면 자동 렌더링, 이상이면 수동 렌더링
        
        const chartData = generateChartData(tableData);
        if (chartData) {
          // 새로운 데이터 로드 시 기본 축 설정 (현재 상태를 즉시 확인)
          setSelectedXColumn(prev => prev === null ? chartData.xKey : prev);
          setSelectedYColumn(prev => prev === null ? chartData.yKey : prev);
        }
      }
    }
  }, [plainResponse]);

  return (
    <div 
    style={{
      paddingTop: '61px'
    }}
    className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative" data-testid="main-container">
      <div dangerouslySetInnerHTML={{ __html: '<!-- 대시보드 헤더 영역 -->' }} />
      <div className="border-b border-border-light p-4 bg-background-main">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary" data-testid="dashboard-title">
              {(() => {
                const queryTitle = extractQueryTitle();
                const queryId = selectedQuery?.id;
                
                if (queryTitle && queryId) {
                  return `대시보드 - ${queryTitle} (#${queryId})`;
                } else if (queryTitle) {
                  return `대시보드 - ${queryTitle}`;
                } else if (queryId) {
                  return `대시보드 - 쿼리 #${queryId}`;
                } else {
                  return '대시보드';
                }
              })()}
        </h1>
        <p className="text-text-secondary mt-1">
              {selectedQuery ? (
                selectedQuery.description || '상세 정보를 확인하고 있습니다'
              ) : (
                "쿼리를 선택해주세요"
              )}
            </p>
          </div>
                     {selectedQuery && (
             <div className="flex items-center gap-2">
                                    <button
                       onClick={handleOpenRedash}
                       className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-button"
                       title="리대시에서 보기"
                     >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                 </svg>
                 리대시에서 보기
               </button>
                                    <button
                       onClick={handleCapture}
                       className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-button"
                       title="대시보드 캡쳐하기"
                     >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
                 캡쳐
               </button>
                                    <button
                       onClick={handleOpenPopup}
                       className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-primary-main to-primary-light text-white rounded-lg hover:from-primary-dark hover:to-primary-main transition-all duration-200 shadow-button"
                       title="새 창에서 대시보드만 보기"
                     >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                 </svg>
                 팝업으로 보기
               </button>
             </div>
           )}
        </div>
      </div>

      <div dangerouslySetInnerHTML={{ __html: '<!-- 메인 컨텐츠 영역 -->' }} />
      <div className="flex-1 p-6 overflow-y-auto">
        {(apiError || error) ? (
          <>
            <div dangerouslySetInnerHTML={{ __html: '<!-- API 에러 상태 -->' }} />
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-700 mb-2">연결 오류</h3>
                <p className="text-red-600">{apiError || error}</p>
              </div>
            </div>
          </>
        ) : selectedQuery ? (
          <>
            <div dangerouslySetInnerHTML={{ __html: '<!-- 선택된 쿼리 표시 영역 -->' }} />
          <div>
            <div dangerouslySetInnerHTML={{ __html: '<!-- 쿼리 정보 카드 영역 -->' }} />
            
            <div dangerouslySetInnerHTML={{ __html: '<!-- AI 분석 영역 (Detail API) -->' }} />
            <div className="bg-white rounded-lg shadow-sm border border-border-light overflow-hidden mb-6" data-testid="ai-analysis-card">
              <div className="bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-gradient-to-br from-primary-pale to-white rounded-lg flex items-center justify-center border border-primary-light shadow-soft">
               <svg className="w-5 h-5 text-primary-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-text-primary">AI 인사이트</h2>
                      <p className="text-text-secondary text-sm">데이터 분석 및 인사이트</p>
                    </div>
                  </div>
                  <div className="text-text-muted">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-0">{/* padding removed, will be handled by MarkdownRenderer */}
              
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-primary-main border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-text-secondary font-medium">AI 인사이트 생성 중...</p>
                    <p className="text-text-muted text-sm mt-1">데이터를 분석하여 의미있는 인사이트를 추출하고 있습니다</p>
                  </div>
                </div>
              ) : detailResponse ? (
                <MarkdownRenderer 
                  content={String(detailResponse.data)}
                  className="p-6"
                />
              ) : (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-pale to-primary-main rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <p className="text-text-secondary font-medium">AI 인사이트 준비 중</p>
                    <p className="text-text-muted text-sm mt-1">쿼리를 선택하면 데이터 기반 인사이트를 생성합니다</p>
              </div>
                </div>
              )}
              </div>
            </div>
            
            {(() => {
              const tableData = plainResponse ? extractTableData(plainResponse.data) : null;
              const chartData = tableData ? generateChartData(tableData) : null;
              
              return (
                <>
                  {/* 차트 영역 (두 번째) */}
                  <div dangerouslySetInnerHTML={{ __html: '<!-- 차트 영역 (Plain API) -->' }} />
                  <div className="bg-white rounded-lg shadow-sm border border-border-light p-6 mb-6" data-testid="chart-card">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-text-primary">
                        📈 데이터 차트
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
                      // 대용량 데이터 - "차트 그리기" 버튼 표시
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
                      // 차트 렌더링 (일반 데이터 또는 사용자가 버튼 클릭함)
                      <div>
                        {isLargeDataset && (
                          <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <p className="text-yellow-700 text-sm">
                                대용량 데이터 ({tableData?.rows.length.toLocaleString()}개 행)로 인해 차트 렌더링이 느릴 수 있습니다.
                              </p>
                            </div>
                          </div>
                        )}
                        <ChartRenderer chartData={chartData} />
                      </div>
                    ) : plainResponse && !chartData ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <p className="text-text-secondary font-medium">차트 생성 불가</p>
                          <p className="text-text-muted text-sm mt-1">숫자 데이터가 없어 차트를 생성할 수 없습니다</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <p className="text-text-secondary font-medium">차트 대기 중</p>
                          <p className="text-text-muted text-sm mt-1">쿼리를 선택하면 차트가 표시됩니다</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 테이블 영역 (세 번째) */}
                  <div dangerouslySetInnerHTML={{ __html: '<!-- 테이블 영역 (Plain API) -->' }} />
                  <div className="bg-white rounded-lg shadow-sm border border-border-light p-6" data-testid="table-card">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-text-primary">
                        📋 데이터 테이블
                      </h2>
                      {tableData && (
                        <div className="text-sm text-text-muted">
                          💡 컬럼 클릭: X축 • Shift+클릭: Y축 (숫자만)
                        </div>
                      )}
                    </div>
                    
                    {isLoadingPlain ? (
                      <div className="flex items-center justify-center py-16" data-testid="table-loading">
                        <div className="text-center">
                          <div className="animate-spin w-12 h-12 border-4 border-primary-main border-t-transparent rounded-full mx-auto mb-4"></div>
                          <p className="text-text-secondary font-medium">테이블 로딩 중...</p>
                          <p className="text-text-muted text-sm mt-1">데이터를 정리하고 있습니다</p>
                        </div>
                      </div>
                    ) : plainResponse && tableData ? (
                      <div data-testid="table-content">
                        <div className="text-sm text-text-muted mb-4">
                          응답 시간: {new Date(plainResponse.timestamp).toLocaleString()}
                        </div>
                        <DataTable 
                          tableData={tableData}
                          currentPage={currentPage}
                          itemsPerPage={itemsPerPage}
                          hiddenColumns={hiddenColumns}
                          selectedXColumn={selectedXColumn}
                          selectedYColumn={selectedYColumn}
                          onPageChange={setCurrentPage}
                          onColumnClick={handleColumnClick}
                          onColumnRightClick={handleColumnRightClick}
                          onShowColumnSettings={() => setIsColumnSettingsVisible(true)}
                          analyzeDataTypes={analyzeDataTypes}
                        />
                      </div>
                    ) : plainResponse && !tableData ? (
                      <div>
                        <div className="text-sm text-text-muted mb-4">
                          응답 시간: {new Date(plainResponse.timestamp).toLocaleString()}
                        </div>
                        <div>
                          <p className="text-sm text-text-secondary mb-2">
                            테이블 형식이 아닌 응답입니다:
                          </p>
                          <pre className="whitespace-pre-wrap overflow-auto bg-gray-50 p-4 rounded border text-sm max-h-96">
                            {typeof plainResponse.data === 'string' 
                              ? plainResponse.data 
                              : JSON.stringify(plainResponse.data, null, 2)
                            }
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v1H8V5z" />
                            </svg>
                          </div>
                          <p className="text-text-secondary font-medium">테이블 대기 중</p>
                          <p className="text-text-muted text-sm mt-1">쿼리를 선택하면 테이블이 표시됩니다</p>
                        </div>
              </div>
            )}
                  </div>
                </>
              );
            })()}
          </div>
          </>
        ) : (
          <>
            <div dangerouslySetInnerHTML={{ __html: '<!-- 기본 상태 (쿼리 선택 대기) -->' }} />
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Image 
                src="/logo-bb.png" 
                alt="BaroBoard Logo" 
                width={isMobile ? 192 : 256} 
                height={isMobile ? 192 : 256} 
                className="mx-auto mb-4 opacity-20 object-contain"
                priority
              />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                BaroBoard에 오신 것을 환영합니다
              </h3>
              <p className="text-text-light">
                좌측 쿼리 목록에서 항목을 선택하면 상세 정보를 확인할 수 있습니다
              </p>
            </div>
          </div>
          </>
        )}

        <ColumnContextMenu
          isVisible={contextMenu.isVisible}
          position={contextMenu.position}
          columnName={contextMenu.columnName}
          onHideColumn={handleHideColumn}
          onClose={closeContextMenu}
        />

        <ColumnSettingsModal
          isVisible={isColumnSettingsVisible}
          allColumns={(() => {
            const tableData = plainResponse ? extractTableData(plainResponse.data) : null;
            return tableData ? tableData.columns.map(col => col.name) : [];
          })()}
          hiddenColumns={hiddenColumns}
          onToggleColumn={handleToggleColumn}
          onClose={() => setIsColumnSettingsVisible(false)}
        />
      </div>
    </div>
  );
};

export default Container;