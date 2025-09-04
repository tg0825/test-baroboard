// 백업용 - localStorage 기반 조회 이력 관리

export interface ViewHistoryItem {
  id: number;
  name: string;
  description?: string;
  type: string;
  viewedAt: string;
  runtime?: string;
}

const STORAGE_KEY = 'baroboard_view_history';
const MAX_HISTORY_ITEMS = 50;

export const addToViewHistory = (query: {
  id: number;
  name: string;
  description?: string;
  type: string;
  runtime?: string;
}): void => {
  try {
    const history = getViewHistory();
    const filteredHistory = history.filter(item => item.id !== query.id);
    
    const newItem: ViewHistoryItem = {
      id: query.id,
      name: query.name,
      description: query.description || '',
      type: query.type,
      runtime: query.runtime,
      viewedAt: new Date().toISOString(),
    };
    
    const updatedHistory = [newItem, ...filteredHistory];
    const trimmedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
    console.log('✅ View history saved to localStorage:', newItem);
  } catch (error) {
    console.error('❌ Error saving view history:', error);
  }
};

export const getViewHistory = (): ViewHistoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const history = JSON.parse(stored) as ViewHistoryItem[];
    return history
      .filter(item => item.id && item.name && item.viewedAt)
      .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());
  } catch (error) {
    console.error('❌ Error loading view history:', error);
    return [];
  }
};

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

export const clearViewHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ View history cleared');
  } catch (error) {
    console.error('❌ Error clearing view history:', error);
  }
};
