interface QueryData {
  id: number;
  name: string;
  type?: string;
  description?: string;
}

export const createQueryFromId = (id: number, name?: string): QueryData => ({
  id,
  name: name || `쿼리 ID ${id}`,
  type: 'Query',
  description: '',
});

export const updateBrowserHistory = (query: QueryData, replace = false) => {
  const method = replace ? 'replaceState' : 'pushState';
  window.history[method](
    { queryId: query.id, queryName: query.name },
    '',
    `/query/${query.id}`
  );
};

export const dispatchRouteChangeEvent = (queryId: number) => {
  window.dispatchEvent(new CustomEvent('baroboard-route-change', {
    detail: { queryId }
  }));
};

export const findQueryInApiData = (apiData: unknown, targetId: number): QueryData | null => {
  const apiDataObj = apiData as Record<string, unknown>;
  let queryFound = null;
  
  // 표준 응답 형태 확인
  if (apiDataObj.results && Array.isArray(apiDataObj.results)) {
    queryFound = apiDataObj.results.find((item: { id: string | number }) => 
      Number(item.id) === Number(targetId)
    );
  }
  // 레거시 응답 형태 확인
  else if (Array.isArray(apiDataObj)) {
    queryFound = apiDataObj.find((item: { id: string | number }) => 
      Number(item.id) === Number(targetId)
    );
  }
  
  if (queryFound && queryFound.name) {
    return {
      id: Number(queryFound.id),
      name: queryFound.name as string,
      type: (queryFound.type as string) || 'Query',
      description: (queryFound.description as string) || '',
    };
  }
  
  return null;
};