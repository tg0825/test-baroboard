"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Graph from './Graph';

interface DetailApiData {
  originalHtml: string;
  bodyContent: string;
}

interface SelectedQuery {
  id: number;
  query: string;
  type: string;
  description: string;
  redashData?: unknown;
  infoApiData?: unknown;
  detailApiData?: DetailApiData | null;
  error?: string;
  timestamp: string;
}

interface ContainerProps {
  selectedQuery?: SelectedQuery | null;
  apiError?: string | null;
}

const Container = ({ selectedQuery, apiError }: ContainerProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [fullQueryData, setFullQueryData] = useState<SelectedQuery | null>(null);
  const [currentAbortController, setCurrentAbortController] = useState<AbortController | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchQueryData = useCallback(async (query: SelectedQuery) => {
    try {
      console.log(`🔍 쿼리 ID ${query.id} - n8n webhook API 호출 시작`);
      
      // 기존 요청이 있으면 취소
      if (currentAbortController) {
        currentAbortController.abort();
        console.log('🚫 기존 API 요청 취소됨');
      }
      
      // 새로운 AbortController 생성
      const abortController = new AbortController();
      setCurrentAbortController(abortController);
      setIsLoading(true);
      
      // n8n webhook API 호출
      const apiKey = localStorage.getItem('baroboard_api_key');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // API 키가 있으면 헤더에 추가
      if (apiKey) {
        headers['Authorization'] = `Key ${apiKey}`;
      }
      
      // n8n info api
      const apiUrl = `https://tg0825.app.n8n.cloud/webhook/01dedf36-0da7-4546-b5c2-dac80381452c?item-id=${query.id}`;
      console.log('🔗 n8n webhook API 요청:', apiUrl);
      console.log('📤 요청 헤더:', headers);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
        signal: abortController.signal,
      });

      if (response.ok) {
        const responseData = await response.json() as Record<string, unknown>;
        console.log('✅ n8n webhook API 응답:', responseData);
        
        // latest_query_data_id 확인 (body 안에 있음)
        const latestQueryDataId = (responseData?.body as Record<string, unknown>)?.latest_query_data_id;
        let detailApiData: DetailApiData | null = null;
        
        console.log('🔍 responseData 전체 구조:', responseData);
        console.log('🔍 responseData.body:', responseData?.body);
        console.log('🔍 latest_query_data_id 값:', latestQueryDataId);
        console.log('🔍 latest_query_data_id 타입:', typeof latestQueryDataId);
        console.log('🔍 null 체크:', latestQueryDataId !== null);
        console.log('🔍 falsy 체크:', !!latestQueryDataId);
        
        if (latestQueryDataId && latestQueryDataId !== null) {
          console.log(`🔍 latest_query_data_id 발견: ${latestQueryDataId} - n8n detail API 호출 시작`);
          
          try {
            // n8n detail API 호출 (is-detail=true와 latest_query_data_id를 쿼리 파라미터로 추가)
            const detailApiUrl = `https://tg0825.app.n8n.cloud/webhook/01dedf36-0da7-4546-b5c2-dac80381452c?item-id=${query.id}&is-detail=true&latest_query_data_id=${latestQueryDataId}`;
            
            // detail API용 헤더 (API 키만 추가)
            const detailHeaders: Record<string, string> = {
              'Content-Type': 'application/json'
            };
            
            // API 키가 있으면 헤더에 추가
            if (apiKey) {
              detailHeaders['Authorization'] = `Key ${apiKey}`;
            }
            
            console.log('🔗 n8n detail API 요청:', detailApiUrl);
            console.log('📤 n8n detail 요청 헤더:', detailHeaders);
            console.log('📋 latest_query_data_id 헤더값:', latestQueryDataId);
            
            const detailResponse = await fetch(detailApiUrl, {
              method: 'GET',
              headers: detailHeaders,
              signal: abortController.signal,
            });
            
            if (detailResponse.ok) {
              // HTML 응답을 텍스트로 받기
              const htmlResponse = await detailResponse.text();
              console.log('✅ n8n detail API HTML 응답:', htmlResponse);
              
              // body 태그 내용 추출
              const bodyMatch = htmlResponse.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
              const bodyContent = bodyMatch ? bodyMatch[1] : htmlResponse;
              
              detailApiData = {
                originalHtml: htmlResponse,
                bodyContent: bodyContent
              };
              console.log('✅ 추출된 body 내용:', bodyContent);
            } else {
              console.error('❌ n8n detail API 호출 실패:', detailResponse.status);
            }
                  } catch (detailError: unknown) {
          if ((detailError as Error).name !== 'AbortError') {
            console.error('❌ n8n detail API 호출 오류:', detailError);
          }
        }
        } else {
          console.log('ℹ️ latest_query_data_id가 null이거나 없음 - n8n detail API 호출 건너뜀');
        }
        
        const fullData = { 
          ...query,
          infoApiData: responseData, // 정보 API에서 받은 데이터
          detailApiData: detailApiData, // 디테일 API에서 받은 데이터 (있는 경우)
        };
        
        setFullQueryData(fullData);
      } else {
        console.error('❌ n8n webhook API 호출 실패:', response.status);
        
        const errorData = { 
          ...query,
          error: `n8n webhook API 호출 실패: ${response.status}`,
        };
        
        setFullQueryData(errorData);
      }
    } catch (error: unknown) {
      // AbortError는 의도적인 취소이므로 로그만 출력
      if ((error as Error).name === 'AbortError') {
        console.log('🚫 API 요청이 취소되었습니다');
        return; // 상태를 업데이트하지 않음
      }
      
      console.error('❌ n8n webhook API 호출 오류:', error);
      
      const errorData = { 
        ...query,
        error: `네트워크 오류: ${error}`,
      };
      
      setFullQueryData(errorData);
    } finally {
      setCurrentAbortController(null);
      setIsLoading(false);
    }
  }, [currentAbortController]);

  // 선택된 쿼리가 변경될 때 API 호출
  useEffect(() => {
    if (selectedQuery) {
      fetchQueryData(selectedQuery);
    }
  }, [selectedQuery, fetchQueryData]);

  return (
    <div className="flex-1 flex flex-col h-full mt-16 min-w-0 overflow-hidden relative">
      {/* 헤더 */}
      <div className="border-b border-border-light p-4 bg-background-main">
        <h1 className="text-2xl font-bold text-text-primary">
          대시보드
        </h1>
        <p className="text-text-secondary mt-1">
          {fullQueryData ? `선택된 쿼리: ${fullQueryData.query}` : selectedQuery ? "데이터 로딩 중..." : "쿼리를 선택해주세요"}
        </p>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 p-6 overflow-y-auto">
        {apiError ? (
          /* API 에러 상태 */
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-700 mb-2">연결 오류</h3>
              <p className="text-red-600">{apiError}</p>
            </div>
          </div>
        ) : fullQueryData ? (
          /* 선택된 쿼리 표시 */
          <div>
            {/* 쿼리 정보 카드 */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-text-primary mb-2">
                    {fullQueryData.query}
                  </h2>
                  {fullQueryData.description && (
                    <p className="text-text-secondary mb-3">
                      {fullQueryData.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <span>ID: {fullQueryData.id}</span>
                    <span>타입: {fullQueryData.type}</span>
                    <span>시간: {new Date(fullQueryData.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* 에러 표시 */}
              {fullQueryData.error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="text-red-800 font-medium mb-2">오류 발생</h4>
                  <p className="text-red-600 text-sm">{fullQueryData.error}</p>
                </div>
              )}
            </div>
            
            {/* 디테일 API HTML 컨텐츠 */}
            {fullQueryData.detailApiData?.bodyContent && (
              <div className="bg-white rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  📊 디테일 API 결과
                </h3>
                <pre 
                  className="detail-api-content whitespace-pre-wrap overflow-auto bg-gray-50 p-4 rounded border text-sm"
                  dangerouslySetInnerHTML={{ __html: fullQueryData.detailApiData.bodyContent }}
                />
              </div>
            )}
            
            {/* 정보 API 응답 데이터 */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                📋 정보 API 응답 (tg0825.app.n8n.cloud/webhook/...?item-id={fullQueryData.id})
              </h3>
              
              {fullQueryData.infoApiData ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="mb-3 text-sm text-green-600 font-medium">
                    ✅ 정보 API 호출 성공
                  </div>
                  <pre className="text-sm overflow-auto max-h-96 bg-white p-3 rounded border">
                    {JSON.stringify(fullQueryData.infoApiData, null, 2)}
                  </pre>
                </div>
              ) : fullQueryData.error ? (
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="mb-3 text-sm text-red-600 font-medium">
                    ❌ 정보 API 호출 실패
                  </div>
                  <div className="text-red-600 text-sm">
                    {fullQueryData.error}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-blue-600 text-sm">
                    🔄 정보 API 호출 중...
                  </div>
                </div>
              )}
            </div>
            

            {/* 그래프 영역 */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">데이터 시각화</h3>
              <Graph data={(fullQueryData.detailApiData || fullQueryData.infoApiData || fullQueryData.redashData || {}) as { [key: string]: unknown }} />
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

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-6 shadow-md flex flex-col items-center animate-scaleIn">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-primary-main mb-3"></div>
            <p className="text-text-primary font-medium text-sm">데이터를 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Container;