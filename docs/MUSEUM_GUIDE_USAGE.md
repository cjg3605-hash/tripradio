# 🏛️ 박물관 전용 가이드 시스템 사용법

## 개요

박물관 특화 AI 가이드 시스템으로, 기존 TripRadio.AI 시스템과 독립적으로 작동하며 **사실기반 + 전문성 극대화**를 통해 박물관 작품을 상세하게 해설합니다.

## 🎯 주요 특징

### ✅ 전문성 극대화
- **미술사학 박사** + **보존과학 전문가** + **박물관교육 전문가** + **AI 프롬프트 엔지니어** 통합 페르소나
- **5단계 층위적 분석**: 기본정보 → 재료분석 → 역사맥락 → 도상해석 → 미술사적평가
- **FACT-FIRST Framework**: 사실기반 원칙 + 학술적 정확성 + 맥락적 심화분석 + 층위적 정보구조

### ❌ 미사여구 완전 제거
- 금지표현: "아름다운", "놀라운", "신비로운", "경이로운" 등
- 추측표현 금지: "아마도", "~것 같다", "추정컨대" 등
- 검증되지 않은 정보 배제

### 🔍 품질 보장
- **3개 이상 출처 검증** 시스템
- **신뢰도 기반 자료 분류** (1차/2차/3차 자료)
- **자동 팩트체크** 및 **품질점수 계산**

## 📁 파일 구조

```
src/lib/ai/prompts/
├── museum-specialized.ts     # 박물관 전용 프롬프트 시스템

src/lib/ai/
├── museum-guide-generator.ts # 박물관 가이드 생성기

app/api/
├── museum-guide/
    └── route.ts              # 테스트용 API 엔드포인트
```

## 🚀 사용 방법

### 1. 기본 박물관 가이드 생성

```javascript
import { museumGuideGenerator } from '@/lib/ai/museum-guide-generator';

// 전시관별 완전 가이드 생성
const result = await museumGuideGenerator.generateMuseumTourGuide(
  '국립중앙박물관',  // 박물관명
  '고려실',          // 전시관명
  {                  // 사용자 프로필 (선택)
    knowledgeLevel: '중급',
    interests: ['고려시대', '도자기', '불교미술'],
    preferredStyle: '전문적'
  }
);

console.log('생성 결과:', result);
```

### 2. 박물관 구조 분석

```javascript
// 박물관 전체 구조 파악
const structure = await museumGuideGenerator.analyzeMuseumStructure('국립현대미술관');

console.log('전시관 목록:', structure.exhibition_halls);
console.log('추천 작품:', structure.recommended_artworks);
```

### 3. 커스텀 키워드 기반 가이드

```javascript
// 특정 주제 중심의 맞춤 가이드
const customGuide = await museumGuideGenerator.generateCustomizedMuseumGuide(
  '리움미술관',
  ['백자', '조선시대', '유교문화', '선비정신'],  // 커스텀 키워드
  { knowledgeLevel: '고급' }
);
```

## 🌐 API 사용법

### POST /api/museum-guide

**완전한 박물관 가이드 생성**

```bash
curl -X POST http://localhost:3000/api/museum-guide \
  -H "Content-Type: application/json" \
  -d '{
    "museum_name": "국립중앙박물관",
    "hall_name": "고려실",
    "user_profile": {
      "knowledgeLevel": "중급",
      "interests": ["고려시대", "청자"],
      "preferredStyle": "전문적"
    }
  }'
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "guide": {
      "id": "museum_국립중앙박물관_고려실_1704123456789",
      "location_name": "국립중앙박물관 고려실",
      "title": "국립중앙박물관 고려실 전문 가이드",
      "chapters": [
        {
          "id": 0,
          "title": "고려실 소개",
          "content": "고려실에 오신 것을 환영합니다...",
          "duration": 120,
          "fact_check": {
            "verified": true,
            "confidence": 90
          }
        },
        {
          "id": 1,
          "title": "1. 청자 상감운학문 매병",
          "content": "### 🔍 Level 1: 기본 팩트 데이터...",
          "duration": 255,
          "artwork_info": {
            "title": "청자 상감운학문 매병",
            "artist": "미상",
            "year": "12세기",
            "medium": "청자, 상감기법",
            "dimensions": "높이 42.1cm",
            "analysis_level": 5
          }
        }
      ],
      "metadata": {
        "total_duration": 2100,
        "difficulty_level": "intermediate",
        "artwork_count": 8,
        "quality_score": 92,
        "fact_verified": true
      }
    },
    "quality_assessment": {
      "score": 92,
      "is_valid": true,
      "recommendations": [],
      "warnings": []
    }
  }
}
```

### GET /api/museum-guide

**박물관 구조 조회**

```bash
curl "http://localhost:3000/api/museum-guide?museum_name=국립현대미술관&hall_name=한국현대미술관"
```

