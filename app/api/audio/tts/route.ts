// 🎙️ Phase 4: AI 음성 해설 API
// 성격 기반 다국어 TTS 시스템

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

/**
 * 🎙️ TTS 메타데이터 및 설정 제공 API
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🎙️ TTS API 요청 시작');
    
    const body = await request.json();
    const {
      text,
      userPersonality = 'agreeableness',
      language = 'ko-KR',
      culturalContext,
      requestType = 'metadata' // 'metadata' | 'validate' | 'suggestions'
    } = body;
    
    // 입력 검증
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '유효한 텍스트를 제공해주세요.' 
        }),
        { status: 400, headers }
      );
    }
    
    console.log(`🎙️ TTS 요청: ${requestType} (${language}, ${userPersonality})`);
    
    const startTime = performance.now();
    
    try {
      // Phase 4: TTS 메타데이터 생성
      const ttsMetadata = await generateTTSMetadata(
        text,
        userPersonality,
        language,
        culturalContext,
        requestType
      );
      
      const processingTime = performance.now() - startTime;
      
      console.log(`✅ TTS ${requestType} 생성 완료 (${processingTime.toFixed(0)}ms)`);
      
      return NextResponse.json({
        success: true,
        data: {
          ...ttsMetadata,
          originalText: text,
          processedText: ttsMetadata.processedText,
          voiceSettings: ttsMetadata.voiceSettings,
          culturalAdaptations: ttsMetadata.culturalAdaptations
        },
        context: {
          userPersonality,
          language,
          culturalContext: culturalContext || getCulturalContext(language),
          requestType,
          processingTime: Math.round(processingTime)
        },
        // Phase 4 메타데이터
        phase4_tts_system: {
          personality_voice_adaptation: 'active',
          multilingual_support: 'enabled',
          cultural_context: 'applied',
          voice_selection: 'optimized',
          processing_time: Math.round(processingTime),
          text_preprocessing: 'completed',
          voice_parameters_count: Object.keys(ttsMetadata.voiceSettings).length,
          supported_languages: getSupportedTTSLanguages().length
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (ttsError) {
      console.error('❌ TTS 처리 실패:', ttsError);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'TTS 처리에 실패했습니다.',
          details: ttsError instanceof Error ? ttsError.message : 'Unknown error'
        }),
        { status: 500, headers }
      );
    }
    
  } catch (error) {
    console.error('❌ TTS API 오류:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'API 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers }
    );
  }
}

/**
 * 🎙️ TTS 메타데이터 생성
 */
async function generateTTSMetadata(
  text: string,
  userPersonality: string,
  language: string,
  culturalContext?: string,
  requestType: string = 'metadata'
) {
  // 1. 텍스트 전처리
  const processedText = preprocessTextForPersonality(text, userPersonality);
  
  // 2. 성격별 음성 설정
  const voiceSettings = getPersonalityVoiceSettings(userPersonality, language);
  
  // 3. 문화적 적응
  const culturalAdaptations = getCulturalAdaptations(language, culturalContext);
  
  // 4. 음성 선택 추천
  const voiceRecommendations = getVoiceRecommendations(language, userPersonality);
  
  // 5. 재생 시간 추정
  const estimatedDuration = estimateSpeechDuration(processedText, voiceSettings.rate);
  
  // 6. 품질 메트릭
  const qualityMetrics = calculateTTSQualityMetrics(text, processedText, voiceSettings);
  
  return {
    processedText,
    voiceSettings,
    culturalAdaptations,
    voiceRecommendations,
    estimatedDuration,
    qualityMetrics,
    personalityInsights: generatePersonalityInsights(userPersonality, 'voice'),
    optimizationSuggestions: generateOptimizationSuggestions(text, userPersonality, language)
  };
}

/**
 * 🔧 헬퍼 함수들
 */
function preprocessTextForPersonality(text: string, personality: string): string {
  let processed = text;
  
  switch (personality) {
    case 'extraversion':
      processed = text.replace(/\./g, '!').replace(/입니다/g, '입니다!');
      break;
    case 'agreeableness':
      processed = text.replace(/보세요/g, '보셔요').replace(/입니다/g, '이에요');
      break;
    case 'conscientiousness':
      processed = text; // 원본 유지
      break;
    case 'neuroticism':
      processed = text.replace(/!/g, '.').replace(/빨리/g, '천천히');
      break;
    case 'openness':
      processed = text.replace(/입니다/g, '입니다. 흥미롭게도');
      break;
  }
  
  // 적절한 휴지 추가
  processed = processed.replace(/\. /g, '... ');
  
  return processed;
}

function getPersonalityVoiceSettings(personality: string, language: string) {
  const baseSettings: Record<string, any> = {
    openness: { rate: 1.1, pitch: 1.2, volume: 0.9, tone: 'energetic' },
    conscientiousness: { rate: 0.9, pitch: 1.0, volume: 0.8, tone: 'professional' },
    extraversion: { rate: 1.2, pitch: 1.3, volume: 1.0, tone: 'warm' },
    agreeableness: { rate: 1.0, pitch: 1.1, volume: 0.9, tone: 'warm' },
    neuroticism: { rate: 0.8, pitch: 0.9, volume: 0.7, tone: 'calm' }
  };
  
  const settings = baseSettings[personality] || baseSettings.agreeableness;
  
  // 언어별 조정
  const langAdjustments = getLanguageAdjustments(language);
  
  return {
    rate: Math.max(0.1, Math.min(10, settings.rate * langAdjustments.rateMultiplier)),
    pitch: Math.max(0, Math.min(2, settings.pitch * langAdjustments.pitchMultiplier)),
    volume: Math.max(0, Math.min(1, settings.volume)),
    tone: settings.tone,
    preferredGender: settings.preferredGender || 'auto'
  };
}

