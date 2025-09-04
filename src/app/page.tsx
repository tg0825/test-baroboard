"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from "@/components/Dashboard";
import { useAuth } from '@/contexts/AuthContext';
import { useApiData } from '@/hooks/useApiData';
import { fetchMainPageData } from '@/utils/mainApiUtils';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false); // 중복 요청 방지
  const [queryId, setQueryId] = useState<number | undefined>(undefined);
  const apiData = useApiData();

  // SPA URL 핸들링: JavaScript로 URL 변경 감지 및 처리
  const handleUrlChange = useCallback(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      console.log('🌐 URL changed - pathname:', path);
      const queryMatch = path.match(/^\/query\/(\d+)\/?$/);
      console.log('🔍 Query match:', queryMatch);
      if (queryMatch) {
        const id = parseInt(queryMatch[1]);
        console.log('✅ Extracted queryId:', id);
        setQueryId(id);
      } else {
        console.log('❌ No query ID found in path, resetting');
        setQueryId(undefined);
      }
    }
  }, []);

  // 초기 로드 + 이벤트 리스너 등록 (SPA 라우팅)
  useEffect(() => {
    // 초기 URL 파싱
    handleUrlChange();
    
    // 브라우저 뒤로/앞으로 가기 감지
    window.addEventListener('popstate', handleUrlChange);
    
    // Dashboard에서 발생시키는 커스텀 이벤트 감지
    const handleCustomRouteChange = () => {
      console.log('🔄 Custom route change detected');
      handleUrlChange();
    };
    window.addEventListener('baroboard-route-change', handleCustomRouteChange);
    
    // cleanup
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('baroboard-route-change', handleCustomRouteChange);
    };
  }, [handleUrlChange]);

  // 로그인 상태 확인
  useEffect(() => {
    console.log('🏠 Home page - Auth check:', { isLoading, user: user?.isLoggedIn, email: user?.email });
    
    if (!isLoading && !user?.isLoggedIn) {
      console.log('❌ Home page - User not logged in, redirecting to login');
      router.push('/login');
    } else if (!isLoading && user?.isLoggedIn) {
      console.log('✅ Home page - User is logged in');
    }
  }, [user, isLoading, router]);

  // API 데이터 로드 함수
  const fetchPageData = useCallback(async (page: number = 1) => {
    if (!user?.isLoggedIn) return;

    try {
      apiData.setLoading(true);
      const result = await fetchMainPageData(page, user.email, user.session);
      apiData.setMainPageData(result);
    } catch (error) {
      apiData.setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  }, [user?.isLoggedIn, user?.email, user?.session, apiData]);

  // 초기 데이터 로드
  useEffect(() => {
    const initializeMainPage = async () => {
      if (hasInitialized || isLoading || !user?.isLoggedIn) {
        if (!isLoading) setIsInitializing(false);
        return;
      }

      setHasInitialized(true);
      setIsInitializing(false);
      await fetchPageData(1);
    };

    initializeMainPage();
  }, [user?.isLoggedIn, isLoading, hasInitialized, fetchPageData]);

  if (isLoading || isInitializing) {
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

  return <Dashboard apiData={apiData} onPageChange={fetchPageData} initialQueryId={queryId} />;
}
