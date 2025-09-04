// Firebase 디버깅 유틸리티

import { db } from '@/firebase';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

// Firebase 설정 정보 출력
export const debugFirebaseConfig = () => {
  console.log('🔧 Firebase Configuration Debug:');
  
  try {
    // Firebase 앱 정보
    const app = db.app;
    console.log('📱 Firebase App Name:', app.name);
    console.log('📱 Firebase Project ID:', app.options.projectId);
    console.log('📱 Firebase Auth Domain:', app.options.authDomain);
    console.log('📱 Firebase API Key:', app.options.apiKey ? '✅ Present' : '❌ Missing');
    console.log('📱 Firebase Storage Bucket:', app.options.storageBucket);
    console.log('📱 Firebase Messaging Sender ID:', app.options.messagingSenderId);
    console.log('📱 Firebase App ID:', app.options.appId);
    
    // Firestore 객체 확인
    console.log('🔥 Firestore Instance:', db ? '✅ Created' : '❌ Not Created');
    console.log('🔥 Firestore Type:', typeof db);
    
    // 네트워크 상태 확인
    console.log('🌐 Online Status:', navigator.onLine ? '✅ Online' : '❌ Offline');
    
    // 브라우저 환경 확인
    console.log('🌍 User Agent:', navigator.userAgent.substring(0, 100) + '...');
    console.log('🌍 Current URL:', window.location.href);
    
    // 환경 변수 확인
    console.log('🔧 Node Environment:', process.env.NODE_ENV);
    
  } catch (error) {
    console.error('❌ Error debugging Firebase config:', error);
  }
};

// 간단한 Firestore 연결 테스트 (읽기 전용)
export const testFirestoreRead = async () => {
  try {
    console.log('📖 Testing Firestore read access...');
    
    // 단순히 컬렉션 참조만 생성 (실제 요청 없음)
    const { collection } = await import('firebase/firestore');
    const testRef = collection(db, 'test');
    
    console.log('✅ Firestore collection reference created successfully');
    console.log('📚 Collection path:', testRef.path);
    
    return true;
  } catch (error) {
    console.error('❌ Firestore read test failed:', error);
    return false;
  }
};

// 매우 간단한 Firestore 쓰기 테스트
export const testSimpleWrite = async () => {
  try {
    console.log('✏️ Testing simple Firestore write...');
    
    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    
    const testData = {
      message: 'Simple test from browser',
      timestamp: Timestamp.now(),
      random: Math.random()
    };
    
    const docRef = await addDoc(collection(db, 'browser_test'), testData);
    console.log('✅ Document written successfully with ID:', docRef.id);
    
    return true;
  } catch (error) {
    console.error('❌ Simple write test failed:', error);
    
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      if (error.message.includes('Missing or insufficient permissions')) {
        console.error('🔒 This is a permission error - check Firestore security rules');
      } else if (error.message.includes('PERMISSION_DENIED')) {
        console.error('🔒 Permission denied - check Firestore security rules');
      } else if (error.message.includes('not-found')) {
        console.error('🔍 Database not found - make sure Firestore is created');
      }
    }
    
    return false;
  }
};

// 개발 환경에서만 전역 함수로 등록
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).firebaseDebug = {
    config: debugFirebaseConfig,
    testRead: testFirestoreRead,
    testWrite: testSimpleWrite,
  };
  
  console.log('🔧 Firebase debug functions available:');
  console.log('- window.firebaseDebug.config()');
  console.log('- window.firebaseDebug.testRead()');
  console.log('- window.firebaseDebug.testWrite()');
}
