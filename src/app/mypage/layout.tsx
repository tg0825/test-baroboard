"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MyPageSidebar from '@/components/MyPageSidebar';
import { 
  getViewHistory, 
  ViewHistoryItem 
} from '@/utils/viewHistoryUtils';
import { getAllQueryMemos, QueryMemo } from '@/utils/queryMemoUtils';

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  
  const [viewHistory, setViewHistory] = useState<ViewHistoryItem[]>([]);
  const [memoList, setMemoList] = useState<QueryMemo[]>([]);
  
  // 현재 활성 메뉴 결정
  const getActiveMenu = (): 'account' | 'history' | 'memos' => {
    if (pathname.includes('/account')) return 'account';
    if (pathname.includes('/memos')) return 'memos';
    return 'history';
  };

  const activeMenu = getActiveMenu();

  // 로그인 상태 확인
  useEffect(() => {
    if (!isLoading && !user?.isLoggedIn) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // 데이터 로드
  useEffect(() => {
    if (user?.isLoggedIn) {
      loadViewHistory();
      loadMemoList();
    }
  }, [user?.isLoggedIn]);

  const loadViewHistory = async () => {
    try {
      const history = await getViewHistory();
      setViewHistory(history);
    } catch (error) {
      console.error('Error loading view history:', error);
    }
  };

  const loadMemoList = async () => {
    try {
      const memos = await getAllQueryMemos();
      setMemoList(memos);
    } catch (error) {
      console.error('Error loading memo list:', error);
    }
  };

  // 메뉴 변경 핸들러
  const handleMenuChange = (menu: 'account' | 'history' | 'memos') => {
    router.push(`/mypage/${menu}`);
  };

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

  if (!user?.isLoggedIn) {
    return null; // 로그인 페이지로 리다이렉트 중
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="flex gap-8">
          {/* 왼쪽 사이드바 - 고정 */}
          <MyPageSidebar
            activeMenu={activeMenu}
            viewHistoryCount={viewHistory.length}
            memoCount={memoList.length}
            onMenuChange={handleMenuChange}
          />
          
          {/* 오른쪽 컨텐츠 - 라우팅 영역 */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
