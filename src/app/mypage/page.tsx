"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/mypage/history');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-main border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-text-secondary">페이지를 이동하는 중...</p>
      </div>
    </div>
  );
}
