/**
 * 팟캐스트 프롬프트 시스템 - 통합 라우터
 * 일반 가이드 프롬프트 시스템과 동일한 패턴으로 구현
 */

import { PERSONAS } from '@/lib/ai/personas/podcast-personas';
import type { PodcastPersona } from '@/lib/ai/personas/podcast-personas';

// ===============================
// 🔧 인터페이스 정의
// ===============================

export interface ChapterInfo {
  title: string;
  description: string;
  targetDuration: number;
  estimatedSegments: number;
  contentFocus: string[];
}

export interface LocationAnalysisResult {
  significance: string;
  historicalImportance: number;
  culturalValue: number;
  uniqueFeatures: string[];
  recommendations: string[];
}

export interface PersonaDetail {
  name: string;
  description: string;
  expertise: string[];
  speechStyle: string;
  emotionalTone: string;
}

export interface PodcastPromptConfig {
  locationName: string;
  chapter: ChapterInfo;
  locationContext?: any;
  personaDetails: PersonaDetail[];
  locationAnalysis: LocationAnalysisResult;
  language: string;
  previousLastSpeaker?: 'male' | 'female' | null;  // 🔥 이전 챕터의 마지막 화자 (챕터 전환 시 연속 발화 방지)
}

export interface SpeakerLabels {
  male: string;
  female: string;
  host: string;
  curator: string;
}

export interface DialogueSegment {
  speaker: string;
  content: string;
  timestamp?: number;
  duration?: number;
}

// ===============================
// 🔧 공통 설정들
// ===============================

export const PODCAST_LANGUAGE_CONFIGS: Record<string, {
  code: string;
  name: string;
  nativeName: string;
  ttsLang: string;
  speakerLabels: SpeakerLabels;
}> = {
  ko: {
    code: 'ko',
    name: '한국어',
    nativeName: '한국어',
    ttsLang: 'ko-KR',
    speakerLabels: {
      male: 'male',
      female: 'female', 
      host: '진행자',
      curator: '큐레이터'
    }
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    ttsLang: 'en-US',
    speakerLabels: {
      male: 'Host',
      female: 'Curator',
      host: 'Host',
      curator: 'Curator'
    }
  },
  ja: {
    code: 'ja',
    name: '日本語',
    nativeName: '日本語', 
    ttsLang: 'ja-JP',
    speakerLabels: {
      male: 'ホスト',
      female: 'キュレーター',
      host: 'ホスト',
      curator: 'キュレーター'
    }
  },
  zh: {
    code: 'zh',
    name: '中文',
    nativeName: '中文',
    ttsLang: 'cmn-CN',
    speakerLabels: {
      male: '主持人',
      female: '策展人',
      host: '主持人',
      curator: '策展人'
    }
  },
  es: {
    code: 'es',
    name: 'Español',
    nativeName: 'Español',
    ttsLang: 'es-ES',
    speakerLabels: {
      male: 'Presentador',
      female: 'Curador',
      host: 'Presentador',
      curator: 'Curador'
    }
  }
};

// ===============================
// 🔧 메인 프롬프트 라우터들
// ===============================

/**
 * 챕터별 팟캐스트 프롬프트 생성 라우터
 */
