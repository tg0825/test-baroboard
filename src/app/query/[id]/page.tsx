import QueryPageClient from './QueryPageClient';

// S3 정적 배포를 위한 generateStaticParams (CSR 유지)
export async function generateStaticParams() {
  // 더미 파라미터를 반환하여 동적 라우팅을 클라이언트에서 처리
  return [
    { id: '1' },
    { id: '2' }
  ];
}

interface QueryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function QueryPage({ params }: QueryPageProps) {
  const resolvedParams = await params;
  const queryId = resolvedParams.id;

  return <QueryPageClient queryId={queryId} />;
} 