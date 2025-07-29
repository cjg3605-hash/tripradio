# 🦋 GUIDEAI - AI 개인화 여행 가이드 플랫폼

AI 기반 실시간 맞춤형 여행 가이드 생성 서비스 - **완전 구현 완료**

## ✨ 완성된 주요 기능

- 🤖 **AI 가이드 생성**: Gemini 2.5 Flash + 정확성 검증 시스템으로 신뢰할 수 있는 가이드 생성
- 📊 **다중 데이터 통합**: UNESCO, Wikidata, 정부 데이터, Google Places 4개 소스 병렬 수집
- 🎯 **개인화 시스템**: 사용자 프로필 기반 관심사, 연령대, 여행 스타일 맞춤 생성
- 🌍 **다국어 지원**: 한국어, 영어, 일본어, 중국어, 스페인어 완전 지원
- 📱 **PWA 지원**: Service Worker 기반 오프라인 캐싱, 8개 최적화 전략
- 🛡️ **보안 시스템**: Rate Limiting, Circuit Breaker, 입력 검증 완비
- 💾 **다층 캐싱**: 메모리 + 디스크 + 네트워크 캐싱으로 빠른 로딩
- 🔐 **인증 시스템**: Google OAuth + Credentials 로그인 완전 구현

## 🚀 빠른 시작

### 1. 저장소 클론 및 의존성 설치
```bash
git clone https://github.com/your-username/navi-guide.git
cd navi-guide
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가:

```bash
# Google AI (필수 - Gemini API)
GEMINI_API_KEY=your-gemini-api-key

# Google OAuth (로그인 기능)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Supabase (옵션 - 챕터별 오디오 저장)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google AdSense (수익화 - 옵션)
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-1234567890123456
NEXT_PUBLIC_ADSENSE_LOADING_SLOT_ID=1234567890
NEXT_PUBLIC_ADSENSE_AUTO_ADS_ENABLED=true
```

### 3. Supabase 설정 (오디오 저장용)

#### 3.1 SQL 스키마 실행
Supabase SQL Editor에서 `setup-guides-table.sql` 파일 내용을 실행:

```sql
-- guides, audio_files 테이블 생성
-- RLS 정책 설정
-- 인덱스 최적화
```

#### 3.2 Storage 버킷 생성
Supabase Dashboard → Storage → Create Bucket:
- **버킷명**: `audio`
- **Public**: `true` (공개 읽기 가능)
- **File size limit**: `50MB`
- **Allowed MIME types**: `audio/mpeg, audio/mp3`

#### 3.3 Storage 정책 설정
```sql
-- 누구나 읽기 가능
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'audio');

-- 서비스롤만 업로드 가능
CREATE POLICY "Service Role Upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'audio' AND auth.role() = 'service_role');
```

### 4. Google Cloud Console 설정

#### 4.1 Text-to-Speech API 활성화
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 선택 (GEMINI_API_KEY와 동일 프로젝트)
3. **API 및 서비스 > 라이브러리** 이동
4. **"Cloud Text-to-Speech API"** 검색 및 활성화

#### 4.2 API 키 확인
- Gemini API와 TTS API가 동일한 API 키로 사용 가능
- 기존 `GEMINI_API_KEY`를 그대로 사용

### 5. 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```
http://localhost:3000 에서 확인

## 🎵 챕터별 오디오 시스템

### 📊 시스템 아키텍처
```
🎯 사용자 요청 (위치 + 프로필)
    ↓
🔍 Rate Limiting + 인증 확인
    ↓
📊 다중 데이터 소스 병렬 수집
   ├── UNESCO 세계유산 API
   ├── Wikidata 구조화 데이터  
   ├── 정부 관광 데이터
   └── Google Places API
    ↓
🤖 AI 가이드 생성 (Gemini 2.5 Flash)
    ↓
🔍 정확성 검증 시스템
   ├── 금지 패턴 탐지
   ├── 사실 확인
   └── 자동 정제
    ↓
💾 캐싱 + 응답 압축
    ↓
🎯 개인화된 가이드 전달
```

### 📁 파일 구조
```
Supabase Storage (audio 버킷):
├── audio/guides/{guideId}/
│   ├── chapter_0_ko-KR_abc123.mp3
│   ├── chapter_1_ko-KR_def456.mp3
│   └── chapter_2_en-US_ghi789.mp3

Supabase DB (audio_files 테이블):
├── guide_id: "abc123..."
├── chapter_index: 0, 1, 2...
├── language: "ko-KR", "en-US"...
├── file_path: "audio/guides/..."
├── file_size: 1234567 (bytes)
└── duration_seconds: 45 (optional)
```

