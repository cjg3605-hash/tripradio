# 🌍 GUIDEAI - AI 기반 스마트 여행 가이드

<div align="center">

![GUIDEAI Logo](public/butterfly-icon.svg)

**개인 맞춤형 AI 여행 가이드로 세계를 탐험하세요**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-purple?style=for-the-badge)](https://web.dev/progressive-web-apps/)

</div>

## ✨ 주요 특징

### 🧠 **AI 기반 가이드 생성**
- **Gemini AI** 활용한 정확하고 상세한 여행 가이드 생성
- **다국어 지원** (한국어, 영어, 일본어, 중국어, 스페인어)
- **사실 검증 시스템**으로 99% 이상의 정확도 보장
- **개인화된 추천** 시스템

### 🔍 **지능형 검색 시스템**
- **자동완성 중복 제거** - Levenshtein distance 기반 알고리즘
- **대표 장소 선택** - 공식명 우선, 인기도 고려
- **실시간 검색** - 200ms 디바운스로 최적화
- **위치 기반 편향** 지원

### 📍 **다중 데이터 소스 통합**
- UNESCO 세계문화유산 데이터
- 정부기관 공식 데이터
- Google Places API
- Wikidata 백과사전 정보
- **신뢰도 기반 데이터 검증**

### 🎵 **고급 오디오 시스템**
- **TTS (Text-to-Speech)** 지원
- **챕터별 오디오 투어**
- **오프라인 오디오 캐싱**
- **다국어 음성 합성**

### 🗺️ **인터랙티브 지도**
- **Leaflet 기반** 고성능 지도
- **실시간 위치 추적**
- **경로 최적화**
- **지오펜싱** 기반 위치 알림

## 🏗️ 기술 스택

### **Frontend**
- **Next.js 14** (App Router) - 서버사이드 렌더링
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 퍼스트 CSS

### **Backend & Database**
- **Supabase** - 백엔드 서비스
- **PostgreSQL** - 주 데이터베이스
- **NextAuth.js** - 인증 시스템
- **Redis** - 캐싱 및 세션 관리

### **AI & 데이터 처리**
- **Google Gemini AI** - 가이드 생성
- **다중 데이터 소스** - UNESCO, 정부기관, Google Places
- **자연어 처리** - 텍스트 유사도 계산
- **정확성 검증** - AI 기반 사실 확인

### **Performance & PWA**
- **Service Worker** - 오프라인 지원
- **캐싱 전략** - 다층 캐시 시스템
- **이미지 최적화** - Next.js Image
- **번들 최적화** - Tree shaking, 코드 분할

## 📦 설치 및 실행

### 환경 요구사항
- Node.js 18.0 이상
- npm 또는 yarn
- PostgreSQL (Supabase 권장)

### 1. 프로젝트 클론
```bash
git clone https://github.com/jg5209/navi-guide-ai.git
cd navi-guide-ai
```

### 2. 의존성 설치
```bash
npm install
# 또는
yarn install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google AI
GEMINI_API_KEY=your_gemini_api_key

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Google Maps (선택사항)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 4. 데이터베이스 설정
```bash
# Supabase 마이그레이션 실행
npx supabase db push
```

### 5. 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```

http://localhost:3000에서 앱을 확인할 수 있습니다.

## 🚀 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
npm start
```

### 타입 체크
```bash
npm run type-check
```

### 린트 검사
```bash
npm run lint
```

### Vercel 배포
```bash
vercel --prod
```

## 📚 주요 기능 가이드

### 🔍 **자동완성 검색**
```typescript
// 자동완성 중복 제거 알고리즘
import { deduplicateAndSelectRepresentative } from '@/lib/location/autocomplete-deduplication';

const suggestions = await deduplicateAndSelectRepresentative(
  rawSuggestions,
  {
    maxResults: 5,
    similarityThreshold: 0.75,
    preferOfficialNames: true
  }
);
```

### 🧠 **AI 가이드 생성**
```typescript
// Gemini AI를 활용한 가이드 생성
import { generateGuideWithGemini } from '@/lib/ai/gemini';

const guide = await generateGuideWithGemini({
  location: "에펠탑",
  language: "ko",
  style: "detailed"
});
```

### 🗺️ **지도 통합**
```typescript
// 인터랙티브 지도 컴포넌트
import { MapWithRoute } from '@/components/guide/MapWithRoute';

<MapWithRoute
  center={[48.8584, 2.2945]}
  markers={attractions}
  route={optimizedRoute}
/>
```

## 🧪 테스트

### 단위 테스트
```bash
npm run test
```

### E2E 테스트
```bash
npm run test:e2e
```

### 부하 테스트
```bash
cd loadtest
npm run test:load
```

## 📊 성능 최적화

### **Core Web Vitals**
- **LCP**: < 2.5초
- **FID**: < 100ms
- **CLS**: < 0.1

### **최적화 기법**
- **이미지 최적화**: Next.js Image, WebP 지원
- **캐싱 전략**: Redis, CDN, Service Worker
- **번들 최적화**: 동적 임포트, Tree shaking
- **데이터베이스**: 인덱스 최적화, 쿼리 최적화

## 🔒 보안

### **데이터 보호**
- **HTTPS** 강제 적용
- **CORS** 정책 설정
- **Rate Limiting** 구현
- **입력 검증** 및 sanitization

### **인증 시스템**
- **NextAuth.js** 기반
- **OAuth** 지원 (Google, GitHub)
- **JWT** 토큰 관리
- **세션 보안**

## 🌐 다국어 지원

### 지원 언어
- 🇰🇷 한국어 (기본)
- 🇺🇸 English
- 🇯🇵 日本語
- 🇨🇳 中文
- 🇪🇸 Español

### 다국어 설정
```typescript
// i18n 설정
import { useLanguage } from '@/contexts/LanguageContext';

const { currentLanguage, t, setLanguage } = useLanguage();
```

## 📱 PWA 기능

### **오프라인 지원**
- 가이드 컨텐츠 캐싱
- 오디오 파일 로컬 저장
- 네트워크 상태 감지

### **앱 설치**
- Add to Home Screen
- 네이티브 앱 경험
- 푸시 알림 (예정)

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 개발 가이드라인
- **TypeScript** 필수 사용
- **ESLint** 규칙 준수
- **Jest** 테스트 작성
- **Semantic versioning** 준수

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원 및 문의

- **이슈 리포트**: [GitHub Issues](https://github.com/jg5209/navi-guide-ai/issues)
- **기능 요청**: [GitHub Discussions](https://github.com/jg5209/navi-guide-ai/discussions)
- **이메일**: support@guideai.com

## 🙏 감사의 말

- [Next.js](https://nextjs.org/) - 강력한 React 프레임워크
- [Supabase](https://supabase.com/) - 오픈소스 Firebase 대안
- [Tailwind CSS](https://tailwindcss.com/) - 유틸리티 퍼스트 CSS
- [Google AI](https://ai.google.dev/) - Gemini AI 모델
- [Leaflet](https://leafletjs.com/) - 오픈소스 지도 라이브러리

---

<div align="center">

**🌟 Star this repository if you found it helpful! 🌟**

Made with ❤️ by the GUIDEAI Team

</div>