### 커스텀 키워드 가이드

```bash
curl -X POST http://localhost:3000/api/museum-guide \
  -H "Content-Type: application/json" \
  -d '{
    "museum_name": "서울시립미술관",
    "custom_keywords": ["추상표현주의", "색채", "현대조각"],
    "user_profile": {
      "knowledgeLevel": "고급",
      "interests": ["현대미술", "추상미술"]
    }
  }'
```

## 🔧 품질 검증

### 품질 점수 계산 기준

```javascript
import { MuseumGuideValidator } from '@/lib/ai/museum-guide-generator';

const guide = /* 생성된 가이드 */;
const assessment = MuseumGuideValidator.validateGuide(guide);

console.log('품질 점수:', assessment.score);        // 0-100점
console.log('검증 통과:', assessment.isValid);      // true/false
console.log('개선사항:', assessment.recommendations);
console.log('경고사항:', assessment.warnings);
```

**점수 기준:**
- **팩트 정확성** (40점): 팩트체크 신뢰도 평균
- **전문성** (30점): 전문용어 사용 여부
- **구조적 완성도** (20점): 소개/본론/마무리 구성
- **금지표현 준수** (10점): 미사여구 사용 여부

### 품질 기준

- ✅ **75점 이상**: 사용 가능한 품질
- ✅ **85점 이상**: 우수한 품질  
- ✅ **95점 이상**: 최고 품질

## 📊 작품 분석 5단계 구조

각 작품마다 다음 5단계로 상세 분석:

### Level 1: 기본 팩트 데이터 (30초)
- 작가 정보 (생몰연도, 국적, 경력)
- 작품 정보 (연도, 크기, 재료, 등록번호)
- 보존상태, 복원이력

### Level 2: 재료과학적 분석 (45초)
- 지지체 특성 (캔버스/패널/종이)
- 안료 성분과 특징
- 제작기법의 과학적 분석
- 붓터치, 질감 분석

### Level 3: 역사적 맥락 (60초)
- 제작 당시 사회/정치/문화적 배경
- 의뢰자, 제작 목적
- 작가의 해당 시기 작품 경향
- 지역적/국가적 미술 전통

### Level 4: 도상학적 해석 (75초)
- 주제와 내용 (종교적/신화적/역사적)
- 상징 체계와 의미
- 구도, 색채, 공간 구성
- 당시와 현재의 해석

### Level 5: 미술사적 평가 (45초)
- 작가 전체 작품군에서의 위치
- 해당 시대/유파에서의 혁신성
- 후대에 미친 영향
- 현재 학계 평가와 연구 동향

## 🎯 지원 박물관

### 기본 지원 박물관
- **국립중앙박물관**: 고고학, 역사학, 불교미술, 도자공예
- **국립현대미술관**: 현대미술, 설치미술, 영상미술
- **서울시립미술관**: 한국현대미술, 서울지역작가
- **리움미술관**: 한국전통미술, 현대미술

### 커스텀 박물관 추가
```javascript
// museum-specialized.ts에서 설정 추가
MUSEUM_SPECIALIZATIONS['새박물관명'] = {
  expertise: ['전문분야1', '전문분야2'],
  focus: 'specialized_focus',
  period_range: '시대범위'
};
```

## ⚠️ 주의사항

### 필수 환경변수
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 사용 제한사항
- 하루 최대 100회 생성 권장 (API 비용 고려)
- 대용량 박물관의 경우 응답시간 1-3분 소요
- 네트워크 안정성 필요 (Gemini AI 호출)

### 품질 보장을 위한 권장사항
- 정확한 박물관명과 전시관명 입력
- 사용자 프로필 상세 설정으로 맞춤화 향상
- 생성 후 반드시 품질 검증 수행

## 🔍 테스트 예시

### 간단한 테스트
```javascript
// 테스트 스크립트 실행
node test-museum-guide.js
```

### API 테스트
```bash
# 박물관 구조 조회
curl "http://localhost:3000/api/museum-guide?museum_name=국립중앙박물관"

# 가이드 생성
curl -X POST http://localhost:3000/api/museum-guide \
  -H "Content-Type: application/json" \
  -d '{"museum_name": "국립중앙박물관", "hall_name": "고려실"}'
```

## 📈 성능 최적화

### 캐싱 전략
- 박물관 구조 데이터: 24시간 캐싱
- 생성된 가이드: 7일간 캐싱
- 품질 평가 결과: 즉시 캐싱

### 병렬 처리
- 작품 분석 단계별 비동기 처리
- 팩트체크와 콘텐츠 생성 병렬 실행
- 품질 검증 자동화

이 시스템을 통해 **극도로 전문적이고 사실기반의 박물관 가이드**를 생성할 수 있습니다.