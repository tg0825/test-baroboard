"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormProps {
  onLogin?: (username: string, password: string) => Promise<boolean> | boolean;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  // 이메일 유효성 검사
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError('올바른 이메일 형식으로 입력해주세요');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 이메일 유효성 검사
    if (!validateEmail(email)) {
      setEmailError('올바른 이메일 형식으로 입력해주세요');
      setIsLoading(false);
      return;
    }

    try {
      if (onLogin) {
        const success = await onLogin(email, password);
        if (success) {
          login(email); // custom onLogin의 경우 session 없이 처리
          router.push('/');
        } else {
          setError('로그인에 실패했습니다.');
        }
      } else {
        // n8n 웹훅으로 로그인 요청
        const webhookUrl = 'https://tg0825.app.n8n.cloud/webhook/89891ead-cd57-43cc-9ad5-090ffc676d68';

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        if (response.ok) {
          const result = await response.json();

          
          // n8n 응답에서 받은 데이터 처리
          const userEmail = result.email || email;
          const session = result.session; // n8n에서 session 값 받기
          const apiKey = result.api_key; // n8n에서 api_key 받기
          
          // API 키를 로컬스토리지에 저장
          if (apiKey) {
            localStorage.setItem('baroboard_api_key', apiKey);

          }
          
          // 전역 상태로 로그인 처리 (session 포함)
          login(userEmail, session);
          router.push('/');
        } else {
          const errorData = await response.text();

          setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        }
      }
    } catch (err) {

      setError('로그인 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-pale to-background-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 영역 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-main rounded-2xl mb-4 shadow-medium">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Baro<span className="text-primary-main">Board</span>
          </h1>
          <p className="text-text-secondary">
            Dashboard Analytics Platform
          </p>
        </div>

        {/* 로그인 폼 */}
        <div className="card p-8 shadow-strong">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이메일 입력 */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-text-primary mb-2"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  emailError 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-border-main focus:ring-primary-main'
                }`}
                placeholder="이메일을 입력하세요"
                required
                disabled={isLoading}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-text-primary mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border-main rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-all duration-200"
                placeholder="비밀번호를 입력하세요"
                required
                disabled={isLoading}
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isLoading || !email || !password || !!emailError}
              className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  로그인 중...
                </div>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          {/* API 연동 안내 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 text-center">
              <strong>🔗 n8n 웹훅 연동</strong><br />
              로그인 요청이 n8n 워크플로우로 전송됩니다
            </p>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="text-center mt-8">
          <p className="text-text-light text-sm">
            © 2024 AIniti4 Team. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}