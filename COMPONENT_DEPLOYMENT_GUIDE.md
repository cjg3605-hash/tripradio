# 🦋 NAVI - Component & Deployment Guide
*Next.js 14 App Router 기반 컴포넌트 아키텍처 및 배포 가이드*

## 📋 목차
1. 컴포넌트 아키텍처
2. 페이지 구조
3. UI 컴포넌트 시스템
4. 배포 환경 설정
5. CI/CD 파이프라인

---

## 🏞️ 컴포넌트 아키텍처

### 실제 폴더 구조 (src 기준)
```
src/
├── app/
│   ├── api/                  # API Routes
│   ├── guide/
│   │   └── [location]/
│   │       ├── page.tsx      # 3페이지 가이드
│   │       └── tour/
│   │           ├── page.tsx
│   │           └── components/
│   │               └── TourContent.tsx
│   ├── my-guide/             # 오프라인 가이드
│   ├── mypage/               # 마이페이지
│   ├── auth/                 # 인증
│   └── layout.tsx            # 글로벌 레이아웃
├── components/
│   ├── home/                 # 홈/검색(SearchBox)
│   ├── layout/               # 헤더, 사이드바 등
│   ├── setup/                # API키 설정
│   └── guide/                # 지도, 경로 등
├── lib/
│   ├── ai/                   # AI 프롬프트, Gemini API
│   ├── cache/                # 로컬스토리지 등
│   └── hooks/                # 커스텀 훅
├── types/                    # 타입 정의
└── public/                   # 정적 파일, PWA, 다국어 리소스
```

### 설계 원칙
- **단일 책임**: 하나의 컴포넌트는 하나의 역할만 담당
- **재사용성**: 최소 2곳 이상에서 쓰이는 컴포넌트만 분리
- **조합**: 작은 컴포넌트 조합으로 복잡한 UI 구성
- **TypeScript**: 모든 props/state 타입 정의 필수
- **이벤트 네이밍**: handle+EventName (예: handleClick)

---

## 🏠 페이지 구조

### 1. 홈(/)
```typescript
// src/app/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            🦋 <span className="text-indigo-600">NAVI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI가 만드는 개인 맞춤 관광 가이드
          </p>
          <SearchBox />
        </div>
      </section>
    </main>
  );
}
```

### 2. 가이드 페이지(/guide/[location])
```typescript
// src/app/guide/[location]/page.tsx
'use client';

export default function GuidePage({ params }: { params: { location: string } }) {
  // ...탭/가이드 데이터 상태 관리
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 탭 네비게이션, 탭별 컨텐츠 */}
    </div>
  );
}
```

### 3. 실시간 투어(/guide/[location]/tour)
```typescript
// src/app/guide/[location]/tour/page.tsx
export default function TourPage({ params }: { params: { location: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <TourContent locationName={decodeURIComponent(params.location)} />
    </div>
  );
}
```

---

## 🎨 UI 컴포넌트 시스템

### 1. 헤더 컴포넌트
```typescript
// src/components/layout/Header.tsx
export default function Header() {
  const handleLogoClick = () => {
    window.location.href = '/';
  };
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <button onClick={handleLogoClick} className="text-2xl font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0">
          <img src="/NAVI.png" alt="NAVI 로고" width="60" height="60" className="object-contain -mr-4 -translate-y-1.5" />
          <span>NAVI</span>
        </button>
        {/* 네비게이션 메뉴 */}
      </div>
    </header>
  );
}
```

### 2. 검색박스 컴포넌트
```typescript
// src/components/home/SearchBox.tsx
export default function SearchBox() {
  // ...query, isLoading 상태
  // ...handleSearch 함수
  return (
    <form /* ... */>
      <input /* ... */ />
      <button /* ... */>검색</button>
    </form>
  );
}
```

### 3. 투어 컨텐츠 컴포넌트
```typescript
// src/app/guide/[location]/tour/components/TourContent.tsx
export default function TourContent({ locationName }: { locationName: string }) {
  // ...currentChapter, guideData, isLoading 상태
  // ...챕터 이동/표시 로직
  return (
    <div className="min-h-screen">
      {/* 진행률 바, 챕터 컨텐츠, 네비게이션 */}
    </div>
  );
}
```

---

## 🛫 배포 환경 설정
- **Vercel** 권장
- 환경변수: GEMINI_API_KEY, NEXTAUTH_SECRET 등
- PWA, 오프라인 지원 자동 적용

---

## ⚙️ CI/CD 파이프라인
- Vercel 자동 배포 (push/PR 시)
- 빌드/테스트/타입체크 자동화

---

## 📝 기타
- 실제 props, 타입, 구조는 src/components, src/app/guide 등 코드 참고
- 더 이상 없는 컴포넌트/폴더/props/설명은 문서에서 삭제함