import React, { memo } from 'react';

interface MyPageSidebarProps {
  activeMenu: 'account' | 'history' | 'memos';
  viewHistoryCount: number;
  memoCount: number;
  onMenuChange: (menu: 'account' | 'history' | 'memos') => void;
}

const MyPageSidebar: React.FC<MyPageSidebarProps> = memo(({ 
  activeMenu, 
  viewHistoryCount, 
  memoCount, 
  onMenuChange 
}) => {
  console.log('🔄 MyPageSidebar rendered'); // 리렌더링 확인용 로그

  return (
    <div className="w-80 bg-white rounded-lg shadow-sm border border-border-light p-0 h-fit">
      <nav className="p-4">
        <button
          onClick={() => onMenuChange('history')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 mb-2 flex items-center gap-3 ${
            activeMenu === 'history'
              ? 'bg-primary-pale text-primary-main border border-primary-light'
              : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
          }`}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">내가 본 쿼리</div>
            <div className="text-xs opacity-75">{viewHistoryCount}개의 기록</div>
          </div>
        </button>
        
        <button
          onClick={() => onMenuChange('memos')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
            activeMenu === 'memos'
              ? 'bg-primary-pale text-primary-main border border-primary-light'
              : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
          }`}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">쿼리메모</div>
            <div className="text-xs opacity-75">{memoCount}개의 쿼리메모</div>
          </div>
        </button>
        
        <button
          onClick={() => onMenuChange('account')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
            activeMenu === 'account'
              ? 'bg-primary-pale text-primary-main border border-primary-light'
              : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
          }`}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">계정 정보</div>
            <div className="text-xs opacity-75">API 키 및 설정</div>
          </div>
        </button>
      </nav>
    </div>
  );
});

MyPageSidebar.displayName = 'MyPageSidebar';

export default MyPageSidebar;
