import { test, expect } from '@playwright/test';

test.describe('Baroboard Homepage', () => {
  test('should display sidebar with query list', async ({ page }) => {
    await page.goto('/');
    
    // 좌측 사이드바의 Query List 확인
    await expect(page.locator('h2').filter({ hasText: 'Query List' })).toBeVisible();
    
    // 쿼리 항목들이 표시되는지 확인
    await expect(page.locator('li').filter({ hasText: 'Query 1' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Query 2' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Query 3' })).toBeVisible();
  });

  test('should display n8n chatbot iframe', async ({ page }) => {
    await page.goto('/');
    
    // 우측 n8n 챗봇 확인
    await expect(page.locator('h2').filter({ hasText: 'n8n Chatbot' })).toBeVisible();
    
    // iframe이 표시되는지 확인
    await expect(page.locator('iframe[title="n8n Chatbot"]')).toBeVisible();
  });

  test('should show graph when query is clicked', async ({ page }) => {
    await page.goto('/');
    
    // Query 1 클릭
    await page.locator('li').filter({ hasText: 'Query 1' }).click();
    
    // 그래프가 표시되는지 확인
    await expect(page.locator('h2').filter({ hasText: 'Graph' })).toBeVisible();
    
    // 임시 데이터가 표시되는지 확인
    await expect(page.locator('pre')).toBeVisible();
    await expect(page.locator('pre')).toContainText('query');
    await expect(page.locator('pre')).toContainText('Query 1');
  });

  test('should update graph data when different queries are clicked', async ({ page }) => {
    await page.goto('/');
    
    // Query 1 클릭 후 데이터 확인
    await page.locator('li').filter({ hasText: 'Query 1' }).click();
    await expect(page.locator('pre')).toContainText('Query 1');
    
    // Query 2 클릭 후 데이터 변경 확인
    await page.locator('li').filter({ hasText: 'Query 2' }).click();
    await expect(page.locator('pre')).toContainText('Query 2');
    
    // Query 3 클릭 후 데이터 변경 확인
    await page.locator('li').filter({ hasText: 'Query 3' }).click();
    await expect(page.locator('pre')).toContainText('Query 3');
  });

  test('should have proper layout structure', async ({ page }) => {
    await page.goto('/');
    
    // 전체 레이아웃이 flex 구조인지 확인
    const layoutDiv = page.locator('body > div').first();
    await expect(layoutDiv).toHaveCSS('display', 'flex');
    await expect(layoutDiv).toHaveCSS('height', '100vh');
    
    // 사이드바 너비 확인
    const sidebar = page.locator('div').filter({ hasText: 'Query List' }).first();
    await expect(sidebar).toHaveCSS('width', '250px');
    
    // 챗봇 너비 확인
    const chatbot = page.locator('div').filter({ hasText: 'n8n Chatbot' }).first();
    await expect(chatbot).toHaveCSS('width', '300px');
  });
}); 