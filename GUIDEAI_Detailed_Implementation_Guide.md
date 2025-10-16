# 🎯 **GUIDEAI 프로젝트 상세 구현 가이드**

## 📋 **우선순위별 구체적 개선 방안**

---

## 🔥 **HIGH 우선순위 - 즉시 실행 (1-2주)**

### 1. 🔒 **보안 강화 - CSP 헤더 구현**

#### **문제점**
- `dangerouslySetInnerHTML` 5곳 사용으로 XSS 공격 위험
- CSP(Content Security Policy) 헤더 미적용

#### **구체적 구현 방법**

**Step 1: CSP 미들웨어 생성**
```typescript
// src/middleware/security.ts
import { NextResponse } from 'next/server';

export function addSecurityHeaders(response: NextResponse) {
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://generativelanguage.googleapis.com https://api.openai.com;
    frame-src 'self' https://www.google.com;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  return response;
}
```

**Step 2: middleware.ts 수정**
```typescript
// middleware.ts
import { addSecurityHeaders } from './src/middleware/security';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // 기존 인증 로직...
  
  // 보안 헤더 추가
  return addSecurityHeaders(response);
}
```

**Step 3: dangerouslySetInnerHTML 대체**
```typescript
// Before (위험)
<script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

// After (안전)
// src/components/seo/SafeStructuredData.tsx
import Script from 'next/script';

export function SafeStructuredData({ data }: { data: object }) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      strategy="beforeInteractive"
    >
      {JSON.stringify(data)}
    </Script>
  );
}
```

---

### 2. 🛡️ **Rate Limiting 강화**

#### **문제점**
- AI API 호출에 대한 체계적인 Rate Limiting 부족
- 사용자별 제한 없음

#### **구체적 구현 방법**

**Step 1: Redis 기반 Rate Limiter 생성**
```typescript
// src/lib/security/advanced-rate-limiter.ts
import { Redis } from '@vercel/kv';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class AdvancedRateLimiter {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }

  async checkLimit(
    key: string, 
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const window = Math.floor(now / config.windowMs);
    const redisKey = `rate_limit:${key}:${window}`;
    
    const current = await this.redis.incr(redisKey);
    
    if (current === 1) {
      await this.redis.expire(redisKey, Math.ceil(config.windowMs / 1000));
    }
    
    const remaining = Math.max(0, config.maxRequests - current);
    const resetTime = (window + 1) * config.windowMs;
    
    return {
      allowed: current <= config.maxRequests,
      remaining,
      resetTime
    };
  }
}

// 사용 예시
export const rateLimitConfigs = {
  'api/ai/generate-guide': {
    windowMs: 60 * 1000, // 1분
    maxRequests: 5, // 1분에 5번
  },
  'api/ai/generate-tts': {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },
  'api/locations/search': {
    windowMs: 60 * 1000,
    maxRequests: 30,
  }
};
```

**Step 2: API 라우트에 적용**
```typescript
// src/app/api/ai/generate-guide-with-gemini/route.ts
import { AdvancedRateLimiter, rateLimitConfigs } from '@/lib/security/advanced-rate-limiter';

const rateLimiter = new AdvancedRateLimiter();

export async function POST(request: Request) {
  // IP 기반 제한
  const clientIP = request.headers.get('x-forwarded-for') || 'anonymous';
  const ipLimit = await rateLimiter.checkLimit(
    `ip:${clientIP}`,
    rateLimitConfigs['api/ai/generate-guide']
  );
  
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', resetTime: ipLimit.resetTime },
      { status: 429 }
    );
  }
  
  // 사용자별 제한 (로그인한 경우)
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const userLimit = await rateLimiter.checkLimit(
      `user:${session.user.email}`,
      { windowMs: 24 * 60 * 60 * 1000, maxRequests: 50 } // 하루 50번
    );
    
    if (!userLimit.allowed) {
      return NextResponse.json(
        { error: 'Daily limit exceeded', resetTime: userLimit.resetTime },
        { status: 429 }
      );
    }
  }
  
  // 기존 로직...
}
```

---

### 3. 🧹 **프로덕션 로그 레벨링**

