// 쿼리메모 전용 유틸리티 - user-query-memos 컬렉션 관리
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
  updateDoc,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';

// 컬렉션 이름
const MEMO_COLLECTION_NAME = 'user-query-memos';

// 쿼리메모 인터페이스
export interface QueryMemo {
  id?: string; // Firestore 문서 ID
  queryId: number;
  queryName: string;
  queryDescription?: string;
  queryType: string;
  queryUser?: string; // 쿼리 작성자
  memo: string;
  userId: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// Firestore용 인터페이스
interface FirestoreQueryMemo {
  queryId: number;
  queryName: string;
  queryDescription?: string;
  queryType: string;
  queryUser?: string;
  memo: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 현재 사용자 ID 가져오기 (AuthContext에서)
const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') {
    console.log('🔍 getCurrentUserId - window undefined (SSR)');
    return null;
  }
  
  try {
    // AuthContext 로그인 시스템에서 사용자 정보 가져오기
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userEmail = localStorage.getItem('userEmail');
    
    console.log('🔍 getCurrentUserId - localStorage check:');
    console.log('  - isLoggedIn:', isLoggedIn);
    console.log('  - userEmail:', userEmail);
    
    if (isLoggedIn && userEmail) {
      console.log('👤 Using logged-in user:', userEmail);
      return userEmail;
    }

    // 기존 baroboard_user 방식도 지원 (호환성)
    const userStr = localStorage.getItem('baroboard_user');
    console.log('🔍 baroboard_user:', userStr);
    
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log('🔍 Parsed baroboard_user:', user);
      const userId = user.email || user.id || null;
      console.log('👤 Using baroboard_user ID:', userId);
      return userId;
    }
    
    console.log('⚠️ No user found in localStorage');
    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

// 쿼리메모 생성
export const createQueryMemo = async (memoData: {
  queryId: number;
  queryName: string;
  queryDescription?: string;
  queryType: string;
  queryUser?: string;
  memo: string;
}): Promise<QueryMemo> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    // 기존 메모가 있는지 확인
    const existingMemo = await getQueryMemo(memoData.queryId);
    if (existingMemo) {
      throw new Error('Memo already exists for this query. Use updateQueryMemo instead.');
    }

    const now = Timestamp.now();
    const firestoreData: FirestoreQueryMemo = {
      queryId: memoData.queryId,
      queryName: memoData.queryName,
      queryDescription: memoData.queryDescription || '',
      queryType: memoData.queryType,
      queryUser: memoData.queryUser,
      memo: memoData.memo,
      userId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, MEMO_COLLECTION_NAME), firestoreData);
    
    console.log(`✅ Created memo for query ${memoData.queryId} in collection: ${MEMO_COLLECTION_NAME}`);
    
    return {
      id: docRef.id,
      queryId: memoData.queryId,
      queryName: memoData.queryName,
      queryDescription: memoData.queryDescription,
      queryType: memoData.queryType,
      queryUser: memoData.queryUser,
      memo: memoData.memo,
      userId,
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString(),
    };
  } catch (error) {
    console.error('❌ Error creating query memo:', error);
    throw error;
  }
};

// 특정 쿼리의 메모 가져오기
export const getQueryMemo = async (queryId: number): Promise<QueryMemo | null> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('⚠️ No user logged in, cannot get query memo');
      return null;
    }

    const q = query(
      collection(db, MEMO_COLLECTION_NAME),
      where('userId', '==', userId),
      where('queryId', '==', queryId)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data() as FirestoreQueryMemo;
    
    return {
      id: doc.id,
      queryId: data.queryId,
      queryName: data.queryName,
      queryDescription: data.queryDescription,
      queryType: data.queryType,
      queryUser: data.queryUser,
      memo: data.memo,
      userId: data.userId,
      createdAt: data.createdAt.toDate().toISOString(),
      updatedAt: data.updatedAt.toDate().toISOString(),
    };
  } catch (error) {
    console.error('❌ Error getting query memo:', error);
    return null;
  }
};

// 쿼리메모 업데이트
export const updateQueryMemo = async (queryId: number, newMemo: string): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    // 빈 메모인 경우 삭제
    if (!newMemo.trim()) {
      await deleteQueryMemo(queryId);
      return;
    }

    const q = query(
      collection(db, MEMO_COLLECTION_NAME),
      where('userId', '==', userId),
      where('queryId', '==', queryId)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('No memo found for this query');
    }

    const docRef = doc(db, MEMO_COLLECTION_NAME, querySnapshot.docs[0].id);
    await updateDoc(docRef, {
      memo: newMemo,
      updatedAt: Timestamp.now(),
    });

    console.log(`✅ Updated memo for query ${queryId} in collection: ${MEMO_COLLECTION_NAME}`);
  } catch (error) {
    console.error('❌ Error updating query memo:', error);
    throw error;
  }
};

