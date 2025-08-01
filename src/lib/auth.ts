// 인증 관련 유틸리티 함수들 (레거시 - AuthContext 사용 권장)

/**
 * 로그인 상태를 확인합니다
 */
export const isLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('isLoggedIn') === 'true';
};

/**
 * 현재 로그인된 사용자 이메일을 가져옵니다
 */
export const getCurrentUser = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userEmail');
};

/**
 * 현재 세션 토큰을 가져옵니다
 */
export const getCurrentSession = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userSession');
};

/**
 * 로그아웃을 수행합니다 (레거시 - AuthContext.logout 사용 권장)
 */
export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userSession');
  window.location.href = '/login';
};

/**
 * 인증이 필요한 페이지에서 사용하는 훅 (레거시 - AuthContext 사용 권장)
 */
export const useAuthRedirect = () => {
  if (typeof window !== 'undefined' && !isLoggedIn()) {
    window.location.href = '/login';
  }
};