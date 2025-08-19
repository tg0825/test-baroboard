"use client";

import React, { useState, useEffect } from 'react';
import Container from './Container';
import LNB from './LNB';

interface SelectedQuery {
  id: number;
  query: string;
  name: string;
  type: string;
  description: string;
  redashData?: unknown;
  error?: string;
  timestamp: string;
}


interface ApiDataHook {
  data: unknown;
  loading: boolean;
  error: string | null;
  setMainPageData: (data: unknown) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  resetData: () => void;
  user: unknown;
}

interface DashboardProps {
  apiData: ApiDataHook;
  onPageChange: (page: number) => void;
  initialQueryId?: number;
}

const Dashboard = ({ apiData, onPageChange, initialQueryId }: DashboardProps) => {
  const [selectedQuery, setSelectedQuery] = useState<SelectedQuery | null>(null);

  // URL에서 추출한 initialQueryId로 즉시 쿼리 선택 (API 데이터 로딩 기다리지 않음)
  useEffect(() => {
    if (initialQueryId && !selectedQuery) {
      // 즉시 해당 ID로 쿼리 선택 (API 데이터 없어도 상관없음)
      const query = {
        id: initialQueryId,
        query: `쿼리 ID ${initialQueryId}`,
        name: `쿼리 ID ${initialQueryId}`,
        type: 'Query',
        description: '',
        timestamp: new Date().toISOString()
      };
      
      setSelectedQuery(query);
      
      // URL 상태도 동기화
      window.history.replaceState(
        { queryId: query.id, queryName: query.name },
        '',
        `/query/${query.id}`
      );
    }
  }, [initialQueryId, selectedQuery]);

  // API 데이터 로드 완료 후 실제 쿼리 데이터로 업데이트 (선택사항)
  useEffect(() => {
    if (initialQueryId && selectedQuery && apiData.data && !apiData.loading) {
      // 이미 실제 데이터로 업데이트된 경우 스킵 (무한 루프 방지)
      if (selectedQuery.name !== `쿼리 ID ${initialQueryId}`) {
        return;
      }
      
      // API 데이터에서 해당 ID의 실제 쿼리 정보 찾기
      const apiDataObj = apiData.data as Record<string, unknown>;
      let queryFound = null;
      
      // 표준 응답 형태 확인
      if (apiDataObj.results && Array.isArray(apiDataObj.results)) {
        queryFound = apiDataObj.results.find((item: { id: string | number }) => Number(item.id) === Number(initialQueryId));
      }
      // 레거시 응답 형태 확인
      else if (Array.isArray(apiDataObj)) {
        queryFound = apiDataObj.find((item: { id: string | number }) => Number(item.id) === Number(initialQueryId));
      }
      
      // 실제 데이터가 있고, 현재와 다른 경우에만 업데이트
      if (queryFound && queryFound.name && queryFound.name !== selectedQuery.name) {
        const updatedQuery = {
          id: queryFound.id,
          query: queryFound.name,
          name: queryFound.name,
          type: queryFound.type || 'Query',
          description: queryFound.description || '',
          timestamp: new Date().toISOString()
        };
        
        setSelectedQuery(updatedQuery);
        
        // URL 상태도 업데이트
        window.history.replaceState(
          { queryId: updatedQuery.id, queryName: updatedQuery.name },
          '',
          `/query/${updatedQuery.id}`
        );
      }
    }
  }, [initialQueryId, apiData.data, apiData.loading]); // selectedQuery 의존성 제거

  const handleQuerySelect = (queryData: Record<string, unknown>) => {
    const query = queryData as unknown as SelectedQuery;
    setSelectedQuery(query);
    
    // SPA 방식으로 URL만 변경 (페이지 리로드 없음)
    window.history.pushState(
      { queryId: query.id, queryName: query.query },
      '',
      `/query/${query.id}`
    );
  };

  // 페이지 제목 업데이트
  useEffect(() => {
    if (selectedQuery) {
      document.title = `${selectedQuery.query} - Baro Board`;
    } else {
      document.title = 'Baro Board';
    }
  }, [selectedQuery]);

  // 브라우저 뒤로가기/앞으로가기 대응
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.queryId) {
        // 이전에 선택된 쿼리로 복원
        setSelectedQuery({
          id: event.state.queryId,
          query: event.state.queryName || `쿼리 ID ${event.state.queryId}`,
          name: event.state.queryName || `쿼리 ID ${event.state.queryId}`,
          type: 'Query',
          description: '',
          timestamp: new Date().toISOString()
        });
      } else {
        // 메인 페이지로 돌아감
        setSelectedQuery(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div className="h-full flex">
      {/* 좌측 쿼리 목록 */}
      <LNB 
        onQuerySelect={handleQuerySelect} 
        apiData={apiData}
        onPageChange={onPageChange}
        selectedQueryId={selectedQuery?.id || null}
      />
      
      {/* 중앙 컨테이너 */}
      <Container 
        selectedQuery={selectedQuery} 
        apiError={apiData.error} 
      />
    </div>
  );
};

export default Dashboard; 