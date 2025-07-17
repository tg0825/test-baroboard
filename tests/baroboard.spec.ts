import { test, expect } from '@playwright/test';

test.describe('Baroboard', () => {
  test('should display GNB with correct styling', async ({ page }) => {
    await page.goto('/');
    
    // GNB가 표시되는지 확인
    const gnb = page.locator('nav');
    await expect(gnb).toBeVisible();
    
    // 바로보드 제목 확인
    await expect(page.locator('h1').filter({ hasText: '바로보드' })).toBeVisible();
    
    // AInity4 로고 확인
    await expect(page.locator('span').filter({ hasText: 'AInity' })).toBeVisible();
    await expect(page.locator('span').filter({ hasText: '4' })).toBeVisible();
  });

  test('should display sidebar with query list', async ({ page }) => {
    await page.goto('/');
    
    // 사이드바의 쿼리 목록 제목 확인
    await expect(page.locator('h2').filter({ hasText: '쿼리 목록' })).toBeVisible();
    
    // 쿼리 항목들이 표시되는지 확인 (처음 몇 개)
    const queryItems = page.locator('li').filter({ hasText: '사용자 행동 분석' });
    await expect(queryItems.first()).toBeVisible();
  });

  test('should show default message when no query is selected', async ({ page }) => {
    await page.goto('/');
    
    // 기본 메시지가 표시되는지 확인
    await expect(page.locator('text=좌측에서 쿼리를 선택하세요')).toBeVisible();
    await expect(page.locator('text=📊')).toBeVisible();
  });

  test('should display graph when query is clicked', async ({ page }) => {
    await page.goto('/');
    
    // 첫 번째 쿼리 클릭
    const firstQuery = page.locator('li').filter({ hasText: '사용자 행동 분석' }).first();
    await firstQuery.click();
    
    // 그래프 컨테이너가 표시되는지 확인
    await expect(page.locator('h2').filter({ hasText: '쿼리 결과' })).toBeVisible();
    
    // 쿼리 정보 카드가 표시되는지 확인
    await expect(page.locator('h3').filter({ hasText: '쿼리 정보' })).toBeVisible();
  });

  test('should display floating chatbot button', async ({ page }) => {
    await page.goto('/');
    
    // 플로팅 챗봇 버튼 확인
    const chatbotButton = page.locator('button').filter({ hasText: '💬' });
    await expect(chatbotButton).toBeVisible();
    
    // 버튼 클릭 시 채팅창이 열리는지 확인
    await chatbotButton.click();
    await expect(page.locator('text=AI 어시스턴트')).toBeVisible();
    
    // 닫기 버튼으로 채팅창 닫기
    const closeButton = page.locator('button').filter({ hasText: '✕' }).last();
    await closeButton.click();
  });

  test('should display footer with current date', async ({ page }) => {
    await page.goto('/');
    
    // 푸터가 표시되는지 확인
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // 현재 날짜가 표시되는지 확인 (YYYY-MM-DD 형식)
    const dateRegex = /\d{4}-\d{2}-\d{2}/;
    await expect(footer).toContainText(dateRegex);
  });

  test('should have responsive layout for different screen sizes', async ({ page }) => {
    // 데스크톱 뷰
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    
    // 사이드바가 보이는지 확인
    await expect(page.locator('h2').filter({ hasText: '쿼리 목록' })).toBeVisible();
    
    // 모바일 뷰
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // 햄버거 메뉴 버튼이 보이는지 확인
    await expect(page.locator('button').filter({ hasText: '☰' })).toBeVisible();
  });

  test('should handle query type filtering', async ({ page }) => {
    await page.goto('/');
    
    // 다양한 타입의 쿼리들이 있는지 확인
    const queryItems = page.locator('li').filter({ hasText: '사용자 행동 분석' });
    
    // 첫 번째 쿼리 클릭
    await queryItems.first().click();
    
    // 쿼리 타입이 표시되는지 확인 (분석, 보고서, 대시보드 중 하나)
    const typeIndicators = page.locator('span').filter({ hasText: /^(분석|보고서|대시보드)$/ });
    await expect(typeIndicators.first()).toBeVisible();
  });

  test('should maintain container width limit', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 800 });
    await page.goto('/');
    
    // 첫 번째 쿼리 클릭하여 컨테이너 활성화
    const firstQuery = page.locator('li').filter({ hasText: '사용자 행동 분석' }).first();
    await firstQuery.click();
    
    // 컨테이너의 최대 너비가 1024px로 제한되는지 확인
    const container = page.locator('.max-w-\\[1024px\\]').first();
    await expect(container).toBeVisible();
  });
}); 