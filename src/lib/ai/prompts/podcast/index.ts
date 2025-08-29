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
 * 스크립트를 세그먼트로 파싱 - 기존 API와 완벽 호환
 */
export function parseDialogueScript(
  scriptText: string, 
  language: string = 'ko'
): DialogueSegment[] {
  const segments: DialogueSegment[] = [];
  const lines = scriptText.split('\n').filter(line => line.trim());
  
  // 기존 parseScriptToSegments와 동일한 로직 유지 (완벽한 호환성)
  for (const line of lines) {
    let maleMatch, femaleMatch;
    
    if (language === 'en' || language === 'en-US') {
      // 영어: Host/Curator 또는 Male/Female 패턴
      maleMatch = line.match(/\*\*(?:Host|Male):\*\*\s*(.+)/i);
      femaleMatch = line.match(/\*\*(?:Curator|Female):\*\*\s*(.+)/i);
    } else {
      // 한국어: male/female 또는 진행자/큐레이터 패턴
      maleMatch = line.match(/(?:\*\*)?(?:male|진행자):(?:\*\*)?\s*(.+)/i);
      femaleMatch = line.match(/(?:\*\*)?(?:female|큐레이터):(?:\*\*)?\s*(.+)/i);
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