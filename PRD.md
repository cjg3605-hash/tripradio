# 🦋 NAVI - AI 가이드 투어 생성기 PRD (Product Requirements Document)

## 📋 프로젝트 개요

### 제품명
**NAVI** - AI 기반 실시간 가이드 생성 및 고품질 TTS 오디오 투어 서비스

### 제품 비전
전 세계 어떤 장소든 AI가 생성하는 맞춤형 가이드를 통해 깊이 있는 여행 경험을 제공하는 플랫폼

### 핵심 가치 제안
- 🎯 **개인화**: 사용자 프로필 기반 맞춤형 투어 생성
- 🎧 **고품질 오디오**: Google Cloud WaveNet TTS를 활용한 자연스러운 음성 가이드
- 🌍 **다국어 지원**: 5개 언어로 글로벌 접근성 제공
- 📱 **접근성**: PWA로 오프라인에서도 이용 가능
- ⚡ **실시간 생성**: 즉시 맞춤형 가이드 제작

## 🎯 핵심 기능 명세

### 1. AI 가이드 생성 시스템
- **엔진**: Google Gemini 2.5 Flash Lite
- **생성 구조**: 3페이지 가이드 (개요 → 관람동선 → 실시간가이드)
- **개인화 요소**:
  - 관심사 (역사, 문화, 건축, 자연 등)
  - 연령대 (20대, 30대, 40대 이상)
  - 지식 수준 (초급, 중급, 고급)
  - 동행자 (혼자, 가족, 친구, 커플)
  - 투어 시간 (60-180분)
  - 선호 스타일 (친근함, 전문적, 유머러스)

### 2. 고품질 TTS 시스템
- **TTS 엔진**: Google Cloud Text-to-Speech WaveNet
- **지원 언어**: 한국어, 영어, 일본어, 중국어, 스페인어
- **음성 품질**: WaveNet 기반 자연스러운 음성
- **스트리밍**: 챕터별 분할 재생으로 빠른 로딩
- **캐싱**: 3단계 캐싱 시스템 (브라우저 → Supabase DB → Storage)

### 3. 다국어 지원
- **지원 언어**: 5개 언어 (ko, en, ja, zh, es)
- **국제화**: next-i18next 기반 완전 현지화
- **AI 프롬프트**: 언어별 최적화된 프롬프트 시스템
- **음성 지원**: 각 언어별 네이티브 WaveNet 음성

### 4. PWA (Progressive Web App)
- **오프라인 기능**: 다운로드한 가이드 오프라인 재생
- **앱 설치**: 모바일/데스크톱 앱처럼 설치 가능
- **푸시 알림**: 위치 기반 알림 (향후 구현)
- **반응형**: 모든 디바이스에서 최적화된 UI

### 5. 스마트 캐싱 시스템
- **Level 1**: 브라우저 localStorage (즉시 로딩)
- **Level 2**: Supabase DB 메타데이터 (중복 생성 방지)
- **Level 3**: Supabase Storage 오디오 파일 (안정적 저장)
- **성능**: 첫 로딩 후 90% 빠른 재접근

## 🏗️ 기술 아키텍처

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Maps**: React Leaflet

### Backend & AI Stack
- **AI Platform**: Google Gemini 2.5 Flash Lite
- **TTS**: Google Cloud Text-to-Speech (WaveNet)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: NextAuth.js + Google OAuth

### Infrastructure
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics
- **PWA**: next-pwa
- **Internationalization**: next-i18next

## 📊 사용자 플로우

### 메인 플로우
1. **홈페이지 접속** → 검색창에 장소 입력
2. **가이드 생성 요청** → AI가 개인화된 가이드 생성
3. **3페이지 가이드 제공**:
   - Page 1: 개요 및 하이라이트
   - Page 2: 관람 동선 및 경로
   - Page 3: 챕터별 상세 가이드 + 오디오
4. **오디오 투어** → 챕터별 TTS 음성 재생
5. **오프라인 저장** → 마이페이지에서 재이용

### 사용자 페르소나
- **문화 탐방객**: 역사/문화에 관심 있는 30-50대
- **여행 초보자**: 가이드 없이 자유여행하는 20-30대
- **외국인 관광객**: 한국 문화를 깊이 알고 싶은 해외 방문객
- **가족 여행객**: 아이들과 함께 교육적 여행을 원하는 부모

## 🔧 핵심 API 명세

### 1. 가이드 생성 API
```typescript
POST /api/ai/generate-audio-tour
Request:
{
  "locationName": "경복궁",
  "userProfile": {
    "interests": ["역사", "건축"],
    "ageGroup": "30s",
    "knowledgeLevel": "intermediate",
    "tourDuration": 90,
    "preferredStyle": "friendly",
    "language": "ko"
  }
}

Response:
{
  "success": true,
  "data": {
    "overview": "...",
    "history": "...",
    "highlights": [...],
    "visitRoute": {...},
    "detailedStops": [...],
    "audioTourInfo": {...},
    "audioChapters": [...]
  }
}
```

### 2. TTS 오디오 생성
```typescript
// 자동 호출 (내부 시스템)
getOrCreateChapterAudio(guideId, chapterIndex, text, language, speakingRate)
→ Returns: AudioURL (Blob URL or Supabase URL)
```

### 3. 위치 검색 API
```typescript
GET /api/locations/search?q=경복궁&limit=5
Response:
{
  "suggestions": [
    {
      "name": "경복궁",
      "location": "서울 종로구",
      "confidence": 0.95
    }
  ]
}
```