#### **문제점**
- 1,059개의 console.log가 프로덕션에서도 실행
- 민감한 정보 노출 위험

#### **구체적 구현 방법**

**Step 1: 구조화된 로깅 시스템**
```typescript
// src/lib/logging/structured-logger.ts
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: string;
  requestId?: string;
  component?: string;
}

export class StructuredLogger {
  private level: LogLevel;
  private isProduction: boolean;
  
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.level = this.isProduction ? LogLevel.WARN : LogLevel.DEBUG;
  }
  
  private log(level: LogLevel, message: string, data?: any, component?: string) {
    if (level > this.level) return;
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: this.sanitizeData(data),
      component
    };
    
    if (this.isProduction && level <= LogLevel.WARN) {
      // 프로덕션에서는 외부 로깅 서비스로 전송
      this.sendToLoggingService(entry);
    } else {
      console.log(JSON.stringify(entry, null, 2));
    }
  }
  
  private sanitizeData(data: any): any {
    if (!data) return data;
    
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'apiKey'];
    const sanitized = { ...data };
    
    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
  
  error(message: string, error?: Error, component?: string) {
    this.log(LogLevel.ERROR, message, { error: error?.stack }, component);
  }
  
  warn(message: string, data?: any, component?: string) {
    this.log(LogLevel.WARN, message, data, component);
  }
  
  info(message: string, data?: any, component?: string) {
    this.log(LogLevel.INFO, message, data, component);
  }
  
  debug(message: string, data?: any, component?: string) {
    this.log(LogLevel.DEBUG, message, data, component);
  }
}

export const logger = new StructuredLogger();
```

**Step 2: 기존 console.log 대체**
```typescript
// Before
console.log('🔄 새로운 가이드 로드 필요', { language, locationName });
console.error('초기 가이드 처리 오류:', error);

// After
import { logger } from '@/lib/logging/structured-logger';

logger.info('새로운 가이드 로드 필요', { language, locationName }, 'MultiLangGuideClient');
logger.error('초기 가이드 처리 오류', error, 'MultiLangGuideClient');
```

**Step 3: ESLint 규칙 추가**
```json
// .eslintrc.json
{
  "rules": {
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "prefer-const": "error"
  }
}
```

---

## ⚡ **MEDIUM 우선순위 - 단기 (1달)**

### 4. 📊 **성능 모니터링 시스템**

#### **문제점**
- Core Web Vitals 모니터링 없음
- 번들 크기 추적 없음
- 실제 사용자 성능 데이터 부족

#### **구체적 구현 방법**

**Step 1: Web Vitals 모니터링**
```typescript
// src/lib/monitoring/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

interface VitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export function trackWebVitals() {
  function sendToAnalytics(metric: VitalsMetric) {
    // Google Analytics 4로 전송
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }
    
    // 내부 분석 API로도 전송
    fetch('/api/monitoring/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
    }).catch(console.error);
  }
  
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
```

**Step 2: 번들 분석 도구**
```bash
# package.json에 추가
npm install --save-dev @next/bundle-analyzer

# next.config.js 수정
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // 기존 설정...
});

# 분석 실행
ANALYZE=true npm run build
```

**Step 3: 실시간 모니터링 대시보드**
```typescript
// src/app/monitoring/performance/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  averageLCP: number;
  averageFID: number;
  averageCLS: number;
  bundleSize: number;
  loadTime: number;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  
  useEffect(() => {
    fetch('/api/monitoring/performance-summary')
      .then(res => res.json())
      .then(setMetrics);
  }, []);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">성능 모니터링 대시보드</h1>
      
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard 
            title="LCP" 
            value={`${metrics.averageLCP}ms`}
            status={metrics.averageLCP < 2500 ? 'good' : 'poor'}
          />
          <MetricCard 
            title="FID" 
            value={`${metrics.averageFID}ms`}
            status={metrics.averageFID < 100 ? 'good' : 'poor'}
          />
          <MetricCard 
            title="CLS" 
            value={metrics.averageCLS.toFixed(3)}
            status={metrics.averageCLS < 0.1 ? 'good' : 'poor'}
          />
          <MetricCard 
            title="Bundle Size" 
            value={`${(metrics.bundleSize / 1024).toFixed(1)}KB`}
            status={metrics.bundleSize < 500 * 1024 ? 'good' : 'poor'}
          />
          <MetricCard 
            title="Load Time" 
            value={`${metrics.loadTime}ms`}
            status={metrics.loadTime < 3000 ? 'good' : 'poor'}
          />
        </div>
      )}
    </div>
  );
}
```

