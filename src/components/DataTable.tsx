import React from 'react';

export interface TableData {
  columns: Array<{ name: string }>;
  rows: Array<Record<string, string | number>>;
}

interface DataTableProps {
  tableData: TableData;
  currentPage: number;
  itemsPerPage: number;
  hiddenColumns: Set<string>;
  selectedXColumn: string | null;
  selectedYColumn: string | null;
  onPageChange: (page: number) => void;
  onColumnClick: (columnName: string, isShiftClick: boolean) => void;
  onColumnRightClick: (e: React.MouseEvent, columnName: string) => void;
  onShowColumnSettings: () => void;
  analyzeDataTypes: (tableData: TableData) => Record<string, 'number' | 'string' | 'date'>;
}

// 페이지네이션 컴포넌트
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void; 
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-4" data-testid="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm border border-border-light rounded-lg hover:bg-background-soft disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        data-testid="prev-page"
      >
        ← 이전
      </button>
      
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
            page === currentPage
              ? 'bg-primary-main text-white border-primary-main'
              : page === '...'
              ? 'cursor-default border-transparent'
              : 'border-border-light hover:bg-background-soft'
          }`}
          data-testid={page === currentPage ? "current-page" : page === '...' ? "page-ellipsis" : `page-${page}`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm border border-border-light rounded-lg hover:bg-background-soft disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        data-testid="next-page"
      >
        다음 →
      </button>
    </div>
  );
};

const DataTable: React.FC<DataTableProps> = ({
  tableData,
  currentPage,
  itemsPerPage,
  hiddenColumns,
  selectedXColumn,
  selectedYColumn,
  onPageChange,
  onColumnClick,
  onColumnRightClick,
  onShowColumnSettings,
  analyzeDataTypes
}) => {
  if (!tableData.columns.length || !tableData.rows.length) {
    return (
      <div className="text-center py-4 text-text-secondary">
        표시할 데이터가 없습니다.
      </div>
    );
  }

  // 보이는 컬럼만 필터링
  const visibleColumns = tableData.columns.filter(col => !hiddenColumns.has(col.name));

  if (visibleColumns.length === 0) {
    return (
      <div className="text-center py-4 text-text-secondary">
        <p className="mb-2">모든 컬럼이 숨겨져 있습니다.</p>
        <button
          onClick={onShowColumnSettings}
          className="px-3 py-1 text-sm bg-primary-main text-white rounded hover:bg-primary-dark transition-colors"
        >
          컬럼 설정
        </button>
      </div>
    );
  }

  // 페이지네이션 계산
  const totalPages = Math.ceil(tableData.rows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = tableData.rows.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    onPageChange(page);
  };

  const handleColumnClick = (columnName: string, isShiftClick: boolean = false) => {
    onColumnClick(columnName, isShiftClick);
  };

  return (
    <div data-testid="table-container">
      {/* 테이블 상단 정보 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-text-muted">
            총 <span className="font-semibold text-text-primary">{tableData.rows.length}</span>개 행 중{' '}
            <span className="font-semibold text-text-primary">
              {startIndex + 1}-{Math.min(endIndex, tableData.rows.length)}
            </span>개 표시
          </div>
          {hiddenColumns.size > 0 && (
            <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
              {hiddenColumns.size}개 컬럼 숨김
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onShowColumnSettings}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
            title="컬럼 설정"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            컬럼 설정
          </button>
          {totalPages > 1 && (
            <div className="text-sm text-text-muted">
              페이지 {currentPage} / {totalPages}
            </div>
          )}
        </div>
      </div>

      {/* 테이블 */}
      <div className="border border-border-light rounded-lg overflow-hidden">
        <div className="overflow-auto max-h-[60vh]">
          <table className="min-w-full">
            <thead className="bg-background-soft sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary border-b border-border-light w-12">
                  #
                </th>
                {visibleColumns.map((column, index) => {
                  const columnTypes = analyzeDataTypes(tableData);
                  const isNumber = columnTypes[column.name] === 'number';
                  const isSelectedX = selectedXColumn === column.name;
                  const isSelectedY = selectedYColumn === column.name;
                  
                  return (
                    <th
                      key={index}
                      onClick={(e) => handleColumnClick(column.name, e.metaKey)}
                      onContextMenu={(e) => onColumnRightClick(e, column.name)}
                      className={`px-4 py-3 text-left text-sm font-semibold border-b border-border-light cursor-pointer transition-colors hover:bg-gray-100 ${
                        isSelectedX
                          ? 'text-blue-600 font-bold'
                          : isSelectedY
                          ? 'text-green-600 font-bold'
                          : 'text-text-primary'
                      }`}
                      title={`클릭: X축 설정${isNumber ? ' • Cmd+클릭: Y축 설정' : ''} ${
                        isSelectedX ? '(X축 선택됨)' : isSelectedY ? '(Y축 선택됨)' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex-1">{column.name}</span>
                        {isSelectedX && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            X축
                          </span>
                        )}
                        {isSelectedY && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            Y축
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border-light">
              {currentPageData.map((row, rowIndex) => {
                const globalRowIndex = startIndex + rowIndex + 1;
                return (
                  <tr key={globalRowIndex} className="hover:bg-background-soft transition-colors">
                    <td className="px-4 py-3 text-sm text-text-muted border-b border-border-light w-12">
                      {globalRowIndex}
                    </td>
                    {visibleColumns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-4 py-3 text-sm text-text-primary border-b border-border-light"
                      >
                        <div className="max-w-xs truncate" title={String(row[column.name] || '')}>
                          {row[column.name] !== null && row[column.name] !== undefined 
                            ? String(row[column.name]) 
                            : '-'
                          }
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 페이지네이션 */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default DataTable;