## 📈 성능 요구사항

### 응답 시간
- **가이드 생성**: 5-10초 (AI 처리 시간)
- **오디오 생성**: 2-5초 (TTS 처리 시간)
- **페이지 로딩**: 1초 이내 (캐시된 콘텐츠)
- **오디오 재생**: 즉시 시작 (스트리밍)

### 확장성
- **동시 사용자**: 1,000명 (단계적 확장)
- **일일 가이드 생성**: 10,000건
- **저장 용량**: 100GB (오디오 파일)
- **API 호출 한도**: Google AI/TTS API 제한 내

### 품질 지표
- **가이드 정확도**: 95% (사실 정보 기준)
- **오디오 품질**: WaveNet 기준 고품질
- **사용자 만족도**: 4.5/5.0 이상
- **PWA 성능**: Lighthouse 90점 이상

## 🎨 UI/UX 설계 원칙

### 디자인 철학
- **미니멀리즘**: 깔끔하고 직관적인 인터페이스
- **접근성**: 모든 연령대가 쉽게 사용 가능
- **반응형**: 모바일 퍼스트 디자인
- **브랜드 일관성**: 일관된 컬러/타이포그래피

### 핵심 UI 컴포넌트
- **검색 박스**: 동적 플레이스홀더, 실시간 제안
- **가이드 카드**: 시각적 계층 구조와 정보 밀도 최적화
- **오디오 플레이어**: 챕터 탐색, 재생 속도 조절
- **진행 표시**: 실시간 생성 과정 시각화

### 사용성 원칙
- **원클릭 접근**: 3클릭 이내 모든 기능 접근
- **직관적 내비게이션**: 명확한 정보 구조
- **에러 처리**: 친화적 에러 메시지와 대안 제시
- **로딩 상태**: 명확한 진행 상황 표시

## 💰 수익화 전략

### 1. 프리미엄 구독
- **무료**: 월 10개 가이드 생성
- **프리미엄**: 월 $9.99, 무제한 생성 + 고급 기능
- **프로**: 월 $19.99, 기업/가이드용 고급 기능

### 2. 광고 수익
- **Google AdSense**: 콘텐츠 맞춤형 광고
- **로딩 화면 광고**: 가이드 생성 중 표시
- **지역 파트너십**: 현지 관광업체와 제휴

### 3. B2B 서비스
- **관광청 파트너십**: 공식 관광 가이드 제작
- **호텔/리조트**: 투숙객 대상 맞춤 서비스
- **교육 기관**: 현장 학습용 교육 콘텐츠

## 🚀 로드맵

### Phase 1: MVP (현재)
- ✅ 기본 가이드 생성 시스템
- ✅ TTS 오디오 생성
- ✅ 5개 언어 지원
- ✅ PWA 기본 기능

### Phase 2: 고도화 (3개월)
- 🔄 사용자 피드백 수집 시스템
- 🔄 AI 프롬프트 최적화
- 🔄 캐싱 시스템 개선
- 🔄 모바일 앱 최적화

### Phase 3: 확장 (6개월)
- 📋 사용자 계정 시스템
- 📋 가이드 북마크/공유
- 📋 위치 기반 푸시 알림
- 📋 소셜 기능 (리뷰, 평점)

### Phase 4: 상용화 (12개월)
- 📋 프리미엄 구독 모델
- 📋 B2B 파트너십
- 📋 실시간 위치 추적
- 📋 AR/VR 기능 연동

## 🔒 보안 및 프라이버시

### 데이터 보호
- **개인정보**: 최소 수집 원칙
- **암호화**: 모든 민감 데이터 암호화
- **GDPR 준수**: 유럽 사용자 데이터 보호
- **로그 관리**: 민감 정보 로깅 금지

### API 보안
- **인증**: NextAuth.js 기반 안전한 인증
- **환경 변수**: 모든 API 키 안전 보관
- **Rate Limiting**: API 남용 방지
- **CORS**: 적절한 도메인 제한

## 📊 분석 및 모니터링

### 핵심 지표 (KPI)
- **사용자 증가율**: MAU (Monthly Active Users)
- **가이드 생성량**: 일일/월별 생성 건수
- **사용자 재방문율**: 재사용 비율
- **오디오 완주율**: 챕터별 완주 비율
- **언어별 사용률**: 다국어 채택률

### 기술 모니터링
- **성능 지표**: 응답 시간, 에러율
- **AI 품질**: 생성 실패율, 사용자 만족도
- **인프라**: 서버 리소스, DB 성능
- **비용 관리**: API 사용량, 스토리지 비용

## 🤝 팀 및 역할

### 개발 팀 구성
- **Full-Stack Developer**: Frontend/Backend 개발
- **AI Engineer**: Gemini API 최적화, 프롬프트 엔지니어링
- **UI/UX Designer**: 사용자 경험 디자인
- **DevOps Engineer**: 인프라 관리, 배포 자동화

### 외부 협력
- **Google Cloud**: AI/TTS API 기술 지원
- **Vercel**: 호스팅 및 배포 최적화
- **Supabase**: 데이터베이스 및 스토리지 관리
- **관광 전문가**: 콘텐츠 품질 검수

---

*이 PRD는 NAVI 프로젝트의 핵심 비전과 구현 계획을 담고 있으며, 지속적인 사용자 피드백과 시장 변화에 따라 업데이트됩니다.*