---

### 5. 🧪 **테스트 커버리지 시스템**

#### **문제점**
- 테스트 코드 전무
- 코드 변경 시 영향도 파악 어려움
- 회귀 버그 발생 위험

#### **구체적 구현 방법**

**Step 1: Jest 및 Testing Library 설정**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

**Step 2: 핵심 컴포넌트 테스트 작성**
```typescript
// src/components/__tests__/MultiLangGuideClient.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiLangGuideClient } from '../MultiLangGuideClient';

// Mock dependencies
jest.mock('@/lib/ai/gemini', () => ({
  generateGuide: jest.fn().mockResolvedValue({
    overview: { title: 'Test Guide' },
    route: { steps: [] }
  })
}));

describe('MultiLangGuideClient', () => {
  it('사용자가 언어를 변경할 수 있다', async () => {
    const user = userEvent.setup();
    
    render(
      <MultiLangGuideClient 
        locationName="테스트 위치"
        initialGuide={null}
        requestedLanguage="ko"
      />
    );
    
    // 언어 선택 버튼 클릭
    const languageButton = screen.getByRole('button', { name: /언어 선택/ });
    await user.click(languageButton);
    
    // 영어 선택
    const englishOption = screen.getByRole('menuitem', { name: /English/ });
    await user.click(englishOption);
    
    // 영어 가이드 로딩 확인
    await waitFor(() => {
      expect(screen.getByText(/Loading English guide/)).toBeInTheDocument();
    });
  });
  
  it('가이드 로딩 실패 시 에러 메시지를 표시한다', async () => {
    // generateGuide 모킹으로 에러 발생
    jest.mocked(generateGuide).mockRejectedValueOnce(new Error('API Error'));
    
    render(
      <MultiLangGuideClient 
        locationName="테스트 위치"
        initialGuide={null}
        requestedLanguage="ko"
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/가이드 로딩 중 오류가 발생했습니다/)).toBeInTheDocument();
    });
  });
});
```

**Step 3: API 테스트**
```typescript
// src/app/api/ai/generate-guide-with-gemini/__tests__/route.test.ts
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock external dependencies
jest.mock('@google/generative-ai');
jest.mock('@/lib/supabaseClient');

describe('/api/ai/generate-guide-with-gemini', () => {
  it('유효한 요청으로 가이드를 생성한다', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai/generate-guide-with-gemini', {
      method: 'POST',
      body: JSON.stringify({
        locationName: '경복궁',
        language: 'ko',
        userProfile: { ageGroup: '30대' }
      }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.overview.title).toBeDefined();
  });
  
  it('필수 파라미터 누락 시 400 에러를 반환한다', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai/generate-guide-with-gemini', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(400);
  });
});
```

---

## 🔧 **코드 품질 개선 - 컴포넌트 분리**

### 6. 🧩 **대형 컴포넌트 분해**

#### **문제점**
- `MultiLangGuideClient.tsx`: 505라인으로 과도하게 복잡
- `auth/signin/page.tsx`: 1000+라인
- 단일 책임 원칙 위반

#### **구체적 구현 방법**

**Step 1: MultiLangGuideClient 분해**
```typescript
// src/app/guide/[location]/components/GuideHeader.tsx
interface GuideHeaderProps {
  locationName: string;
  currentLanguage: string;
  availableLanguages: string[];
  onLanguageChange: (language: string) => void;
  isLoading: boolean;
}

export function GuideHeader({ 
  locationName, 
  currentLanguage, 
  availableLanguages, 
  onLanguageChange, 
  isLoading 
}: GuideHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-semibold text-gray-900">
            {locationName}
          </h1>
          <LanguageSelector
            currentLanguage={currentLanguage}
            availableLanguages={availableLanguages}
            onChange={onLanguageChange}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
```