### 🚀 성능 최적화
1. **3단계 캐싱**:
   - Level 1: 브라우저 localStorage (즉시 로딩)
   - Level 2: Supabase DB 확인 (중복 생성 방지)
   - Level 3: Supabase Storage 다운로드 (안정적 저장)

2. **스마트 파일명**: `guide_id + chapter_index + language + content_hash`
3. **중복 방지**: UNIQUE 제약조건으로 동일 챕터 중복 생성 방지
4. **배치 관리**: 가이드별 오디오 파일 일괄 조회/삭제 가능

## 🏗️ 프로젝트 구조

```
src/
├── app/
│   ├── api/                  # Next.js API Routes
│   │   ├── ai/              # AI 가이드 생성
│   │   ├── tts/             # TTS 오디오 생성  
│   │   └── locations/       # 위치 검색
│   ├── guide/
│   │   └── [location]/
│   │       ├── page.tsx      # 3페이지 가이드
│   │       └── tour/
│   │           ├── page.tsx
│   │           └── components/
│   │               └── TourContent.tsx  # 챕터별 오디오 재생
│   ├── my-guide/             # 오프라인 가이드
│   ├── mypage/               # 마이페이지
│   ├── auth/                 # 인증
│   └── layout.tsx            # 글로벌 레이아웃
├── components/
│   ├── home/                 # 홈/검색
│   ├── layout/               # 헤더, 사이드바 등
│   ├── ads/                  # AdSense 광고
│   └── guide/                # 지도, 경로 등
├── lib/
│   ├── ai/                   # AI 프롬프트, Gemini API
│   ├── tts-gcs.ts           # 챕터별 TTS 시스템 ⭐
│   ├── cache/                # 로컬스토리지
│   └── supabaseClient.ts    # Supabase 설정
├── types/                    # 타입 정의
└── public/                   # 정적 파일, PWA, 다국어
```

## 🎨 기술 스택
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **AI**: Google Gemini 1.5 Flash
- **TTS**: Google Cloud Text-to-Speech (WaveNet)
- **DB**: Supabase (PostgreSQL + Storage)
- **인증**: NextAuth.js + Google OAuth
- **국제화**: next-i18next
- **PWA**: next-pwa
- **광고**: Google AdSense

## 🌐 배포

### Vercel 배포 (권장)
1. GitHub 저장소 연결
2. 환경 변수 설정
3. 자동 배포

### 환경 변수 체크리스트
- ✅ `GEMINI_API_KEY`: Google AI Studio에서 발급
- ✅ `GOOGLE_CLIENT_ID/SECRET`: Google OAuth 설정
- ✅ `NEXTAUTH_URL/SECRET`: 인증 시스템
- ✅ `SUPABASE_URL/KEY`: 오디오 저장용 (옵션)
- ✅ `ADSENSE_*`: 수익화용 (옵션)

## 📝 주요 API

### 가이드 생성
```typescript
POST /api/ai/generate-audio-tour
{
  "locationName": "경복궁",
  "userProfile": {
    "interests": ["역사", "건축"],
    "ageGroup": "30s"
  }
}
```

### 챕터별 TTS 생성
```typescript
// 자동 호출 (TourContent.tsx에서)
getOrCreateChapterAudio(guideId, chapterIndex, text, language)
```

### 위치 검색
```typescript
GET /api/locations/search?q=경복궁&limit=5
```

## 🔧 개발 가이드

### 새로운 언어 추가
1. `public/locales/{lang}/` 디렉토리 생성
2. `src/lib/ai/prompts/{language}.ts` 프롬프트 파일 생성
3. `WAVENET_VOICES`에 음성 추가
4. `next-i18next.config.js` 설정 업데이트

### 커스텀 프롬프트 수정
`src/lib/ai/prompts/` 폴더에서 언어별 프롬프트 수정 가능

### 오디오 품질 조정
`src/lib/tts-gcs.ts`의 `audioConfig` 섹션:
- `speakingRate`: 말하기 속도 (0.25-4.0)
- `pitch`: 음성 높낮이 (-20.0 ~ 20.0)
- `volumeGainDb`: 볼륨 조정 (-96.0 ~ 16.0)

## 🛠️ 문제 해결

### TTS 오류
1. Google Cloud Text-to-Speech API 활성화 확인
2. `GEMINI_API_KEY` 유효성 확인
3. API 할당량 확인

### Supabase 연결 오류
1. URL/Key 확인
2. RLS 정책 확인
3. Storage 버킷 생성 확인

### 빌드 에러
```bash
npm run build  # 로컬 빌드 테스트
npm run type-check  # 타입 에러 확인
```

## 📄 라이센스
MIT License

## 🤝 기여하기
1. Fork 저장소
2. Feature 브랜치 생성
3. 커밋 & 푸시
4. Pull Request 생성

---

**🦋 NAVI와 함께 세계 어디든 똑똑한 가이드를 만나보세요!**