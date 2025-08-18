"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface DetailApiResponse {
  data: string;
  timestamp: string;
  type: 'detail' | 'plain';
}

interface PlainApiResponse {
  data: any; // JSON 또는 string
  timestamp: string;
  type: 'detail' | 'plain';
}

interface TableData {
  columns: Array<{ name: string }>;
  rows: Array<Record<string, any>>;
}

interface SelectedQuery {
  id: number;
  query: string;
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

  // 테이블 데이터 추출 함수
  const extractTableData = (plainData: any): TableData | null => {
    try {
      // query_result.data 구조 확인
      if (plainData?.query_result?.data?.columns && plainData?.query_result?.data?.rows) {
        return {
          columns: plainData.query_result.data.columns,
          rows: plainData.query_result.data.rows
        };
      }
      return null;
    } catch (err) {
      return null;
    }
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

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-border-light rounded-lg overflow-hidden">
          <thead className="bg-background-soft">
            <tr>
              {tableData.columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-sm font-semibold text-text-primary border-b border-border-light"
                >
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-border-light">
            {tableData.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-background-soft transition-colors">
                {tableData.columns.map((column, colIndex) => (
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
            ))}
          </tbody>
        </table>
        
        {/* 테이블 정보 */}
        <div className="mt-2 text-xs text-text-muted text-center">
          총 {tableData.rows.length}개 행, {tableData.columns.length}개 열
        </div>
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
        } catch (parseError) {
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
      fetchDetailAndPlainApi(selectedQuery.id);
    }
  }, [selectedQuery, fetchDetailAndPlainApi]);

  return (
    <div className="flex-1 flex flex-col h-full mt-16 min-w-0 overflow-hidden relative">
      {/* 헤더 */}
      <div className="border-b border-border-light p-4 bg-background-main">
        <h1 className="text-2xl font-bold text-text-primary">
          대시보드
        </h1>
        <p className="text-text-secondary mt-1">
          {selectedQuery ? `선택된 쿼리: ${selectedQuery.query}` : "쿼리를 선택해주세요"}
        </p>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 p-6 overflow-y-auto">
        {(apiError || error) ? (
          /* API 에러 상태 */
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
        ) : selectedQuery ? (
          /* 선택된 쿼리 표시 */
          <div>
            {/* 쿼리 정보 카드 */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-text-primary mb-2">
                    {selectedQuery.query}
                  </h2>
                  {selectedQuery.description && (
                    <p className="text-text-secondary mb-3">
                      {selectedQuery.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <span>ID: {selectedQuery.id}</span>
                    <span>타입: {selectedQuery.type}</span>
                    <span>시간: {new Date(selectedQuery.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 상세 API 응답 (첫 번째) */}
            <div className="bg-white rounded-lg shadow-sm border border-border-light p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-primary">
                  📊 상세 API 응답 (api-type=detail)
                </h2>
                {isLoadingDetail && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-primary-main border-t-transparent rounded-full"></div>
                    <span className="text-sm text-text-secondary">로딩 중...</span>
                  </div>
                )}
              </div>
              
              {detailResponse ? (
                <div>
                  <div className="text-sm text-text-muted mb-3">
                    응답 시간: {new Date(detailResponse.timestamp).toLocaleString()}
                  </div>
                  <pre 
                    className="whitespace-pre-wrap overflow-auto bg-gray-50 p-4 rounded border text-sm max-h-96"
                    dangerouslySetInnerHTML={{ __html: detailResponse.data }}
                  />
                </div>
              ) : !isLoadingDetail ? (
                <p className="text-text-secondary">아직 응답이 없습니다.</p>
              ) : null}
            </div>

            {/* 플레인 API 응답 (두 번째) - 테이블 형태 */}
            <div className="bg-white rounded-lg shadow-sm border border-border-light p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-primary">
                  📋 쿼리 결과 테이블 (api-type=plain)
                </h2>
                {isLoadingPlain && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-primary-main border-t-transparent rounded-full"></div>
                    <span className="text-sm text-text-secondary">로딩 중...</span>
                  </div>
                )}
              </div>
              
              {plainResponse ? (
                <div>
                  <div className="text-sm text-text-muted mb-3">
                    응답 시간: {new Date(plainResponse.timestamp).toLocaleString()}
                  </div>
                  
                  {(() => {
                    const tableData = extractTableData(plainResponse.data);
                    
                    if (tableData) {
                      return <TableRenderer tableData={tableData} />;
                    } else {
                      // 테이블 구조가 아닌 경우 원본 데이터 표시
                      return (
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
                      );
                    }
                  })()}
                </div>
              ) : !isLoadingPlain ? (
                <p className="text-text-secondary">아직 응답이 없습니다.</p>
              ) : null}
            </div>
          </div>
        ) : (
          /* 기본 상태 */
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
        )}
      </div>
    </div>
  );
};

export default Container;