"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import ColumnContextMenu from './ColumnContextMenu';
import ColumnSettingsModal from './ColumnSettingsModal';
import ChartRenderer from './ChartRenderer';
import DataTable from './DataTable';
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
  const [apiQueryTitle, setApiQueryTitle] = useState<string | null>(null);

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

  // plainResponse가 변경될 때 기본 선택된 축을 상태에 반영  
  useEffect(() => {
    if (plainResponse) {
      const tableData = extractTableData(plainResponse.data);
      if (tableData) {
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
                 onClick={handleCapture}
                 className="flex items-center gap-2 px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
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
                 className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors"
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
            <div className="bg-white rounded-lg shadow-sm border border-border-light p-6 mb-6" data-testid="ai-analysis-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-primary">
                  📊 AI 분석
                  </h2>
              </div>
              
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-primary-main border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-text-secondary font-medium">AI 분석 중...</p>
                    <p className="text-text-muted text-sm mt-1">데이터를 분석하고 있습니다</p>
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
                    <p className="text-text-secondary font-medium">AI 분석 대기 중</p>
                    <p className="text-text-muted text-sm mt-1">쿼리를 선택하면 AI 분석이 시작됩니다</p>
              </div>
                </div>
              )}
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
                    ) : plainResponse && chartData ? (
                      <div>
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