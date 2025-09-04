// 사용자 활동 기록 관련 유틸리티 함수들
import { db } from '@/firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

// 사용자 활동 기록 인터페이스
export interface UserActivity {
  id?: string;
  userId: string; // 사용자 이메일
  activityType: 'query_view' | 'dashboard_access'; // 활동 유형
  queryId?: number; // 쿼리 ID (쿼리 관련 활동일 때)
  queryName?: string; // 쿼리 이름
  queryDescription?: string; // 쿼리 설명
  metadata?: Record<string, any>; // 추가 메타데이터
  timestamp: Timestamp | Date; // 활동 시간
}

// 사용자 쿼리 조회 기록 저장
export const recordQueryView = async (
  userId: string, 
  queryId: number, 
  queryName: string, 
  queryDescription?: string
): Promise<void> => {
  try {
    const activity: Omit<UserActivity, 'id'> = {
      userId,
      activityType: 'query_view',
      queryId,
      queryName,
      queryDescription: queryDescription || '',
      timestamp: Timestamp.now(),
      metadata: {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
        url: typeof window !== 'undefined' ? window.location.href : null,
      }
    };

    await addDoc(collection(db, 'user_activities'), activity);
    console.log('✅ Query view recorded:', { userId, queryId, queryName });
  } catch (error) {
    console.error('❌ Error recording query view:', error);
    // 에러가 발생해도 사용자 경험에 영향주지 않도록 조용히 실패
  }
};

// 대시보드 접근 기록 저장
export const recordDashboardAccess = async (userId: string): Promise<void> => {
  try {
    const activity: Omit<UserActivity, 'id'> = {
      userId,
      activityType: 'dashboard_access',
      timestamp: Timestamp.now(),
      metadata: {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
        url: typeof window !== 'undefined' ? window.location.href : null,
      }
    };

    await addDoc(collection(db, 'user_activities'), activity);
    console.log('✅ Dashboard access recorded:', { userId });
  } catch (error) {
    console.error('❌ Error recording dashboard access:', error);
    // 에러가 발생해도 사용자 경험에 영향주지 않도록 조용히 실패
  }
};

// 사용자 활동 기록 조회
export const getUserActivities = async (
  userId: string, 
  limitCount: number = 50,
  activityType?: 'query_view' | 'dashboard_access'
): Promise<UserActivity[]> => {
  try {
    let q = query(
      collection(db, 'user_activities'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    // 활동 유형 필터링
    if (activityType) {
      q = query(
        collection(db, 'user_activities'),
        where('userId', '==', userId),
        where('activityType', '==', activityType),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const activities: UserActivity[] = [];

    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data(),
      } as UserActivity);
    });

    return activities;
  } catch (error) {
    console.error('❌ Error fetching user activities:', error);
    return [];
  }
};

// 최근 조회한 쿼리 목록 조회 (중복 제거)
export const getRecentQueries = async (
  userId: string, 
  limitCount: number = 20
): Promise<UserActivity[]> => {
  try {
    const activities = await getUserActivities(userId, 100, 'query_view');
    
    // 쿼리 ID 기준으로 중복 제거 (가장 최근 것만 유지)
    const uniqueQueries = new Map<number, UserActivity>();
    
    activities.forEach(activity => {
      if (activity.queryId && !uniqueQueries.has(activity.queryId)) {
        uniqueQueries.set(activity.queryId, activity);
      }
    });

    // 최근 순으로 정렬하고 제한
    return Array.from(uniqueQueries.values())
      .sort((a, b) => {
        const timeA = a.timestamp instanceof Timestamp ? a.timestamp.toDate() : new Date(a.timestamp);
        const timeB = b.timestamp instanceof Timestamp ? b.timestamp.toDate() : new Date(b.timestamp);
        return timeB.getTime() - timeA.getTime();
      })
      .slice(0, limitCount);
  } catch (error) {
    console.error('❌ Error fetching recent queries:', error);
    return [];
  }
};

// 활동 통계 조회
export const getActivityStats = async (userId: string): Promise<{
  totalQueryViews: number;
  uniqueQueries: number;
  totalDashboardAccess: number;
  lastActivity: Date | null;
}> => {
  try {
    const activities = await getUserActivities(userId, 1000); // 충분한 수량 조회
    
    const queryViews = activities.filter(a => a.activityType === 'query_view');
    const dashboardAccess = activities.filter(a => a.activityType === 'dashboard_access');
    
    const uniqueQueryIds = new Set(queryViews.map(a => a.queryId).filter(id => id !== undefined));
    
    const lastActivity = activities.length > 0 
      ? (activities[0].timestamp instanceof Timestamp 
          ? activities[0].timestamp.toDate() 
          : new Date(activities[0].timestamp))
      : null;

    return {
      totalQueryViews: queryViews.length,
      uniqueQueries: uniqueQueryIds.size,
      totalDashboardAccess: dashboardAccess.length,
      lastActivity,
    };
  } catch (error) {
    console.error('❌ Error fetching activity stats:', error);
    return {
      totalQueryViews: 0,
      uniqueQueries: 0,
      totalDashboardAccess: 0,
      lastActivity: null,
    };
  }
};
