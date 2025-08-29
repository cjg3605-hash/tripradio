/** @type {import('jest').Config} */
const config = {
  displayName: 'TripRadio.AI Tests',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/types/**/*'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/lib/ai/podcast/': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  testTimeout: 120000, // 2분 타임아웃 (팟캐스트 생성용)
  maxWorkers: process.env.CI ? 2 : 4,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: ['<rootDir>/tests/**/unit/*.test.ts'],
      testTimeout: 30000
    },
    {
      displayName: 'Integration Tests',
      testMatch: ['<rootDir>/tests/**/integration/*.test.ts'],
      testTimeout: 120000,
      maxWorkers: 1 // DB 경합 방지
    },
    {
      displayName: 'Performance Tests',
      testMatch: ['<rootDir>/tests/**/performance/*.test.ts'],
      testTimeout: 180000,
      maxWorkers: 1
    },
    {
      displayName: 'Failure Scenarios',
      testMatch: ['<rootDir>/tests/**/failure/*.test.ts'],
      testTimeout: 150000,
      maxWorkers: 1
    }
  ],
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test-reports',
      filename: 'report.html',
      openReport: false,
      expand: true
    }],
    ['jest-junit', {
      outputDirectory: './test-reports',
      outputName: 'junit.xml',
      ancestorSeparator: ' › ',
      uniqueOutputName: false
    }]
  ],
  globalSetup: '<rootDir>/tests/global-setup.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.ts'
};

module.exports = config;