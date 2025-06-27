# 🦋 NAVI - Component & Deployment Guide
*Next.js 14 앱 라우터 기반 컴포넌트 아키텍처 및 배포 가이드*

## 📋 목차
1. [컴포넌트 아키텍처](#컴포넌트-아키텍처)
2. [페이지 구조](#페이지-구조)
3. [UI 컴포넌트 시스템](#ui-컴포넌트-시스템)
4. [배포 환경 설정](#배포-환경-설정)
5. [CI/CD 파이프라인](#cicd-파이프라인)
6. [모니터링 및 운영](#모니터링-및-운영)

## 🏗️ 컴포넌트 아키텍처

### 현재 구현된 폴더 구조 ✅

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API Routes
│   │   ├── ai/
│   │   │   └── generate-guide/
│   │   ├── health/
│   │   └── locations/
│   ├── auth/              # 인증 페이지
│   │   └── signin/
│   ├── guide/             # 메인 가이드 기능
│   │   └── [location]/    # 동적 라우팅
│   │       ├── page.tsx   # 3페이지 탭 구조
│   │       └── tour/      # 실시간 가이드
│   ├── mypage/           # 사용자 페이지
│   ├── globals.css       # 글로벌 스타일
│   ├── layout.tsx        # 루트 레이아웃
│   └── page.tsx          # 홈페이지
├── components/            # 재사용 컴포넌트
│   ├── home/             # 홈 전용
│   │   └── SearchBox.tsx
│   ├── layout/           # 레이아웃 컴포넌트
│   │   ├── ClientLayout.tsx
│   │   └── Header.tsx    # NAVI 로고 헤더
│   ├── setup/            # 설정 컴포넌트
│   │   └── ApiKeySetup.tsx
│   ├── tour/             # 투어 컴포넌트
│   └── ui/               # 기본 UI 컴포넌트
└── lib/                  # 유틸리티 및 라이브러리
    ├── ai/               # AI 관련
    │   ├── gemini.ts
    │   └── prompts.ts
    └── cache/            # 캐싱 시스템
        └── localStorage.ts
```

### 컴포넌트 설계 원칙 ✅

```typescript
// 1. 단일 책임 원칙
interface ComponentPrinciples {
  singleResponsibility: '하나의 컴포넌트는 하나의 기능만';
  reusability: '최소 2곳 이상에서 사용되는 컴포넌트만 분리';
  composition: '작은 컴포넌트들의 조합으로 복잡한 UI 구성';
  typeScript: '모든 props와 state는 타입 정의 필수';
}

// 2. 네이밍 컨벤션
const NAMING_CONVENTION = {
  components: 'PascalCase (예: SearchBox)',
  files: 'PascalCase.tsx',
  props: 'camelCase',
  events: 'handle + EventName (예: handleSearch)',
  constants: 'UPPER_SNAKE_CASE'
};
```

## 📱 페이지 구조

### 1. 홈페이지 (/) ✅

```typescript
// src/app/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* 히어로 섹션 */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            🦋 <span className="text-indigo-600">NAVI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI가 만드는 개인 맞춤 관광 가이드
          </p>
          
          {/* 검색 박스 */}
          <SearchBox />
          
          {/* 특징 소개 */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <FeatureCard 
              icon="🎭" 
              title="알함브라급 스토리텔링"
              description="전문 가이드 수준의 드라마틱한 이야기"
            />
            <FeatureCard 
              icon="📖" 
              title="3페이지 완벽 구조"
              description="개요 → 관람동선 → 실시간가이드"
            />
            <FeatureCard 
              icon="🤖" 
              title="100% AI 맞춤 생성"
              description="당신만을 위한 개인화된 가이드"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
```

### 2. 가이드 페이지 (/guide/[location]) ✅

```typescript
// src/app/guide/[location]/page.tsx
'use client';

export default function GuidePage({ 
  params 
}: { 
  params: { location: string } 
}) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [guideData, setGuideData] = useState<GuideData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const tabs: Tab[] = [
    { id: 'overview', label: '개요', icon: '📖' },
    { id: 'route', label: '관람동선', icon: '🗺️' },
    { id: 'realtime', label: '실시간가이드', icon: '🎭' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 */}
      <TabNavigation 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {/* 메인 콘텐츠 */}
      <main className="p-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <TabContent 
            activeTab={activeTab}
            guideData={guideData}
          />
        )}
      </main>
    </div>
  );
}
```

### 3. 실시간 투어 페이지 (/guide/[location]/tour) ✅

```typescript
// src/app/guide/[location]/tour/page.tsx
export default function TourPage({ 
  params 
}: { 
  params: { location: string } 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <TourContent locationName={decodeURIComponent(params.location)} />
    </div>
  );
}
```

## 🎨 UI 컴포넌트 시스템

### 1. 헤더 컴포넌트 ✅

```typescript
// src/components/layout/Header.tsx
export default function Header() {
  const handleLogoClick = () => {
    window.location.href = '/';
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* NAVI 로고 */}
        <button 
          onClick={handleLogoClick}
          className="text-2xl font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-0"
        >
          <img 
            src="/NAVI.png" 
            alt="NAVI 로고" 
            width="60" 
            height="60" 
            className="object-contain -mr-4 -translate-y-1.5"
            style={{ filter: 'hue-rotate(-20deg) saturate(1.1) brightness(0.9)' }}
          />
          <span>NAVI</span>
        </button>
        
        {/* 네비게이션 메뉴 */}
        <nav className="hidden md:flex space-x-8">
          <a href="/" className="text-gray-700 hover:text-indigo-600">홈</a>
          <a href="/mypage" className="text-gray-700 hover:text-indigo-600">마이페이지</a>
        </nav>
        
        {/* 모바일 메뉴 버튼 */}
        <button className="md:hidden p-2">
          <MenuIcon />
        </button>
      </div>
    </header>
  );
}
```

### 2. 검색 박스 컴포넌트 ✅

```typescript
// src/components/home/SearchBox.tsx
export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    try {
      // URL 인코딩하여 안전하게 전달
      const encodedQuery = encodeURIComponent(query.trim());
      window.location.href = `/guide/${encodedQuery}`;
    } catch (error) {
      console.error('검색 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="어떤 명소를 탐험하고 싶으신가요? (예: 경복궁, 에펠탑, 타지마할)"
          className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
          disabled={isLoading}
        />
        
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <SearchIcon className="w-5 h-5 mr-2" />
              탐험시작
            </>
          )}
        </button>
      </div>
    </form>
  );
}
```

### 3. 투어 콘텐츠 컴포넌트 ✅

```typescript
// src/app/guide/[location]/tour/components/TourContent.tsx
export default function TourContent({ 
  locationName 
}: { 
  locationName: string 
}) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [guideData, setGuideData] = useState<GuideData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const chapters = guideData?.content.realTimeGuide.chapters || [];
  const currentChapterData = chapters[currentChapter];

  return (
    <div className="min-h-screen">
      {/* 진행률 바 */}
      <ProgressBar 
        current={currentChapter + 1}
        total={chapters.length}
        duration={guideData?.content.realTimeGuide.totalDuration}
      />
      
      {/* 챕터 콘텐츠 */}
      {currentChapterData && (
        <ChapterDisplay 
          chapter={currentChapterData}
          chapterNumber={currentChapter + 1}
        />
      )}
      
      {/* 네비게이션 */}
      <ChapterNavigation
        currentChapter={currentChapter}
        totalChapters={chapters.length}
        onPrevious={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
        onNext={() => setCurrentChapter(Math.min(chapters.length - 1, currentChapter + 1))}
      />
    </div>
  );
}
```

### 4. 공통 UI 컴포넌트

```typescript
// src/components/ui/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-indigo-600 border-t-transparent ${sizeClasses[size]} ${className}`} />
  );
}