export async function createPodcastChapterPrompt(
  config: PodcastPromptConfig
): Promise<string> {
  const langCode = config.language.slice(0, 2).toLowerCase();
  
  try {
    switch (langCode) {
      case 'ko': {
        const koreanModule = await import('./korean-podcast');
        return koreanModule.createKoreanPodcastPrompt(config);
      }
      case 'en': {
        try {
          const englishModule = await import('./english-podcast');
          return englishModule.createEnglishPodcastPrompt(config);
        } catch {
          // 영어 파일이 없으면 한국어로 폴백
          const koreanModule = await import('./korean-podcast');
          return koreanModule.createKoreanPodcastPrompt(config);
        }
      }
      case 'ja': {
        try {
          const japaneseModule = await import('./japanese-podcast');
          return japaneseModule.createJapanesePodcastPrompt(config);
        } catch {
          const koreanModule = await import('./korean-podcast');
          return koreanModule.createKoreanPodcastPrompt(config);
        }
      }
      case 'zh': {
        try {
          const chineseModule = await import('./chinese-podcast');
          return chineseModule.createChinesePodcastPrompt(config);
        } catch {
          const koreanModule = await import('./korean-podcast');
          return koreanModule.createKoreanPodcastPrompt(config);
        }
      }
      case 'es': {
        try {
          const spanishModule = await import('./spanish-podcast');
          return spanishModule.createSpanishPodcastPrompt(config);
        } catch {
          const koreanModule = await import('./korean-podcast');
          return koreanModule.createKoreanPodcastPrompt(config);
        }
      }
      default: {
        console.warn(`Unsupported language: ${config.language}, falling back to Korean`);
        const koreanModule = await import('./korean-podcast');
        return koreanModule.createKoreanPodcastPrompt(config);
      }
    }
  } catch (error) {
    console.error(`Failed to load ${config.language} podcast prompts:`, error);
    const koreanModule = await import('./korean-podcast');
    return koreanModule.createKoreanPodcastPrompt(config);
  }
}

/**
 * 전체 가이드 팟캐스트 프롬프트 생성 라우터
 */
export async function createFullGuidePodcastPrompt(
  locationName: string,
  guideData: any,
  language: string = 'ko',
  options: {
    priority?: 'engagement' | 'accuracy' | 'emotion';
    audienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    podcastStyle?: 'deep-dive' | 'casual' | 'educational' | 'exploratory';
  } = {}
): Promise<string> {
  const langCode = language.slice(0, 2).toLowerCase();
  
  try {
    switch (langCode) {
      case 'ko': {
        const koreanModule = await import('./korean-podcast');
        return koreanModule.createKoreanFullGuidePrompt(locationName, guideData, options);
      }
      case 'en': {
        try {
          const englishModule = await import('./english-podcast');
          return englishModule.createEnglishFullGuidePrompt(locationName, guideData, options);
        } catch {
          const koreanModule = await import('./korean-podcast');
          return koreanModule.createKoreanFullGuidePrompt(locationName, guideData, options);
        }
      }
      case 'ja': {
        try {
          const japaneseModule = await import('./japanese-podcast');
          return japaneseModule.createJapaneseFullGuidePrompt(locationName, guideData, options);
        } catch {
          const koreanModule = await import('./korean-podcast');
          return koreanModule.createKoreanFullGuidePrompt(locationName, guideData, options);
        }
      }
      case 'zh': {
        try {
          const chineseModule = await import('./chinese-podcast');
          return chineseModule.createChineseFullGuidePrompt(locationName, guideData, options);
        } catch {
          const koreanModule = await import('./korean-podcast');
          return koreanModule.createKoreanFullGuidePrompt(locationName, guideData, options);
        }
      }
      case 'es': {
        try {
          const spanishModule = await import('./spanish-podcast');
          return spanishModule.createSpanishFullGuidePrompt(locationName, guideData, options);
        } catch {
          const koreanModule = await import('./korean-podcast');
          return koreanModule.createKoreanFullGuidePrompt(locationName, guideData, options);
        }
      }
      default: {
        console.warn(`Unsupported language: ${language}, falling back to Korean`);
        const koreanModule = await import('./korean-podcast');
        return koreanModule.createKoreanFullGuidePrompt(locationName, guideData, options);
      }
    }
  } catch (error) {
    console.error(`Failed to load ${language} full guide podcast prompts:`, error);
    const koreanModule = await import('./korean-podcast');
    return koreanModule.createKoreanFullGuidePrompt(locationName, guideData, options);
  }
}

// ===============================
// 🔧 유틸리티 함수들
// ===============================

/**
 * 언어별 화자 레이블 가져오기
 */
export function getSpeakerLabels(language: string): SpeakerLabels {
  const langCode = language.slice(0, 2).toLowerCase();
  return PODCAST_LANGUAGE_CONFIGS[langCode]?.speakerLabels || PODCAST_LANGUAGE_CONFIGS.ko.speakerLabels;
}

