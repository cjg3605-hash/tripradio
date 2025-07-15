# 🦋 NAVI - AI 관광 가이드

NAVI는 AI가 생성하는 개인 맞춤형 관광 가이드 서비스입니다. 전 세계 모든 관광명소에 대해 실시간으로 생성되는 고품질 스토리텔링을 제공합니다.

## ✨ 주요 특징

### 🎭 알함브라 수준의 스토리텔링
- 실제 역사 인물과 전설을 조합한 드라마틱한 현장감
- 감각적 디테일과 몰입형 설명

### 📖 완벽한 3페이지 구조
1. **개요**: 역사적 배경, 문화적 중요성, 방문 정보
2. **관람동선**: 효율적 동선, 실용적 팁, 편의시설 정보
3. **실시간 가이드**: 챕터별 드라마틱 스토리텔링

### 🌏 다국어 지원
- 한국어, 영어, 일본어, 중국어, 스페인어
- 언어별 문화적 맥락을 반영한 현지화
- 자연스러운 원어민 수준의 표현

### 🤖 100% AI 기반 개인화
- 데이터 없이 실시간 AI 생성
- 사용자 관심사, 연령대, 지식수준 반영
- Gemini 1.5 Flash 기반 고품질 콘텐츠

### 📱 모바일 최적화 & PWA
- 3초 시작: 검색 → 가이드 → 시작
- 오프라인 지원 (PWA)
- 한손 조작 최적화
- 홈 화면 추가 가능

### 💾 오프라인 가이드
- 생성된 가이드를 로컬에 저장
- 인터넷 없이도 가이드 열람 가능
- 마이페이지에서 저장된 가이드 관리

### 💰 수익화 (AdSense)
- 가이드 생성 대기 시간 중 광고 표시
- 사용자 경험을 해치지 않는 적절한 광고 배치
- 개발 환경에서는 테스트 광고 표시

## 🚀 빠른 시작

### 1. 환경설정
```bash
# 저장소 클론
git clone https://github.com/your-repo/navi-tour.git
cd navi-tour

# 의존성 설치
npm install
# 또는
yarn install
```

### 2. 환경변수 설정
.env.local 파일 생성:
```
# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Google OAuth (옵션)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Supabase (옵션)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google AdSense (수익화 - 옵션)
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-1234567890123456
NEXT_PUBLIC_ADSENSE_LOADING_SLOT_ID=1234567890
NEXT_PUBLIC_ADSENSE_AUTO_ADS_ENABLED=true
```

### 3. 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```
http://localhost:3000 에서 확인

## 🏗️ 프로젝트 구조

```
src/
├── app/
│   ├── api/                  # Next.js API Routes (AI, 인증, 위치 등)
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
│   ├── home/                 # 홈/검색
│   ├── layout/               # 헤더, 사이드바 등
│   ├── setup/                # API키 설정
│   └── guide/                # 지도, 경로 등
├── lib/
│   ├── ai/                   # AI 프롬프트, 공식데이터, Gemini API
│   ├── cache/                # 로컬스토리지 등
│   └── hooks/                # 커스텀 훅
├── types/                    # 타입 정의
└── public/                   # 정적 파일, PWA, 다국어 리소스
```

## 🎨 기술 스택
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **AI**: Google Gemini 1.5 Flash
- **인증**: NextAuth.js
- **DB**: Supabase (옵션)
- **PWA**: next-pwa, Service Worker, IndexedDB
- **국제화**: next-i18next

## 🛠️ 주요 명령어
```bash
npm run dev         # 개발 서버 실행
npm run build       # 프로덕션 빌드
npm start           # 빌드 실행
npm run type-check  # 타입 검사
npm run lint        # 린트 검사
```

## 🔧 서비스 워커 디버깅

### 개발 환경
- 개발 서버(`npm run dev`)에서는 PWA가 비활성화됨
- 압축되지 않은 서비스 워커(`sw-dev.js`) 사용
- 브라우저 콘솔에서 `SWDebug` 도구 사용 가능

### 디버깅 도구 사용법
```javascript
// 브라우저 콘솔에서 사용
SWDebug.debugInfo()         // 현재 상태 확인
SWDebug.getCaches()         // 캐시 내용 확인
SWDebug.clearAllCaches()    // 모든 캐시 삭제
SWDebug.unregisterAll()     // 서비스 워커 등록 해제
SWDebug.reset()             // 완전 초기화
```

### 문제 해결
1. **서비스 워커 문제**: `SWDebug.reset()` 후 새로고침
2. **캐시 문제**: `SWDebug.clearAllCaches()` 실행
3. **오프라인 테스트**: 개발자 도구 → Application → Service Workers → Offline 체크

## 💰 AdSense 설정 (선택사항)

### 1. Google AdSense 계정 설정
1. [Google AdSense](https://www.google.com/adsense/) 가입
2. 웹사이트 추가 및 승인 대기
3. 승인 후 광고 단위 생성

### 2. 환경 변수 설정
```bash
# Google AdSense Publisher ID (AdSense → 계정 → 계정 정보에서 확인)
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-1234567890123456

# 광고 설정 (AdSense → 광고에서 설정)
NEXT_PUBLIC_ADSENSE_LOADING_SLOT_ID=1234567890  # 로딩 화면 수동 광고용
NEXT_PUBLIC_ADSENSE_AUTO_ADS_ENABLED=true       # 자동 광고 활성화
```

### 3. 개발 환경에서 테스트
- 개발 환경에서는 실제 광고 대신 플레이스홀더가 표시됩니다
- 운영 환경에 배포 후 실제 광고가 표시됩니다

### 4. 주의사항
- AdSense 정책을 준수해야 합니다
- 광고는 콘텐츠와 명확히 구분되어야 합니다
- 사용자가 실수로 클릭하지 않도록 주의하세요

## 🛫 배포
- Vercel 권장
- Vercel 환경변수: GEMINI_API_KEY, NEXTAUTH_SECRET, AdSense 관련 환경변수 등

## 🧑‍💻 기여하기
- Fork → 브랜치 생성 → 커밋 → PR