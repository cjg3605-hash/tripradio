// 🔄 AI 가이드 자동 재생성 API
// 품질이 낮은 가이드를 자동으로 개선하여 재생성

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// 재생성 요청 인터페이스
interface RegenerationRequest {
  locationName: string;
  language?: string;
  currentIssues?: string[];
  targetQualityScore?: number;
  strategy?: 'standard' | 'enhanced' | 'comprehensive';
  forceRegenerate?: boolean;
}

// 재생성 결과 인터페이스
interface RegenerationResult {
  success: boolean;
  newVersion?: number;
  qualityImprovement?: number;
  originalScore?: number;
  newScore?: number;
  processingTime: number;
  strategy: string;
  issues?: string[];
  nextActions?: string[];
}

// 품질 임계값
const QUALITY_THRESHOLDS = {
  AUTO_REGENERATE: 70,      // 70점 미만 시 자동 재생성
  CACHE_INVALIDATE: 60,     // 60점 미만 시 캐시 무효화
  USER_ALERT: 50,           // 50점 미만 시 사용자 알림
  EMERGENCY_FALLBACK: 40    // 40점 미만 시 이전 버전 사용
};

// 재생성 설정
const REGENERATION_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY_MINUTES: 30,
  BATCH_SIZE: 5,
  QUALITY_IMPROVEMENT_TARGET: 15  // 최소 15점 향상 목표
};

// 수동 재생성 트리거
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('🔄 가이드 재생성 요청 시작');

    const body: RegenerationRequest = await request.json();
    const { 
      locationName, 
      language = 'ko', 
      currentIssues = [], 
      targetQualityScore = 80,
      strategy = 'standard',
      forceRegenerate = false
    } = body;

    // 입력 검증
    if (!locationName) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'locationName이 필요합니다.' 
        }),
        { status: 400, headers }
      );
    }

    // 현재 가이드 상태 확인
    const currentGuideInfo = await getCurrentGuideInfo(locationName, language);
    
    // 재생성 필요 여부 확인
    if (!forceRegenerate && !needsRegeneration(currentGuideInfo, targetQualityScore)) {
      return NextResponse.json({
        success: false,
        message: '현재 가이드 품질이 양호하여 재생성이 필요하지 않습니다.',
        currentScore: currentGuideInfo?.qualityScore,
        targetScore: targetQualityScore,
        processingTime: Date.now() - startTime
      });
    }

    // 재생성 실행
    const result = await performRegeneration(
      locationName,
      language,
      currentIssues,
      targetQualityScore,
      strategy,
      currentGuideInfo
    );

    const processingTime = Date.now() - startTime;
    result.processingTime = processingTime;

    console.log(`✅ 재생성 완료: ${locationName} (${processingTime}ms)`);

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 가이드 재생성 실패:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `재생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        processingTime: Date.now() - startTime
      }),
      { status: 500, headers }
    );
  }
}

// 재생성 큐 처리 (백그라운드 작업)
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 재생성 큐 처리 시작');

    const url = new URL(request.url);
    const batchSize = parseInt(url.searchParams.get('batchSize') || '5');
    const strategy = url.searchParams.get('strategy') || 'standard';

    const results = await processRegenerationQueue(batchSize, strategy);

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 재생성 큐 처리 실패:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `큐 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      }),
      { status: 500, headers }
    );
  }
}

// 현재 가이드 정보 조회
async function getCurrentGuideInfo(locationName: string, language: string) {
  try {
    // 현재 프로덕션 버전 조회
    const { data: currentGuide, error } = await supabase
      .from('guide_versions')
      .select(`
        *,
        quality_evolution (
          overall_quality,
          factual_accuracy,
          content_completeness,
          coherence_score,
          cultural_sensitivity,
          detected_issues,
          recommendations,
          created_at
        )
      `)
      .eq('location_name', locationName)
      .eq('language', language)
      .eq('status', 'production')
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error || !currentGuide) {
      console.log('현재 프로덕션 가이드 없음:', error);
      
      // 프로덕션 버전이 없으면 최신 버전 조회
      const { data: latestGuide } = await supabase
        .from('guide_versions')
        .select('*')
        .eq('location_name', locationName)
        .eq('language', language)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      return latestGuide ? {
        ...latestGuide,
        qualityScore: latestGuide.quality_score || 50,
        version: latestGuide.version || 1
      } : null;
    }

    // 최근 품질 평가 정보 추가
    const latestQuality = currentGuide.quality_evolution?.[0];
    
    return {
      ...currentGuide,
      qualityScore: latestQuality?.overall_quality || currentGuide.quality_score || 50,
      qualityDetails: latestQuality,
      version: currentGuide.version || 1
    };

  } catch (error) {
    console.error('현재 가이드 정보 조회 실패:', error);
    return null;
  }
}