/**
 * 언어별 페르소나 가져오기
 */
export function getPodcastPersonas(language: string): { host: PodcastPersona; curator: PodcastPersona } {
  const langCode = language.slice(0, 2).toLowerCase();
  
  switch (langCode) {
    case 'en':
      return {
        host: PERSONAS.ENGLISH_HOST,
        curator: PERSONAS.ENGLISH_CURATOR
      };
    case 'ja':
      return {
        host: PERSONAS.JAPANESE_HOST,
        curator: PERSONAS.JAPANESE_CURATOR
      };
    default:
      return {
        host: PERSONAS.HOST,
        curator: PERSONAS.CURATOR
      };
  }
}

/**
 * 스크립트를 세그먼트로 파싱 - 개선된 형식 지원
 * [male] / [female] 패턴 + 마크다운 형식 모두 지원
 */
export function parseDialogueScript(
  scriptText: string,
  language: string = 'ko'
): DialogueSegment[] {
  const segments: DialogueSegment[] = [];
  const lines = scriptText.split('\n').filter(line => line.trim());

  for (const line of lines) {
    let maleMatch, femaleMatch;

    if (language === 'en' || language === 'en-US') {
      // 영어: 모든 패턴 지원 (Host/Curator/Male/Female, 마크다운 및 브래킷)
      maleMatch =
        line.match(/^\[male\]\s*(.+)$/i) ||
        line.match(/^\*\*Host:\*\*\s*(.+)$/i) ||
        line.match(/^\*\*Male:\*\*\s*(.+)$/i) ||
        line.match(/^Host:\s*(.+)$/i) ||
        line.match(/^Male:\s*(.+)$/i);

      femaleMatch =
        line.match(/^\[female\]\s*(.+)$/i) ||
        line.match(/^\*\*Curator:\*\*\s*(.+)$/i) ||
        line.match(/^\*\*Female:\*\*\s*(.+)$/i) ||
        line.match(/^Curator:\s*(.+)$/i) ||
        line.match(/^Female:\s*(.+)$/i);
    } else {
      // 한국어: 모든 패턴 지원 ([male]/[female], 마크다운, 이름)
      maleMatch =
        line.match(/^\[male\]\s*(.+)$/i) ||
        line.match(/^\*\*male:\*\*\s*(.+)$/i) ||
        line.match(/^\*\*진행자:\*\*\s*(.+)$/i) ||
        line.match(/^male:\s*(.+)$/i) ||
        line.match(/^진행자:\s*(.+)$/i);

      femaleMatch =
        line.match(/^\[female\]\s*(.+)$/i) ||
        line.match(/^\*\*female:\*\*\s*(.+)$/i) ||
        line.match(/^\*\*큐레이터:\*\*\s*(.+)$/i) ||
        line.match(/^female:\s*(.+)$/i) ||
        line.match(/^큐레이터:\s*(.+)$/i);
    }

    if (maleMatch) {
      segments.push({
        speaker: 'male',
        content: maleMatch[1].trim()
      });
    } else if (femaleMatch) {
      segments.push({
        speaker: 'female',
        content: femaleMatch[1].trim()
      });
    }
  }

  return segments;
}

/**
 * 팟캐스트 스크립트 검증 함수
 * 형식, 턴 교대, 내용 검증
 */
export interface PodcastValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalTurns: number;
    maleCount: number;
    femaleCount: number;
    malePercentage: number;
    femalePercentage: number;
    hasConsecutiveSpeaker: boolean;
    averageTurnLength: number;
  };
}

