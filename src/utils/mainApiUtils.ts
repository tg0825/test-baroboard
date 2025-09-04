export const fetchMainPageData = async (page: number = 1, userEmail?: string, userSession?: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  const apiKey = localStorage.getItem('baroboard_api_key');
  const headers = {
    'Content-Type': 'application/json',
    ...(apiKey && { 'Authorization': `Key ${apiKey}` }),
  };
  
  try {
    const response = await fetch(
      `https://tg0825.app.n8n.cloud/webhook/54e868d6-9698-40e4-bcd7-331c40dff4b4?email=${encodeURIComponent(userEmail || '')}&session=${encodeURIComponent(userSession || '')}&action=main_page_init&page=${page}`,
      {
        method: 'GET',
        headers,
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('API 요청 시간이 초과되었습니다.');
    }
    throw new Error('네트워크 연결 오류가 발생했습니다.');
  }
};

export const extractQueryIdFromUrl = (): number | undefined => {
  if (typeof window === 'undefined') return undefined;
  
  const queryMatch = window.location.pathname.match(/^\/query\/(\d+)\/?$/);
  return queryMatch ? parseInt(queryMatch[1]) : undefined;
};