// 재생성 필요 여부 판단
function needsRegeneration(guideInfo: any, targetScore: number): boolean {
  if (!guideInfo) return true; // 가이드가 없으면 생성 필요
  
  const currentScore = guideInfo.qualityScore || 0;
  
  // 다양한 재생성 조건
  const conditions = [
    currentScore < QUALITY_THRESHOLDS.AUTO_REGENERATE,  // 품질 임계값 미만
    currentScore < targetScore,                         // 목표 점수 미만
    !guideInfo.content || Object.keys(guideInfo.content).length === 0  // 빈 콘텐츠
  ];

  return conditions.some(condition => condition);
}

// 재생성 실행
async function performRegeneration(
  locationName: string,
  language: string,
  currentIssues: string[],
  targetQualityScore: number,
  strategy: string,
  currentGuideInfo: any
): Promise<RegenerationResult> {

  let attempts = 0;
  const maxAttempts = REGENERATION_CONFIG.MAX_RETRIES;
  let bestResult: any = null;
  let bestScore = 0;

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`🔄 재생성 시도 ${attempts}/${maxAttempts}: ${locationName}`);

    try {
      // 1. 개선된 프롬프트 생성
      const enhancedPrompt = await generateEnhancedPrompt(
        locationName,
        language,
        currentIssues,
        currentGuideInfo,
        strategy
      );

      // 2. AI로 새 가이드 생성
      const newGuideContent = await generateImprovedGuide(enhancedPrompt, locationName);

      // 3. 새 가이드 품질 검증
      const qualityResult = await verifyNewGuideQuality(newGuideContent, locationName, language);

      // 4. 품질 개선 확인
      const originalScore = currentGuideInfo?.qualityScore || 0;
      const newScore = qualityResult.overallQuality;
      const improvement = newScore - originalScore;

      console.log(`📊 품질 비교: ${originalScore} → ${newScore} (${improvement > 0 ? '+' : ''}${improvement.toFixed(1)})`);

      // 5. 목표 달성 또는 최고 점수 업데이트
      if (newScore >= targetQualityScore || newScore > bestScore) {
        bestResult = {
          content: newGuideContent,
          qualityResult,
          originalScore,
          newScore,
          improvement,
          attempts
        };
        bestScore = newScore;

        // 목표 달성 시 조기 종료
        if (newScore >= targetQualityScore) {
          console.log(`🎯 목표 품질 달성: ${newScore}점`);
          break;
        }
      }

      // 6. 개선이 미미하면 다른 전략 시도
      if (improvement < 5 && attempts < maxAttempts) {
        console.log('개선 미미, 다른 전략으로 재시도...');
        strategy = strategy === 'standard' ? 'enhanced' : 'comprehensive';
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
        continue;
      }

    } catch (error) {
      console.error(`재생성 시도 ${attempts} 실패:`, error);
      
      if (attempts === maxAttempts) {
        throw new Error(`모든 재생성 시도 실패: ${error}`);
      }
      
      // 잠시 대기 후 재시도
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  if (!bestResult) {
    throw new Error('재생성에 성공한 결과가 없습니다');
  }

  // 7. 최고 결과로 새 버전 저장
  const newVersion = await saveNewGuideVersion(
    locationName,
    language,
    bestResult.content,
    bestResult.qualityResult,
    currentGuideInfo?.version || 0
  );

  return {
    success: true,
    newVersion,
    qualityImprovement: bestResult.improvement,
    originalScore: bestResult.originalScore,
    newScore: bestResult.newScore,
    processingTime: 0, // 나중에 설정됨
    strategy,
    nextActions: generateNextActions(bestResult.newScore, targetQualityScore)
  };
}

