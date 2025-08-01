"use client";

import React from 'react';
import Container from './Container';
import Sidebar from './Sidebar';



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
}

const Dashboard = ({ apiData }: DashboardProps) => {
  return (
    <div className="h-full flex">
      {/* 좌측 쿼리 목록 */}
      <Sidebar onQuerySelect={() => {}} apiData={apiData} />
      
      {/* 중앙 컨테이너 */}
      <Container selectedItem={null} apiError={apiData.error} />
    </div>
  );
};

export default Dashboard; 