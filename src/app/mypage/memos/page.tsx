"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAllQueryMemos, QueryMemo, updateQueryMemo, createQueryMemo, getQueryMemo } from '@/utils/queryMemoUtils';
import { getRelativeTime } from '@/utils/viewHistoryUtils';
import Snackbar from '@/components/Snackbar';

export default function MemosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [memoList, setMemoList] = useState<QueryMemo[]>([]);
  const [isLoadingMemos, setIsLoadingMemos] = useState(false);
  
  // 메모 수정 모달 관련 상태
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [currentMemo, setCurrentMemo] = useState('');
  const [editingQueryId, setEditingQueryId] = useState<number | null>(null);
  const [editingQueryName, setEditingQueryName] = useState<string>('');
  
  // 스낵바 상태
  const [snackbar, setSnackbar] = useState({
    message: '',
    visible: false,
    type: 'info' as 'info' | 'warning' | 'error' | 'success'
  });

  useEffect(() => {
    if (user?.isLoggedIn) {
      loadMemoList();
    }
  }, [user?.isLoggedIn]);

  const loadMemoList = async () => {
    console.log('🔍 Loading memo list...');
    console.log('🔍 User login status:', user?.isLoggedIn);
    console.log('🔍 User email:', user?.email);
    
    setIsLoadingMemos(true);
    try {
      const memos = await getAllQueryMemos();
      console.log('✅ Loaded memos count:', memos.length);
      console.log('✅ Loaded memos data:', memos);
      setMemoList(memos);
    } catch (error) {
      console.error('❌ Error loading memo list:', error);
    } finally {
      setIsLoadingMemos(false);
    }
  };

  const handleOpenQueryPopup = (queryId: number) => {
    // 화면 중앙에 세로 직사각형 형태로 팝업 열기
    const width = 900;
    const height = 1200;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      `/dashboard-popup?queryId=${queryId}`, 
      '_blank', 
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  };

  const handleEditMemo = (queryId: number, currentMemoText: string, queryName: string) => {
    setEditingQueryId(queryId);
    setEditingQueryName(queryName);
    setCurrentMemo(currentMemoText);
    setIsMemoModalOpen(true);
  };

  const handleSaveMemo = async () => {
    if (!editingQueryId) return;
    
    try {
      if (!currentMemo.trim()) {
        // 빈 메모인 경우 삭제
        await updateQueryMemo(editingQueryId, '');
        setSnackbar({
          message: '쿼리메모가 삭제되었습니다.',
          visible: true,
          type: 'success'
        });
      } else {
        // 메모 업데이트
        await updateQueryMemo(editingQueryId, currentMemo);
        setSnackbar({
          message: '쿼리메모가 저장되었습니다.',
          visible: true,
          type: 'success'
        });
      }
      
      // 메모 목록 새로고침
      await loadMemoList();
      
      // 모달은 닫지 않고 사용자가 직접 닫도록 함
      // setIsMemoModalOpen(false);
      // setCurrentMemo('');
      // setEditingQueryId(null);
      // setEditingQueryName('');
    } catch (error) {
      console.error('Error saving memo:', error);
      setSnackbar({
        message: `메모 저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        visible: true,
        type: 'error'
      });
    }
  };

  const handleCloseMemoModal = () => {
    setIsMemoModalOpen(false);
    setCurrentMemo('');
    setEditingQueryId(null);
    setEditingQueryName('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border-light">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">쿼리메모</h2>
            <p className="text-sm text-text-muted">{memoList.length}개의 쿼리메모</p>
          </div>
        </div>
      </div>

      {/* 쿼리메모 리스트 */}
      <div className="p-0">
        {isLoadingMemos ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-main border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-text-secondary">쿼리메모를 불러오는 중...</p>
          </div>
        ) : memoList.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-text-muted text-4xl mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-text-secondary font-medium">아직 작성된 쿼리메모가 없습니다</p>
            <p className="text-text-muted">쿼리에 쿼리메모를 추가해보세요</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {memoList.map((item, index) => (
              <div
                key={`${item.queryId}-${item.updatedAt}`}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-text-primary truncate">
                        (#{item.queryId}) {item.queryName}
                      </h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex-shrink-0">
                        {item.queryType}
                      </span>
                    </div>
                    
                    {/* 쿼리메모 내용 */}
                    <div className="bg-gray-50 border border-gray-200 p-3 mb-2 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {item.memo}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-text-light">
                        {item.queryUser && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {item.queryUser}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          메모 작성: {getRelativeTime(new Date(item.updatedAt))}
                        </span>
                      </div>
                      
                      {/* 액션 버튼들 */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenQueryPopup(item.queryId);
                          }}
                          className="px-3 py-1.5 text-xs text-green-700 border border-green-300 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          상세보기
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditMemo(item.queryId, item.memo, item.queryName);
                          }}
                          className="px-3 py-1.5 text-xs text-orange-700 border border-orange-300 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          메모수정
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 메모 수정 모달 */}
      {isMemoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-lg shadow-xl w-[500px] max-w-[90vw] h-[480px] min-h-[450px] flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-text-primary">
                쿼리메모 <span className="text-sm text-gray-500 font-normal">(ID: {editingQueryId})</span>
              </h2>
              <button
                onClick={handleCloseMemoModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 바디 */}
            <div className="flex-1 p-3 overflow-hidden flex flex-col">
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-700 mb-1">쿼리 이름</h3>
                <p className="text-sm text-gray-600">{editingQueryName}</p>
              </div>
              
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">메모 내용</label>
                <textarea
                  value={currentMemo}
                  onChange={(e) => setCurrentMemo(e.target.value)}
                  placeholder="이 쿼리에 대한 메모를 작성하세요..."
                  className="flex-1 min-h-[180px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent"
                />
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="flex items-center justify-end gap-3 p-3 border-t border-gray-200">
              <button
                onClick={handleCloseMemoModal}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveMemo}
                className="px-4 py-2 text-sm text-white bg-primary-main border border-primary-main rounded-lg hover:bg-primary-dark transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 스낵바 */}
      <Snackbar
        message={snackbar.message}
        isVisible={snackbar.visible}
        type={snackbar.type}
        onClose={() => setSnackbar(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
