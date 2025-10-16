// 🎯 AI 가이드 품질 검증 API
// 자동화된 콘텐츠 평가 및 품질 점수 산출

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HallucinationPreventionSystem } from '@/lib/ai/hallucination-prevention';

export const runtime = 'nodejs';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// 품질 검증 결과 인터페이스
interface GuideQualityVerification {
  factualAccuracy: number;      // 0-100 (사실 검증 점수)
  contentCompleteness: number;  // 0-100 (필수 필드 존재 여부)
  coherenceScore: number;       // 0-100 (논리적 흐름 평가)
  culturalSensitivity: number;  // 0-100 (문화적 적절성)
  overallQuality: number;       // 가중 평균
  confidenceLevel: number;      // 0-100 (AI 평가 신뢰도)
  issues: QualityIssue[];       // 식별된 구체적 문제점
  recommendations: string[];    // 개선 제안사항
  processingTime: number;       // 검증 소요 시간 (ms)
}

interface QualityIssue {
  category: 'factual' | 'structure' | 'language' | 'cultural' | 'completeness';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string;            // 문제가 발생한 위치
  suggestion: string;           // 수정 제안사항
}

// 품질 검증 요청 인터페이스
interface VerificationRequest {
  guideContent: any;            // 검증할 가이드 콘텐츠
  locationName: string;         // 위치명
  language: string;             // 언어
  expectedElements?: string[];  // 기대되는 요소들
}

// 품질 임계값 설정
const QUALITY_THRESHOLDS = {
  EXCELLENT: 90,        // 우수 (90점 이상)
  GOOD: 75,            // 양호 (75-89점)
  ACCEPTABLE: 60,      // 허용 가능 (60-74점)
  POOR: 40,            // 불량 (40-59점)
  CRITICAL: 0          // 심각 (40점 미만)
};

