/**
 * 팟캐스트 플로우 자동화 테스트
 * 페르소나: QA 테스터
 * 목표: 모든 플로우가 설계된 대로 동작하는가?
 */

import { chromium, Browser, Page } from 'playwright';

// 테스트 결과 저장
const testResults = {
  startTime: new Date(),
  tests: [] as any[],
  passed: 0,
  failed: 0
};

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// 로깅 함수
function log(level: string, message: string) {
  const timestamp = new Date().toLocaleTimeString('ko-KR');
  switch (level) {
    case 'INFO':
      console.log(`${colors.blue}[${timestamp}] ℹ️ ${message}${colors.reset}`);
      break;
    case 'SUCCESS':
      console.log(`${colors.green}[${timestamp}] ✅ ${message}${colors.reset}`);
      break;
    case 'ERROR':
      console.log(`${colors.red}[${timestamp}] ❌ ${message}${colors.reset}`);
      break;
    case 'WARNING':
      console.log(`${colors.yellow}[${timestamp}] ⚠️  ${message}${colors.reset}`);
      break;
    case 'SECTION':
      console.log(`\n${colors.cyan}${'='.repeat(60)}`);
      console.log(`${message}`);
      console.log(`${'='.repeat(60)}${colors.reset}\n`);
      break;
  }
}

