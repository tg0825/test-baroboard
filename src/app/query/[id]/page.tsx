"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useApiData } from '@/hooks/useApiData';

interface QueryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function QueryPage({ params }: QueryPageProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const apiData = useApiData();
  const [queryId, setQueryId] = useState<string | null>(null);

  // 쿼리 상세 페이지에서는 페이지네이션이 필요하지 않으므로 빈 함수 전달
  const handlePageChange = useCallback(() => {
    // 쿼리 상세 페이지에서는 페이지네이션 기능을 사용하지 않음
  }, []);

  // params를 클라이언트에서 처리
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setQueryId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // 로그인 상태 확인
  useEffect(() => {
    if (!isLoading && !user?.isLoggedIn) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !queryId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-main border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-secondary">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user?.isLoggedIn) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="h-screen overflow-auto">
      <Dashboard apiData={apiData} onPageChange={handlePageChange} />
    </div>
  );
} 