// 개선된 프롬프트 생성
async function generateEnhancedPrompt(
  locationName: string,
  language: string,
  currentIssues: string[],
  currentGuideInfo: any,
  strategy: string
): Promise<string> {

  const basePrompt = `${locationName}에 대한 고품질 관광 가이드를 생성해주세요.`;
  
  let enhancements: string[] = [];

  // 현재 문제점 기반 개선사항
  if (currentIssues.length > 0) {
    enhancements.push(`다음 문제점들을 특히 개선해주세요:\n${currentIssues.map(issue => `- ${issue}`).join('\n')}`);
  }

  // 품질 세부사항 기반 개선
  if (currentGuideInfo?.qualityDetails) {
    const details = currentGuideInfo.qualityDetails;
    
    if (details.factual_accuracy < 80) {
      enhancements.push('사실 정확성을 높이기 위해 검증된 역사적 정보와 정확한 수치를 포함해주세요.');
    }
    
    if (details.content_completeness < 80) {
      enhancements.push('가이드의 완성도를 높이기 위해 모든 필수 정보를 포함해주세요.');
    }
    
    if (details.coherence_score < 80) {
      enhancements.push('논리적 흐름과 스토리텔링을 개선하여 더 흥미롭고 이해하기 쉽게 작성해주세요.');
    }
    
    if (details.cultural_sensitivity < 80) {
      enhancements.push('문화적 민감성을 고려하여 존중하는 표현을 사용해주세요.');
    }
  }

  // 전략별 추가 지시사항
  switch (strategy) {
    case 'enhanced':
      enhancements.push('더 상세하고 전문적인 정보를 포함하여 작성해주세요.');
      enhancements.push('현지인만 알 수 있는 특별한 정보나 이야기를 추가해주세요.');
      break;
      
    case 'comprehensive':
      enhancements.push('종합적이고 체계적인 관점에서 가이드를 작성해주세요.');  
      enhancements.push('역사, 문화, 예술, 건축 등 다양한 관점을 포함해주세요.');
      enhancements.push('실용적인 방문 정보와 팁도 상세히 포함해주세요.');
      break;
  }

  // 품질 기준 명시
  enhancements.push(`
품질 기준:
- 사실 정확성: 90점 이상 (검증된 정보만 사용)
- 완성도: 90점 이상 (모든 필수 필드 포함)
- 논리적 흐름: 85점 이상 (자연스러운 스토리텔링)
- 문화적 적절성: 90점 이상 (존중하는 표현)
  `);

  return [basePrompt, ...enhancements].join('\n\n');
}

// AI로 개선된 가이드 생성
async function generateImprovedGuide(prompt: string, locationName: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash-lite-preview-06-17',
    generationConfig: {
      temperature: 0.3,  // 일관성을 위해 낮은 온도
      maxOutputTokens: 16384
    }
  });

  const fullPrompt = `${prompt}

다음 JSON 형식으로 응답해주세요:
{
  "location": "${locationName}",
  "language": "ko",
  "overview": "관광지 개요",
  "realTimeGuide": {
    "title": "${locationName} 가이드",
    "chapters": [
      {
        "title": "챕터 제목",
        "content": "상세 내용",
        "duration": 300,
        "highlights": ["주요 포인트들"]
      }
    ]
  },
  "practicalInfo": {
    "openingHours": "운영시간",
    "admissionFee": "입장료",
    "accessInfo": "교통정보",
    "tips": ["실용적인 팁들"]
  }
}

JSON 형식으로만 응답해주세요.`;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch (parseError) {
    console.error('AI 응답 파싱 실패:', parseError);
    
    // 파싱 실패 시 기본 구조 반환
    return {
      location: locationName,
      language: 'ko',
      overview: text.substring(0, 500) + '...',
      realTimeGuide: {
        title: `${locationName} 가이드`,
        chapters: [{
          title: '기본 정보',
          content: text,
          duration: 300,
          highlights: ['AI 생성 콘텐츠']
        }]
      },
      practicalInfo: {
        openingHours: '확인 필요',
        admissionFee: '확인 필요',
        accessInfo: '확인 필요',
        tips: ['재생성된 콘텐츠입니다']
      }
    };
  }
}

// 새 가이드 품질 검증
async function verifyNewGuideQuality(guideContent: any, locationName: string, language: string) {
  try {
    // 품질 검증 API 호출
    const verificationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/quality/verify-guide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guideContent,
        locationName,
        language
      })
    });

    if (!verificationResponse.ok) {
      throw new Error('품질 검증 API 호출 실패');
    }

    const verificationData = await verificationResponse.json();
    
    if (!verificationData.success) {
      throw new Error('품질 검증 실패');
    }

    return verificationData.verification;

  } catch (error) {
    console.error('품질 검증 실패:', error);
    
    // 검증 실패 시 기본 점수 반환
    return {
      factualAccuracy: 60,
      contentCompleteness: 70,
      coherenceScore: 65,
      culturalSensitivity: 75,
      overallQuality: 67,
      confidenceLevel: 30,
      issues: [],
      recommendations: ['품질 검증을 다시 수행해주세요']
    };
  }
}

