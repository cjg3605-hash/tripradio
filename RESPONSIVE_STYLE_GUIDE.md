# TripRadio.AI 반응형 디자인 스타일가이드

## 📱 브레이크포인트 정의

### Tailwind CSS 브레이크포인트 (현재 사용 중)
```css
/* 기본 (모바일): 0px+ */
sm: 640px   /* 소형 태블릿 */  
md: 768px   /* 태블릿 */
lg: 1024px  /* 데스크톱 */
xl: 1280px  /* 대형 데스크톱 */
2xl: 1536px /* 초대형 화면 */
```

### 디바이스 분류
- **모바일**: 320px - 640px (기본 스타일)
- **소형 태블릿**: 640px - 768px (sm:)
- **태블릿**: 768px - 1024px (md:)
- **PC**: 1024px+ (lg:)

## 🎨 타이포그래피 시스템

### PC 버전 기준 폰트 크기 (유지)
```css
text-xs: 12px      /* 보조 텍스트 */
text-sm: 14px      /* 작은 텍스트 */
text-base: 16px    /* 기본 텍스트 */
text-lg: 18px      /* 검색 입력 필드 */
text-xl: 20px      /* 중간 제목 */
text-2xl: 24px     /* 큰 제목 */
text-3xl: 30px     /* 히어로 텍스트 */
```

### 모바일/태블릿 반응형 매핑
```css
/* 히어로 섹션 제목 */
PC: text-3xl (30px)
태블릿: text-2xl (24px)  
모바일: text-xl (20px)

/* 검색 입력 */
PC: text-lg (18px)
태블릿: text-base (16px)
모바일: text-base (16px)

/* 버튼 텍스트 */
PC: text-base (16px)
태블릿: text-sm (14px)
모바일: text-sm (14px)

/* 카드 제목 */
PC: text-lg (18px)
태블릿: text-base (16px)
모바일: text-base (16px)
```

## 📏 간격 시스템 (8px Grid)

### 패딩/마진 반응형 규칙
```css
/* 컨테이너 패딩 */
PC: px-8 (32px)
태블릿: px-6 (24px)  
모바일: px-4 (16px)

/* 섹션 간격 */
PC: py-20 (80px)
태블릿: py-16 (64px)
모바일: py-12 (48px)

/* 컴포넌트 내부 패딩 */
PC: p-6 (24px)
태블릿: p-5 (20px)
모바일: p-4 (16px)

/* 요소 간 간격 */
PC: gap-6 (24px)
태블릿: gap-4 (16px)
모바일: gap-3 (12px)
```

## 🎯 컴포넌트별 반응형 규칙

### 히어로 섹션
```css
PC: min-h-[90vh] text-center
태블릿: min-h-[80vh] text-center
모바일: min-h-[70vh] text-center px-4

/* 뱃지 */
PC: px-4 py-2 text-sm rounded-full
태블릿: px-3 py-2 text-sm rounded-full
모바일: px-3 py-1.5 text-xs rounded-full

/* 제목 마진 */
PC: mb-16 mt-16
태블릿: mb-12 mt-12
모바일: mb-8 mt-8
```

### 검색 박스
```css
PC: max-w-2xl border-radius-20px p-2
태블릿: max-w-xl border-radius-18px p-2
모바일: max-w-full border-radius-16px p-3

/* 검색 입력 */
PC: text-lg px-4
태블릿: text-base px-4  
모바일: text-base px-3

/* 검색 버튼 */
PC: px-8 py-3 border-radius-16px
태블릿: px-6 py-2.5 border-radius-14px
모바일: px-4 py-2.5 border-radius-12px
```

### 버튼 시스템
```css
/* Primary 버튼 */
PC: px-8 py-3 text-base rounded-2xl (16px)
태블릿: px-6 py-2.5 text-sm rounded-xl (12px)
모바일: px-4 py-2.5 text-sm rounded-lg (8px)
min-height: 44px (터치 최적화)

/* Secondary 버튼 */
PC: px-6 py-2 text-sm rounded-xl
태블릿: px-4 py-2 text-xs rounded-lg
모바일: px-3 py-2 text-xs rounded-md
```

### 카드 컴포넌트
```css
PC: p-6 rounded-2xl shadow-lg
태블릿: p-5 rounded-xl shadow-md
모바일: p-4 rounded-lg shadow-sm

/* 카드 간격 */
PC: gap-6
태블릿: gap-4
모바일: gap-3
```