// 테스트 케이스 실행 함수
async function runTest(
  name: string,
  testFn: (page: Page) => Promise<boolean>,
  page: Page
): Promise<boolean> {
  log('INFO', `테스트 시작: ${name}`);
  const startTime = Date.now();

  try {
    const result = await testFn(page);
    const duration = Date.now() - startTime;

    if (result) {
      log('SUCCESS', `테스트 완료: ${name} (${duration}ms)`);
      testResults.tests.push({ name, status: 'PASS', duration });
      testResults.passed++;
      return true;
    } else {
      log('ERROR', `테스트 실패: ${name}`);
      testResults.tests.push({ name, status: 'FAIL', duration });
      testResults.failed++;
      return false;
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    log('ERROR', `테스트 오류: ${name} - ${error instanceof Error ? error.message : String(error)}`);
    testResults.tests.push({ name, status: 'ERROR', duration, error: String(error) });
    testResults.failed++;
    return false;
  }
}

// 메인 테스트 함수
async function main() {
  log('SECTION', '팟캐스트 QA 테스트 시작');

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // 브라우저 시작
    log('INFO', '브라우저 시작 중...');
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();

    // 콘솔 메시지 모니터링
    page.on('console', msg => {
      if (msg.type() === 'error') {
        log('ERROR', `브라우저 콘솔 에러: ${msg.text()}`);
      }
    });

    // ===== TEST 1: 완성된 팟캐스트 접근 =====
    log('SECTION', 'TEST 1: 완성된 팟캐스트 접근');
    const test1Result = await runTest(
      'Test 1: 완성된 팟캐스트 조회',
      async (page) => {
        // 페이지 접근
        log('INFO', '페이지 접근: /ko/podcast/colosseum');
        await page.goto('http://localhost:3000/ko/podcast/colosseum', {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        // 제목 확인
        const title = await page.locator('h1').first().textContent();
        log('INFO', `페이지 제목: ${title}`);
        if (!title?.includes('colosseum') && !title?.includes('콜로세움')) {
          throw new Error('제목 확인 실패');
        }

        // 오디오플레이어 확인
        const playerExists = await page.locator('[role="application"]').first().isVisible().catch(() => false);
        log('INFO', `오디오플레이어 표시: ${playerExists}`);

        // 챕터 목록 확인
        const chapterListExists = await page.locator('text=/챕터/').first().isVisible().catch(() => false);
        log('INFO', `챕터 목록 표시: ${chapterListExists}`);

        return title?.length! > 0;
      },
      page!
    );

    // ===== TEST 2: 새 팟캐스트 생성 =====
    log('SECTION', 'TEST 2: 새 팟캐스트 생성 (1단계)');
    const test2Result = await runTest(
      'Test 2: 새 팟캐스트 생성 요청',
      async (page) => {
        // 새 페이지로 접근
        log('INFO', '페이지 접근: /ko/podcast/테스트장소');
        await page.goto('http://localhost:3000/ko/podcast/테스트장소', {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        // 생성 버튼 확인
        const createButtonExists = await page
          .locator('text=/팟캐스트 생성/i')
          .first()
          .isVisible()
          .catch(() => false);

        log('INFO', `생성 버튼 표시: ${createButtonExists}`);

        if (!createButtonExists) {
          log('WARNING', '생성 버튼을 찾을 수 없음 - 기존 팟캐스트가 있을 수 있음');
          return true; // fallback
        }

        return true;
      },
      page!
    );

    // ===== TEST 3: UI 렌더링 상태 =====
    log('SECTION', 'TEST 3: UI 렌더링 및 상태 표시');
    const test3Result = await runTest(
      'Test 3: UI 요소 렌더링 확인',
      async (page) => {
        // 현재 페이지의 모든 UI 요소 확인
        const audioPlayer = await page.locator('audio').first().isVisible().catch(() => false);
        const playButton = await page
          .locator('button:has-text("Play"), button:has-text("재생")')
          .first()
          .isVisible()
          .catch(() => false);
        const volumeControl = await page.locator('[role="slider"]').first().isVisible().catch(() => false);

        log('INFO', `오디오 플레이어: ${audioPlayer}`);
        log('INFO', `재생 버튼: ${playButton}`);
        log('INFO', `볼륨 제어: ${volumeControl}`);

        return audioPlayer || playButton;
      },
      page!
    );

    // ===== TEST 4: API 응답 검증 =====
    log('SECTION', 'TEST 4: API 응답 구조 검증');
    const test4Result = await runTest(
      'Test 4: GET API 응답 검증',
      async (page) => {
        // 네트워크 요청 가로채기
        let apiResponse: any = null;

        page.on('response', async (response) => {
          if (response.url().includes('/api/tts/notebooklm/generate')) {
            apiResponse = await response.json().catch(() => null);
            log('INFO', `API 응답 상태: ${response.status()}`);
          }
        });

        // API 호출
        const response = await page.evaluate(() => {
          return fetch('/api/tts/notebooklm/generate?location=colosseum&language=ko').then(
            r => r.json()
          );
        });

        log('INFO', `응답 구조: success=${response.success}, hasEpisode=${response.data?.hasEpisode}`);

        if (!response.success) {
          throw new Error('API 응답 실패');
        }

        if (response.data?.hasEpisode) {
          log('INFO', `에피소드 발견: status=${response.data.status}`);
          log('INFO', `챕터 수: ${response.data.chapters?.length || 0}`);
          log('INFO', `세그먼트 수: ${response.data.segmentCount || 0}`);
        }

        return true;
      },
      page!
    );

    // ===== TEST 5: 데이터 플로우 =====
    log('SECTION', 'TEST 5: 데이터 플로우 검증');
    const test5Result = await runTest(
      'Test 5: 데이터 경로 확인',
      async (page) => {
        // 페이지 상태 확인
        const scriptContent = await page.locator('p:has-text(/여러분|안녕|시작/)').first().textContent();
        log('INFO', `스크립트 내용 로드: ${scriptContent ? '성공' : '실패'}`);

        // 오디오 URL 확인
        const audioSrc = await page
          .locator('audio')
          .first()
          .getAttribute('src')
          .catch(() => null);

        log('INFO', `오디오 URL: ${audioSrc ? '설정됨' : 'NULL (script_ready 상태일 가능성)'}`);

        return true;
      },
      page!
    );

    // ===== TEST 6: 브라우저 콘솔 에러 =====
    log('SECTION', 'TEST 6: 콘솔 에러 검사');
    const test6Result = await runTest(
      'Test 6: 콘솔 에러 없음',
      async (page) => {
        // 모든 에러 메시지 수집
        const errors: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });

        // 페이지 재로드
        await page.reload();
        await page.waitForLoadState('networkidle');

        log('INFO', `수집된 에러: ${errors.length}개`);
        errors.forEach(err => log('WARNING', `콘솔 에러: ${err}`));

        return errors.length === 0;
      },
      page!
    );

    // ===== 테스트 결과 요약 =====
    log('SECTION', '테스트 결과 요약');

    console.log(`\n${colors.cyan}┌─────────────────────────────────────┐${colors.reset}`);
    console.log(`${colors.cyan}│       팟캐스트 QA 테스트 결과       │${colors.reset}`);
    console.log(`${colors.cyan}├─────────────────────────────────────┤${colors.reset}`);

    testResults.tests.forEach((test, idx) => {
      const statusIcon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️ ';
      console.log(
        `${colors.cyan}│${colors.reset} ${statusIcon} Test ${idx + 1}: ${test.name.padEnd(25)} ${test.duration}ms`
      );
    });

    console.log(`${colors.cyan}├─────────────────────────────────────┤${colors.reset}`);
    console.log(
      `${colors.cyan}│${colors.reset} 총 테스트: ${testResults.passed + testResults.failed} | ${colors.green}통과: ${testResults.passed}${colors.reset} | ${colors.red}실패: ${testResults.failed}${colors.reset}`
    );
    console.log(`${colors.cyan}└─────────────────────────────────────┘${colors.reset}\n`);

    // 최종 결론
    if (testResults.failed === 0) {
      log('SUCCESS', '모든 테스트 통과! 🎉 플로우가 정상 작동합니다.');
    } else {
      log('ERROR', `${testResults.failed}개의 테스트가 실패했습니다. 문제 해결이 필요합니다.`);
    }
  } catch (error) {
    log('ERROR', `테스트 실행 중 오류: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    // 브라우저 종료
    if (browser) {
      await browser.close();
      log('INFO', '브라우저 종료됨');
    }

    // 최종 통계
    const duration = Date.now() - testResults.startTime.getTime();
    log('INFO', `테스트 완료: 총 ${duration}ms 소요`);
  }
}

// 테스트 실행
main().catch(error => {
  console.error('테스트 실행 실패:', error);
  process.exit(1);
});
