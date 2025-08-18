"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Container from '@/components/Container';

interface QueryPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface DetailApiResponse {
  data: string;
  timestamp: string;
  type: 'detail' | 'plain';
}

export default function QueryPage({ params }: QueryPageProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [queryId, setQueryId] = useState<string | null>(null);
  const [detailResponse, setDetailResponse] = useState<DetailApiResponse | null>(null);
  const [plainResponse, setPlainResponse] = useState<DetailApiResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingPlain, setIsLoadingPlain] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // API 호출 함수들
  const fetchDetailAndPlainApi = useCallback(async (id: string) => {
    setIsLoadingDetail(true);
    setIsLoadingPlain(true);
    
    try {
      const apiKey = localStorage.getItem('baroboard_api_key');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (apiKey) {
        headers['Authorization'] = `Key ${apiKey}`;
      }

      // 1단계: pre API 호출하여 latest_query_data_id 얻기
      const preApiUrl = `https://tg0825.app.n8n.cloud/webhook/01dedf36-0da7-4546-b5c2-dac80381452c?item-id=${id}&api-type=pre`;
      
      const preResponse = await fetch(preApiUrl, {
        method: 'GET',
        headers,
      });

      if (!preResponse.ok) {
        throw new Error(`Pre API 호출 실패: ${preResponse.status}`);
      }

      const preData = await preResponse.json() as Record<string, unknown>;
      const latestQueryDataId = (preData?.body as Record<string, unknown>)?.latest_query_data_id;

      if (!latestQueryDataId) {
        setError('latest_query_data_id를 찾을 수 없습니다.');
        return;
      }

      // 2단계: detail과 plain API를 병렬로 호출
      const [detailResult, plainResult] = await Promise.allSettled([
        // Detail API 호출
        fetch(`https://tg0825.app.n8n.cloud/webhook/01dedf36-0da7-4546-b5c2-dac80381452c?item-id=${id}&api-type=detail&latest_query_data_id=${latestQueryDataId}`, {
          method: 'GET',
          headers,
        }).then(res => res.ok ? res.text() : Promise.reject(`Detail API 실패: ${res.status}`)),
        
        // Plain API 호출
        fetch(`https://tg0825.app.n8n.cloud/webhook/01dedf36-0da7-4546-b5c2-dac80381452c?item-id=${id}&api-type=plain&latest_query_data_id=${latestQueryDataId}`, {
          method: 'GET',
          headers,
        }).then(res => res.ok ? res.text() : Promise.reject(`Plain API 실패: ${res.status}`))
      ]);

      // Detail API 결과 처리
      if (detailResult.status === 'fulfilled') {
        setDetailResponse({
          data: detailResult.value,
          timestamp: new Date().toISOString(),
          type: 'detail'
        });
      } else {
        setError(`Detail API 오류: ${detailResult.reason}`);
      }

      // Plain API 결과 처리  
      if (plainResult.status === 'fulfilled') {
        setPlainResponse({
          data: plainResult.value,
          timestamp: new Date().toISOString(),
          type: 'plain'
        });
      } else {
        setError(`Plain API 오류: ${plainResult.reason}`);
      }

    } catch (err) {
      setError(`API 호출 중 오류가 발생했습니다: ${err}`);
    } finally {
      setIsLoadingDetail(false);
      setIsLoadingPlain(false);
    }
  }, []);

  // 쿼리 ID가 설정되면 두 API를 비동기로 호출
  useEffect(() => {
    // 로딩이 완료되고 queryId가 있고 사용자가 로그인되었을 때
    if (!isLoading && queryId && user && user.isLoggedIn) {
      setError(null);
      setDetailResponse(null);
      setPlainResponse(null);
      
      // pre -> detail, plain 순서로 API 호출
      fetchDetailAndPlainApi(queryId);
    }
  }, [queryId, user, isLoading, fetchDetailAndPlainApi]);

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

  // 선택된 쿼리 객체 생성
  const selectedQuery = queryId ? {
    id: parseInt(queryId),
    query: `쿼리 ID ${queryId}`,
    type: '상세 조회',
    description: '상세 API와 플레인 API 응답을 확인할 수 있습니다',
    timestamp: new Date().toISOString()
  } : null;

  return (
    <div className="h-screen overflow-auto">
      <Container 
        selectedQuery={selectedQuery}
        detailResponse={detailResponse}
        plainResponse={plainResponse}
        isLoadingDetail={isLoadingDetail}
        isLoadingPlain={isLoadingPlain}
        apiError={error}
      />
    </div>
  );
} 