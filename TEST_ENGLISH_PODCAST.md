# English Podcast Support Test Guide

팟캐스트 시스템에 영어 지원이 추가되었습니다. 다음과 같이 테스트할 수 있습니다:

## 🎯 구현된 기능

### 1. 영어 프롬프트 시스템
- **파일**: `src/lib/ai/prompts/english-notebook-podcast.ts`
- **기능**: NotebookLM 스타일 영어 대화 패턴 구현
- **특징**: 
  - Host/Curator 역할 구분
  - 자연스러운 영어 대화 흐름
  - 정보 밀도 높은 팟캐스트 생성

### 2. 영어 페르소나 시스템  
- **파일**: `src/lib/ai/personas/podcast-personas.ts`
- **추가**: `ENGLISH_HOST_PERSONA`, `ENGLISH_CURATOR_PERSONA`
- **특징**:
  - Sarah (Host): 호기심 많은 진행자
  - Dr. Thompson (Curator): 전문가 큐레이터

### 3. 다국어 TTS 음성 프로필
- **파일**: `src/lib/ai/voices/multilingual-voice-profiles.ts`
- **지원 언어**: 한국어, 영어, 일본어, 중국어, 스페인어
- **영어 음성**:
  - Primary: `en-US-Neural2-H` (여성, 매력적)
  - Secondary: `en-US-Neural2-J` (남성, 권위적)

### 4. API 다국어 지원
- **파일**: `app/api/tts/notebooklm/generate/route.ts`
- **개선사항**:
  - 언어별 프롬프트 분기
  - 영어 스크립트 파싱 지원
  - TTS 언어코드 정규화

## 🧪 테스트 방법

### 1. API 직접 호출 테스트

```bash
# 영어 팟캐스트 생성
curl -X POST http://localhost:3000/api/tts/notebooklm/generate \
  -H "Content-Type: application/json" \
  -d '{
    "locationName": "Louvre Museum",
    "language": "en",
    "locationContext": {
      "type": "museum",
      "country": "France"
    }
  }'
```

### 2. 기존 팟캐스트 조회 테스트

```bash
# 영어 팟캐스트 조회
curl "http://localhost:3000/api/tts/notebooklm/generate?location=Louvre Museum&language=en"
```

### 3. 헤더 언어 설정 연동

- 헤더에서 언어를 "English"로 변경
- 팟캐스트 생성 요청 시 `language: 'en'` 파라미터 자동 적용
- `LanguageContext`의 `ttsLang` 값 활용: `'en-US'`

## 🎛️ 언어 매핑

| UI 언어 | API 파라미터 | TTS 언어코드 | 음성 프로필 |
|---------|-------------|------------|------------|
| ko      | ko          | ko-KR      | Neural2-A/C |
| en      | en          | en-US      | Neural2-H/J |
| ja      | ja          | ja-JP      | Neural2-B/C |
| zh      | zh          | zh-CN      | XiaoxiaoNeural/YunxiNeural |
| es      | es          | es-ES      | ElviraNeural/AlvaroNeural |

## 🔍 예상 결과

### 영어 팟캐스트 스크립트 예시:
```
**Host:** Welcome everyone to TripRadio! Today we're at something really special, the Louvre Museum. Wow, just the scale alone is incredible...

**Curator:** Hello, I'm Curator Dr. Thompson. Yes, this is one of the world's largest museums. The total floor area alone is over 782,910 square feet...

**Host:** 782,910 square feet? I can't even imagine that scale!

**Curator:** To put it in perspective, that's about the size of 18 football fields. With over 380,000 artifacts in our collection...
```

### TTS 음성 특징:
- **Host (Sarah)**: 매력적이고 호기심 많은 여성 음성
- **Curator (Dr. Thompson)**: 권위적이고 차분한 남성 음성
- **속도**: 영어는 1.1x 속도 (한국어보다 약간 빠름)
- **피치**: 영어는 +1st 피치 (약간 높은 톤)

## 🚀 프로덕션 배포 전 확인사항

1. **환경변수 설정 확인**
   - `GOOGLE_CLOUD_TTS_API_KEY` 설정
   - `NEXTAUTH_URL` 설정

2. **Supabase 테이블 확인**
   - `podcast_episodes` 테이블 언어 필드
   - `podcast_segments` 테이블 다국어 지원

3. **성능 테스트**
   - 영어 TTS 생성 시간 측정
   - 파일 크기 및 품질 확인

## 🔧 추가 개선 가능한 부분

1. **언어별 대화 스타일 세밀 조정**
2. **문화적 컨텍스트 반영 강화**
3. **언어별 전환 구문 최적화**
4. **사용자 언어 설정 자동 감지**

---

## 테스트 결과 기록

### ✅ 완료된 테스트
- [ ] API 영어 파라미터 처리
- [ ] 영어 프롬프트 생성
- [ ] 영어 TTS 음성 적용
- [ ] 스크립트 파싱 정확성
- [ ] 파일 저장 경로 확인

### ❌ 발견된 이슈
- 발견된 문제점들을 여기에 기록

### 📝 개선 제안
- 추가 개선 사항들을 여기에 기록