// 새 가이드 버전 저장
async function saveNewGuideVersion(
  locationName: string,
  language: string,
  content: any,
  qualityResult: any,
  currentVersion: number
): Promise<number> {

  const newVersion = currentVersion + 1;

  try {
    // 1. 새 가이드 버전 저장
    const { data: newGuide, error: guideError } = await supabase
      .from('guide_versions')
      .insert({
        location_name: locationName,
        language: language,
        version: newVersion,
        content: content,
        quality_score: qualityResult.overallQuality,
        status: qualityResult.overallQuality >= QUALITY_THRESHOLDS.AUTO_REGENERATE ? 'production' : 'staging',
        verification_results: qualityResult,
        ai_model: 'gemini-2.5-flash-lite-preview-06-17'
      })
      .select('id')
      .single();

    if (guideError) {
      throw guideError;
    }

    // 2. 품질 진화 기록 저장
    await supabase
      .from('quality_evolution')
      .insert({
        guide_id: newGuide.id,
        factual_accuracy: qualityResult.factualAccuracy,
        content_completeness: qualityResult.contentCompleteness,
        coherence_score: qualityResult.coherenceScore,
        cultural_sensitivity: qualityResult.culturalSensitivity,
        overall_quality: qualityResult.overallQuality,
        confidence_level: qualityResult.confidenceLevel,
        verification_method: 'ai_regeneration',
        detected_issues: qualityResult.issues || [],
        recommendations: qualityResult.recommendations || []
      });

    // 3. 프로덕션으로 승격된 경우 이전 버전들을 deprecated로 변경
    if (qualityResult.overallQuality >= QUALITY_THRESHOLDS.AUTO_REGENERATE) {
      await supabase
        .from('guide_versions')
        .update({ status: 'deprecated' })
        .eq('location_name', locationName)
        .eq('language', language)
        .eq('status', 'production')
        .neq('version', newVersion);
    }

    console.log(`💾 새 가이드 버전 저장 완료: v${newVersion} (품질: ${qualityResult.overallQuality}점)`);
    
    return newVersion;

  } catch (error) {
    console.error('새 가이드 버전 저장 실패:', error);
    throw error;
  }
}

// 재생성 큐 처리
async function processRegenerationQueue(batchSize: number, strategy: string): Promise<any[]> {
  try {
    // 대기 중인 재생성 요청 조회
    const { data: queueItems, error } = await supabase
      .from('quality_improvement_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('retry_count', 'max_retries')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(batchSize);

    if (error || !queueItems || queueItems.length === 0) {
      console.log('처리할 재생성 요청이 없습니다');
      return [];
    }

    console.log(`📝 ${queueItems.length}개 재생성 요청 처리 시작`);

    const results: any[] = [];

    for (const item of queueItems) {
      try {
        // 처리 상태로 변경
        await supabase
          .from('quality_improvement_queue')
          .update({ 
            status: 'processing',
            last_attempt_at: new Date().toISOString()
          })
          .eq('id', item.id);

        // 재생성 실행
        const result = await performRegeneration(
          item.location_name,
          item.language || 'ko',
          item.current_issues || [],
          item.target_quality_score || 80,
          strategy,
          null
        );

        // 성공 시 완료 상태로 변경
        await supabase
          .from('quality_improvement_queue')
          .update({ status: 'completed' })
          .eq('id', item.id);

        results.push({
          id: item.id,
          locationName: item.location_name,
          success: true,
          result
        });

        console.log(`✅ ${item.location_name} 재생성 완료`);

      } catch (error) {
        console.error(`❌ ${item.location_name} 재생성 실패:`, error);

        // 재시도 횟수 증가
        const newRetryCount = (item.retry_count || 0) + 1;
        const newStatus = newRetryCount >= (item.max_retries || 3) ? 'failed' : 'pending';

        await supabase
          .from('quality_improvement_queue')
          .update({ 
            status: newStatus,
            retry_count: newRetryCount,
            error_log: [...(item.error_log || []), error instanceof Error ? error.message : String(error)]
          })
          .eq('id', item.id);

        results.push({
          id: item.id,
          locationName: item.location_name,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return results;

  } catch (error) {
    console.error('재생성 큐 처리 실패:', error);
    throw error;
  }
}

// 다음 행동 제안 생성
function generateNextActions(newScore: number, targetScore: number): string[] {
  const actions: string[] = [];

  if (newScore >= targetScore) {
    actions.push('목표 품질에 도달했습니다');
    actions.push('사용자 피드백을 모니터링하세요');
  } else {
    actions.push(`목표 점수 ${targetScore}점까지 ${targetScore - newScore}점 더 개선이 필요합니다`);
    actions.push('추가 재생성을 고려해보세요');
  }

  if (newScore < QUALITY_THRESHOLDS.CACHE_INVALIDATE) {
    actions.push('캐시를 무효화하고 이전 버전을 사용하는 것을 고려하세요');
  }

  return actions;
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers
  });
}