```typescript
// src/app/guide/[location]/components/GuideContent.tsx
interface GuideContentProps {
  guideData: GuideData | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function GuideContent({ guideData, isLoading, error, onRetry }: GuideContentProps) {
  if (isLoading) {
    return <GuideLoadingSkeleton />;
  }
  
  if (error) {
    return <GuideErrorState error={error} onRetry={onRetry} />;
  }
  
  if (!guideData) {
    return <GuideEmptyState />;
  }
  
  return (
    <div className="space-y-6">
      <GuideOverview overview={guideData.overview} />
      <GuideRouteMap route={guideData.route} />
      <GuideChapters chapters={guideData.route.steps} />
    </div>
  );
}
```

```typescript
// src/app/guide/[location]/hooks/useGuideState.ts
export function useGuideState(locationName: string, initialGuide: GuideData | null) {
  const [guideData, setGuideData] = useState<GuideData | null>(initialGuide);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  
  const loadGuide = useCallback(async (language: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/generate-multilang-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationName, language }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setGuideData(result.data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [locationName]);
  
  return {
    guideData,
    isLoading,
    error,
    availableLanguages,
    loadGuide,
    setGuideData,
  };
}
```

**Step 2: 리팩토링된 메인 컴포넌트**
```typescript
// src/app/guide/[location]/MultiLangGuideClient.tsx (리팩토링 후)
'use client';

import { useGuideState } from './hooks/useGuideState';
import { useLanguage } from '@/contexts/LanguageContext';
import { GuideHeader } from './components/GuideHeader';
import { GuideContent } from './components/GuideContent';
import { GuideActions } from './components/GuideActions';

interface MultiLangGuideClientProps {
  locationName: string;
  initialGuide: GuideData | null;
  requestedLanguage?: string;
}

export default function MultiLangGuideClient({
  locationName,
  initialGuide,
  requestedLanguage
}: MultiLangGuideClientProps) {
  const { currentLanguage, setLanguage } = useLanguage();
  const {
    guideData,
    isLoading,
    error,
    availableLanguages,
    loadGuide
  } = useGuideState(locationName, initialGuide);
  
  const handleLanguageChange = useCallback((language: string) => {
    setLanguage(language);
    loadGuide(language);
  }, [setLanguage, loadGuide]);
  
  const handleRetry = useCallback(() => {
    loadGuide(currentLanguage);
  }, [loadGuide, currentLanguage]);
  
  // 초기 로딩 로직...
  
  return (
    <div className="min-h-screen bg-gray-50">
      <GuideHeader
        locationName={locationName}
        currentLanguage={currentLanguage}
        availableLanguages={availableLanguages}
        onLanguageChange={handleLanguageChange}
        isLoading={isLoading}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <GuideContent
          guideData={guideData}
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
        />
        
        {guideData && (
          <GuideActions
            guideData={guideData}
            locationName={locationName}
            language={currentLanguage}
          />
        )}
      </main>
    </div>
  );
}
```

---

## 📱 **중기 개선사항 (3달)**

### 7. 🏗️ **아키텍처 개선 - 마이크로서비스 도입**

#### **현재 문제점**
- 모든 기능이 하나의 Next.js 앱에 집중
- AI 가이드 생성이 메인 앱 성능에 영향
- 독립적 확장 어려움

#### **구체적 구현 방안**

**Step 1: 서비스 분리 계획**
```
현재 구조:
┌─────────────────────────────────┐
│         GUIDEAI App             │
│  ┌─────────────────────────────┐│
│  │    Web Interface            ││
│  │    API Routes               ││
│  │    AI Guide Generation      ││
│  │    User Management          ││
│  │    File Storage             ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘

목표 구조:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Web Frontend  │  │  AI Service     │  │  User Service   │
│   (Next.js)     │  │  (FastAPI)      │  │  (Node.js)      │
│                 │  │                 │  │                 │
│  - UI/UX        │  │  - Guide Gen    │  │  - Auth         │
│  - Routing      │  │  - TTS          │  │  - Profiles     │
│  - Client State │  │  - Coordinates  │  │  - History      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
              ┌─────────────────────────────┐
              │     API Gateway             │
              │   - Authentication          │
              │   - Rate Limiting           │
              │   - Load Balancing          │
              └─────────────────────────────┘
```

