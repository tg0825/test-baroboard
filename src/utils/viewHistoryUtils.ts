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
  Timestamp,
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

interface FirestoreViewHistoryItem {
  queryId: number;
  queryName: string;
  queryDescription?: string;
  queryType: string;
  queryRuntime?: string;
  userId: string;
  viewedAt: Timestamp;
  createdAt: Timestamp;
}

const COLLECTION_NAME = 'user_view_history';
const MAX_HISTORY_ITEMS = 50; // 최대 저장 개수
const STORAGE_KEY = 'baroboard_view_history'; // localStorage 키 (마이그레이션용)

// 사용자 ID 가져오기 (로그인된 사용자의 이메일)
const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // AuthContext 로그인 시스템에서 사용자 정보 가져오기
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userEmail = localStorage.getItem('userEmail');
  
  if (isLoggedIn && userEmail) {
    console.log('👤 Using logged-in user:', userEmail);
    return userEmail;
  }
  
  // 로그인되지 않은 경우 null 반환 (Firestore 저장 안함)
  console.log('⚠️ User not logged in, skipping Firestore operations');
  return null;
};

// Firestore에 조회 기록 저장
export const addToViewHistory = async (query: {
  id: number;
  name: string;
  description?: string;
  type: string;
  runtime?: string;
}): Promise<void> => {
  try {
    console.log('🔍 Attempting to save view history:', query);
    
    const userId = getCurrentUserId();
    console.log('🔍 Current user ID:', userId);
    
    if (!userId) {
      console.log('⚠️ No user logged in, skipping Firestore save');
      console.log('🔍 localStorage baroboard_user:', localStorage.getItem('baroboard_user'));
      return;
    }

    // 중복 제거: 기존 같은 쿼리 ID 삭제
    await removeFromViewHistory(query.id);

    const now = Timestamp.now();
    const firestoreData: FirestoreViewHistoryItem = {
      queryId: query.id,
      queryName: query.name,
      queryDescription: query.description || '',
      queryType: query.type,
      queryRuntime: query.runtime,
      userId,
      viewedAt: now,
      createdAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), firestoreData);
    console.log('✅ View history saved to Firestore:', docRef.id);

    // 최대 개수 제한 확인 및 정리 (인덱스 생성 후 활성화)
    // await cleanupOldHistory(userId);
  } catch (error) {
    console.error('❌ Error saving to Firestore:', error);
    throw error;
  }
};

// 오래된 기록 정리 (최대 개수 초과 시)
const cleanupOldHistory = async (userId: string): Promise<void> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('viewedAt', 'desc'),
      limit(MAX_HISTORY_ITEMS + 10) // 여유분 포함해서 조회
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.docs.length > MAX_HISTORY_ITEMS) {
      // 초과된 문서들 삭제
      const docsToDelete = querySnapshot.docs.slice(MAX_HISTORY_ITEMS);
      const deletePromises = docsToDelete.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`✅ Cleaned up ${docsToDelete.length} old history items`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up old history:', error);
  }
};

// Firestore에서 조회 기록 불러오기
export const getViewHistory = async (): Promise<ViewHistoryItem[]> => {
  try {
    console.log('🔍 Starting getViewHistory...');
    
    const userId = getCurrentUserId();
    console.log('🔍 User ID for loading history:', userId);
    
    if (!userId) {
      console.log('⚠️ No user logged in, returning empty history');
      return [];
    }

    console.log('🔍 Creating Firestore query (no orderBy to avoid index)...');
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      // orderBy('viewedAt', 'desc'), // 인덱스 생성 전까지 비활성화
      limit(MAX_HISTORY_ITEMS)
    );

    console.log('🔍 Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    console.log('🔍 Query snapshot size:', querySnapshot.size);
    
    const history: ViewHistoryItem[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirestoreViewHistoryItem;
      history.push({
        id: data.queryId,
        name: data.queryName,
        description: data.queryDescription,
        type: data.queryType,
        runtime: data.queryRuntime,
        viewedAt: data.viewedAt.toDate().toISOString(),
        firestoreId: doc.id,
      });
    });

    // 클라이언트에서 최신순 정렬
    history.sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());

    console.log(`✅ Loaded ${history.length} items from Firestore`);
    console.log('🔍 History items:', history);
    return history;
  } catch (error) {
    console.error('❌ Error loading from Firestore:', error);
    if (error instanceof Error) {
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
    }
    throw error;
  }
};

// Firestore에서 특정 기록 삭제
export const removeFromViewHistory = async (queryId: number): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.log('⚠️ No user logged in, skipping Firestore delete');
      return;
    }

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('queryId', '==', queryId)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('⚠️ No document found to delete');
      return;
    }

    // 해당 쿼리의 모든 기록 삭제 (중복이 있을 수 있음)
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log(`✅ Removed ${deletePromises.length} documents from Firestore`);
  } catch (error) {
    console.error('❌ Error removing from Firestore:', error);
    throw error;
  }
};

// Firestore에서 전체 기록 삭제
export const clearViewHistory = async (): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.log('⚠️ No user logged in, skipping Firestore clear');
      return;
    }

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('⚠️ No documents found to delete');
      return;
    }

    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log(`✅ Cleared ${deletePromises.length} documents from Firestore`);
  } catch (error) {
    console.error('❌ Error clearing Firestore:', error);
    throw error;
  }
};

// localStorage에서 Firestore로 마이그레이션
export const migrateLocalStorageToFirestore = async (): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.log('⚠️ No user logged in, skipping migration');
      return;
    }

    // localStorage에서 기존 데이터 확인
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      console.log('⚠️ No local history to migrate');
      return;
    }

    const localHistory = JSON.parse(stored) as ViewHistoryItem[];
    if (localHistory.length === 0) {
      console.log('⚠️ No local history to migrate');
      return;
    }

    console.log(`🔄 Migrating ${localHistory.length} items from localStorage to Firestore...`);
    
    let successCount = 0;
    for (const item of localHistory) {
      try {
        // 중복 확인 후 추가
        const q = query(
          collection(db, COLLECTION_NAME),
          where('userId', '==', userId),
          where('queryId', '==', item.id)
        );
        
        const existing = await getDocs(q);
        if (!existing.empty) {
          console.log(`⚠️ Skipping duplicate item: ${item.id}`);
          continue;
        }

        // Firestore에 추가
        const firestoreData: FirestoreViewHistoryItem = {
          queryId: item.id,
          queryName: item.name,
          queryDescription: item.description || '',
          queryType: item.type,
          queryRuntime: item.runtime,
          userId,
          viewedAt: Timestamp.fromDate(new Date(item.viewedAt)),
          createdAt: Timestamp.now(),
        };

        await addDoc(collection(db, COLLECTION_NAME), firestoreData);
        successCount++;
      } catch (error) {
        console.error('❌ Failed to migrate item:', item.id, error);
      }
    }
    
    console.log(`✅ Successfully migrated ${successCount}/${localHistory.length} items`);
    
    if (successCount > 0) {
      // 마이그레이션이 성공적으로 완료된 경우 localStorage 정리
      localStorage.removeItem(STORAGE_KEY);
      console.log('✅ Local storage cleared after successful migration');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};