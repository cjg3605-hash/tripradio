import { NextRequest, NextResponse } from 'next/server';
import { captchaSystem } from '@/lib/security/captcha-system';

/**
 * CAPTCHA 챌린지 생성 API
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const riskScore = parseInt(searchParams.get('riskScore') || '50');
    const type = searchParams.get('type') as 'math' | 'text' | 'image' | 'auto';

    let challenge;
    
    if (type === 'auto' || !type) {
      // 위험도에 따른 적응형 CAPTCHA
      challenge = captchaSystem.getAdaptiveCaptcha(riskScore);
    } else {
      // 특정 타입의 CAPTCHA
      switch (type) {
        case 'math':
          challenge = captchaSystem.generateMathChallenge();
          break;
        case 'text':
          challenge = captchaSystem.generateTextChallenge();
          break;
        case 'image':
          challenge = captchaSystem.generateImageChallenge();
          break;
        default:
          challenge = captchaSystem.generateMathChallenge();
      }
    }

    return NextResponse.json({
      success: true,
      challenge: {
        id: challenge.id,
        type: challenge.type,
        challenge: challenge.challenge,
        expiresAt: challenge.expiresAt,
        maxAttempts: challenge.maxAttempts
      }
    });

  } catch (error) {
    console.error('CAPTCHA 생성 오류:', error);
    return NextResponse.json(
      { error: 'CAPTCHA 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * CAPTCHA 검증 API
 */
export async function POST(request: NextRequest) {
  try {
    const { challengeId, answer, recaptchaToken, action } = await request.json();

    // reCAPTCHA v3 검증 우선
    if (recaptchaToken) {
      const recaptchaResult = await captchaSystem.verifyRecaptcha(
        recaptchaToken, 
        action || 'submit',
        0.5 // 기본 점수 임계값
      );

      if (recaptchaResult.success) {
        return NextResponse.json({
          success: true,
          type: 'recaptcha',
          score: recaptchaResult.score,
          action: recaptchaResult.action
        });
      } else {
        return NextResponse.json({
          success: false,
          error: recaptchaResult.error,
          type: 'recaptcha'
        }, { status: 400 });
      }
    }

    // 커스텀 CAPTCHA 검증
    if (challengeId && answer) {
      const verificationResult = await captchaSystem.verifyCaptcha(challengeId, answer);

      if (verificationResult.success) {
        return NextResponse.json({
          success: true,
          type: 'custom',
          challengeId: verificationResult.challengeId
        });
      } else {
        return NextResponse.json({
          success: false,
          error: verificationResult.error,
          type: 'custom',
          challengeId: verificationResult.challengeId
        }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: '검증할 CAPTCHA 데이터가 없습니다.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('CAPTCHA 검증 오류:', error);
    return NextResponse.json(
      { error: 'CAPTCHA 검증에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * CAPTCHA 설정 정보 API
 */
export async function OPTIONS() {
  try {
    const config = captchaSystem.isConfigured();
    const siteKey = captchaSystem.getRecaptchaSiteKey();

    return NextResponse.json({
      recaptcha: {
        enabled: config.recaptcha,
        siteKey: config.recaptcha ? siteKey : undefined
      },
      customCaptcha: {
        enabled: config.customCaptcha
      }
    });

  } catch (error) {
    console.error('CAPTCHA 설정 조회 오류:', error);
    return NextResponse.json(
      { error: 'CAPTCHA 설정 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}