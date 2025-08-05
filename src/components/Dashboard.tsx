"use client";

import React, { useState } from 'react';
import Container from './Container';
import Sidebar from './Sidebar';

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
  const [selectedQuery, setSelectedQuery] = useState<SelectedQuery | null>(null);

  const handleQuerySelect = (queryData: Record<string, unknown>) => {
    console.log('📋 Dashboard에서 쿼리 선택됨:', queryData);
    setSelectedQuery(queryData as unknown as SelectedQuery);
  };

  return (
    <div className="h-full flex">
      {/* 좌측 쿼리 목록 */}
      <Sidebar 
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