export function validatePodcastScript(
  scriptText: string,
  language: string = 'ko'
): PodcastValidationResult {
  const segments = parseDialogueScript(scriptText, language);
  const errors: string[] = [];
  const warnings: string[] = [];

  // 통계 계산
  const maleCount = segments.filter(s => s.speaker === 'male').length;
  const femaleCount = segments.filter(s => s.speaker === 'female').length;
  const totalTurns = segments.length;
  const malePercentage = totalTurns > 0 ? (maleCount / totalTurns) * 100 : 0;
  const femalePercentage = totalTurns > 0 ? (femaleCount / totalTurns) * 100 : 0;
  const totalLength = segments.reduce((sum, s) => sum + s.content.length, 0);
  const averageTurnLength = totalTurns > 0 ? totalLength / totalTurns : 0;

  // 연속 같은 화자 감지
  let hasConsecutiveSpeaker = false;
  for (let i = 0; i < segments.length - 1; i++) {
    if (segments[i].speaker === segments[i + 1].speaker) {
      hasConsecutiveSpeaker = true;
      errors.push(
        `❌ Line ${i + 1}-${i + 2}: [${segments[i].speaker}]가 연속으로 2회 발화 (위치: "${segments[i].content.substring(0, 30)}...")`
      );
    }
  }

  // 형식 검증
  const formatIssues = validateScriptFormat(scriptText, language);
  errors.push(...formatIssues.errors);
  warnings.push(...formatIssues.warnings);

  // 내용 검증
  const contentIssues = validateScriptContent(segments, language);
  warnings.push(...contentIssues.warnings);

  // 균형 검증
  if (maleCount === 0) {
    errors.push('❌ [male] 화자가 없습니다. 최소 3회 이상 필요합니다.');
  } else if (maleCount < 3) {
    warnings.push('⚠️ [male] 화자가 3회 미만입니다. 더 많은 질문이 필요할 수 있습니다.');
  }

  if (femaleCount === 0) {
    errors.push('❌ [female] 화자가 없습니다. 최소 3회 이상 필요합니다.');
  } else if (femaleCount < 3) {
    warnings.push('⚠️ [female] 화자가 3회 미만입니다. 더 많은 설명이 필요할 수 있습니다.');
  }

  // 비율 검증 (40-60% 범위 권장)
  if (malePercentage < 30 || malePercentage > 70) {
    warnings.push(`⚠️ [male] 비율이 ${malePercentage.toFixed(1)}%입니다. 40-60% 범위를 권장합니다.`);
  }
  if (femalePercentage < 30 || femalePercentage > 70) {
    warnings.push(`⚠️ [female] 비율이 ${femalePercentage.toFixed(1)}%입니다. 40-60% 범위를 권장합니다.`);
  }

  // 턴 길이 검증
  const tooLongTurns = segments.filter(s => s.content.split('。').length > 5 || s.content.length > 200);
  if (tooLongTurns.length > 0) {
    warnings.push(`⚠️ ${tooLongTurns.length}개의 턴이 너무 깁니다. (권장: 한 턴 3-4문장 이내)`);
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    stats: {
      totalTurns,
      maleCount,
      femaleCount,
      malePercentage: parseFloat(malePercentage.toFixed(1)),
      femalePercentage: parseFloat(femalePercentage.toFixed(1)),
      hasConsecutiveSpeaker,
      averageTurnLength: parseFloat(averageTurnLength.toFixed(1))
    }
  };
}

/**
 * 스크립트 형식 검증
 */
function validateScriptFormat(scriptText: string, language: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 마크다운 형식 검사
  if (scriptText.includes('**') || scriptText.includes('##') || scriptText.includes('- ') || scriptText.includes('* ')) {
    warnings.push('⚠️ 마크다운 형식(**, ##, -, *)이 포함되어 있습니다. [male]/[female] 형식만 사용하세요.');
  }

  // 이모지 검사
  const emojiRegex = /[\p{Emoji}]/gu;
  if (emojiRegex.test(scriptText)) {
    warnings.push('⚠️ 이모지가 포함되어 있습니다. 제거하세요.');
  }

  // [male]/[female] 형식 확인
  const lines = scriptText.split('\n').filter(line => line.trim());
  const validLines = lines.filter(line => /^\[(male|female)\]/.test(line.trim()));
  const invalidLines = lines.filter(line => line.trim() && !/^\[(male|female)\]/.test(line.trim()));

  if (invalidLines.length > 0) {
    if (invalidLines.length > 2) {
      errors.push(`❌ ${invalidLines.length}개의 줄이 올바른 형식이 아닙니다. "[male]" 또는 "[female]"로 시작해야 합니다.`);
    } else {
      invalidLines.forEach(line => {
        warnings.push(`⚠️ 형식 문제: "${line.substring(0, 40)}..."`);
      });
    }
  }

  return { errors, warnings };
}

