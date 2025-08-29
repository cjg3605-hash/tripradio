/**
 * 팟캐스트 생성 E2E 사용자 여정 테스트
 * Playwright를 사용한 실제 브라우저 환경 테스트
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import { chromium, firefox, webkit } from '@playwright/test';

test.describe('Podcast Generation User Journey', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeEach(async () => {
    context = await chromium.launchPersistentContext('./test-user-data', {
      headless: process.env.CI === 'true',
      viewport: { width: 1280, height: 720 },
      permissions: ['microphone', 'notifications']
    });
    page = await context.newPage();
    
    // 콘솔 에러 모니터링
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`브라우저 콘솔 에러: ${msg.text()}`);
      }
    });

    // 네트워크 에러 모니터링
    page.on('response', response => {
      if (!response.ok() && response.status() >= 500) {
        console.error(`네트워크 에러: ${response.status()} ${response.url()}`);
      }
    });
  });

  test.afterEach(async () => {
    await context.close();
  });

  test.describe('핵심 사용자 여정', () => {
    test('사용자가 팟캐스트를 처음부터 끝까지 생성하고 재생', async () => {
      // 1. 홈페이지 방문
      await page.goto('/');
      await expect(page).toHaveTitle(/TripRadio.AI/);
      
      // 2. 검색 박스에 박물관명 입력
      const searchBox = page.getByPlaceholder(/어디로 떠나고 싶으신가요/);
      await expect(searchBox).toBeVisible();
      await searchBox.fill('국립중앙박물관');
      
      // 3. 자동완성 결과 대기 및 선택
      await page.waitForSelector('[data-testid="autocomplete-item"]', { timeout: 10000 });
      await page.click('[data-testid="autocomplete-item"]:first-child');
      
      // 4. 가이드 페이지로 이동 확인
      await page.waitForURL(/\/guide\//, { timeout: 15000 });
      await expect(page.locator('h1')).toContainText('국립중앙박물관');
      
      // 5. 팟캐스트 생성 버튼 찾기 및 클릭
      const podcastButton = page.getByText(/팟캐스트 생성|순차 팟캐스트/);
      await expect(podcastButton).toBeVisible({ timeout: 10000 });
      await podcastButton.click();
      
      // 6. 팟캐스트 생성 모달/섹션 확인
      const podcastSection = page.locator('[data-testid="podcast-generator"]').or(
        page.locator('.podcast-generator')
      );
      await expect(podcastSection).toBeVisible();
      
      // 7. 생성 설정 확인 (우선순위, 청중 수준, 스타일)
      const prioritySelect = page.locator('select').first();
      await expect(prioritySelect).toBeVisible();
      
      // 8. 팟캐스트 생성 시작
      const generateButton = page.getByText(/생성|시작/);
      await generateButton.click();
      
      // 9. 생성 진행 상황 모니터링
      const progressBar = page.locator('[data-testid="progress-bar"]').or(
        page.locator('.progress, .loading')
      );
      await expect(progressBar).toBeVisible({ timeout: 5000 });
      
      // 10. 진행률 업데이트 확인
      await page.waitForFunction(() => {
        const progressText = document.querySelector('[data-testid="progress-text"]')?.textContent;
        return progressText && (
          progressText.includes('생성') || 
          progressText.includes('진행') || 
          progressText.includes('%')
        );
      }, { timeout: 10000 });
      
      // 11. 완료 대기 (최대 2분)
      await expect(page.getByText(/완료|재생/)).toBeVisible({ timeout: 120000 });
      
      // 12. 재생 버튼 확인 및 클릭
      const playButton = page.getByRole('button').filter({ hasText: /재생|play/i });
      await expect(playButton).toBeVisible();
      await playButton.click();
      
      // 13. 오디오 재생 확인
      await page.waitForFunction(() => {
        const audio = document.querySelector('audio');
        return audio && !audio.paused;
      }, { timeout: 10000 });
      
      // 14. 세그먼트 정보 확인
      const segmentInfo = page.getByText(/세그먼트 \d+ \/ \d+/);
      await expect(segmentInfo).toBeVisible();
      
      // 15. 다음 세그먼트 버튼 테스트
      const nextButton = page.getByRole('button', { name: /다음|next/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(2000); // 세그먼트 전환 대기
      }
    });

    test('모바일 환경에서의 팟캐스트 생성 및 재생', async () => {
      // 모바일 뷰포트 설정
      await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
      
      await page.goto('/');
      
      // 모바일에서 메뉴 토글이 필요할 수 있음
      const menuToggle = page.getByRole('button', { name: /menu|메뉴/i });
      if (await menuToggle.isVisible()) {
        await menuToggle.click();
      }
      
      // 나머지 단계는 데스크톱과 유사하지만 모바일 UI 고려
      const searchBox = page.getByPlaceholder(/어디로 떠나고 싶으신가요/);
      await searchBox.fill('경복궁');
      
      await page.waitForSelector('[data-testid="autocomplete-item"]');
      await page.click('[data-testid="autocomplete-item"]:first-child');
      
      await page.waitForURL(/\/guide\//);
      
      // 모바일에서는 스크롤이 필요할 수 있음
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      const podcastButton = page.getByText(/팟캐스트/);
      await expect(podcastButton).toBeVisible();
      await podcastButton.click();
      
      // 모바일에서 팟캐스트 생성 확인
      const generateButton = page.getByText(/생성/);
      await generateButton.click();
      
      await expect(page.getByText(/생성 중/)).toBeVisible();
      await expect(page.getByText(/완료|재생/)).toBeVisible({ timeout: 120000 });
    });
  });

  test.describe('에러 시나리오 사용자 경험', () => {
    test('네트워크 에러 시 사용자에게 적절한 피드백 제공', async () => {
      // 네트워크 요청 인터셉트하여 에러 시뮬레이션
      await page.route('**/api/tts/notebooklm/generate', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );
      
      await page.goto('/');
      const searchBox = page.getByPlaceholder(/어디로 떠나고 싶으신가요/);
      await searchBox.fill('테스트 박물관');
      
      // 자동완성이 로딩되지 않더라도 엔터로 검색 가능해야 함
      await searchBox.press('Enter');
      
      // 에러 메시지 확인
      const errorMessage = page.getByText(/오류|실패|에러|연결/);
      await expect(errorMessage).toBeVisible({ timeout: 15000 });
      
      // 재시도 버튼 확인
      const retryButton = page.getByText(/재시도|다시/);
      if (await retryButton.isVisible()) {
        await expect(retryButton).toBeEnabled();
      }
    });

    test('생성 중 브라우저 새로고침 시 상태 복구', async () => {
      await page.goto('/');
      
      // 팟캐스트 생성 시작
      const searchBox = page.getByPlaceholder(/어디로 떠나고 싶으신가요/);
      await searchBox.fill('덕수궁');
      await page.press('[placeholder*="어디로"]', 'Enter');
      
      await page.waitForURL(/\/guide\//);
      
      const podcastButton = page.getByText(/팟캐스트/);
      await podcastButton.click();
      
      const generateButton = page.getByText(/생성/);
      await generateButton.click();
      
      // 생성이 시작된 후 새로고침
      await expect(page.getByText(/생성 중/)).toBeVisible();
      await page.reload();
      
      // 새로고침 후 상태 확인
      // 진행 중인 작업이 있으면 표시되어야 함
      const statusIndicator = page.locator('.generating, .in-progress, [data-status="generating"]');
      
      // 완료된 팟캐스트가 있으면 재생 버튼이 보여야 함
      const playButton = page.getByRole('button', { name: /재생/i });
      
      // 둘 중 하나는 보여야 함
      await expect(statusIndicator.or(playButton)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('접근성 테스트', () => {
    test('키보드 탐색으로 전체 워크플로우 수행', async () => {
      await page.goto('/');
      
      // Tab 키로 검색 박스까지 이동
      let tabCount = 0;
      while (tabCount < 10) {
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        const placeholder = await focusedElement.getAttribute('placeholder');
        if (placeholder && placeholder.includes('어디로')) {
          break;
        }
        tabCount++;
      }
      
      // 검색어 입력
      await page.keyboard.type('국립현대미술관');
      await page.keyboard.press('Enter');
      
      // 결과 페이지에서 Tab으로 팟캐스트 버튼 찾기
      await page.waitForURL(/\/guide\//);
      
      // 팟캐스트 버튼까지 Tab으로 이동
      tabCount = 0;
      while (tabCount < 20) {
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        const text = await focusedElement.textContent();
        if (text && text.includes('팟캐스트')) {
          await page.keyboard.press('Enter');
          break;
        }
        tabCount++;
      }
      
      // 생성 버튼도 키보드로 클릭
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // 완료 후 재생도 키보드로
      await expect(page.getByText(/완료|재생/)).toBeVisible({ timeout: 120000 });
      await page.keyboard.press('Tab');
      await page.keyboard.press('Space'); // 재생 버튼은 보통 Space로 활성화
    });

    test('스크린 리더를 위한 ARIA 레이블 확인', async () => {
      await page.goto('/');
      
      const searchBox = page.getByRole('searchbox').or(
        page.locator('input[aria-label*="검색"]')
      );
      await expect(searchBox).toBeVisible();
      
      // 팟캐스트 섹션의 접근성 확인
      const searchInput = page.getByPlaceholder(/어디로 떠나고 싶으신가요/);
      await searchInput.fill('테스트 박물관');
      await searchInput.press('Enter');
      
      await page.waitForURL(/\/guide\//);
      
      // 팟캐스트 영역의 ARIA 레이블 확인
      const podcastSection = page.locator('[role="main"]').or(
        page.locator('[aria-label*="팟캐스트"]')
      );
      await expect(podcastSection).toBeVisible();
      
      // 버튼들의 접근성 레이블 확인
      const buttons = page.getByRole('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const ariaLabel = await button.getAttribute('aria-label');
          const text = await button.textContent();
          
          // 버튼은 aria-label이나 텍스트 중 하나는 있어야 함
          expect(ariaLabel || text).toBeTruthy();
        }
      }
    });
  });

  test.describe('크로스 브라우저 호환성', () => {
    test('Firefox에서의 팟캐스트 생성', async () => {
      // Firefox 컨텍스트로 전환
      await context.close();
      context = await firefox.launchPersistentContext('./test-user-data-firefox', {
        headless: process.env.CI === 'true'
      });
      page = await context.newPage();
      
      await page.goto('/');
      
      const searchBox = page.getByPlaceholder(/어디로 떠나고 싶으신가요/);
      await searchBox.fill('국립민속박물관');
      await searchBox.press('Enter');
      
      await page.waitForURL(/\/guide\//);
      
      const podcastButton = page.getByText(/팟캐스트/);
      await podcastButton.click();
      
      const generateButton = page.getByText(/생성/);
      await generateButton.click();
      
      // Firefox에서도 정상 동작 확인
      await expect(page.getByText(/생성 중/)).toBeVisible();
      await expect(page.getByText(/완료|재생/)).toBeVisible({ timeout: 120000 });
    });

    test('Safari WebKit에서의 팟캐스트 재생', async () => {
      if (process.platform !== 'darwin') {
        test.skip('Safari는 macOS에서만 테스트 가능');
      }
      
      await context.close();
      context = await webkit.launchPersistentContext('./test-user-data-webkit', {
        headless: process.env.CI === 'true'
      });
      page = await context.newPage();
      
      await page.goto('/');
      
      const searchBox = page.getByPlaceholder(/어디로 떠나고 싶으신가요/);
      await searchBox.fill('창경궁');
      await searchBox.press('Enter');
      
      await page.waitForURL(/\/guide\//);
      
      const podcastButton = page.getByText(/팟캐스트/);
      await podcastButton.click();
      
      const generateButton = page.getByText(/생성/);
      await generateButton.click();
      
      await expect(page.getByText(/완료|재생/)).toBeVisible({ timeout: 120000 });
      
      const playButton = page.getByRole('button', { name: /재생/i });
      await playButton.click();
      
      // WebKit에서 오디오 재생 확인
      await page.waitForFunction(() => {
        const audio = document.querySelector('audio');
        return audio && !audio.paused;
      }, { timeout: 10000 });
    });
  });
});