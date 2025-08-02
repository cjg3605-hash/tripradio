import { NextRequest } from 'next/server';

/**
 * CAPTCHA 시스템 통합
 * Google reCAPTCHA v3와 자체 제작 CAPTCHA를 지원합니다.
 */

export interface CaptchaChallenge {
  id: string;
  type: 'recaptcha' | 'math' | 'image' | 'text';
  challenge: string;
  answer?: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
}

export interface CaptchaVerificationResult {
  success: boolean;
  score?: number; // reCAPTCHA v3 점수 (0.0-1.0)
  error?: string;
  action?: string;
  challengeId?: string;
}

// 메모리 기반 CAPTCHA 저장소 (프로덕션에서는 Redis 권장)
const captchaChallenges = new Map<string, CaptchaChallenge>();

/**
 * CAPTCHA 시스템 클래스
 */
export class CaptchaSystem {
  private readonly config = {
    recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY || '',
    recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
    challengeExpiry: 5 * 60 * 1000, // 5분
    maxAttempts: 3,
    enableRecaptcha: true,
    enableCustomCaptcha: true
  };

  /**
   * Google reCAPTCHA v3 검증
   */
  async verifyRecaptcha(token: string, action: string = 'submit', expectedScore: number = 0.5): Promise<CaptchaVerificationResult> {
    if (!this.config.recaptchaSecretKey) {
      return {
        success: false,
        error: 'reCAPTCHA가 구성되지 않았습니다.'
      };
    }

    try {
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: this.config.recaptchaSecretKey,
          response: token
        })
      });

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: 'reCAPTCHA 검증 실패: ' + (data['error-codes']?.join(', ') || '알 수 없는 오류')
        };
      }

      // 액션 확인
      if (data.action !== action) {
        return {
          success: false,
          error: '잘못된 액션'
        };
      }

      // 점수 확인 (reCAPTCHA v3)
      const score = data.score || 0;
      if (score < expectedScore) {
        return {
          success: false,
          error: '의심스러운 활동이 감지되었습니다.',
          score
        };
      }

      return {
        success: true,
        score,
        action: data.action
      };

    } catch (error) {
      console.error('reCAPTCHA 검증 오류:', error);
      return {
        success: false,
        error: 'reCAPTCHA 서비스 오류'
      };
    }
  }

  /**
   * 수학 문제 CAPTCHA 생성
   */
  generateMathChallenge(): CaptchaChallenge {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, answer: number;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 25;
        num2 = Math.floor(Math.random() * 25) + 1;
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      default:
        num1 = 5;
        num2 = 3;
        answer = 8;
    }

    const id = this.generateChallengeId();
    const now = Date.now();

    const challenge: CaptchaChallenge = {
      id,
      type: 'math',
      challenge: `${num1} ${operation} ${num2} = ?`,
      answer: answer.toString(),
      createdAt: now,
      expiresAt: now + this.config.challengeExpiry,
      attempts: 0,
      maxAttempts: this.config.maxAttempts
    };

    captchaChallenges.set(id, challenge);
    return challenge;
  }

  /**
   * 텍스트 CAPTCHA 생성 (단어 뒤섞기)
   */
  generateTextChallenge(): CaptchaChallenge {
    const words = [
      '여행', '가이드', '관광', '문화', '역사',
      '건축', '예술', '음식', '자연', '경치',
      '전통', '현대', '도시', '산책', '탐험'
    ];
    
    const word = words[Math.floor(Math.random() * words.length)];
    const scrambled = this.scrambleText(word);
    
    const id = this.generateChallengeId();
    const now = Date.now();

    const challenge: CaptchaChallenge = {
      id,
      type: 'text',
      challenge: `다음 글자를 올바른 순서로 배열하세요: "${scrambled}"`,
      answer: word,
      createdAt: now,
      expiresAt: now + this.config.challengeExpiry,
      attempts: 0,
      maxAttempts: this.config.maxAttempts
    };

    captchaChallenges.set(id, challenge);
    return challenge;
  }

  /**
   * 이미지 CAPTCHA 생성 (간단한 색상/모양 인식)
   */
  generateImageChallenge(): CaptchaChallenge {
    const colors = ['빨간색', '파란색', '초록색', '노란색', '보라색'];
    const shapes = ['원', '사각형', '삼각형', '별', '하트'];
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    const id = this.generateChallengeId();
    const now = Date.now();

    const challenge: CaptchaChallenge = {
      id,
      type: 'image',
      challenge: `${color} ${shape}을 선택하세요`,
      answer: `${color}_${shape}`,
      createdAt: now,
      expiresAt: now + this.config.challengeExpiry,
      attempts: 0,
      maxAttempts: this.config.maxAttempts
    };

    captchaChallenges.set(id, challenge);
    return challenge;
  }

  /**
   * CAPTCHA 검증
   */
  async verifyCaptcha(challengeId: string, userAnswer: string): Promise<CaptchaVerificationResult> {
    const challenge = captchaChallenges.get(challengeId);
    
    if (!challenge) {
      return {
        success: false,
        error: '유효하지 않은 CAPTCHA ID',
        challengeId
      };
    }

    // 만료 확인
    if (Date.now() > challenge.expiresAt) {
      captchaChallenges.delete(challengeId);
      return {
        success: false,
        error: 'CAPTCHA가 만료되었습니다.',
        challengeId
      };
    }

    // 시도 횟수 확인
    if (challenge.attempts >= challenge.maxAttempts) {
      captchaChallenges.delete(challengeId);
      return {
        success: false,
        error: '최대 시도 횟수를 초과했습니다.',
        challengeId
      };
    }

    // 시도 횟수 증가
    challenge.attempts++;

    // 답안 확인
    const isCorrect = this.validateAnswer(challenge, userAnswer);
    
    if (isCorrect) {
      captchaChallenges.delete(challengeId);
      return {
        success: true,
        challengeId
      };
    } else {
      // 틀린 경우 최대 시도 횟수에 도달했는지 확인
      if (challenge.attempts >= challenge.maxAttempts) {
        captchaChallenges.delete(challengeId);
        return {
          success: false,
          error: '틀렸습니다. 최대 시도 횟수에 도달했습니다.',
          challengeId
        };
      }

      return {
        success: false,
        error: `틀렸습니다. ${challenge.maxAttempts - challenge.attempts}번 더 시도할 수 있습니다.`,
        challengeId
      };
    }
  }

  /**
   * 적응형 CAPTCHA 제공
   * 위험도에 따라 적절한 CAPTCHA 유형 선택
   */
  getAdaptiveCaptcha(riskScore: number): CaptchaChallenge {
    if (riskScore < 40) {
      // 낮은 위험: 간단한 수학 문제
      return this.generateMathChallenge();
    } else if (riskScore < 70) {
      // 중간 위험: 텍스트 문제
      return this.generateTextChallenge();
    } else {
      // 높은 위험: 이미지 문제 (더 복잡)
      return this.generateImageChallenge();
    }
  }

  /**
   * CAPTCHA 요구 여부 판단
   */
  shouldRequireCaptcha(riskScore: number, failedAttempts: number = 0): boolean {
    // 위험도 기반 판단
    if (riskScore >= 60) return true;
    
    // 실패 횟수 기반 판단
    if (failedAttempts >= 3) return true;
    
    // 무작위 검증 (1% 확률)
    if (Math.random() < 0.01) return true;
    
    return false;
  }

  /**
   * CAPTCHA 답안 검증
   */
  private validateAnswer(challenge: CaptchaChallenge, userAnswer: string): boolean {
    if (!challenge.answer) return false;

    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = challenge.answer.toLowerCase();

    switch (challenge.type) {
      case 'math':
        return normalizedUserAnswer === normalizedCorrectAnswer;
      
      case 'text':
        return normalizedUserAnswer === normalizedCorrectAnswer;
      
      case 'image':
        return normalizedUserAnswer === normalizedCorrectAnswer;
      
      default:
        return false;
    }
  }

  /**
   * 텍스트 뒤섞기
   */
  private scrambleText(text: string): string {
    const chars = text.split('');
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
  }

  /**
   * 고유한 챌린지 ID 생성
   */
  private generateChallengeId(): string {
    return `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 만료된 CAPTCHA 정리
   */
  static cleanup(): void {
    const now = Date.now();
    for (const [id, challenge] of captchaChallenges.entries()) {
      if (now > challenge.expiresAt) {
        captchaChallenges.delete(id);
      }
    }
  }

  /**
   * CAPTCHA 통계 반환
   */
  getStats(): {
    activeChallenges: number;
    totalChallenges: number;
    successRate: number;
  } {
    const activeChallenges = captchaChallenges.size;
    
    // 실제로는 데이터베이스에서 통계를 가져와야 함
    return {
      activeChallenges,
      totalChallenges: activeChallenges,
      successRate: 0.85 // 임시 값
    };
  }

  /**
   * reCAPTCHA 사이트 키 반환
   */
  getRecaptchaSiteKey(): string {
    return this.config.recaptchaSiteKey;
  }

  /**
   * CAPTCHA 설정 확인
   */
  isConfigured(): {
    recaptcha: boolean;
    customCaptcha: boolean;
  } {
    return {
      recaptcha: !!(this.config.recaptchaSecretKey && this.config.recaptchaSiteKey),
      customCaptcha: this.config.enableCustomCaptcha
    };
  }
}

// 전역 CAPTCHA 시스템 인스턴스
export const captchaSystem = new CaptchaSystem();

// 1시간마다 정리 작업 실행
setInterval(() => {
  CaptchaSystem.cleanup();
}, 60 * 60 * 1000);

/**
 * reCAPTCHA v3 클라이언트 사이드 헬퍼
 */
export const RecaptchaHelper = {
  /**
   * reCAPTCHA 스크립트 로드
   */
  loadScript(siteKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('reCAPTCHA는 브라우저에서만 사용 가능합니다.'));
        return;
      }

      // 이미 로드되었는지 확인
      if ((window as any).grecaptcha) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('reCAPTCHA 스크립트 로드 실패'));
      
      document.head.appendChild(script);
    });
  },

  /**
   * reCAPTCHA 토큰 생성
   */
  async getToken(siteKey: string, action: string = 'submit'): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error('reCAPTCHA는 브라우저에서만 사용 가능합니다.');
    }

    const grecaptcha = (window as any).grecaptcha;
    if (!grecaptcha) {
      throw new Error('reCAPTCHA가 로드되지 않았습니다.');
    }

    try {
      await grecaptcha.ready();
      const token = await grecaptcha.execute(siteKey, { action });
      return token;
    } catch (error) {
      throw new Error('reCAPTCHA 토큰 생성 실패: ' + (error as Error).message);
    }
  }
};