/**
 * 스크립트 내용 검증
 */
function validateScriptContent(segments: DialogueSegment[], language: string): { warnings: string[] } {
  const warnings: string[] = [];

  // 추상적 표현 검사
  const abstractPhrases = ['아름다운', '신비로운', '경이로운', '멋진', '황홀한', '웅장한'];
  const emptySegments = segments.filter(s =>
    !s.content || s.content.trim().length === 0
  );

  if (emptySegments.length > 0) {
    warnings.push(`⚠️ ${emptySegments.length}개의 빈 세그먼트가 있습니다.`);
  }

  // 반복 표현 검사
  const filler = ['정말', '정말', '진짜', '대충', '좀'];
  segments.forEach(segment => {
    const content = segment.content;
    abstractPhrases.forEach(phrase => {
      if (content.includes(phrase)) {
        warnings.push(`⚠️ [${segment.speaker}] 추상적 표현 발견: "${phrase}"`);
      }
    });
  });

  return { warnings };
}

/**
 * 언어가 지원되는지 확인
 */
export function isPodcastLanguageSupported(language: string): boolean {
  const langCode = language.slice(0, 2).toLowerCase();
  return langCode in PODCAST_LANGUAGE_CONFIGS;
}

/**
 * 지원되는 팟캐스트 언어 목록 가져오기
 */
export function getSupportedPodcastLanguages(): string[] {
  return Object.keys(PODCAST_LANGUAGE_CONFIGS);
}

/**
 * 팟캐스트 설정 가져오기
 */
export function getPodcastLanguageConfig(language: string) {
  const langCode = language.slice(0, 2).toLowerCase();
  return PODCAST_LANGUAGE_CONFIGS[langCode] || PODCAST_LANGUAGE_CONFIGS.ko;
}

// ===============================
// 🔧 레거시 호환성 함수들
// ===============================

/**
 * @deprecated 기존 API와의 호환성을 위한 함수. createPodcastChapterPrompt 사용 권장
 */
export async function createLegacyPodcastPrompt(
  locationName: string,
  chapterInfo: ChapterInfo,
  language: string,
  locationContext?: any
): Promise<string> {
  const config: PodcastPromptConfig = {
    locationName,
    chapter: chapterInfo,
    locationContext,
    personaDetails: [
      {
        name: '진행자',
        description: '호기심 많은 여행자',
        expertise: ['여행', '문화'],
        speechStyle: '친근하고 자연스러운',
        emotionalTone: '호기심과 경이로움'
      },
      {
        name: '큐레이터',
        description: '전문 해설자',
        expertise: ['역사', '문화', '예술'],
        speechStyle: '전문적이지만 이해하기 쉬운',
        emotionalTone: '열정적이고 친근함'
      }
    ],
    locationAnalysis: {
      significance: '중요한 문화유산',
      historicalImportance: 8,
      culturalValue: 9,
      uniqueFeatures: ['독특한 건축', '역사적 가치'],
      recommendations: ['필수 관람 포인트']
    },
    language
  };
  
  return createPodcastChapterPrompt(config);
}

// ===============================
// 🔧 기본 export
// ===============================

const PodcastPromptModule = {
  createPodcastChapterPrompt,
  createFullGuidePodcastPrompt,
  getSpeakerLabels,
  getPodcastPersonas,
  parseDialogueScript,
  isPodcastLanguageSupported,
  getSupportedPodcastLanguages,
  getPodcastLanguageConfig,
  createLegacyPodcastPrompt,
  PODCAST_LANGUAGE_CONFIGS
};

export default PodcastPromptModule;