// 쿼리메모 삭제
export const deleteQueryMemo = async (queryId: number): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const q = query(
      collection(db, MEMO_COLLECTION_NAME),
      where('userId', '==', userId),
      where('queryId', '==', queryId)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`⚠️ No memo found for query ${queryId}`);
      return;
    }

    const docRef = doc(db, MEMO_COLLECTION_NAME, querySnapshot.docs[0].id);
    await deleteDoc(docRef);

    console.log(`✅ Deleted memo for query ${queryId}`);
  } catch (error) {
    console.error('❌ Error deleting query memo:', error);
    throw error;
  }
};

// 사용자의 모든 쿼리메모 가져오기 (최신순)
export const getAllQueryMemos = async (): Promise<QueryMemo[]> => {
  try {
    const userId = getCurrentUserId();
    console.log('🔍 getAllQueryMemos - userId:', userId);
    
    if (!userId) {
      console.warn('⚠️ No user logged in, cannot get query memos');
      return [];
    }

    console.log(`🔍 Querying collection: ${MEMO_COLLECTION_NAME} for userId: ${userId}`);

    const q = query(
      collection(db, MEMO_COLLECTION_NAME),
      where('userId', '==', userId),
      // orderBy('updatedAt', 'desc'), // 임시로 제거 (인덱스 문제 방지)
      limit(100) // 최대 100개
    );

    console.log('🔍 Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    console.log('🔍 Query snapshot size:', querySnapshot.size);
    
    const memos: QueryMemo[] = [];

    querySnapshot.forEach((doc) => {
      console.log('🔍 Processing document:', doc.id, doc.data());
      const data = doc.data() as FirestoreQueryMemo;
      memos.push({
        id: doc.id,
        queryId: data.queryId,
        queryName: data.queryName,
        queryDescription: data.queryDescription,
        queryType: data.queryType,
        queryUser: data.queryUser,
        memo: data.memo,
        userId: data.userId,
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      });
    });

    // 클라이언트 사이드에서 정렬 (최신순)
    memos.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    console.log(`✅ Loaded ${memos.length} query memos from collection: ${MEMO_COLLECTION_NAME}`);
    console.log('🔍 Final memos array:', memos);
    return memos;
  } catch (error) {
    console.error('❌ Error getting all query memos:', error);
    console.error('❌ Error details:', error);
    return [];
  }
};

// 쿼리메모 존재 여부 확인
export const hasQueryMemo = async (queryId: number): Promise<boolean> => {
  try {
    const memo = await getQueryMemo(queryId);
    return memo !== null;
  } catch (error) {
    console.error('❌ Error checking memo existence:', error);
    return false;
  }
};

// 디버깅: 모든 컬렉션에서 특정 쿼리의 메모 확인
export const debugQueryMemoStorage = async (queryId: number): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.log('❌ No user logged in for debug check');
      return;
    }

    console.log(`🔍 DEBUG: Checking memo storage for query ${queryId}, user ${userId}`);
    
    // user-query-memos 컬렉션 확인
    const memoQuery = query(
      collection(db, MEMO_COLLECTION_NAME),
      where('userId', '==', userId),
      where('queryId', '==', queryId)
    );
    const memoSnapshot = await getDocs(memoQuery);
    console.log(`📝 user-query-memos collection: ${memoSnapshot.size} documents found`);
    
    // user_view_history 컬렉션 확인
    const historyQuery = query(
      collection(db, 'user_view_history'),
      where('userId', '==', userId),
      where('queryId', '==', queryId)
    );
    const historySnapshot = await getDocs(historyQuery);
    console.log(`📚 user_view_history collection: ${historySnapshot.size} documents found`);
    
    if (historySnapshot.size > 0) {
      historySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.memo) {
          console.log(`⚠️ WARNING: Found memo in user_view_history collection:`, data.memo);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error in debug check:', error);
  }
};

// 쿼리메모와 함께 쿼리 정보 업데이트 (쿼리 이름이 변경된 경우)
export const updateQueryMemoInfo = async (queryId: number, queryInfo: {
  queryName?: string;
  queryDescription?: string;
  queryType?: string;
  queryUser?: string;
}): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('No user logged in');
    }

    const q = query(
      collection(db, MEMO_COLLECTION_NAME),
      where('userId', '==', userId),
      where('queryId', '==', queryId)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return; // 메모가 없으면 업데이트할 필요 없음
    }

    const docRef = doc(db, MEMO_COLLECTION_NAME, querySnapshot.docs[0].id);
    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    if (queryInfo.queryName !== undefined) updateData.queryName = queryInfo.queryName;
    if (queryInfo.queryDescription !== undefined) updateData.queryDescription = queryInfo.queryDescription;
    if (queryInfo.queryType !== undefined) updateData.queryType = queryInfo.queryType;
    if (queryInfo.queryUser !== undefined) updateData.queryUser = queryInfo.queryUser;

    await updateDoc(docRef, updateData);

    console.log(`✅ Updated query info for memo ${queryId}`);
  } catch (error) {
    console.error('❌ Error updating query memo info:', error);
    throw error;
  }
};