**Step 2: AI 서비스 분리**
```python
# ai-service/main.py (FastAPI 서비스)
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import google.generativeai as genai
import asyncio
from typing import Optional

app = FastAPI(title="GUIDEAI AI Service", version="1.0.0")

class GuideRequest(BaseModel):
    location_name: str
    language: str
    user_profile: dict
    coordinates: Optional[dict] = None

class GuideResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    processing_time: float

@app.post("/generate-guide", response_model=GuideResponse)
async def generate_guide(request: GuideRequest):
    start_time = time.time()
    
    try:
        # AI 가이드 생성 로직
        guide_data = await generate_ai_guide(
            location=request.location_name,
            language=request.language,
            profile=request.user_profile
        )
        
        processing_time = time.time() - start_time
        
        return GuideResponse(
            success=True,
            data=guide_data,
            processing_time=processing_time
        )
        
    except Exception as e:
        return GuideResponse(
            success=False,
            error=str(e),
            processing_time=time.time() - start_time
        )

# 성능 최적화
@app.middleware("http")
async def add_process_time_header(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

**Step 3: API Gateway 구성**
```typescript
// api-gateway/src/index.ts
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from './middleware/auth';

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // 최대 100 요청
});

app.use(limiter);
app.use(express.json());

// AI 서비스 프록시
app.use('/api/ai', 
  authenticateToken,
  createProxyMiddleware({
    target: process.env.AI_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/ai': ''
    },
    onError: (err, req, res) => {
      console.error('AI Service Proxy Error:', err);
      res.status(503).json({ error: 'AI Service Unavailable' });
    }
  })
);

// 사용자 서비스 프록시
app.use('/api/user',
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/user': ''
    }
  })
);

app.listen(3001, () => {
  console.log('API Gateway running on port 3001');
});
```

---

## 🎯 **구체적 실행 체크리스트**

### **Week 1-2: 보안 강화**
- [ ] CSP 헤더 구현 및 테스트
- [ ] dangerouslySetInnerHTML 제거
- [ ] Rate Limiting 시스템 구축
- [ ] 환경변수 검증 시스템
- [ ] 로그 레벨링 시스템 구현

### **Week 3-4: 성능 최적화**
- [ ] Web Vitals 모니터링 설정
- [ ] 번들 분석 도구 설정
- [ ] 이미지 최적화 적용
- [ ] 캐싱 전략 개선
- [ ] 성능 모니터링 대시보드

### **Month 2: 테스트 및 품질**
- [ ] Jest 및 Testing Library 설정
- [ ] 핵심 컴포넌트 테스트 작성
- [ ] API 엔드포인트 테스트
- [ ] E2E 테스트 Playwright 설정
- [ ] CI/CD 파이프라인 테스트 통합

### **Month 3: 아키텍처 개선**
- [ ] 컴포넌트 분리 및 리팩토링
- [ ] 커스텀 훅 추출
- [ ] 상태 관리 중앙화
- [ ] 에러 바운더리 구현
- [ ] 마이크로서비스 계획 수립

---

## 📈 **성공 지표 (KPI)**

### **보안 지표**
- XSS 취약점: 0개
- API Rate Limiting 적용률: 100%
- 민감정보 로그 노출: 0건

### **성능 지표**
- LCP (Largest Contentful Paint): < 2.5초
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- 번들 크기: < 500KB (gzipped)

### **품질 지표**
- 테스트 커버리지: > 70%
- TypeScript 에러: 0개
- ESLint 경고: < 10개
- 컴포넌트 평균 크기: < 300라인

### **사용자 경험 지표**
- 가이드 생성 성공률: > 95%
- 평균 응답 시간: < 3초
- 사용자 만족도: > 4.0/5.0
- 오류 발생률: < 1%

---

**이 가이드를 통해 GUIDEAI 프로젝트를 엔터프라이즈급 품질로 발전시킬 수 있습니다. 각 단계별로 체계적으로 진행하여 안정적이고 확장 가능한 시스템을 구축하시기 바랍니다.**