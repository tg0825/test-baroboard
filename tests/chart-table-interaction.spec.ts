import { test, expect } from '@playwright/test';

test.describe('Chart and Table Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 후 특정 쿼리로 이동
    await page.goto('/login');
    await page.goto('/query/795');
    
    // 데이터 로딩 완료까지 대기
    await page.waitForSelector('[data-testid="chart-card"]', { timeout: 15000 });
    await page.waitForSelector('[data-testid="table-card"]', { timeout: 15000 });
  });

  test('should display separate chart and table cards', async ({ page }) => {
    // 차트 카드 확인
    const chartCard = page.locator('[data-testid="chart-card"]');
    await expect(chartCard).toBeVisible();
    await expect(chartCard).toContainText('📈 데이터 차트');
    
    // 테이블 카드 확인
    const tableCard = page.locator('[data-testid="table-card"]');
    await expect(tableCard).toBeVisible();
    await expect(tableCard).toContainText('📋 데이터 테이블');
    
    // AI 분석 카드 확인
    const aiCard = page.locator('[data-testid="ai-analysis-card"]');
    await expect(aiCard).toBeVisible();
    await expect(aiCard).toContainText('🤖 AI 분석');
  });

  test('should show default selected columns in table headers', async ({ page }) => {
    // 테이블이 로드될 때까지 대기
    await page.waitForSelector('table', { timeout: 10000 });
    
    // X축으로 선택된 컬럼 확인
    const xAxisColumn = page.locator('th.bg-blue-100');
    await expect(xAxisColumn).toBeVisible();
    await expect(xAxisColumn).toContainText('📊');
    
    // Y축으로 선택된 컬럼 확인
    const yAxisColumn = page.locator('th.bg-green-100');
    await expect(yAxisColumn).toBeVisible();
    await expect(yAxisColumn).toContainText('📈');
  });

  test('should change chart axes when clicking table columns', async ({ page }) => {
    // 테이블 컬럼이 로드될 때까지 대기
    await page.waitForSelector('table th', { timeout: 10000 });
    
    // 현재 선택된 X축 컬럼 확인
    const currentXAxis = page.locator('th.bg-blue-100').first();
    const initialXAxisText = await currentXAxis.textContent();
    
    // 다른 컬럼 클릭 (X축 변경)
    const otherColumn = page.locator('table th').nth(2); // 세 번째 컬럼
    await otherColumn.click();
    
    // 새로운 X축 컬럼이 하이라이트되었는지 확인
    await expect(otherColumn).toHaveClass(/bg-blue-100/);
    
    // 이전 컬럼에서 하이라이트가 제거되었는지 확인
    const newCurrentXAxis = page.locator('th.bg-blue-100').first();
    const newXAxisText = await newCurrentXAxis.textContent();
    expect(newXAxisText).not.toBe(initialXAxisText);
  });

  test('should change Y-axis when Shift+clicking table columns', async ({ page }) => {
    // 숫자 컬럼만 Y축으로 선택 가능한지 테스트
    await page.waitForSelector('table th', { timeout: 10000 });
    
    // 현재 Y축 컬럼 확인
    const currentYAxis = page.locator('th.bg-green-100').first();
    
    // Shift + 클릭으로 Y축 변경
    const numberColumn = page.locator('table th').filter({ hasText: /\d/ }).first();
    await numberColumn.click({ modifiers: ['Shift'] });
    
    // Y축이 변경되었는지 확인
    await expect(numberColumn).toHaveClass(/bg-green-100/);
  });

  test('should display appropriate chart type based on data', async ({ page }) => {
    // 차트가 렌더링될 때까지 대기
    await page.waitForSelector('[data-testid="chart-renderer"]', { timeout: 10000 });
    
    // 차트 컨테이너가 존재하는지 확인
    const chartContainer = page.locator('[data-testid="chart-renderer"]');
    await expect(chartContainer).toBeVisible();
    
    // SVG나 Canvas 요소가 있는지 확인 (차트 라이브러리에 따라)
    const chartElement = page.locator('[data-testid="chart-renderer"] canvas, [data-testid="chart-renderer"] svg');
    await expect(chartElement).toBeVisible();
  });

  test('should handle pagination correctly', async ({ page }) => {
    // 페이지네이션이 있는 경우에만 테스트
    const pagination = page.locator('[data-testid="pagination"]');
    
    if (await pagination.isVisible()) {
      // 현재 페이지 확인
      const currentPage = page.locator('[data-testid="current-page"]');
      await expect(currentPage).toContainText('1');
      
      // 다음 페이지 버튼 클릭
      const nextButton = page.locator('[data-testid="next-page"]');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        
        // 페이지가 변경되었는지 확인
        await expect(currentPage).toContainText('2');
        
        // 테이블 내용이 변경되었는지 확인
        await page.waitForSelector('table tbody tr', { timeout: 5000 });
      }
    }
  });

  test('should handle table scrolling for large data', async ({ page }) => {
    // 테이블 스크롤 컨테이너 확인
    const tableContainer = page.locator('[data-testid="table-container"]');
    await expect(tableContainer).toBeVisible();
    
    // 스크롤이 가능한지 확인 (최대 높이 설정)
    const tableBox = await tableContainer.boundingBox();
    expect(tableBox?.height).toBeLessThan(800); // 최대 높이 제한 확인
    
    // 스크롤 테스트
    await tableContainer.hover();
    await page.mouse.wheel(0, 200);
    
    // 헤더가 고정되어 있는지 확인
    const tableHeader = page.locator('table thead');
    await expect(tableHeader).toBeVisible();
  });

  test('should display loading states correctly', async ({ page }) => {
    // 새로운 쿼리로 이동하여 로딩 상태 확인
    await page.goto('/query/1049');
    
    // 차트 로딩 스피너 확인
    const chartLoading = page.locator('[data-testid="chart-loading"]');
    await expect(chartLoading).toBeVisible();
    await expect(chartLoading).toContainText('차트 로딩 중');
    
    // 테이블 로딩 스피너 확인
    const tableLoading = page.locator('[data-testid="table-loading"]');
    await expect(tableLoading).toBeVisible();
    await expect(tableLoading).toContainText('테이블 로딩 중');
    
    // 로딩 완료 후 실제 내용 표시 확인
    await page.waitForSelector('[data-testid="chart-content"]', { timeout: 15000 });
    await page.waitForSelector('[data-testid="table-content"]', { timeout: 15000 });
  });
});
