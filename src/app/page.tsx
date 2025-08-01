"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from "@/components/Dashboard";
import { useAuth } from '@/contexts/AuthContext';
import { useApiData } from '@/hooks/useApiData';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false); // 중복 요청 방지
  const apiData = useApiData();

  // 로그인 상태 확인
  useEffect(() => {
    if (!isLoading && !user?.isLoggedIn) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

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

      try {
        console.log('🚀 메인 페이지 초기화 API 호출 시작 (1회만)');
        setHasInitialized(true); // 즉시 플래그 설정하여 중복 요청 방지
        apiData.setLoading(true);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
        
        // 로컬스토리지에서 API 키 가져오기
        const apiKey = localStorage.getItem('baroboard_api_key');
        console.log('🔑 로컬스토리지에서 가져온 API 키:', apiKey);
        
        // 헤더 구성
        const headers = {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': `Key ${apiKey}` }), // API 키가 있으면 헤더에 포함
        };
        console.log('📤 요청 헤더:', headers);
        
        // 리스트 조회
        const response = await fetch(`https://tg0825.app.n8n.cloud/webhook/54e868d6-9698-40e4-bcd7-331c40dff4b4?email=${encodeURIComponent(user.email)}&session=${encodeURIComponent(user.session)}&action=main_page_init`, {
          method: 'GET',
          headers,
          signal: controller.signal, // 요청 취소 가능하도록
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          console.log('✅ 메인 페이지 초기화 API 응답:', result);
          
          // API 응답 데이터를 전역 상태에 저장
          apiData.setMainPageData(result);
        } else {
          console.error('❌ 메인 페이지 초기화 API 실패:', response.status);
          apiData.setError(`API 호출 실패: ${response.status} - 재시도하지 않습니다.`);
          // 에러 발생 시 재시도하지 않음
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('⏰ API 요청 타임아웃');
          apiData.setError('API 요청 시간이 초과되었습니다.');
        } else {
          console.error('❌ 메인 페이지 초기화 API 오류:', error);
          apiData.setError('네트워크 연결 오류가 발생했습니다. 페이지를 새로고침해주세요.');
        }
        // 에러 발생 시 재시도하지 않음
      } finally {
        setIsInitializing(false);
      }
    };

    initializeMainPage();
  }, [user, isLoading, hasInitialized, apiData]);

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

  return <Dashboard apiData={apiData} />;
}
