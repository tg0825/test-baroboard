"use client";

import React, { useState } from 'react';
import Container from './Container';
import Sidebar from './Sidebar';
import LNB from './LNB';

interface ListItem {
  id: string;
  title: string;
  description?: string;
  status?: string;
  type?: string;
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
}

const Dashboard = ({ apiData }: DashboardProps) => {
  const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);

  // API 데이터에서 리스트 추출 (n8n 응답 구조에 따라 조정)
  const listItems: ListItem[] = React.useMemo(() => {
    if (!apiData.data) return [];
    
    try {
      // n8n 응답이 { items: [...] } 형태인 경우
      if (apiData.data && typeof apiData.data === 'object' && 'items' in apiData.data && Array.isArray((apiData.data as {items: unknown[]}).items)) {
        return (apiData.data as {items: Record<string, unknown>[]}).items.map((item: Record<string, unknown>, index: number) => ({
          id: item.id || `item-${index}`,
          title: item.title || item.name || `Item ${index + 1}`,
          description: item.description || item.summary,
          status: item.status,
          type: item.type || item.category,
        }));
      }
      
      // n8n 응답이 배열 형태인 경우
      if (Array.isArray(apiData.data)) {
        return (apiData.data as Record<string, unknown>[]).map((item: Record<string, unknown>, index: number) => ({
          id: (item.id as string) || `item-${index}`,
          title: (item.title as string) || (item.name as string) || `Item ${index + 1}`,
          description: (item.description as string) || (item.summary as string),
          status: item.status as string,
          type: (item.type as string) || (item.category as string),
        }));
      }
      
      // n8n 응답이 단일 객체인 경우
      return [{
        id: 'api-response',
        title: 'API 응답 데이터',
        description: `데이터 수신됨: ${new Date().toLocaleTimeString()}`,
        status: 'received',
        type: 'data',
      }];
    } catch (error) {
      console.error('리스트 데이터 파싱 오류:', error);
      return [];
    }
  }, [apiData.data]);

  const handleItemSelect = (item: ListItem) => {
    setSelectedItem(item);
    console.log('🎯 선택된 아이템:', item);
  };

  return (
    <div className="h-full flex">
      {/* 좌측 리스트 (LNB) */}
      <LNB 
        items={listItems}
        onItemSelect={handleItemSelect}
        selectedItemId={selectedItem?.id}
        isLoading={apiData.loading}
      />
      
      {/* 중앙 컨테이너 */}
      <Container selectedItem={selectedItem} apiError={apiData.error} />
      
      {/* 우측 사이드바 */}
      <Sidebar onQuerySelect={() => {}} />
    </div>
  );
};

export default Dashboard; 