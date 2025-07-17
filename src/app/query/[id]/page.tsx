import React from 'react';
import Dashboard from '@/components/Dashboard';

// 정적 빌드를 위한 파라미터 생성
export function generateStaticParams() {
  // 1부터 100까지의 쿼리 ID에 대한 정적 경로 생성
  const paths = Array.from({ length: 100 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
  
  return paths;
}

interface QueryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function QueryPage({ params }: QueryPageProps) {
  const { id } = await params;
  const queryId = parseInt(id);

  return (
    <div className="h-screen overflow-auto">
      <Dashboard initialQueryId={queryId || null} />
    </div>
  );
} 