// src/components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`
        rounded-lg font-medium transition-colors 
        ${variantClasses[variant]} 
        ${sizeClasses[size]}
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center">
          <LoadingSpinner size="sm" className="mr-2" />
          처리중...
        </div>
      ) : (
        children
      )}
    </button>
  );
}
```

## 🚀 배포 환경 설정

### 1. Vercel 배포 설정 ✅

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "framework": "nextjs",
  "regions": ["icn1"],
  "env": {
    "GEMINI_API_KEY": "@gemini-api-key",
    "NEXT_PUBLIC_APP_URL": "@app-url"
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 2. 환경변수 관리

```bash
# .env.local (로컬 개발)
GEMINI_API_KEY="your-gemini-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# .env.production (프로덕션)
GEMINI_API_KEY="production-gemini-key"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"

# 향후 추가될 환경변수
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
STRIPE_SECRET_KEY="sk_live_..."
AWS_ACCESS_KEY_ID="..."
ELEVENLABS_API_KEY="..."
```

### 3. Next.js 설정

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 이미지 최적화
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // API 타임아웃 설정
  experimental: {
    serverComponentsExternalPackages: ['@google/generative-ai']
  },
  
  // 헤더 설정
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
  
  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: '/tour/:location',
        destination: '/guide/:location/tour',
        permanent: true,
      },
    ];
  }
};

module.exports = nextConfig;
```

### 4. PWA 설정 (향후)

```json
// public/manifest.json
{
  "name": "NAVI - AI 가이드 투어",
  "short_name": "NAVI",
  "description": "AI가 만드는 개인 맞춤 관광 가이드",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4f46e5",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/NAVI.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## 🔄 CI/CD 파이프라인

### 1. GitHub Actions 워크플로우

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linting
        run: npm run lint
        
      - name: Run type checking
        run: npm run type-check
        
      - name: Run tests
        run: npm run test
        
  deploy:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 2. 품질 관리 스크립트

```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "pre-commit": "lint-staged"
  }
}
```

### 3. 자동화된 테스트

```typescript
// __tests__/components/SearchBox.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBox from '@/components/home/SearchBox';

