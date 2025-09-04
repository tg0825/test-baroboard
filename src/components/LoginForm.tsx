"use client";

import { useState, useEffect } from 'react';
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
  const [showTeamInfo, setShowTeamInfo] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  // 외부 클릭 시 팀 정보 툴팁 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTeamInfo) {
        const target = event.target as Element;
        if (!target.closest('[data-team-info-container]')) {
          setShowTeamInfo(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTeamInfo]);

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
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* 배경 이미지 레이어 */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80&fm=webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* 블러 오버레이 */}
        <div className="absolute inset-0 backdrop-blur-sm bg-black/20"></div>
        
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-main/10 via-transparent to-primary-dark/10"></div>
        
        {/* 추가 다크 오버레이 (가독성 향상) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20"></div>
        
        {/* 비네팅 효과 (외각 어둡게) */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)'
          }}
        ></div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 w-full max-w-md">
        {/* 로고 영역 */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Baro<span 
              className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse"
              style={{
                backgroundSize: '200% 200%',
                animation: 'gradient-move 3s ease-in-out infinite'
              }}
            >Board</span>
          </h1>
          <p className="text-white/90 text-xl drop-shadow-md">
            BAROGO Analytics Platform
          </p>
        </div>

        {/* 그라데이션 애니메이션 CSS */}
        <style jsx>{`
          @keyframes gradient-move {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        `}</style>

        {/* 로그인 폼 */}
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20" data-testid="login-form">
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
                data-testid="email-input"
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600" data-testid="email-error">{emailError}</p>
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
                data-testid="password-input"
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" data-testid="login-error">
                {error}
              </div>
            )}

            {/* 리대시 계정 안내 */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                리대시 계정으로 접속 가능합니다.
              </p>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isLoading || !email || !password || !!emailError}
              className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="login-button"
            >
              {isLoading ? (
                <div className="flex items-center justify-center" data-testid="login-loading">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  로그인 중...
                </div>
              ) : (
                '로그인'
              )}
            </button>
          </form>

        </div>

        {/* 하단 정보 */}
        <div className="text-center mt-8">
          <p className="text-white/70 text-sm drop-shadow-md">
            © 2024 AIniti4 Team. All rights reserved.
          </p>
        </div>
      </div>

      {/* 우측 하단 물음표 아이콘 */}
      <div className="fixed bottom-6 right-6 z-20" data-team-info-container>
        <button
          onClick={() => setShowTeamInfo(!showTeamInfo)}
          className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/20 flex items-center justify-center text-red-500 hover:bg-white hover:text-red-600 transition-all duration-200 hover:scale-105"
          title="팀 정보"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>

        {/* 팀 정보 툴팁 */}
        {showTeamInfo && (
          <div className="absolute bottom-16 right-0 w-64 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20 p-4 transform transition-all duration-200 animate-in slide-in-from-bottom-2">
            <div className="text-center">
              <h3 className="font-semibold text-gray-800 mb-2">AI프로젝트 4조 AInity4</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>윤주희</p>
                <p>김세민</p>
                <p>심항보</p>
                <p>김경림</p>
                <p>윤태건</p>
              </div>
            </div>
            {/* 화살표 */}
            <div className="absolute bottom-[-8px] right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/95"></div>
          </div>
        )}
      </div>
    </div>
  );
}