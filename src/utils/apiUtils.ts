// API 호출 관련 유틸리티 함수들

interface ApiResponse {
  data: string | unknown;
  timestamp: string;
  type: 'detail' | 'plain';
}

// Pre API 호출
export const callPreApi = async (id: number): Promise<{ latestQueryDataId: string; queryName?: string; queryUser?: string }> => {
  const apiKey = localStorage.getItem('baroboard_api_key');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    headers['Authorization'] = `Key ${apiKey}`;
  }
  
  const preApiUrl = `https://tg0825.app.n8n.cloud/webhook/01dedf36-0da7-4546-b5c2-dac80381452c?item-id=${id}&api-type=pre`;
  
  const preResponse = await fetch(preApiUrl, {
    method: 'GET',
    headers,
  });

  if (!preResponse.ok) {
    throw new Error(`Pre API 호출 실패: ${preResponse.status}`);
  }

  const preData = await preResponse.json() as Record<string, unknown>;
  const latestQueryDataId = (preData?.body as Record<string, unknown>)?.latest_query_data_id as string;
  
  // pre API 응답에서 쿼리 제목 추출 (body.name)
  const queryName = (preData?.body as Record<string, unknown>)?.name as string;
  if (queryName && typeof queryName === 'string') {
    console.log('✅ Pre API에서 제목 추출:', queryName);
  } else {
    console.log('❌ Pre API에서 제목 추출 실패, body:', preData?.body);
  }

  // pre API 응답에서 작성자 정보 추출 (body.user)
  const userRaw = (preData?.body as Record<string, unknown>)?.user;
  let queryUser: string | undefined;
  
  if (typeof userRaw === 'string') {
    queryUser = userRaw;
    console.log('✅ Pre API에서 작성자 추출 (문자열):', queryUser);
  } else if (userRaw && typeof userRaw === 'object') {
    // user가 객체인 경우 name 속성을 추출
    const userObj = userRaw as Record<string, unknown>;
    queryUser = (userObj.name || userObj.email) as string;
    console.log('✅ Pre API에서 작성자 추출 (객체):', queryUser);
    console.log('🔍 User 객체 전체:', userRaw);
  } else {
    console.log('❌ Pre API에서 작성자 추출 실패, body.user:', userRaw);
  }

  if (!latestQueryDataId) {
    throw new Error('latest_query_data_id를 찾을 수 없습니다.');
  }

  return { latestQueryDataId, queryName, queryUser };
};

// Detail API 호출
export const callDetailApi = async (id: number, latestQueryDataId: string): Promise<ApiResponse> => {
  const apiKey = localStorage.getItem('baroboard_api_key');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    headers['Authorization'] = `Key ${apiKey}`;
  }

  const response = await fetch(`https://tg0825.app.n8n.cloud/webhook/01dedf36-0da7-4546-b5c2-dac80381452c?item-id=${id}&api-type=detail&latest_query_data_id=${latestQueryDataId}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Detail API 실패: ${response.status}`);
  }

  const htmlData = await response.text();
  
  return {
    data: htmlData,
    timestamp: new Date().toISOString(),
    type: 'detail'
  };
};

// Plain API 호출
export const callPlainApi = async (id: number, latestQueryDataId: string): Promise<ApiResponse> => {
  const apiKey = localStorage.getItem('baroboard_api_key');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    headers['Authorization'] = `Key ${apiKey}`;
  }

  const response = await fetch(`https://tg0825.app.n8n.cloud/webhook/01dedf36-0da7-4546-b5c2-dac80381452c?item-id=${id}&api-type=plain&latest_query_data_id=${latestQueryDataId}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Plain API 실패: ${response.status}`);
  }

  const jsonData = await response.text();
  
  // JSON 파싱 시도
  try {
    const parsedData = JSON.parse(jsonData);
    return {
      data: parsedData,
      timestamp: new Date().toISOString(),
      type: 'plain'
    };
  } catch {
    // JSON 파싱 실패시 원본 텍스트로 처리
    return {
      data: jsonData,
      timestamp: new Date().toISOString(),
      type: 'plain'
    };
  }
};