### 자동완성 드롭다운
```css
PC: rounded-2xl shadow-2xl border
태블릿: rounded-xl shadow-xl border
모바일: rounded-lg shadow-lg border
       position: fixed (전체 화면 활용)
       bottom: 0 (하단 고정)
```

## 📱 모바일 최적화 규칙

### 터치 최적화
```css
/* 최소 터치 영역 */
min-height: 44px
min-width: 44px

/* 권장 터치 영역 */
min-height: 48px
min-width: 48px
```

### 호버 효과 제거
```css
@media (hover: none) {
  .hover-effect:hover {
    transform: none;
  }
}
```

### 스크롤 최적화
```css
/* 부드러운 스크롤 */
scroll-behavior: smooth;

/* 스크롤 스냅 */
scroll-snap-type: x mandatory;
scroll-snap-align: start;
```

## 🔧 실제 적용 클래스

### 히어로 섹션 반응형 클래스
```tsx
// PC 버전 유지, 모바일/태블릿 추가
className="relative min-h-[90vh] md:min-h-[80vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden"

// 뱃지
className="inline-flex items-center px-4 md:px-3 sm:px-3 py-2 md:py-2 sm:py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 mb-16 md:mb-12 sm:mb-8 mt-16 md:mt-12 sm:mt-8"

// 뱃지 텍스트
className="text-sm md:text-sm sm:text-xs font-medium text-white/90"
```

### 검색 박스 반응형 클래스
```tsx
// 컨테이너
className="relative max-w-2xl md:max-w-xl sm:max-w-full mx-auto mb-12 sm:mb-8 px-0 sm:px-4"

// 검색 폼
className="flex items-center bg-white/95 backdrop-blur shadow-2xl md:shadow-xl sm:shadow-lg border border-white/30 p-2 sm:p-3"
style={{ borderRadius: isMobile ? '16px' : isTablet ? '18px' : '20px' }}

// 검색 입력
className="border-0 bg-transparent text-lg md:text-base sm:text-base placeholder:text-gray-500 focus-visible:ring-0 w-full focus:outline-none px-4 sm:px-3"

// 검색 버튼
className="px-8 md:px-6 sm:px-4 py-3 md:py-2.5 sm:py-2.5 bg-black hover:bg-black/90 text-white font-medium flex items-center gap-2 sm:gap-1.5 transition-colors text-base md:text-sm sm:text-sm"
style={{ borderRadius: isMobile ? '12px' : isTablet ? '14px' : '16px' }}
```

### 자동완성 드롭다운 반응형 클래스
```tsx
// 데스크톱/태블릿
className="absolute top-full left-0 right-0 bg-white rounded-2xl md:rounded-xl shadow-2xl md:shadow-xl shadow-black/15 border border-gray-100 overflow-hidden z-[9999]"

// 모바일 (전체 화면 최적화)
className="sm:fixed sm:inset-x-0 sm:bottom-0 sm:top-auto sm:rounded-t-lg sm:rounded-b-none sm:max-h-[50vh] bg-white rounded-2xl shadow-2xl border overflow-hidden z-[9999]"
```

### 국가 카드 그리드 반응형
```tsx
// 스크롤 컨테이너
className="flex gap-6 md:gap-4 sm:gap-3 overflow-x-auto pb-4 px-8 md:px-6 sm:px-4 scroll-smooth"

// 개별 카드
className="flex-shrink-0 w-64 md:w-56 sm:w-48 p-6 md:p-5 sm:p-4 bg-white rounded-2xl md:rounded-xl sm:rounded-lg shadow-lg md:shadow-md sm:shadow-sm"
```

## 💡 중요 구현 가이드라인

### 1. PC 버전 보존
- 기존 PC 디자인의 클래스는 변경하지 않음
- `lg:` 접두사를 사용해 명시적으로 PC 스타일 지정
- 기본 클래스에 모바일 우선 스타일 적용

### 2. 점진적 향상 (Progressive Enhancement)  
- 모바일 기본 → 태블릿 개선 → PC 최적화
- `sm:` → `md:` → `lg:` 순서로 적용

### 3. 성능 최적화
- 불필요한 호버 효과 모바일에서 제거
- 터치 최적화된 인터랙션
- 이미지 lazy loading 활용

### 4. 접근성 유지
- 터치 타겟 최소 44px 보장
- 키보드 네비게이션 지원
- 적절한 컬러 대비 유지

이 스타일가이드에 따라 기존 PC 디자인을 보존하면서 모바일과 태블릿에서 최적화된 사용자 경험을 제공할 수 있습니다.