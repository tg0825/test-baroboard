"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from "@/components/Dashboard";
import { useAuth } from '@/contexts/AuthContext';
import { useApiData } from '@/hooks/useApiData';

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
    if (!isLoading && !user?.isLoggedIn) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // 페이지네이션을 위한 API 호출 함수
  const fetchPageData = useCallback(async (page: number = 1) => {
    if (!user?.isLoggedIn) return;

    try {
      apiData.setLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
      
      // 로컬스토리지에서 API 키 가져오기
      const apiKey = localStorage.getItem('baroboard_api_key');
      
      // 헤더 구성
      const headers = {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Key ${apiKey}` }), // API 키가 있으면 헤더에 포함
      };
      
      // page 파라미터를 포함한 리스트 조회
      const response = await fetch(`https://tg0825.app.n8n.cloud/webhook/54e868d6-9698-40e4-bcd7-331c40dff4b4?email=${encodeURIComponent(user?.email || '')}&session=${encodeURIComponent(user?.session || '')}&action=main_page_init&page=${page}`, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        
        // API 응답 데이터를 전역 상태에 저장
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

  // 메인 페이지 진입 시 초기 API 호출 (단 한 번만)
  useEffect(() => {
    const initializeMainPage = async () => {
      // 중복 요청 방지: 이미 초기화했거나 로딩 중이면 건너뛰기
      if (hasInitialized || isLoading || !user?.isLoggedIn) {
        if (!isLoading) {
          setIsInitializing(false);
        }
        return;
      }

      setHasInitialized(true); // 즉시 플래그 설정하여 중복 요청 방지
      setIsInitializing(false);
      
      // 첫 페이지 데이터 로딩 (재시도 방지를 위해 한 번만 호출)
      await fetchPageData(1);
    };

    initializeMainPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading, hasInitialized]); // fetchPageData 의존성 제거로 API 재시도 방지

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
