"use client";

import React, { useState, useEffect } from 'react';
import Container from './Container';
import LNB from './LNB';
import { createQueryFromId, updateBrowserHistory, dispatchRouteChangeEvent, findQueryInApiData } from '@/utils/routeUtils';

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
  

  // 초기 쿼리 ID 처리
  useEffect(() => {
    if (initialQueryId && !selectedQuery) {
      const queryData = createQueryFromId(initialQueryId);
      const query = {
        ...queryData,
        query: queryData.name,
        type: queryData.type || 'Query',
        description: queryData.description || '',
        timestamp: new Date().toISOString()
      };
      
      setSelectedQuery(query);
      updateBrowserHistory(queryData, true);
      dispatchRouteChangeEvent(query.id);
    }
  }, [initialQueryId, selectedQuery]);

  // API 데이터 로드 후 실제 쿼리 데이터로 업데이트
  useEffect(() => {
    if (initialQueryId && selectedQuery && apiData.data && !apiData.loading) {
      if (selectedQuery.name !== `쿼리 ID ${initialQueryId}`) return;
      
      const queryData = findQueryInApiData(apiData.data, initialQueryId);
      if (queryData && queryData.name !== selectedQuery.name) {
        const updatedQuery = {
          ...queryData,
          query: queryData.name,
          type: queryData.type || 'Query',
          description: queryData.description || '',
          timestamp: new Date().toISOString()
        };
        
        setSelectedQuery(updatedQuery);
        updateBrowserHistory(queryData, true);
        dispatchRouteChangeEvent(updatedQuery.id);
      }
    }
  }, [initialQueryId, apiData.data, apiData.loading, selectedQuery]);

  const handleQuerySelect = (queryData: Record<string, unknown>) => {
    const query = queryData as unknown as SelectedQuery;
    setSelectedQuery(query);
    
    const queryInfo = { id: query.id, name: query.query, type: query.type, description: query.description };
    updateBrowserHistory(queryInfo);
    dispatchRouteChangeEvent(query.id);
  };

  // 브라우저 뒤로가기/앞으로가기 처리
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.queryId) {
        const queryData = createQueryFromId(event.state.queryId, event.state.queryName);
        setSelectedQuery({
          ...queryData,
          query: queryData.name,
          type: queryData.type || 'Query',
          description: queryData.description || '',
          timestamp: new Date().toISOString()
        });
      } else {
        setSelectedQuery(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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
      <div className="flex-1 min-w-0">
        <Container 
          selectedQuery={selectedQuery} 
          apiError={apiData.error} 
        />
      </div>
    </div>
  );
};

export default Dashboard; 