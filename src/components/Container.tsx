"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import ColumnContextMenu from './ColumnContextMenu';
import ColumnSettingsModal from './ColumnSettingsModal';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface DetailApiResponse {
  data: string;
  timestamp: string;
  type: 'detail' | 'plain';
}

interface PlainApiResponse {
  data: unknown; // JSON 또는 string
  timestamp: string;
  type: 'detail' | 'plain';
}

interface TableData {
  columns: Array<{ name: string }>;
  rows: Array<Record<string, string | number>>;
}

interface ChartData {
  data: Array<Record<string, string | number>>;
  type: 'bar' | 'line' | 'pie';
  xKey: string;
  yKey: string;
  title?: string;
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
  const [detailResponse, setDetailResponse] = useState<DetailApiResponse | null>(null);
  const [plainResponse, setPlainResponse] = useState<PlainApiResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingPlain, setIsLoadingPlain] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [selectedXColumn, setSelectedXColumn] = useState<string | null>(null);
  const [selectedYColumn, setSelectedYColumn] = useState<string | null>(null);

  // 컬럼 숨기기/보이기 관련 상태
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

  // 컬럼 숨기기/보이기 핸들러 함수들
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
    
    // 숨겨진 컬럼이 현재 선택된 X/Y축이면 선택 해제
    if (selectedXColumn === columnName) {
      setSelectedXColumn(null);
    }
    if (selectedYColumn === columnName) {
      setSelectedYColumn(null);
    }
  };

  const handleToggleColumn = (columnName: string) => {
    setHiddenColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnName)) {
        newSet.delete(columnName);
      } else {
        newSet.add(columnName);
        
        // 숨겨진 컬럼이 현재 선택된 X/Y축이면 선택 해제
        if (selectedXColumn === columnName) {
          setSelectedXColumn(null);
        }
        if (selectedYColumn === columnName) {
          setSelectedYColumn(null);
        }
      }
      return newSet;
    });
  };

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isVisible: false }));
  };

  // 테이블 데이터 추출 함수
  const extractTableData = (plainData: unknown): TableData | null => {
    try {
      // 타입 가드를 사용한 query_result.data 구조 확인
      if (
        plainData && 
        typeof plainData === 'object' && 
        'query_result' in plainData &&
        plainData.query_result &&
        typeof plainData.query_result === 'object' &&
        'data' in plainData.query_result &&
        plainData.query_result.data &&
        typeof plainData.query_result.data === 'object' &&
        'columns' in plainData.query_result.data &&
        'rows' in plainData.query_result.data
      ) {
        const data = plainData.query_result.data as { columns: Array<{ name: string }>; rows: Array<Record<string, string | number>> };
        return {
          columns: data.columns,
          rows: data.rows
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  // 데이터 타입 분석 함수
  const analyzeDataTypes = (tableData: TableData) => {
    const columnTypes: Record<string, 'number' | 'string' | 'date'> = {};
    
    tableData.columns.forEach(column => {
      const sampleValues = tableData.rows
        .slice(0, Math.min(10, tableData.rows.length)) // 처음 10개 행만 샘플링
        .map(row => row[column.name])
        .filter(val => val !== null && val !== undefined);

      if (sampleValues.length === 0) {
        columnTypes[column.name] = 'string';
        return;
      }

      // 숫자 타입 확인
      const isNumeric = sampleValues.every(val => 
        !isNaN(Number(val)) && isFinite(Number(val))
      );

      // 날짜 타입 확인 (간단한 패턴)
      const isDate = sampleValues.every(val => 
        typeof val === 'string' && !isNaN(Date.parse(val))
      );

      if (isNumeric) {
        columnTypes[column.name] = 'number';
      } else if (isDate) {
        columnTypes[column.name] = 'date';
      } else {
        columnTypes[column.name] = 'string';
      }
    });

    return columnTypes;
  };

  // 차트 데이터 생성 함수
  const generateChartData = (tableData: TableData): ChartData | null => {
    const columnTypes = analyzeDataTypes(tableData);
    
    const numberColumns = Object.entries(columnTypes)
      .filter(([_name, type]) => type === 'number')
      .map(([name]) => name);
    const stringColumns = Object.entries(columnTypes)
      .filter(([_name, type]) => type === 'string')
      .map(([name]) => name);
    const dateColumns = Object.entries(columnTypes)
      .filter(([_name, type]) => type === 'date')
      .map(([name]) => name);

    // 차트 생성 조건 확인
    if (numberColumns.length === 0) return null;

    let xKey = '';
    let yKey = numberColumns[0];
    let chartType: 'bar' | 'line' | 'pie' = 'bar';

    // Y축 결정 (사용자 선택이 있으면 우선 사용, 숫자 컬럼만 가능)
    if (selectedYColumn && numberColumns.includes(selectedYColumn)) {
      yKey = selectedYColumn;
    } else {
      yKey = numberColumns[0];
    }

    // X축 결정 (사용자 선택이 있으면 우선 사용)
    if (selectedXColumn && tableData.columns.some(col => col.name === selectedXColumn)) {
      xKey = selectedXColumn;
      
      // 선택된 X축 타입에 따라 차트 타입 결정
      const selectedColumnType = columnTypes[selectedXColumn];
      if (selectedColumnType === 'date') {
        chartType = 'line';
      } else if (selectedColumnType === 'string') {
        const uniqueValues = new Set(tableData.rows.map(row => row[xKey])).size;
        chartType = uniqueValues <= 7 ? 'pie' : 'bar'; // 8개 이상이면 막대 그래프
      } else {
        chartType = 'bar';
      }
    } else {
      // 기본 자동 선택 로직
      if (dateColumns.length > 0) {
        xKey = dateColumns[0];
        chartType = 'line';
      } else if (stringColumns.length > 0) {
        xKey = stringColumns[0];
        const uniqueValues = new Set(tableData.rows.map(row => row[xKey])).size;
        chartType = uniqueValues <= 7 ? 'pie' : 'bar'; // 8개 이상이면 막대 그래프
      } else {
        xKey = tableData.columns[0].name;
      }
    }

    return {
      data: tableData.rows,
      type: chartType,
      xKey,
      yKey,
      title: `차트, 그래프`
    };
  };

  // 차트 색상 팔레트
  const CHART_COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff7f', 
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'
  ];

  // 차트 렌더러 컴포넌트
  const ChartRenderer = ({ chartData }: { chartData: ChartData }) => {
    const renderChart = (): React.ReactElement => {
      switch (chartData.type) {
        case 'bar':
          return (
            <BarChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartData.xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={chartData.yKey} fill={CHART_COLORS[0]} />
            </BarChart>
          );

        case 'line':
          return (
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartData.xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={chartData.yKey} 
                stroke={CHART_COLORS[0]} 
                strokeWidth={2}
              />
            </LineChart>
          );

        case 'pie':
          return (
            <PieChart>
              <Pie
                data={chartData.data}
                dataKey={chartData.yKey}
                nameKey={chartData.xKey}
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {chartData.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          );

        default:
          return <div>지원하지 않는 차트 타입입니다.</div>;
      }
    };

    return (
      <div className="w-full mb-8" data-testid="chart-renderer">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            📊 {chartData.title}
          </h3>
          <div className="text-sm text-text-muted">
            {chartData.type === 'bar' && '막대 차트'}
            {chartData.type === 'line' && '선 차트'}
            {chartData.type === 'pie' && '파이 차트'}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border" data-testid="chart-content">
          <ResponsiveContainer width="100%" height={500}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // 페이지네이션 컴포넌트
  const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange 
  }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void; 
  }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      return pages;
    };

    return (
      <div className="flex items-center justify-center gap-2 mt-4" data-testid="pagination">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm border border-border-light rounded-lg hover:bg-background-soft disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          data-testid="prev-page"
        >
          ← 이전
        </button>
        
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
              page === currentPage
                ? 'bg-primary-main text-white border-primary-main'
                : page === '...'
                ? 'cursor-default border-transparent'
                : 'border-border-light hover:bg-background-soft'
            }`}
            data-testid={page === currentPage ? "current-page" : page === '...' ? "page-ellipsis" : `page-${page}`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm border border-border-light rounded-lg hover:bg-background-soft disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          data-testid="next-page"
        >
          다음 →
        </button>
      </div>
    );
  };

  // 테이블 컴포넌트
  const TableRenderer = ({ tableData }: { tableData: TableData }) => {
    if (!tableData.columns.length || !tableData.rows.length) {
      return (
        <div className="text-center py-4 text-text-secondary">
          표시할 데이터가 없습니다.
        </div>
      );
    }

    // 보이는 컬럼만 필터링
    const visibleColumns = tableData.columns.filter(col => !hiddenColumns.has(col.name));
    const allColumnNames = tableData.columns.map(col => col.name);

    if (visibleColumns.length === 0) {
      return (
        <div className="text-center py-4 text-text-secondary">
          <p className="mb-2">모든 컬럼이 숨겨져 있습니다.</p>
          <button
            onClick={() => setIsColumnSettingsVisible(true)}
            className="px-3 py-1 text-sm bg-primary-main text-white rounded hover:bg-primary-dark transition-colors"
          >
            컬럼 설정
          </button>
        </div>
      );
    }

    // 페이지네이션 계산
    const totalPages = Math.ceil(tableData.rows.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = tableData.rows.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };

    const handleColumnClick = (columnName: string, isShiftClick: boolean = false) => {
      if (isShiftClick) {
        // Shift + 클릭: Y축 설정 (숫자 컬럼만 가능)
        const columnTypes = analyzeDataTypes(tableData);
        if (columnTypes[columnName] === 'number') {
          setSelectedYColumn(columnName === selectedYColumn ? null : columnName);
        }
      } else {
        // 일반 클릭: X축 설정
        setSelectedXColumn(columnName === selectedXColumn ? null : columnName);
      }
    };

    return (
      <div data-testid="table-container">
        {/* 테이블 상단 정보 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-text-muted">
              총 <span className="font-semibold text-text-primary">{tableData.rows.length}</span>개 행 중{' '}
              <span className="font-semibold text-text-primary">
                {startIndex + 1}-{Math.min(endIndex, tableData.rows.length)}
              </span>개 표시
            </div>
            {hiddenColumns.size > 0 && (
              <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                {hiddenColumns.size}개 컬럼 숨김
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsColumnSettingsVisible(true)}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
              title="컬럼 설정"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              컬럼 설정
            </button>
            {totalPages > 1 && (
              <div className="text-sm text-text-muted">
                페이지 {currentPage} / {totalPages}
              </div>
            )}
          </div>
        </div>

        {/* 테이블 */}
        <div className="border border-border-light rounded-lg overflow-hidden">
          <div className="overflow-auto max-h-[60vh]">
            <table className="min-w-full">
              <thead className="bg-background-soft sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary border-b border-border-light w-12">
                    #
                  </th>
                  {visibleColumns.map((column, index) => {
                    const columnTypes = analyzeDataTypes(tableData);
                    const isNumber = columnTypes[column.name] === 'number';
                    const isSelectedX = selectedXColumn === column.name;
                    const isSelectedY = selectedYColumn === column.name;
                    
                    return (
                      <th
                        key={index}
                        onClick={(e) => handleColumnClick(column.name, e.shiftKey)}
                        onContextMenu={(e) => handleColumnRightClick(e, column.name)}
                        className={`px-4 py-3 text-left text-sm font-semibold border-b border-border-light cursor-pointer transition-colors hover:bg-gray-200 ${
                          isSelectedX
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : isSelectedY
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'text-text-primary'
                        }`}
                        title={`클릭: X축 설정${isNumber ? ' • Shift+클릭: Y축 설정' : ''} ${
                          isSelectedX ? '(X축 선택됨)' : isSelectedY ? '(Y축 선택됨)' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {column.name}
                          {isSelectedX && <span className="text-xs">📊X</span>}
                          {isSelectedY && <span className="text-xs">📈Y</span>}
                          {isNumber && !isSelectedX && !isSelectedY && (
                            <span className="text-xs opacity-50">🔢</span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {currentPageData.map((row, rowIndex) => {
                  const globalRowIndex = startIndex + rowIndex + 1;
                  return (
                    <tr key={globalRowIndex} className="hover:bg-background-soft transition-colors">
                      <td className="px-4 py-3 text-sm text-text-muted border-b border-border-light w-12">
                        {globalRowIndex}
                      </td>
                      {visibleColumns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-4 py-3 text-sm text-text-primary border-b border-border-light"
                        >
                          <div className="max-w-xs truncate" title={String(row[column.name] || '')}>
                            {row[column.name] !== null && row[column.name] !== undefined 
                              ? String(row[column.name]) 
                              : '-'
                            }
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* 페이지네이션 */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    );
  };

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
  }, [selectedQuery?.id]);

  // API 호출 함수
  const fetchDetailAndPlainApi = useCallback(async (id: number) => {
    setIsLoadingDetail(true);
    setIsLoadingPlain(true);
    setError(null);
    
    try {
      const apiKey = localStorage.getItem('baroboard_api_key');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (apiKey) {
        headers['Authorization'] = `Key ${apiKey}`;
      }
      
      // 1단계: pre API 호출하여 latest_query_data_id 얻기
      const preApiUrl = `https://tg0825.app.n8n.cloud/webhook/01dedf36-0da7-4546-b5c2-dac80381452c?item-id=${id}&api-type=pre`;
      
      const preResponse = await fetch(preApiUrl, {
        method: 'GET',
        headers,
      });

      if (!preResponse.ok) {
        throw new Error(`Pre API 호출 실패: ${preResponse.status}`);
      }

      const preData = await preResponse.json() as Record<string, unknown>;
      const latestQueryDataId = (preData?.body as Record<string, unknown>)?.latest_query_data_id;

      if (!latestQueryDataId) {
        setError('latest_query_data_id를 찾을 수 없습니다.');
        return;
      }

      // 2단계: detail과 plain API를 독립적으로 병렬 호출
      // Detail API 호출
      fetch(`https://tg0825.app.n8n.cloud/webhook/01dedf36-0da7-4546-b5c2-dac80381452c?item-id=${id}&api-type=detail&latest_query_data_id=${latestQueryDataId}`, {
              method: 'GET',
        headers,
      })
      .then(res => res.ok ? res.text() : Promise.reject(`Detail API 실패: ${res.status}`))
      .then(htmlData => {
        setDetailResponse({
          data: htmlData,
          timestamp: new Date().toISOString(),
          type: 'detail'
        });
      })
      .catch(err => {
        setError(`Detail API 오류: ${err}`);
      })
      .finally(() => {
        setIsLoadingDetail(false);
      });

      // Plain API 호출
      fetch(`https://tg0825.app.n8n.cloud/webhook/01dedf36-0da7-4546-b5c2-dac80381452c?item-id=${id}&api-type=plain&latest_query_data_id=${latestQueryDataId}`, {
        method: 'GET',
        headers,
      })
      .then(res => res.ok ? res.text() : Promise.reject(`Plain API 실패: ${res.status}`))
      .then(jsonData => {
        // JSON 파싱 시도
        try {
          const parsedData = JSON.parse(jsonData);
          setPlainResponse({
            data: parsedData,
            timestamp: new Date().toISOString(),
            type: 'plain'
          });
        } catch {
          // JSON 파싱 실패시 원본 텍스트로 처리
          setPlainResponse({
            data: jsonData,
            timestamp: new Date().toISOString(),
            type: 'plain'
          });
        }
      })
      .catch(err => {
        setError(`Plain API 오류: ${err}`);
      })
      .finally(() => {
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
  }, [plainResponse]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div 
    style={{
      paddingTop: '61px'
    }}
    className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative" data-testid="main-container">
      <div dangerouslySetInnerHTML={{ __html: '<!-- 대시보드 헤더 영역 -->' }} />
      <div className="border-b border-border-light p-4 bg-background-main">
        <h1 className="text-2xl font-bold text-text-primary" data-testid="dashboard-title">
          {selectedQuery ? `대시보드 - ${selectedQuery.name} (#${selectedQuery.id})` : '대시보드'}
        </h1>
        <p className="text-text-secondary mt-1">
          {selectedQuery ? (
            selectedQuery.description || '상세 정보를 확인하고 있습니다'
          ) : (
            "쿼리를 선택해주세요"
          )}
        </p>
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
                    dangerouslySetInnerHTML={{ __html: detailResponse.data }}
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
                        <TableRenderer tableData={tableData} />
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

        {/* 컨텍스트 메뉴 */}
        <ColumnContextMenu
          isVisible={contextMenu.isVisible}
          position={contextMenu.position}
          columnName={contextMenu.columnName}
          onHideColumn={handleHideColumn}
          onClose={closeContextMenu}
        />

        {/* 컬럼 설정 모달 */}
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