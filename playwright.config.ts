import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 설정 - E2E 테스트용
 * 팟캐스트 생성 사용자 여정 테스트
 */
export default defineConfig({
  testDir: './tests/podcast/e2e',
  
  /* 병렬 테스트 설정 */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  /* 리포터 설정 */
  reporter: [
    ['html', { outputFolder: 'test-reports/playwright-report' }],
    ['junit', { outputFile: 'test-reports/playwright-junit.xml' }],
    ['line']
  ],

  /* 전역 테스트 설정 */
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // 팟캐스트 테스트를 위한 권한
    permissions: ['microphone'],
    
    // 느린 네트워크 시뮬레이션 (선택적)
    // launchOptions: {
    //   slowMo: process.env.CI ? 0 : 100
    // }
  },

  /* 타임아웃 설정 */
  timeout: 120000, // 2분 (팟캐스트 생성 시간 고려)
  expect: { timeout: 30000 }, // 30초 대기

  /* 프로젝트별 설정 */
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'cleanup'
    },
    {
      name: 'cleanup',
      testMatch: /.*\.teardown\.ts/
    },
    
    /* 데스크톱 브라우저 */
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // 더 큰 뷰포트 (팟캐스트 UI 고려)
        viewport: { width: 1440, height: 900 }
      },
      dependencies: ['setup']
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1440, height: 900 }
      },
      dependencies: ['setup']
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1440, height: 900 }
      },
      dependencies: ['setup']
    },

    /* 모바일 브라우저 */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup']
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      dependencies: ['setup']
    },

    /* 태블릿 */
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
      dependencies: ['setup']
    },

    /* 접근성 테스트 전용 프로젝트 */
    {
      name: 'accessibility',
      testMatch: /.*accessibility.*\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        // 고대비 모드, 스크린 리더 시뮬레이션 등
        colorScheme: 'dark',
        reducedMotion: 'reduce'
      },
      dependencies: ['setup']
    },

    /* 성능 테스트 전용 프로젝트 */
    {
      name: 'performance',
      testMatch: /.*performance.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // 느린 네트워크 조건 시뮬레이션
        launchOptions: {
          args: ['--enable-precise-memory-info']
        }
      },
      dependencies: ['setup']
    }
  ],

  /* 개발 서버 설정 */
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      // 테스트 환경 변수
      NODE_ENV: 'test',
      NEXT_PUBLIC_TEST_MODE: 'true'
    }
  },

  /* 글로벌 설정 */
  globalSetup: require.resolve('./tests/playwright-global-setup.ts'),
  globalTeardown: require.resolve('./tests/playwright-global-teardown.ts'),

  /* 테스트 출력 디렉토리 */
  outputDir: 'test-results/',
  
  /* 스크린샷 비교 설정 */
  expect: {
    toHaveScreenshot: { 
      threshold: 0.2, 
      maxDiffPixels: 1000 
    },
    toMatchSnapshot: { 
      threshold: 0.2 
    }
  }
});