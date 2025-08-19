import { test, expect } from '@playwright/test';

test.describe('LNB Navigation and Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.goto('/');
    
    // LNB 데이터 로딩 완료까지 대기
    await page.waitForSelector('[data-testid="lnb-container"]', { timeout: 10000 });
  });

  test('should display query list in LNB', async ({ page }) => {
    // LNB 컨테이너 확인
    const lnb = page.locator('[data-testid="lnb-container"]');
    await expect(lnb).toBeVisible();
    
    // 쿼리 목록 제목 확인
    await expect(page.locator('h2')).toContainText('쿼리 목록');
    
    // 쿼리 아이템들이 표시되는지 확인
    const queryItems = page.locator('[data-testid="lnb-item"]');
    await expect(queryItems.first()).toBeVisible();
    
    // 각 아이템에 ID와 제목이 표시되는지 확인
    const firstItem = queryItems.first();
    await expect(firstItem).toContainText('#'); // ID 표시
  });

  test('should highlight selected query in LNB', async ({ page }) => {
    // 첫 번째 쿼리 클릭
    const firstQuery = page.locator('[data-testid="lnb-item"]').first();
    await firstQuery.click();
    
    // 선택된 아이템이 하이라이트되었는지 확인
    await expect(firstQuery).toHaveClass(/bg-primary/);
    await expect(firstQuery).toContainText('✓'); // 체크 아이콘
    
    // 다른 쿼리 클릭
    const secondQuery = page.locator('[data-testid="lnb-item"]').nth(1);
    await secondQuery.click();
    
    // 새로운 아이템이 하이라이트되고 이전 아이템은 해제되었는지 확인
    await expect(secondQuery).toHaveClass(/bg-primary/);
    await expect(firstQuery).not.toHaveClass(/bg-primary/);
  });

  test('should change URL when LNB item is clicked', async ({ page }) => {
    // 특정 쿼리 클릭
    const queryItem = page.locator('[data-testid="lnb-item"]').first();
    
    // 쿼리 ID 추출 (data-query-id 속성 등에서)
    const queryId = await queryItem.getAttribute('data-query-id');
    
    await queryItem.click();
    
    // URL이 변경되었는지 확인
    if (queryId) {
      await expect(page).toHaveURL(`/query/${queryId}`);
    } else {
      await expect(page).toHaveURL(/\/query\/\d+/);
    }
  });

  test('should update dashboard title when query is selected', async ({ page }) => {
    // 쿼리 선택
    const queryItem = page.locator('[data-testid="lnb-item"]').first();
    const queryName = await queryItem.locator('[data-testid="query-name"]').textContent();
    
    await queryItem.click();
    
    // 대시보드 제목이 업데이트되었는지 확인
    const dashboardTitle = page.locator('[data-testid="dashboard-title"]');
    if (queryName) {
      await expect(dashboardTitle).toContainText(queryName);
    }
    await expect(dashboardTitle).toContainText('대시보드 -');
  });

  test('should handle LNB search functionality', async ({ page }) => {
    // 검색 입력 필드가 있는지 확인
    const searchInput = page.locator('[data-testid="lnb-search"]');
    
    if (await searchInput.isVisible()) {
      // 검색어 입력
      await searchInput.fill('분석');
      
      // 필터링된 결과만 표시되는지 확인
      const queryItems = page.locator('[data-testid="lnb-item"]');
      const visibleItems = await queryItems.all();
      
      for (const item of visibleItems) {
        const text = await item.textContent();
        expect(text?.toLowerCase()).toContain('분석');
      }
      
      // 검색어 지우기
      await searchInput.clear();
      
      // 모든 아이템이 다시 표시되는지 확인
      await expect(queryItems.first()).toBeVisible();
    }
  });

  test('should handle LNB pagination', async ({ page }) => {
    // 페이지네이션이 있는지 확인
    const pagination = page.locator('[data-testid="lnb-pagination"]');
    
    if (await pagination.isVisible()) {
      // 현재 페이지 정보 확인
      const pageInfo = page.locator('[data-testid="page-info"]');
      await expect(pageInfo).toBeVisible();
      
      // 다음 페이지 버튼 클릭 (활성화된 경우)
      const nextButton = page.locator('[data-testid="next-page-btn"]');
      if (await nextButton.isEnabled()) {
        const initialItems = await page.locator('[data-testid="lnb-item"]').all();
        
        await nextButton.click();
        
        // 페이지 로딩 대기
        await page.waitForTimeout(1000);
        
        // 다른 아이템들이 로드되었는지 확인
        const newItems = await page.locator('[data-testid="lnb-item"]').all();
        expect(newItems.length).toBeGreaterThan(0);
      }
    }
  });

  test('should maintain selection across page refreshes', async ({ page }) => {
    // 쿼리 선택
    const firstQuery = page.locator('[data-testid="lnb-item"]').first();
    await firstQuery.click();
    
    // URL 확인
    const currentUrl = page.url();
    
    // 페이지 새로고침
    await page.reload();
    
    // LNB 로딩 대기
    await page.waitForSelector('[data-testid="lnb-container"]', { timeout: 10000 });
    
    // URL이 유지되고 해당 아이템이 여전히 선택되어 있는지 확인
    expect(page.url()).toBe(currentUrl);
    
    // 선택된 아이템 하이라이트 확인 (해당 ID를 가진 아이템)
    const urlMatch = currentUrl.match(/\/query\/(\d+)/);
    if (urlMatch) {
      const queryId = urlMatch[1];
      const selectedItem = page.locator(`[data-testid="lnb-item-${queryId}"]`);
      await expect(selectedItem).toHaveClass(/bg-primary/);
    }
  });

  test('should handle mobile responsiveness', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // 모바일에서 햄버거 메뉴 버튼 확인
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-toggle"]');
    await expect(mobileMenuButton).toBeVisible();
    
    // LNB가 기본적으로 숨겨져 있는지 확인
    const lnb = page.locator('[data-testid="lnb-container"]');
    await expect(lnb).toHaveClass(/hidden/);
    
    // 햄버거 메뉴 클릭
    await mobileMenuButton.click();
    
    // LNB가 표시되었는지 확인
    await expect(lnb).not.toHaveClass(/hidden/);
    
    // 쿼리 선택 후 메뉴가 자동으로 닫히는지 확인
    const firstQuery = page.locator('[data-testid="lnb-item"]').first();
    await firstQuery.click();
    
    await expect(lnb).toHaveClass(/hidden/);
  });

  test('should display query metadata correctly', async ({ page }) => {
    // 첫 번째 쿼리 확인
    const firstQuery = page.locator('[data-testid="lnb-item"]').first();
    
    // ID 표시 확인
    await expect(firstQuery.locator('[data-testid="query-id"]')).toBeVisible();
    
    // 제목 표시 확인
    await expect(firstQuery.locator('[data-testid="query-name"]')).toBeVisible();
    
    // 타입 표시 확인 (있는 경우)
    const queryType = firstQuery.locator('[data-testid="query-type"]');
    if (await queryType.isVisible()) {
      await expect(queryType).toContainText(/분석|보고서|대시보드/);
    }
    
    // 업데이트 시간 표시 확인 (있는 경우)
    const updateTime = firstQuery.locator('[data-testid="query-updated"]');
    if (await updateTime.isVisible()) {
      const timeText = await updateTime.textContent();
      expect(timeText).toMatch(/\d{4}-\d{2}-\d{2}|\d+분 전|\d+시간 전/);
    }
  });
});
