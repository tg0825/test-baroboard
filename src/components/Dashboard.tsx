"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from './Container';
import LNB from './LNB';

interface SelectedQuery {
  id: number;
  query: string;
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
}

const Dashboard = ({ apiData, onPageChange }: DashboardProps) => {
  const router = useRouter();
  const [selectedQuery, setSelectedQuery] = useState<SelectedQuery | null>(null);

  const handleQuerySelect = (queryData: Record<string, unknown>) => {
    setSelectedQuery(queryData as unknown as SelectedQuery);
    // 라우터 이동 제거 - 같은 페이지에서 상세 정보 표시
  };

  return (
    <div className="h-full flex">
      {/* 좌측 쿼리 목록 */}
      <LNB 
        onQuerySelect={handleQuerySelect} 
        apiData={apiData}
        onPageChange={onPageChange}
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