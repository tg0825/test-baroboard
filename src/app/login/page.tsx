"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // 이미 로그인된 사용자는 메인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && user?.isLoggedIn) {
      console.log('✅ Login page - User already logged in, redirecting to home');
      window.location.href = '/';
    }
  }, [user, isLoading]);

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-main border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-secondary">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인된 사용자면 빈 화면 (리다이렉트 중)
  if (user?.isLoggedIn) {
    return null;
  }

  return <LoginForm />;
}