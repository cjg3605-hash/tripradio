# 팟캐스트 시스템 가이드

## 📚 목차
1. [시스템 개요](#시스템-개요)
2. [아키텍처](#아키텍처)
3. [사용 방법](#사용-방법)
4. [언어별 커스터마이징](#언어별-커스터마이징)
5. [페르소나 시스템](#페르소나-시스템)
6. [API 통합](#api-통합)
7. [테스트 및 검증](#테스트-및-검증)
8. [문제 해결](#문제-해결)

## 시스템 개요

### 핵심 기능
- **구조화된 프롬프트 시스템**: 언어별로 분리된 모듈식 프롬프트
- **챕터별 생성**: 순차적 챕터 생성으로 안정성 향상
- **페르소나 통합**: 자연스러운 대화를 위한 동적 페르소나
- **다국어 지원**: 5개 언어 (한국어, 영어, 일본어, 중국어, 스페인어)

### 주요 개선사항
- ✅ 하드코딩된 프롬프트 제거
- ✅ 모듈식 구조로 유지보수성 향상
- ✅ 페르소나 시스템과 깊은 통합
- ✅ 언어별 문화적 적응

## 아키텍처

### 디렉토리 구조
```
src/lib/ai/prompts/podcast/
├── index.ts                    # 메인 라우터
├── korean-podcast.ts           # 한국어 프롬프트
├── english-podcast.ts          # 영어 프롬프트
├── japanese-podcast.ts         # 일본어 프롬프트
├── chinese-podcast.ts          # 중국어 프롬프트
├── spanish-podcast.ts          # 스페인어 프롬프트
└── persona-prompt-integration.ts # 페르소나 통합
```

### 주요 컴포넌트

#### 1. 프롬프트 라우터 (index.ts)
```typescript
// 챕터별 프롬프트 생성
const prompt = await createPodcastChapterPrompt({
  locationName: '경복궁',
  chapter: chapterInfo,
  language: 'ko',
  personaDetails: personas,
  locationAnalysis: analysis
});

// 전체 가이드 프롬프트 생성
const fullPrompt = await createFullGuidePodcastPrompt({
  guideContent: content,
  language: 'en'
});
```

#### 2. 화자 레이블 시스템
```typescript
const labels = getSpeakerLabels('ko');
// { male: 'male', female: 'female' }

const enLabels = getSpeakerLabels('en');
// { host: 'Host', curator: 'Curator' }
```

#### 3. 스크립트 파싱
```typescript
const segments = parseDialogueScript(script, 'ko');
// [{ speaker: 'male', content: '...' }, ...]
```

## 사용 방법

### 기본 사용법

#### 1. API에서 프롬프트 생성
```typescript
// generate-by-chapter/route.ts
import { createPodcastChapterPrompt } from '@/lib/ai/prompts/podcast';

const prompt = await createPodcastChapterPrompt({
  locationName: location,
  chapter: {
    title: chapterTitle,
    description: chapterDescription,
    targetDuration: 300,
    estimatedSegments: 10,
    contentFocus: ['역사', '문화']
  },
  language: requestLanguage,
  personaDetails: getPersonaDetails(requestLanguage),
  locationAnalysis: await analyzeLocation(location)
});
```

#### 2. 컴포넌트에서 사용
```typescript
// ChapterBasedPodcastGenerator.tsx
import { getSpeakerLabels, parseDialogueScript } from '@/lib/ai/prompts/podcast';

const labels = getSpeakerLabels(language);
const segments = parseDialogueScript(generatedScript, language);
```

### 고급 사용법

#### 페르소나 통합
```typescript
import { personaPromptIntegrator } from '@/lib/ai/prompts/podcast/persona-prompt-integration';

// 동적 대화 예시 생성
const dialogueExample = personaPromptIntegrator.generateDynamicDialogueExample(
  '경복궁의 역사',
  ['조선 왕조의 정궁', '1395년 건립'],
  'ko',
  4 // 대화 턴 수
);

// NotebookLM 패턴 생성
const patterns = personaPromptIntegrator.generateNotebookLMPatterns(
  HOST_PERSONA,
  3
);
```

## 언어별 커스터마이징

### 한국어 (korean-podcast.ts)
- **화자**: male (진행자) / female (큐레이터)
- **특징**: 친근하고 자연스러운 대화
- **문화적 요소**: 존댓말, 감탄사 활용

### 영어 (english-podcast.ts)
- **화자**: Host (Sarah) / Curator (Dr. Thompson)
- **특징**: 전문적이면서도 접근하기 쉬운 톤
- **문화적 요소**: 스토리텔링 중심

### 일본어 (japanese-podcast.ts)
- **화자**: ホスト (田中ユウ) / キュレーター (佐藤先生)
- **특징**: 정중하고 세심한 설명
- **문화적 요소**: 경어 사용, 계절감 표현

### 중국어 (chinese-podcast.ts)
- **화자**: 主持人 / 策展人
- **특징**: 직접적이고 명확한 정보 전달
- **문화적 요소**: 역사적 연결성 강조

### 스페인어 (spanish-podcast.ts)
- **화자**: Presentador / Curador
- **특징**: 열정적이고 표현력 풍부
- **문화적 요소**: 감정 표현, 스토리 중심

## 페르소나 시스템

### 페르소나 특성
```typescript
interface PodcastPersona {
  name: string;
  role: 'host' | 'curator';
  characteristics: {
    personality: string[];
    speakingStyle: string[];
    expertise: string[];
    conversationPatterns: string[];
  };
  responses: {
    surprise: string[];
    curiosity: string[];
    explanation: string[];
    engagement: string[];
    transition: string[];
  };
  notebookLMPatterns: {
    interruptions: string[];
    affirmations: string[];
    questions: string[];
    transitions: string[];
  };
}
```

### 페르소나 품질 검증
```typescript
import { personaQualityValidator } from '@/lib/ai/prompts/podcast/persona-prompt-integration';

const validation = personaQualityValidator.validatePersonaConsistency(
  dialogue,
  expectedPersona
);

if (!validation.isConsistent) {
  console.log('페르소나 일관성 문제:', validation.issues);
}
```

## API 통합

### 1. generate-by-chapter API
```typescript
// POST /api/tts/notebooklm/generate-by-chapter
{
  "location": "경복궁",
  "language": "ko",
  "chapterIndex": 0,
  "chapterTitle": "광화문과 근정전",
  "chapterDescription": "조선 왕조의 중심"
}
```

### 2. generate API (전체 가이드)
```typescript
// POST /api/tts/notebooklm/generate
{
  "location": "Eiffel Tower",
  "language": "en",
  "guideId": "guide-123"
}
```

### 3. 프로그레스 트래킹
```typescript
// 실시간 진행 상황 모니터링
const checkProgress = async (episodeId: string) => {
  const { data } = await supabase
    .from('podcast_segments')
    .select('status, segment_index')
    .eq('episode_id', episodeId);
  
  const completed = data.filter(s => s.status === 'completed').length;
  const total = data.length;
  const progress = (completed / total) * 100;
  
  return { progress, completed, total };
};
```

## 테스트 및 검증

### 통합 테스트 실행
```bash
# 전체 시스템 테스트
node test-podcast-system.js

# 예상 출력:
# ✅ 모든 필수 함수가 정상적으로 export됨
# ✅ ko: 15234자 생성
# ✅ en: 14892자 생성
# ✅ 페르소나 시스템 정상 작동
# ✅ 모든 언어 레이블 정상
# ✅ 스크립트 파싱 정상 작동
# 🎉 모든 테스트 통과!
```

### 개별 언어 테스트
```javascript
// 특정 언어 프롬프트 테스트
const testKoreanPrompt = async () => {
  const config = {
    locationName: '경복궁',
    chapter: { title: '테스트', description: '테스트' },
    language: 'ko'
  };
  
  const prompt = await createPodcastChapterPrompt(config);
  console.log('생성된 프롬프트 길이:', prompt.length);
};
```

## 문제 해결

### 일반적인 문제

#### 1. 프롬프트가 생성되지 않음
```typescript
// 체크리스트:
// ✓ language 파라미터가 올바른지 확인 (ko, en, ja, zh, es)
// ✓ personaDetails가 제공되었는지 확인
// ✓ locationAnalysis 데이터가 있는지 확인

// 디버깅:
console.log('Config:', JSON.stringify(config, null, 2));
```

#### 2. 화자 레이블 불일치
```typescript
// 언어별 레이블 확인
const labels = getSpeakerLabels(language);
console.log('사용 중인 레이블:', labels);

// 파싱 전 레이블 정규화
const normalizedScript = script.replace(/\*\*Host:\*\*/g, `**${labels.host || labels.male}:**`);
```

#### 3. 페르소나 일관성 문제
```typescript
// 페르소나 검증 실행
const validation = personaQualityValidator.validatePersonaConsistency(
  generatedDialogue,
  expectedPersona
);

if (validation.score < 70) {
  // 재생성 또는 수정 필요
  console.log('페르소나 점수:', validation.score);
  console.log('문제점:', validation.issues);
}
```

### 성능 최적화

#### 프롬프트 캐싱
```typescript
const promptCache = new Map();

const getCachedPrompt = (config) => {
  const key = `${config.language}-${config.chapter.title}`;
  
  if (!promptCache.has(key)) {
    promptCache.set(key, createPodcastChapterPrompt(config));
  }
  
  return promptCache.get(key);
};
```

#### 병렬 처리
```typescript
// 여러 챕터 동시 생성
const generateMultipleChapters = async (chapters, language) => {
  const prompts = await Promise.all(
    chapters.map(chapter => 
      createPodcastChapterPrompt({ 
        ...baseConfig, 
        chapter, 
        language 
      })
    )
  );
  
  return prompts;
};
```

## 향후 개선 계획

### 단기 (1-2주)
- [ ] 프롬프트 A/B 테스팅 시스템
- [ ] 품질 점수 자동 추적
- [ ] 캐싱 메커니즘 강화

### 중기 (1-2개월)
- [ ] 추가 언어 지원 (프랑스어, 독일어)
- [ ] AI 모델별 프롬프트 최적화
- [ ] 사용자 피드백 반영 시스템

### 장기 (3-6개월)
- [ ] ML 기반 프롬프트 자동 최적화
- [ ] 실시간 품질 모니터링 대시보드
- [ ] 개인화된 페르소나 생성

## 참고 자료

### 관련 파일
- 프롬프트 시스템: `src/lib/ai/prompts/podcast/`
- 페르소나 정의: `src/lib/ai/personas/podcast-personas.ts`
- API 라우트: `app/api/tts/notebooklm/`
- 컴포넌트: `src/components/audio/ChapterBasedPodcastGenerator.tsx`

### 테스트 스크립트
- 통합 테스트: `test-podcast-system.js`
- 품질 검증: `check-episode-status.js`
- 파싱 테스트: `test-parsing-patterns.js`

## 연락처

문제가 발생하거나 개선 제안이 있으시면:
- GitHub Issues에 등록
- 프로젝트 관리자에게 직접 연락
- Slack #podcast-system 채널

---

*최종 업데이트: 2025년 1월*
*버전: 2.0.0*
*작성자: AI Assistant with Structured Approach*