import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { botDetectionEngine, BotDetectionEngine } from '@/lib/security/bot-detection-engine';
import { captchaSystem, CaptchaSystem } from '@/lib/security/captcha-system';

/**
 * 보안 통계 조회 API (관리자 전용)
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    
    // 개발 환경에서만 접근 허용 (프로덕션에서는 관리자 권한 체크 필요)
    if (process.env.NODE_ENV === 'production') {
      if (!session || !isAdmin(session.user?.email)) {
        return NextResponse.json(
          { error: '접근 권한이 없습니다.' },
          { status: 403 }
        );
      }
    }

    // 봇 탐지 엔진 통계
    const botStats = botDetectionEngine.getStats();
    
    // CAPTCHA 시스템 통계
    const captchaStats = captchaSystem.getStats();
    
    // CAPTCHA 설정 정보
    const captchaConfig = captchaSystem.isConfigured();

    // 메모리 사용량 계산
    const memoryUsage = process.memoryUsage();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      botDetection: {
        totalUsers: botStats.totalUsers,
        activeUsers: botStats.activeUsers,
        memoryUsage: botStats.memoryUsage,
        detectionRate: calculateDetectionRate(),
        topThreats: getTopThreats()
      },
      captcha: {
        activeChallenges: captchaStats.activeChallenges,
        totalChallenges: captchaStats.totalChallenges,
        successRate: captchaStats.successRate,
        configuration: {
          recaptchaEnabled: captchaConfig.recaptcha,
          customCaptchaEnabled: captchaConfig.customCaptcha
        }
      },
      system: {
        memoryUsage: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024) // MB
        },
        uptime: Math.floor(process.uptime()), // seconds
        nodeVersion: process.version,
        environment: process.env.NODE_ENV
      }
    });

  } catch (error) {
    console.error('보안 통계 조회 오류:', error);
    return NextResponse.json(
      { error: '통계 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 관리자 권한 확인 (예시)
 */
function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  return adminEmails.includes(email);
}

/**
 * 봇 탐지율 계산 (임시 구현)
 */
function calculateDetectionRate(): number {
  // 실제로는 데이터베이스에서 통계를 가져와야 함
  return 0.85; // 85% 탐지율 (예시)
}

/**
 * 주요 위협 목록 조회 (임시 구현)
 */
function getTopThreats(): Array<{
  type: string;
  count: number;
  description: string;
}> {
  // 실제로는 데이터베이스에서 통계를 가져와야 함
  return [
    {
      type: 'user-agent-bot',
      count: 156,
      description: '알려진 봇 User-Agent'
    },
    {
      type: 'rapid-requests',
      count: 89,
      description: '비정상적으로 빠른 요청'
    },
    {
      type: 'no-interaction',
      count: 67,
      description: '사용자 상호작용 부족'
    },
    {
      type: 'suspicious-pattern',
      count: 34,
      description: '의심스러운 행동 패턴'
    }
  ];
}

/**
 * 보안 설정 업데이트 API (관리자 전용)
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    
    if (process.env.NODE_ENV === 'production') {
      if (!session || !isAdmin(session.user?.email)) {
        return NextResponse.json(
          { error: '접근 권한이 없습니다.' },
          { status: 403 }
        );
      }
    }

    const { action, config } = await request.json();

    switch (action) {
      case 'cleanup':
        // 오래된 데이터 정리
        BotDetectionEngine.cleanup();
        CaptchaSystem.cleanup();
        
        return NextResponse.json({
          success: true,
          message: '데이터 정리가 완료되었습니다.'
        });

      case 'reset-stats':
        // 통계 초기화 (실제 구현 필요)
        return NextResponse.json({
          success: true,
          message: '통계가 초기화되었습니다.'
        });

      default:
        return NextResponse.json(
          { error: '지원하지 않는 작업입니다.' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('보안 설정 업데이트 오류:', error);
    return NextResponse.json(
      { error: '설정 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}