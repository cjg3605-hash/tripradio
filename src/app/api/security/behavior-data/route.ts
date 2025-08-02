import { NextRequest, NextResponse } from 'next/server';
import { botDetectionEngine } from '@/lib/security/bot-detection-engine';

/**
 * 클라이언트 행동 데이터 수집 API
 */
export async function POST(request: NextRequest) {
  try {
    const behaviorData = await request.json();
    
    // 행동 패턴 검증
    if (!behaviorData || typeof behaviorData !== 'object') {
      return NextResponse.json(
        { error: '잘못된 행동 데이터 형식' },
        { status: 400 }
      );
    }

    // IP 주소 추출
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') ||
               request.ip ||
               'unknown';

    // 행동 데이터와 함께 봇 탐지 실행
    const detectionResult = await botDetectionEngine.detectBot(request, behaviorData);

    // 결과 로깅 (위험도가 높은 경우만)
    if (detectionResult.riskScore > 50) {
      console.log(`📊 의심스러운 행동 패턴 탐지: ${ip}`, {
        riskScore: detectionResult.riskScore,
        reasons: detectionResult.reasons,
        behaviorSummary: {
          mouseMovements: behaviorData.mouseMovements,
          keystrokes: behaviorData.keystrokes,
          sessionDuration: behaviorData.sessionDuration,
          humanLikelihood: calculateHumanLikelihood(behaviorData)
        }
      });
    }

    // 클라이언트에게 응답 (필요한 정보만)
    return NextResponse.json({
      success: true,
      riskScore: detectionResult.riskScore,
      action: detectionResult.action,
      // 개발/테스트 환경에서만 추가 정보 제공
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          reasons: detectionResult.reasons,
          detectionMethods: detectionResult.detectionMethods,
          humanLikelihood: calculateHumanLikelihood(behaviorData)
        }
      })
    });

  } catch (error) {
    console.error('행동 데이터 처리 오류:', error);
    
    // 오류가 발생해도 클라이언트에게는 성공 응답 (보안상)
    return NextResponse.json({
      success: true,
      riskScore: 0,
      action: 'allow'
    });
  }
}

/**
 * 행동 데이터 기반 인간 가능성 계산
 */
function calculateHumanLikelihood(behaviorData: any): number {
  let humanScore = 1.0;

  // 마우스 움직임 체크
  if (behaviorData.mouseMovements === 0 && behaviorData.sessionDuration > 5000) {
    humanScore -= 0.3;
  }

  // 키보드 입력 체크
  if (behaviorData.keystrokes === 0 && behaviorData.sessionDuration > 10000) {
    humanScore -= 0.2;
  }

  // 페이지 탐색 속도 체크
  if (behaviorData.pageSequence && behaviorData.pageSequence.length > 3) {
    const avgTimePerPage = behaviorData.sessionDuration / behaviorData.pageSequence.length;
    if (avgTimePerPage < 1000) {
      humanScore -= 0.3;
    }
  }

  // 스크롤 이벤트 체크
  if (behaviorData.scrollEvents === 0 && behaviorData.sessionDuration > 15000) {
    humanScore -= 0.2;
  }

  return Math.max(0, Math.min(1, humanScore));
}

/**
 * OPTIONS 요청 처리 (CORS)
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}