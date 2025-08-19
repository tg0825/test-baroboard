import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 후 메인 페이지로
    await page.goto('/login');
    // 로그인 로직 (실제 환경에 맞게)
    await page.goto('/');
  });

  test('should adapt layout for desktop screens', async ({ page }) => {
    // 큰 데스크톱 해상도
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    
    // LNB가 항상 표시되는지 확인
    const lnb = page.locator('[data-testid="lnb-container"]');
    await expect(lnb).toBeVisible();
    
    // 햄버거 메뉴가 숨겨져 있는지 확인
    const mobileMenu = page.locator('[data-testid="mobile-menu-toggle"]');
    await expect(mobileMenu).toBeHidden();
    
    // LNB 너비가 적절한지 확인
    const lnbBox = await lnb.boundingBox();
    expect(lnbBox?.width).toBeGreaterThan(250);
    expect(lnbBox?.width).toBeLessThan(400);
  });

  test('should adapt layout for tablet screens', async ({ page }) => {
    // 태블릿 해상도
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // LNB가 여전히 표시되는지 확인
    const lnb = page.locator('[data-testid="lnb-container"]');
    await expect(lnb).toBeVisible();
    
    // 레이아웃이 적절히 조정되었는지 확인
    const container = page.locator('[data-testid="main-container"]');
    const containerBox = await container.boundingBox();
    expect(containerBox?.width).toBeLessThan(768);
  });

  test('should adapt layout for mobile screens', async ({ page }) => {
    // 모바일 해상도
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // 햄버거 메뉴 버튼이 표시되는지 확인
    const mobileMenuToggle = page.locator('[data-testid="mobile-menu-toggle"]');
    await expect(mobileMenuToggle).toBeVisible();
    
    // LNB가 기본적으로 숨겨져 있는지 확인
    const lnb = page.locator('[data-testid="lnb-container"]');
    await expect(lnb).toHaveClass(/hidden|translate-x-/);
  });

  test('should handle mobile menu interactions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    const mobileMenuToggle = page.locator('[data-testid="mobile-menu-toggle"]');
    const lnb = page.locator('[data-testid="lnb-container"]');
    
    // 메뉴가 닫혀있는 초기 상태
    await expect(lnb).toHaveClass(/hidden|translate-x-/);
    
    // 햄버거 메뉴 클릭
    await mobileMenuToggle.click();
    
    // LNB가 표시되는지 확인
    await expect(lnb).not.toHaveClass(/hidden/);
    await expect(lnb).toBeVisible();
    
    // 쿼리 선택 후 메뉴가 자동으로 닫히는지 확인
    const firstQuery = page.locator('[data-testid="lnb-item"]').first();
    await firstQuery.click();
    
    await expect(lnb).toHaveClass(/hidden|translate-x-/);
  });

  test('should handle chart responsiveness', async ({ page }) => {
    // 쿼리 선택하여 차트 표시
    const firstQuery = page.locator('[data-testid="lnb-item"]').first();
    await firstQuery.click();
    
    // 차트가 로드될 때까지 대기
    await page.waitForSelector('[data-testid="chart-renderer"]', { timeout: 10000 });
    
    // 데스크톱에서 차트 크기 확인
    await page.setViewportSize({ width: 1200, height: 800 });
    const chartDesktop = page.locator('[data-testid="chart-renderer"]');
    const desktopBox = await chartDesktop.boundingBox();
    
    // 모바일에서 차트 크기 확인
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500); // 레이아웃 조정 대기
    const mobileBox = await chartDesktop.boundingBox();
    
    // 모바일에서 차트가 화면에 맞게 조정되었는지 확인
    expect(mobileBox?.width).toBeLessThan(desktopBox?.width || 0);
    expect(mobileBox?.width).toBeLessThan(375);
  });

  test('should handle table responsiveness', async ({ page }) => {
    // 쿼리 선택하여 테이블 표시
    const firstQuery = page.locator('[data-testid="lnb-item"]').first();
    await firstQuery.click();
    
    // 테이블이 로드될 때까지 대기
    await page.waitForSelector('table', { timeout: 10000 });
    
    // 모바일 뷰에서 테이블 확인
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 테이블이 스크롤 가능한지 확인
    const tableContainer = page.locator('[data-testid="table-container"]');
    await expect(tableContainer).toHaveCSS('overflow-x', 'auto');
    
    // 테이블 헤더가 고정되어 있는지 확인
    const tableHeader = page.locator('table thead');
    await expect(tableHeader).toHaveCSS('position', 'sticky');
  });

  test('should handle text size adjustments', async ({ page }) => {
    const firstQuery = page.locator('[data-testid="lnb-item"]').first();
    await firstQuery.click();
    
    // 데스크톱에서 폰트 크기 확인
    await page.setViewportSize({ width: 1200, height: 800 });
    const titleDesktop = page.locator('[data-testid="dashboard-title"]');
    const desktopFontSize = await titleDesktop.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // 모바일에서 폰트 크기 확인
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileFontSize = await titleDesktop.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // 모바일에서 폰트가 적절히 조정되었는지 확인
    const desktopSize = parseFloat(desktopFontSize);
    const mobileSize = parseFloat(mobileFontSize);
    expect(mobileSize).toBeLessThanOrEqual(desktopSize);
  });

  test('should handle navigation in different screen sizes', async ({ page }) => {
    // 데스크톱에서 네비게이션 테스트
    await page.setViewportSize({ width: 1200, height: 800 });
    
    const firstQuery = page.locator('[data-testid="lnb-item"]').first();
    await firstQuery.click();
    
    // URL 변경 확인
    await expect(page).toHaveURL(/\/query\/\d+/);
    
    // 모바일에서 동일한 테스트
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 햄버거 메뉴 열기
    await page.click('[data-testid="mobile-menu-toggle"]');
    
    // 다른 쿼리 선택
    const secondQuery = page.locator('[data-testid="lnb-item"]').nth(1);
    await secondQuery.click();
    
    // URL이 변경되고 메뉴가 닫혔는지 확인
    await expect(page).toHaveURL(/\/query\/\d+/);
    const lnb = page.locator('[data-testid="lnb-container"]');
    await expect(lnb).toHaveClass(/hidden|translate-x-/);
  });

  test('should handle orientation changes', async ({ page }) => {
    // 세로 모드
    await page.setViewportSize({ width: 375, height: 667 });
    
    const firstQuery = page.locator('[data-testid="lnb-item"]').first();
    await page.click('[data-testid="mobile-menu-toggle"]');
    await firstQuery.click();
    
    // 차트와 테이블이 세로로 배치되는지 확인
    await page.waitForSelector('[data-testid="chart-card"]', { timeout: 10000 });
    const chartCard = page.locator('[data-testid="chart-card"]');
    const tableCard = page.locator('[data-testid="table-card"]');
    
    const chartBox = await chartCard.boundingBox();
    const tableBox = await tableCard.boundingBox();
    
    // 차트가 테이블 위에 있는지 확인
    expect(chartBox?.y).toBeLessThan(tableBox?.y || 0);
    
    // 가로 모드
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500);
    
    // 레이아웃이 가로 모드에 맞게 조정되었는지 확인
    const newChartBox = await chartCard.boundingBox();
    const newTableBox = await tableCard.boundingBox();
    
    // 높이가 줄어들었는지 확인
    expect(newChartBox?.height).toBeLessThan(chartBox?.height || 0);
  });

  test('should handle touch interactions on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 터치로 햄버거 메뉴 열기
    const mobileMenuToggle = page.locator('[data-testid="mobile-menu-toggle"]');
    await mobileMenuToggle.tap();
    
    // LNB가 열렸는지 확인
    const lnb = page.locator('[data-testid="lnb-container"]');
    await expect(lnb).toBeVisible();
    
    // 터치로 쿼리 선택
    const firstQuery = page.locator('[data-testid="lnb-item"]').first();
    await firstQuery.tap();
    
    // 쿼리가 선택되고 메뉴가 닫혔는지 확인
    await expect(page).toHaveURL(/\/query\/\d+/);
    await expect(lnb).toHaveClass(/hidden|translate-x-/);
  });

  test('should handle very small screens', async ({ page }) => {
    // 매우 작은 화면 (예: 작은 모바일)
    await page.setViewportSize({ width: 320, height: 568 });
    await page.reload();
    
    // 기본 요소들이 여전히 표시되고 사용 가능한지 확인
    const mobileMenuToggle = page.locator('[data-testid="mobile-menu-toggle"]');
    await expect(mobileMenuToggle).toBeVisible();
    
    // 햄버거 메뉴 열기
    await mobileMenuToggle.click();
    
    // LNB가 화면을 가득 채우는지 확인
    const lnb = page.locator('[data-testid="lnb-container"]');
    const lnbBox = await lnb.boundingBox();
    expect(lnbBox?.width).toBeLessThanOrEqual(320);
  });

  test('should handle large screens correctly', async ({ page }) => {
    // 매우 큰 화면
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.reload();
    
    // 콘텐츠가 너무 넓게 퍼지지 않는지 확인
    const mainContainer = page.locator('[data-testid="main-container"]');
    const containerBox = await mainContainer.boundingBox();
    
    // 최대 너비 제한이 적용되었는지 확인
    expect(containerBox?.width).toBeLessThan(2560);
    
    // LNB가 적절한 크기를 유지하는지 확인
    const lnb = page.locator('[data-testid="lnb-container"]');
    const lnbBox = await lnb.boundingBox();
    expect(lnbBox?.width).toBeLessThan(500); // 너무 크지 않게
  });
});
