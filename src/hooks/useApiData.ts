// API 데이터 관리를 위한 커스텀 훅

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ApiDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApiData<T = unknown>() {
  const { user } = useAuth();
  const [state, setState] = useState<ApiDataState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  const [requestCount, setRequestCount] = useState(0); // 요청 횟수 추적

  // 메인 페이지 초기화 API 응답 저장
  const setMainPageData = (data: T) => {
    setState({
      data,
      loading: false,
      error: null,
    });
    console.log(`📊 API 데이터 저장 완료 (총 ${requestCount + 1}회 요청)`);
    setRequestCount(prev => prev + 1);
  };

  // 로딩 상태 설정
  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  // 에러 상태 설정
  const setError = (error: string) => {
    setState(prev => ({ ...prev, error, loading: false }));
    console.log(`❌ API 오류 발생 (총 ${requestCount + 1}회 요청 후):`, error);
    setRequestCount(prev => prev + 1);
  };

  // 데이터 초기화
  const resetData = () => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
    setRequestCount(0);
  };

  return {
    ...state,
    setMainPageData,
    setLoading,
    setError,
    resetData,
    user,
    requestCount, // 요청 횟수 반환
  };
}