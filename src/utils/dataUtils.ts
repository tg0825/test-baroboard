// 데이터 처리 관련 유틸리티 함수들

export interface TableData {
  columns: Array<{ name: string }>;
  rows: Array<Record<string, string | number>>;
}

export interface ChartData {
  data: Array<Record<string, string | number>>;
  type: 'bar' | 'line' | 'pie';
  xKey: string;
  yKey: string;
  title?: string;
}

// 테이블 데이터 추출 함수
export const extractTableData = (plainData: unknown): TableData | null => {
  try {
    // 타입 가드를 사용한 query_result.data 구조 확인
    if (
      plainData && 
      typeof plainData === 'object' && 
      'query_result' in plainData &&
      plainData.query_result &&
      typeof plainData.query_result === 'object' &&
      'data' in plainData.query_result &&
      plainData.query_result.data &&
      typeof plainData.query_result.data === 'object' &&
      'columns' in plainData.query_result.data &&
      'rows' in plainData.query_result.data
    ) {
      const data = plainData.query_result.data as { columns: Array<{ name: string }>; rows: Array<Record<string, string | number>> };
      return {
        columns: data.columns,
        rows: data.rows
      };
    }
    return null;
  } catch {
    return null;
  }
};

// 데이터 타입 분석 함수
export const analyzeDataTypes = (tableData: TableData) => {
  const columnTypes: Record<string, 'number' | 'string' | 'date'> = {};
  
  tableData.columns.forEach(column => {
    const sampleValues = tableData.rows
      .slice(0, Math.min(10, tableData.rows.length)) // 처음 10개 행만 샘플링
      .map(row => row[column.name])
      .filter(val => val !== null && val !== undefined);

    if (sampleValues.length === 0) {
      columnTypes[column.name] = 'string';
      return;
    }

    // 숫자 타입 확인
    const isNumeric = sampleValues.every(val => 
      !isNaN(Number(val)) && isFinite(Number(val))
    );

    // 날짜 타입 확인 (간단한 패턴)
    const isDate = sampleValues.every(val => 
      typeof val === 'string' && !isNaN(Date.parse(val))
    );

    if (isNumeric) {
      columnTypes[column.name] = 'number';
    } else if (isDate) {
      columnTypes[column.name] = 'date';
    } else {
      columnTypes[column.name] = 'string';
    }
  });

  return columnTypes;
};

// 차트 데이터 생성 함수
export const generateChartData = (tableData: TableData, selectedXColumn?: string | null, selectedYColumn?: string | null): ChartData | null => {
  const columnTypes = analyzeDataTypes(tableData);
  
  const numberColumns = Object.entries(columnTypes)
    .filter(([, type]) => type === 'number')
    .map(([name]) => name);
  const stringColumns = Object.entries(columnTypes)
    .filter(([, type]) => type === 'string')
    .map(([name]) => name);
  const dateColumns = Object.entries(columnTypes)
    .filter(([, type]) => type === 'date')
    .map(([name]) => name);

  // 차트 생성 조건 확인
  if (numberColumns.length === 0) return null;

  let xKey = '';
  let yKey = numberColumns[0];
  let chartType: 'bar' | 'line' | 'pie' = 'bar';

  // Y축 결정 (사용자 선택이 있으면 우선 사용, 숫자 컬럼만 가능)
  if (selectedYColumn && numberColumns.includes(selectedYColumn)) {
    yKey = selectedYColumn;
  } else {
    yKey = numberColumns[0];
  }

  // X축 결정 (사용자 선택이 있으면 우선 사용)
  if (selectedXColumn && tableData.columns.some(col => col.name === selectedXColumn)) {
    xKey = selectedXColumn;
    
    // 선택된 X축 타입에 따라 차트 타입 결정
    const selectedColumnType = columnTypes[selectedXColumn];
    if (selectedColumnType === 'date') {
      chartType = 'line';
    } else if (selectedColumnType === 'string') {
      const uniqueValues = new Set(tableData.rows.map(row => row[xKey])).size;
      chartType = uniqueValues <= 7 ? 'pie' : 'bar'; // 8개 이상이면 막대 그래프
    } else {
      chartType = 'bar';
    }
  } else {
    // 기본 자동 선택 로직
    if (dateColumns.length > 0) {
      xKey = dateColumns[0];
      chartType = 'line';
    } else if (stringColumns.length > 0) {
      xKey = stringColumns[0];
      const uniqueValues = new Set(tableData.rows.map(row => row[xKey])).size;
      chartType = uniqueValues <= 7 ? 'pie' : 'bar'; // 8개 이상이면 막대 그래프
    } else {
      xKey = tableData.columns[0].name;
    }
  }

  return {
    data: tableData.rows,
    type: chartType,
    xKey,
    yKey,
    title: `차트, 그래프`
  };
};