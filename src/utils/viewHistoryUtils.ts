// Firestore를 활용한 조회 이력 관리 유틸리티

import { db } from '@/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  deleteDoc, 
  doc,
  Timestamp 
} from 'firebase/firestore';

export interface ViewHistoryItem {
  id: number;
  name: string;
  description?: string;
  type: string;
  viewedAt: string; // ISO string
  runtime?: string;
  firestoreId?: string; // Firestore 문서 ID
}

const STORAGE_KEY = 'baroboard_view_history';
const MAX_HISTORY_ITEMS = 50; // 최대 저장 개수

// 조회 기록 저장
export const addToViewHistory = (query: {
  id: number;
  name: string;
  description?: string;
  type: string;
  runtime?: string;
}): void => {
  try {
    const history = getViewHistory();
    
    // 중복 제거 (같은 ID의 이전 기록 제거)
    const filteredHistory = history.filter(item => item.id !== query.id);
    
    // 새 기록을 맨 앞에 추가
    const newItem: ViewHistoryItem = {
      id: query.id,
      name: query.name,
      description: query.description || '',
      type: query.type,
      runtime: query.runtime,
      viewedAt: new Date().toISOString(),
    };
    
    const updatedHistory = [newItem, ...filteredHistory];
    
    // 최대 개수 제한
    const trimmedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);
    
    // 로컬스토리지에 저장
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
    
    console.log('✅ View history saved:', newItem);
  } catch (error) {
    console.error('❌ Error saving view history:', error);
  }
};

// 조회 기록 불러오기
export const getViewHistory = (): ViewHistoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const history = JSON.parse(stored) as ViewHistoryItem[];
    
    // 유효성 검사 및 정렬 (최신순)
    return history
      .filter(item => item.id && item.name && item.viewedAt)
      .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());
      
  } catch (error) {
    console.error('❌ Error loading view history:', error);
    return [];
  }
};

// 특정 기록 삭제
export const removeFromViewHistory = (queryId: number): void => {
  try {
    const history = getViewHistory();
    const updatedHistory = history.filter(item => item.id !== queryId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    
    console.log('✅ Removed from view history:', queryId);
  } catch (error) {
    console.error('❌ Error removing from view history:', error);
  }
};

// 전체 기록 삭제
export const clearViewHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ View history cleared');
  } catch (error) {
    console.error('❌ Error clearing view history:', error);
  }
};

// 최근 N개 기록 가져오기
export const getRecentViewHistory = (limit: number = 20): ViewHistoryItem[] => {
  const history = getViewHistory();
  return history.slice(0, limit);
};

// 조회 통계
export const getViewHistoryStats = (): {
  totalViews: number;
  uniqueQueries: number;
  todayViews: number;
  weekViews: number;
} => {
  try {
    const history = getViewHistory();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const todayViews = history.filter(item => 
      new Date(item.viewedAt) >= todayStart
    ).length;
    
    const weekViews = history.filter(item => 
      new Date(item.viewedAt) >= weekStart
    ).length;
    
    const uniqueQueryIds = new Set(history.map(item => item.id));
    
    return {
      totalViews: history.length,
      uniqueQueries: uniqueQueryIds.size,
      todayViews,
      weekViews,
    };
  } catch (error) {
    console.error('❌ Error getting view history stats:', error);
    return {
      totalViews: 0,
      uniqueQueries: 0,
      todayViews: 0,
      weekViews: 0,
    };
  }
};

// 특정 날짜 범위의 기록 가져오기
export const getViewHistoryByDateRange = (startDate: Date, endDate: Date): ViewHistoryItem[] => {
  try {
    const history = getViewHistory();
    return history.filter(item => {
      const viewDate = new Date(item.viewedAt);
      return viewDate >= startDate && viewDate <= endDate;
    });
  } catch (error) {
    console.error('❌ Error getting view history by date range:', error);
    return [];
  }
};