describe('SearchBox Component', () => {
  test('검색 입력 및 제출이 정상 작동한다', async () => {
    render(<SearchBox />);
    
    const input = screen.getByPlaceholderText(/어떤 명소를 탐험하고 싶으신가요/);
    const button = screen.getByText('탐험시작');
    
    fireEvent.change(input, { target: { value: '경복궁' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(window.location.href).toContain('/guide/%EA%B2%BD%EB%B3%B5%EA%B6%81');
    });
  });
  
  test('빈 검색어로는 제출할 수 없다', () => {
    render(<SearchBox />);
    
    const button = screen.getByText('탐험시작');
    expect(button).toBeDisabled();
  });
});

// __tests__/api/generate-guide.test.ts
import { POST } from '@/app/api/ai/generate-guide/route';
import { NextRequest } from 'next/server';

describe('/api/ai/generate-guide', () => {
  test('유효한 요청에 대해 가이드를 생성한다', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai/generate-guide', {
      method: 'POST',
      body: JSON.stringify({
        locationName: '경복궁',
        userProfile: {
          interests: ['역사'],
          ageGroup: '30s'
        }
      })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.content).toBeDefined();
  });
});
```

## 📊 모니터링 및 운영

### 1. 성능 모니터링

```typescript
// src/lib/monitoring/performance.ts
export class PerformanceMonitor {
  static trackPageLoad(pageName: string): void {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        page: pageName,
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
      };
      
      this.sendMetrics(metrics);
    });
  }
  
  static trackAPICall(endpoint: string, duration: number, success: boolean): void {
    const metrics = {
      type: 'api_call',
      endpoint,
      duration,
      success,
      timestamp: Date.now()
    };
    
    this.sendMetrics(metrics);
  }
  
  private static sendMetrics(metrics: any): void {
    // 프로덕션에서는 실제 모니터링 서비스로 전송
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Metrics:', metrics);
    }
  }
}
```

### 2. 오류 추적

```typescript
// src/lib/monitoring/errorTracking.ts
export class ErrorTracker {
  static captureError(error: Error, context?: any): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      context
    };
    
    // 프로덕션에서는 Sentry 등 오류 추적 서비스 사용
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(errorData);
    } else {
      console.error('🚨 Error Captured:', errorData);
    }
  }
  
  static setupGlobalErrorHandlers(): void {
    window.addEventListener('error', (event) => {
      this.captureError(event.error, { type: 'unhandled_error' });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(new Error(event.reason), { type: 'unhandled_promise_rejection' });
    });
  }
}
```

### 3. 사용자 분석 (향후)

```typescript
// src/lib/analytics/userTracking.ts
export class UserAnalytics {
  static trackGuideGeneration(locationName: string, userProfile?: UserProfile): void {
    const event = {
      action: 'guide_generated',
      location: locationName,
      profile: userProfile,
      timestamp: Date.now()
    };
    
    this.sendEvent(event);
  }
  
  static trackPageNavigation(from: string, to: string): void {
    const event = {
      action: 'page_navigation',
      from,
      to,
      timestamp: Date.now()
    };
    
    this.sendEvent(event);
  }
  
  static trackTourCompletion(locationName: string, completedChapters: number): void {
    const event = {
      action: 'tour_completed',
      location: locationName,
      chapters_completed: completedChapters,
      timestamp: Date.now()
    };
    
    this.sendEvent(event);
  }
}
```

---

## 📈 배포 체크리스트

### 프로덕션 배포 전 ✅
- [ ] 환경변수 설정 완료
- [ ] API 키 보안 확인
- [ ] 성능 테스트 통과
- [ ] 모바일 반응형 확인
- [ ] 접근성 테스트 완료
- [ ] SEO 메타태그 설정
- [ ] 오류 처리 검증
- [ ] 캐싱 정책 확인

### 배포 후 모니터링
- [ ] API 응답 시간 체크
- [ ] 오류율 모니터링
- [ ] 사용자 피드백 수집
- [ ] 성능 지표 분석
- [ ] 캐시 효율성 확인

---

## 📝 요약

현재 NAVI는 **Next.js 14 기반의 완성된 프로덕션 아키텍처**를 갖추고 있습니다:

### 현재 완성도 ✅
- 모듈화된 컴포넌트 구조
- 반응형 모바일 UI
- Vercel 배포 준비 완료
- TypeScript 타입 안정성
- 기본 오류 처리 시스템

### 향후 확장 계획 🚀
- PWA 전환 (오프라인 지원)
- 성능 모니터링 시스템
- 자동화된 테스트 커버리지 확대
- 사용자 분석 시스템
- 다국어 지원 아키텍처

**🦋 NAVI - 확장 가능하고 안정적인 프로덕션 아키텍처**