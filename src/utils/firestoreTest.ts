// Firestore 연결 테스트 유틸리티

import { db } from '@/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  limit,
  Timestamp 
} from 'firebase/firestore';

// Firestore 연결 테스트
export const testFirestoreConnection = async (): Promise<void> => {
  try {
    console.log('🔥 Testing Firestore connection...');
    
    // 테스트 데이터 추가
    const testData = {
      test: true,
      message: 'Firestore connection test',
      timestamp: Timestamp.now(),
      userId: 'test-user'
    };
    
    const docRef = await addDoc(collection(db, 'connection_test'), testData);
    console.log('✅ Test document written with ID: ', docRef.id);
    
    // 데이터 읽기 테스트
    const testQuery = query(collection(db, 'connection_test'), limit(1));
    const querySnapshot = await getDocs(testQuery);
    
    if (!querySnapshot.empty) {
      console.log('✅ Test document read successfully');
      querySnapshot.forEach((doc) => {
        console.log('📄 Document data:', doc.data());
      });
    }
    
    console.log('🎉 Firestore connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Firestore connection test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        console.error('🔒 Permission denied. Check Firestore security rules.');
      } else if (error.message.includes('not-found')) {
        console.error('🔍 Database not found. Make sure Firestore is initialized.');
      } else {
        console.error('🚨 Unknown error:', error.message);
      }
    }
  }
};

// user_view_history 컬렉션 테스트
export const testViewHistoryCollection = async (): Promise<void> => {
  try {
    console.log('📚 Testing user_view_history collection...');
    
    const testHistoryData = {
      queryId: 999,
      queryName: 'Test Query',
      queryDescription: 'This is a test query for Firestore',
      queryType: 'sql',
      queryRuntime: '0.5s',
      userId: 'test@example.com',
      viewedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'user_view_history'), testHistoryData);
    console.log('✅ View history test document created with ID:', docRef.id);
    
    // 데이터 읽기
    const historyQuery = query(collection(db, 'user_view_history'), limit(5));
    const snapshot = await getDocs(historyQuery);
    
    console.log(`📊 Found ${snapshot.size} documents in user_view_history collection`);
    snapshot.forEach((doc) => {
      console.log('📄 History document:', doc.id, doc.data());
    });
    
    console.log('🎉 View history collection test completed!');
    
  } catch (error) {
    console.error('❌ View history collection test failed:', error);
  }
};

// 전역 객체에 테스트 함수들 추가 (개발 환경에서만)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).firestoreTest = {
    testConnection: testFirestoreConnection,
    testViewHistory: testViewHistoryCollection,
  };
  
  console.log('🧪 Firestore test functions available:');
  console.log('- window.firestoreTest.testConnection()');
  console.log('- window.firestoreTest.testViewHistory()');
}