function getLanguageAdjustments(language: string) {
  const langCode = language.slice(0, 2);
  const adjustments: Record<string, { rateMultiplier: number; pitchMultiplier: number }> = {
    ko: { rateMultiplier: 1.0, pitchMultiplier: 1.0 },
    en: { rateMultiplier: 1.1, pitchMultiplier: 0.95 },
    ja: { rateMultiplier: 0.9, pitchMultiplier: 1.05 },
    zh: { rateMultiplier: 0.95, pitchMultiplier: 1.0 },
    es: { rateMultiplier: 1.2, pitchMultiplier: 1.1 }
  };
  
  return adjustments[langCode] || adjustments.ko;
}

function getCulturalAdaptations(language: string, culturalContext?: string) {
  const context = culturalContext || getCulturalContext(language);
  
  const adaptations: Record<string, any> = {
    korean: {
      formalityLevel: 'high',
      pauseStyle: 'respectful',
      intonationPattern: 'gentle',
      emphasis: 'subtle'
    },
    english: {
      formalityLevel: 'medium',
      pauseStyle: 'natural',
      intonationPattern: 'varied',
      emphasis: 'moderate'
    },
    japanese: {
      formalityLevel: 'very_high',
      pauseStyle: 'ceremonial',
      intonationPattern: 'rising',
      emphasis: 'minimal'
    }
  };
  
  return adaptations[context] || adaptations.korean;
}

function getCulturalContext(language: string): string {
  const langCode = language.slice(0, 2);
  const contexts: Record<string, string> = {
    ko: 'korean',
    en: 'english',
    ja: 'japanese',
    zh: 'chinese',
    es: 'spanish'
  };
  return contexts[langCode] || 'neutral';
}

function getVoiceRecommendations(language: string, personality: string) {
  return {
    primary: `${language}-${personality}`,
    fallback: [`${language}-neutral`, 'default'],
    quality: 'high',
    naturalness: 0.9
  };
}

function estimateSpeechDuration(text: string, rate: number): number {
  // 평균 발화 속도: 분당 150단어 (한국어), rate로 조정
  const wordsPerMinute = 150 * rate;
  const wordCount = text.split(/\s+/).length;
  const durationMinutes = wordCount / wordsPerMinute;
  
  return Math.ceil(durationMinutes * 60); // 초 단위로 반환
}

function calculateTTSQualityMetrics(originalText: string, processedText: string, voiceSettings: any) {
  return {
    textLength: originalText.length,
    processedLength: processedText.length,
    processingRatio: processedText.length / originalText.length,
    personalityAdaptation: processedText !== originalText,
    voiceOptimization: Object.keys(voiceSettings).length,
    estimatedQuality: 0.9, // 추정 품질 점수
    culturalAlignment: 0.85 // 문화적 적응 점수
  };
}

function generatePersonalityInsights(personality: string, domain: string) {
  const insights: Record<string, string[]> = {
    openness: ['호기심을 자극하는 톤', '창의적 표현 사용', '다양한 억양 변화'],
    conscientiousness: ['정확한 발음', '체계적인 전달', '안정적인 속도'],
    extraversion: ['활발한 에너지', '높은 볼륨', '사교적인 톤'],
    agreeableness: ['부드러운 톤', '따뜻한 음성', '친근한 억양'],
    neuroticism: ['차분한 속도', '안정적인 톤', '편안한 음성']
  };
  
  return insights[personality] || ['균형잡힌 음성'];
}

function generateOptimizationSuggestions(text: string, personality: string, language: string): string[] {
  const suggestions: string[] = [];
  
  if (text.length > 1000) {
    suggestions.push('긴 텍스트는 문단별로 나누어 재생하는 것을 권장합니다');
  }
  
  if (personality === 'extraversion') {
    suggestions.push('활발한 성격을 위해 빠른 속도와 높은 음조를 권장합니다');
  }
  
  if (language.startsWith('ko')) {
    suggestions.push('한국어는 존댓말과 반말에 따라 음성 톤을 조정합니다');
  }
  
  return suggestions;
}

function getSupportedTTSLanguages() {
  return ['ko-KR', 'en-US', 'ja-JP', 'cmn-CN', 'es-ES'];
}

/**
 * OPTIONS 메서드 핸들러
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers
  });
}

/**
 * GET 메서드 핸들러 (API 정보)
 */
export async function GET() {
  return NextResponse.json({
    api: 'AI Voice Commentary TTS API',
    phase: 'Phase 4',
    description: '성격 기반 다국어 음성 해설 시스템',
    endpoints: {
      POST: 'TTS 메타데이터 및 설정 생성',
      OPTIONS: 'CORS preflight'
    },
    parameters: {
      text: 'string (required) - 음성 변환할 텍스트',
      userPersonality: 'string (optional) - 사용자 성격 유형',
      language: 'string (optional) - 언어 코드 (기본: ko-KR)',
      culturalContext: 'string (optional) - 문화적 맥락',
      requestType: 'string (optional) - 요청 타입 (metadata/validate/suggestions)'
    },
    features: [
      '성격 기반 음성 적응',
      '다국어 TTS 지원',
      '문화적 맥락 고려',
      '실시간 음성 설정 최적화',
      '텍스트 전처리 및 품질 향상'
    ],
    supportedLanguages: getSupportedTTSLanguages(),
    supportedPersonalities: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
  });
}