// 품질 가중치 설정
const QUALITY_WEIGHTS = {
  factualAccuracy: 0.35,       // 35% - 사실 정확성이 가장 중요
  contentCompleteness: 0.25,   // 25% - 완성도
  coherenceScore: 0.20,        // 20% - 논리적 흐름
  culturalSensitivity: 0.20    // 20% - 문화적 적절성
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🔍 가이드 품질 검증 시작');

    const body: VerificationRequest = await request.json();
    const { guideContent, locationName, language, expectedElements } = body;

    // 입력 검증
    if (!guideContent || !locationName || !language) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '필수 필드가 누락되었습니다.' 
        }),
        { status: 400, headers }
      );
    }

    // AI 기반 품질 검증 수행
    const verificationResult = await performQualityVerification(
      guideContent, 
      locationName, 
      language,
      expectedElements
    );

    const processingTime = Date.now() - startTime;
    verificationResult.processingTime = processingTime;

    console.log(`✅ 품질 검증 완료: ${verificationResult.overallQuality}점 (${processingTime}ms)`);

    return NextResponse.json({
      success: true,
      verification: verificationResult,
      qualityLevel: getQualityLevel(verificationResult.overallQuality),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 품질 검증 실패:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `품질 검증 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      }),
      { status: 500, headers }
    );
  }
}

// AI 기반 품질 검증 수행
async function performQualityVerification(
  guideContent: any,
  locationName: string,
  language: string,
  expectedElements?: string[]
): Promise<GuideQualityVerification> {
  
  // 1. 구조적 검증 (빠른 검증)
  const structuralResults = await performStructuralVerification(guideContent, expectedElements);
  
  // 2. AI 기반 콘텐츠 검증 (시간 소요)
  const aiResults = await performAIContentVerification(guideContent, locationName, language);
  
  // 3. 결과 통합 및 점수 계산
  const combinedResults = combineVerificationResults(structuralResults, aiResults);
  
  return combinedResults;
}

// 구조적 검증 (JSON 구조, 필수 필드 등) + 할루시네이션 방지
async function performStructuralVerification(
  guideContent: any,
  expectedElements?: string[]
): Promise<Partial<GuideQualityVerification>> {
  
  const issues: QualityIssue[] = [];
  const recommendations: string[] = [];
  
  let completenessScore = 100;

  // 🛡️ 할루시네이션 방지 검증 추가
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && guideContent.realTimeGuide?.chapters) {
      const hallucinationPrevention = new HallucinationPreventionSystem(apiKey);
      
      // 챕터 제목들에 대한 빠른 할루시네이션 검증
      for (let i = 0; i < guideContent.realTimeGuide.chapters.length; i++) {
        const chapter = guideContent.realTimeGuide.chapters[i];
        if (chapter.title) {
          const verification = await hallucinationPrevention.verifyChapterReality(
            chapter.title,
            guideContent.location || 'Unknown',
            chapter
          );
          
          if (!verification.isReal && verification.confidence > 0.7) {
            issues.push({
              category: 'factual',
              severity: 'high',
              description: `챕터 "${chapter.title}"가 실존하지 않을 가능성이 높습니다`,
              location: `chapters[${i}].title`,
              suggestion: verification.suggestions?.[0] || '실제 존재하는 장소명으로 수정해주세요'
            });
            completenessScore -= 15;
          } else if (!verification.isReal && verification.confidence > 0.5) {
            issues.push({
              category: 'factual',
              severity: 'medium',
              description: `챕터 "${chapter.title}"의 실존성에 의문이 있습니다`,
              location: `chapters[${i}].title`,
              suggestion: '실제 장소인지 재확인 필요'
            });
            completenessScore -= 8;
          }
        }
      }
    }
  } catch (hallucinationError) {
    console.warn('⚠️ 할루시네이션 검증 실패:', hallucinationError);
    // 기본 패턴 검증으로 폴백
    if (guideContent.realTimeGuide?.chapters) {
      guideContent.realTimeGuide.chapters.forEach((chapter: any, index: number) => {
        if (chapter.title && hasHallucinationPatterns(chapter.title)) {
          issues.push({
            category: 'factual',
            severity: 'medium',
            description: `챕터 "${chapter.title}"에 의심스러운 패턴이 발견되었습니다`,
            location: `chapters[${index}].title`,
            suggestion: '더 구체적이고 실제적인 장소명으로 수정해주세요'
          });
          completenessScore -= 10;
        }
      });
    }
  }
  
  try {
    // 기본 구조 검증
    if (!guideContent.realTimeGuide) {
      issues.push({
        category: 'structure',
        severity: 'critical',
        description: 'realTimeGuide 필드가 없습니다',
        suggestion: 'realTimeGuide 객체를 추가해주세요'
      });
      completenessScore -= 30;
    }
    
    // 챕터 검증
    if (!guideContent.realTimeGuide?.chapters || guideContent.realTimeGuide.chapters.length === 0) {
      issues.push({
        category: 'structure',
        severity: 'high',
        description: '챕터가 없습니다',
        suggestion: '최소 1개 이상의 챕터를 추가해주세요'
      });
      completenessScore -= 25;
    }
    
    // 각 챕터 검증
    if (guideContent.realTimeGuide?.chapters) {
      guideContent.realTimeGuide.chapters.forEach((chapter: any, index: number) => {
        if (!chapter.title || chapter.title.trim().length === 0) {
          issues.push({
            category: 'completeness',
            severity: 'medium',
            description: `챕터 ${index + 1}에 제목이 없습니다`,
            location: `chapters[${index}].title`,
            suggestion: '챕터 제목을 추가해주세요'
          });
          completenessScore -= 5;
        }
        
        if (!chapter.content || chapter.content.trim().length < 50) {
          issues.push({
            category: 'completeness',
            severity: 'medium',
            description: `챕터 ${index + 1}의 내용이 너무 짧습니다`,
            location: `chapters[${index}].content`,
            suggestion: '챕터 내용을 더 상세히 작성해주세요'
          });
          completenessScore -= 10;
        }
      });
    }
    
    // 메타데이터 검증
    if (!guideContent.location || !guideContent.overview) {
      issues.push({
        category: 'completeness',
        severity: 'medium',
        description: '기본 메타데이터가 부족합니다',
        suggestion: 'location, overview 필드를 추가해주세요'
      });
      completenessScore -= 15;
    }
    
    // 기대 요소 검증
    if (expectedElements) {
      expectedElements.forEach(element => {
        if (!hasElement(guideContent, element)) {
          issues.push({
            category: 'completeness',
            severity: 'low',
            description: `기대 요소 '${element}'가 누락되었습니다`,
            suggestion: `${element} 정보를 추가해주세요`
          });
          completenessScore -= 5;
        }
      });
    }
    
    // 추천사항 생성
    if (completenessScore < 90) {
      recommendations.push('누락된 필수 필드를 추가하여 완성도를 높여주세요');
    }
    if (issues.some(issue => issue.category === 'structure')) {
      recommendations.push('가이드 구조를 표준 형식에 맞게 수정해주세요');
    }
    
  } catch (error) {
    console.error('구조적 검증 오류:', error);
    completenessScore = 0;
    issues.push({
      category: 'structure',
      severity: 'critical',
      description: '가이드 구조 분석 중 오류가 발생했습니다',
      suggestion: '가이드 형식을 확인해주세요'
    });
  }
  
  return {
    contentCompleteness: Math.max(0, completenessScore),
    issues,
    recommendations
  };
}

// AI 기반 콘텐츠 검증
async function performAIContentVerification(
  guideContent: any,
  locationName: string,
  language: string
): Promise<Partial<GuideQualityVerification>> {
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY가 설정되지 않았습니다');
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite-preview-06-17',
      generationConfig: {
        temperature: 0.1,  // 일관된 평가를 위해 낮은 온도
        maxOutputTokens: 2048
      }
    });

    const verificationPrompt = `다음 관광 가이드의 품질을 평가해주세요.

위치: ${locationName}
언어: ${language}
가이드 내용: ${JSON.stringify(guideContent, null, 2)}

다음 기준으로 평가하고 JSON 형식으로 응답해주세요:

{
  "factualAccuracy": 0-100점 (역사적 사실, 수치, 인명 등의 정확성),
  "coherenceScore": 0-100점 (논리적 흐름, 스토리텔링 품질),
  "culturalSensitivity": 0-100점 (문화적 적절성, 존중도),
  "confidenceLevel": 0-100점 (평가에 대한 확신도),
  "detectedIssues": [
    {
      "category": "factual|language|cultural",
      "severity": "low|medium|high|critical", 
      "description": "구체적인 문제점",
      "suggestion": "개선 제안사항"
    }
  ],
  "aiRecommendations": ["개선을 위한 구체적 제안사항들"]
}

평가 시 고려사항:
- 사실 정확성: 알려진 역사적 사실과 일치하는지
- 논리적 흐름: 내용이 자연스럽게 연결되는지
- 문화적 적절성: 해당 문화권에 대한 존중과 이해
- 언어 품질: 문법, 어휘 선택, 읽기 편의성`;

    const result = await model.generateContent(verificationPrompt);
    const response = await result.response;
    const text = await response.text();
    
    console.log('AI 검증 응답:', text);
    
    try {
      const aiResult = JSON.parse(text);
      
      // AI 결과를 우리 형식으로 변환
      const convertedIssues: QualityIssue[] = (aiResult.detectedIssues || []).map((issue: any) => ({
        category: issue.category,
        severity: issue.severity,
        description: issue.description,
        suggestion: issue.suggestion
      }));
      
      return {
        factualAccuracy: Math.min(100, Math.max(0, aiResult.factualAccuracy || 50)),
        coherenceScore: Math.min(100, Math.max(0, aiResult.coherenceScore || 50)),
        culturalSensitivity: Math.min(100, Math.max(0, aiResult.culturalSensitivity || 50)),
        confidenceLevel: Math.min(100, Math.max(0, aiResult.confidenceLevel || 50)),
        issues: convertedIssues,
        recommendations: aiResult.aiRecommendations || []
      };
      
    } catch (parseError) {
      console.error('AI 응답 파싱 실패:', parseError);
      
      // 파싱 실패 시 기본값 반환
      return {
        factualAccuracy: 60,
        coherenceScore: 60,
        culturalSensitivity: 70,
        confidenceLevel: 30,
        issues: [{
          category: 'language',
          severity: 'medium',
          description: 'AI 분석 결과를 파싱할 수 없습니다',
          suggestion: '콘텐츠 형식을 확인해주세요'
        }],
        recommendations: ['AI 분석을 다시 수행해주세요']
      };
    }
    
  } catch (error) {
    console.error('AI 콘텐츠 검증 실패:', error);
    
    // AI 검증 실패 시 기본값 반환
    return {
      factualAccuracy: 50,
      coherenceScore: 50,
      culturalSensitivity: 50,
      confidenceLevel: 20,
      issues: [{
        category: 'factual',
        severity: 'medium',
        description: 'AI 검증을 수행할 수 없습니다',
        suggestion: 'AI 서비스 상태를 확인해주세요'
      }],
      recommendations: ['수동 검토를 수행해주세요']
    };
  }
}

// 검증 결과 통합
function combineVerificationResults(
  structuralResults: Partial<GuideQualityVerification>,
  aiResults: Partial<GuideQualityVerification>
): GuideQualityVerification {
  
  // 점수 통합
  const factualAccuracy = aiResults.factualAccuracy || 50;
  const contentCompleteness = structuralResults.contentCompleteness || 50;
  const coherenceScore = aiResults.coherenceScore || 50;
  const culturalSensitivity = aiResults.culturalSensitivity || 50;
  
  // 가중 평균으로 전체 품질 점수 계산
  const overallQuality = Math.round(
    factualAccuracy * QUALITY_WEIGHTS.factualAccuracy +
    contentCompleteness * QUALITY_WEIGHTS.contentCompleteness +
    coherenceScore * QUALITY_WEIGHTS.coherenceScore +
    culturalSensitivity * QUALITY_WEIGHTS.culturalSensitivity
  );
  
  // 이슈와 추천사항 통합
  const allIssues = [
    ...(structuralResults.issues || []),
    ...(aiResults.issues || [])
  ];
  
  const allRecommendations = [
    ...(structuralResults.recommendations || []),
    ...(aiResults.recommendations || [])
  ];
  
  return {
    factualAccuracy,
    contentCompleteness,
    coherenceScore,
    culturalSensitivity,
    overallQuality,
    confidenceLevel: aiResults.confidenceLevel || 70,
    issues: allIssues,
    recommendations: [...new Set(allRecommendations)], // 중복 제거
    processingTime: 0 // 나중에 설정됨
  };
}

// 품질 레벨 결정
function getQualityLevel(score: number): string {
  if (score >= QUALITY_THRESHOLDS.EXCELLENT) return 'excellent';
  if (score >= QUALITY_THRESHOLDS.GOOD) return 'good';
  if (score >= QUALITY_THRESHOLDS.ACCEPTABLE) return 'acceptable';
  if (score >= QUALITY_THRESHOLDS.POOR) return 'poor';
  return 'critical';
}

// 헬퍼 함수: 특정 요소가 가이드에 포함되어 있는지 확인
function hasElement(guideContent: any, element: string): boolean {
  const searchText = JSON.stringify(guideContent).toLowerCase();
  return searchText.includes(element.toLowerCase());
}

// 헬퍼 함수: 기본 할루시네이션 패턴 확인 (폴백용)
function hasHallucinationPatterns(text: string): boolean {
  const patterns = [
    /\b(가상|상상|임의|예시|테스트)\b/i,
    /\b(존재하지\s*않는|없는)\b/,
    /\b(OO|XX|YY|ZZ)\b/,
    /\b(AI\s*생성|자동\s*생성)\b/i,
    /\[\s*.*\s*\]/
  ];
  
  return patterns.some(pattern => pattern.test(text));
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers
  });
}