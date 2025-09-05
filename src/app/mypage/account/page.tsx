"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

  // API 키 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedApiKey = localStorage.getItem('baroboard_api_key') || '';
      setApiKey(storedApiKey);
    }
  }, []);

  // API 키 저장
  const handleApiKeySave = () => {
    localStorage.setItem('baroboard_api_key', apiKey);
    alert('API 키가 저장되었습니다.');
  };

  // API 키 초기화
  const handleApiKeyReset = () => {
    if (confirm('API 키를 초기화하시겠습니까?')) {
      setApiKey('');
      localStorage.removeItem('baroboard_api_key');
      alert('API 키가 초기화되었습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 계정 정보 */}
      <div className="bg-white rounded-lg shadow-sm border border-border-light p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-main" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          계정 정보
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">이메일</label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="flex-1 px-3 py-2 border border-border-light rounded-lg bg-gray-50 text-text-primary cursor-not-allowed"
              />
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">인증됨</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">세션 ID</label>
            <input
              type="text"
              value={user?.session || '없음'}
              disabled
              className="w-full px-3 py-2 border border-border-light rounded-lg bg-gray-50 text-text-primary cursor-not-allowed font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">로그인 상태</label>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-medium">활성</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* API 설정 */}
      <div className="bg-white rounded-lg shadow-sm border border-border-light p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2-2m2 2H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          API 설정
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">API 키</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type={isApiKeyVisible ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="API 키를 입력하세요"
                  className="flex-1 px-3 py-2 border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-main"
                />
                <button
                  onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                  className="px-3 py-2 text-text-secondary hover:text-text-primary border border-border-light rounded-lg transition-colors"
                  title={isApiKeyVisible ? "숨기기" : "보기"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isApiKeyVisible ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleApiKeySave}
                  className="px-4 py-2 bg-gradient-to-r from-primary-main to-primary-light text-white text-sm rounded-lg hover:from-primary-dark hover:to-primary-main transition-all duration-200 shadow-button"
                >
                  저장
                </button>
                <button
                  onClick={handleApiKeyReset}
                  className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                >
                  초기화
                </button>
              </div>
            </div>
            <p className="text-xs text-text-muted mt-1">
              API 키는 브라우저에 안전하게 저장됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 기타 설정 */}
      <div className="bg-white rounded-lg shadow-sm border border-border-light p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          기타 설정
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-text-primary">로그아웃</h3>
              <p className="text-xs text-text-muted">현재 세션을 종료하고 로그인 페이지로 이동합니다.</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
