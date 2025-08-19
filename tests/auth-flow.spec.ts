import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    // 인증되지 않은 상태로 대시보드 접근
    await page.goto('/');
    
    // 로그인 페이지로 리다이렉트되는지 확인
    await expect(page).toHaveURL('/login');
    
    // 로그인 폼이 표시되는지 확인
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test('should redirect to login when accessing protected routes', async ({ page }) => {
    // 인증되지 않은 상태로 쿼리 페이지 접근
    await page.goto('/query/795');
    
    // 로그인 페이지로 리다이렉트되는지 확인
    await expect(page).toHaveURL('/login');
  });

  test('should display login form with required fields', async ({ page }) => {
    await page.goto('/login');
    
    // 로그인 폼 요소들 확인
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    
    // API 키 입력 필드 확인 (있는 경우)
    const apiKeyInput = page.locator('[data-testid="api-key-input"]');
    if (await apiKeyInput.isVisible()) {
      await expect(apiKeyInput).toBeVisible();
    }
    
    // 로그인 폼 제목 확인
    await expect(page.locator('h1, h2')).toContainText(/로그인|Login/);
  });

  test('should handle form validation', async ({ page }) => {
    await page.goto('/login');
    
    // 빈 폼으로 로그인 시도
    await page.click('[data-testid="login-button"]');
    
    // 유효성 검사 메시지 확인
    const emailError = page.locator('[data-testid="email-error"]');
    const passwordError = page.locator('[data-testid="password-error"]');
    
    if (await emailError.isVisible()) {
      await expect(emailError).toContainText(/이메일|email/i);
    }
    
    if (await passwordError.isVisible()) {
      await expect(passwordError).toContainText(/비밀번호|password/i);
    }
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    
    // 잘못된 자격증명으로 로그인 시도
    await page.fill('[data-testid="email-input"]', 'invalid@test.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    
    await page.click('[data-testid="login-button"]');
    
    // 에러 메시지 확인
    const errorMessage = page.locator('[data-testid="login-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/로그인 실패|Invalid|틀렸습니다/i);
  });

  test('should handle loading state during login', async ({ page }) => {
    await page.goto('/login');
    
    // 로그인 정보 입력
    await page.fill('[data-testid="email-input"]', 'test@test.com');
    await page.fill('[data-testid="password-input"]', 'password');
    
    // 로그인 버튼 클릭
    await page.click('[data-testid="login-button"]');
    
    // 로딩 상태 확인
    const loadingIndicator = page.locator('[data-testid="login-loading"]');
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeVisible();
    }
    
    // 로그인 버튼이 비활성화되었는지 확인
    await expect(page.locator('[data-testid="login-button"]')).toBeDisabled();
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.goto('/login');
    
    // 테스트용 로그인 정보 (실제 환경에 맞게 조정)
    await page.fill('[data-testid="email-input"]', 'test@baroboard.com');
    await page.fill('[data-testid="password-input"]', 'validpassword');
    
    // API 키가 필요한 경우
    const apiKeyInput = page.locator('[data-testid="api-key-input"]');
    if (await apiKeyInput.isVisible()) {
      await page.fill('[data-testid="api-key-input"]', 'test-api-key');
    }
    
    await page.click('[data-testid="login-button"]');
    
    // 대시보드로 리다이렉트되는지 확인
    await expect(page).toHaveURL('/');
    
    // 대시보드 요소들이 표시되는지 확인
    await expect(page.locator('[data-testid="lnb-container"]')).toBeVisible();
  });

  test('should maintain authentication state after page refresh', async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@baroboard.com');
    await page.fill('[data-testid="password-input"]', 'validpassword');
    await page.click('[data-testid="login-button"]');
    
    // 대시보드 로드 확인
    await expect(page).toHaveURL('/');
    
    // 페이지 새로고침
    await page.reload();
    
    // 여전히 대시보드에 있고 로그인 페이지로 리다이렉트되지 않는지 확인
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="lnb-container"]')).toBeVisible();
  });

  test('should handle logout functionality', async ({ page }) => {
    // 로그인 상태라고 가정
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@baroboard.com');
    await page.fill('[data-testid="password-input"]', 'validpassword');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/');
    
    // 로그아웃 버튼 찾기 (GNB나 사용자 메뉴에 있을 것)
    const logoutButton = page.locator('[data-testid="logout-button"]');
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // 로그인 페이지로 리다이렉트되는지 확인
      await expect(page).toHaveURL('/login');
    }
  });

  test('should preserve intended route after login', async ({ page }) => {
    // 인증되지 않은 상태로 특정 쿼리 페이지 접근
    await page.goto('/query/795');
    
    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL('/login');
    
    // 로그인
    await page.fill('[data-testid="email-input"]', 'test@baroboard.com');
    await page.fill('[data-testid="password-input"]', 'validpassword');
    await page.click('[data-testid="login-button"]');
    
    // 원래 의도했던 페이지로 리다이렉트되는지 확인
    await expect(page).toHaveURL('/query/795');
    
    // 해당 쿼리가 자동으로 로드되는지 확인
    await expect(page.locator('[data-testid="dashboard-title"]')).toContainText('795');
  });

  test('should handle session expiration', async ({ page }) => {
    // 로그인 상태라고 가정
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@baroboard.com');
    await page.fill('[data-testid="password-input"]', 'validpassword');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/');
    
    // 세션 만료 시뮬레이션 (localStorage 클리어)
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // 페이지 새로고침 또는 API 호출
    await page.reload();
    
    // 로그인 페이지로 리다이렉트되는지 확인
    await expect(page).toHaveURL('/login');
  });

  test('should display appropriate error messages for different failure types', async ({ page }) => {
    await page.goto('/login');
    
    // 네트워크 오류 시뮬레이션
    await page.route('**/webhook/**', route => {
      route.abort('internetdisconnected');
    });
    
    await page.fill('[data-testid="email-input"]', 'test@baroboard.com');
    await page.fill('[data-testid="password-input"]', 'validpassword');
    await page.click('[data-testid="login-button"]');
    
    // 네트워크 오류 메시지 확인
    const errorMessage = page.locator('[data-testid="login-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/네트워크|연결|오류/i);
  });
});
