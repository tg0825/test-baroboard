"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useApiData } from '@/hooks/useApiData';
import Dashboard from '@/components/Dashboard';

interface QueryPageClientProps {
  queryId: string;
}

export default function QueryPageClient({ queryId }: QueryPageClientProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const apiData = useApiData();

  // 로그인 상태 확인
  useEffect(() => {
    if (!isLoading && !user?.isLoggedIn) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // 페이지네이션을 위한 API 호출 함수 (메인 페이지와 동일)
  const fetchPageData = useCallback(async (page: number = 1) => {
    if (!user?.isLoggedIn) return;

    try {
      apiData.setLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const apiKey = localStorage.getItem('baroboard_api_key');
      
      const headers = {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Key ${apiKey}` }),
      };
      
      const response = await fetch(`https://tg0825.app.n8n.cloud/webhook/54e868d6-9698-40e4-bcd7-331c40dff4b4?email=${encodeURIComponent(user?.email || '')}&session=${encodeURIComponent(user?.session || '')}&action=main_page_init&page=${page}`, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        apiData.setMainPageData(result);
      } else {
        apiData.setError(`API 호출 실패: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        apiData.setError('API 요청 시간이 초과되었습니다.');
      } else {
        apiData.setError('네트워크 연결 오류가 발생했습니다.');
      }
    }
  }, [user, apiData]);

  // 초기 API 호출
  useEffect(() => {
    const initializeQueryPage = async () => {
      if (hasInitialized || isLoading || !user?.isLoggedIn || !queryId) {
        if (!isLoading) {
          setIsInitializing(false);
        }
        return;
      }

      setHasInitialized(true);
      setIsInitializing(false);
      
      await fetchPageData(1);
    };

    initializeQueryPage();
  }, [user, isLoading, hasInitialized, queryId, fetchPageData]);

  if (isLoading || isInitializing || !queryId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-main border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-secondary">
            {isLoading ? '로딩 중...' : '초기화 중...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user?.isLoggedIn) {
    return null; // 리다이렉트 중
  }

  return <Dashboard apiData={apiData} onPageChange={fetchPageData} initialQueryId={queryId ? parseInt(queryId) : undefined} />;
}
