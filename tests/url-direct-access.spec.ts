import { test, expect } from '@playwright/test';

test.describe('URL Direct Access', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 상태 모킹 (실제 환경에 맞게 조정)
    await page.goto('/login');
    // 로그인 로직 추가 필요 시 여기에
  });

  test('should load specific query when accessing /query/795 directly', async ({ page }) => {
    // 직접 URL 접근
    await page.goto('/query/795');
    
    // 로딩이 완료될 때까지 기다림
    await page.waitForSelector('[data-testid="dashboard-title"]', { timeout: 10000 });
    
    // 대시보드 제목에 해당 ID가 포함되어 있는지 확인
    const dashboardTitle = page.locator('h1');
    await expect(dashboardTitle).toContainText('795');
    
    // LNB에서 해당 아이템이 하이라이트되어 있는지 확인
    const highlightedItem = page.locator('[data-testid="lnb-item-795"]');
    await expect(highlightedItem).toHaveClass(/bg-primary/);
    
    // API 호출이 시작되었는지 확인 (로딩 스피너)
    const loadingSpinner = page.locator('.animate-spin');
    await expect(loadingSpinner).toBeVisible();
  });

  test('should handle non-existent query ID gracefully', async ({ page }) => {
    // 존재하지 않는 ID로 접근
    await page.goto('/query/999999');
    
    // 에러 페이지가 아닌 정상 페이지가 로드되는지 확인
    await expect(page.locator('h1')).toContainText('대시보드');
    
    // 더미 데이터로라도 표시되는지 확인
    await expect(page.locator('h1')).toContainText('999999');
  });

  test('should maintain URL when navigating with browser buttons', async ({ page }) => {
    // 첫 번째 쿼리로 이동
    await page.goto('/query/795');
    await page.waitForLoadState('networkidle');
    
    // LNB에서 다른 쿼리 클릭 (첫 번째 아이템)
    const firstQuery = page.locator('[data-testid="lnb-item"]').first();
    await firstQuery.click();
    
    // URL이 변경되었는지 확인
    await expect(page).toHaveURL(/\/query\/\d+/);
    
    // 뒤로가기 버튼
    await page.goBack();
    await expect(page).toHaveURL('/query/795');
    
    // 앞으로가기 버튼
    await page.goForward();
    await expect(page).not.toHaveURL('/query/795');
  });

  test('should work with different query IDs', async ({ page }) => {
    const testIds = ['795', '1049', '1234'];
    
    for (const id of testIds) {
      await page.goto(`/query/${id}`);
      
      // 각 ID에 대해 정상 로드되는지 확인
      await expect(page.locator('h1')).toContainText(id);
      
      // URL이 올바른지 확인
      await expect(page).toHaveURL(`/query/${id}`);
    }
  });
});
