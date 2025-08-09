import { NextRequest } from 'next/server';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  keyGenerator?: (req: NextRequest) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// 메모리 기반 저장소 (프로덕션에서는 Redis 권장)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * 인증 관련 API를 위한 속도 제한기
 */
export class AuthRateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * 요청이 속도 제한에 걸렸는지 확인
   */
  async isRateLimited(req: NextRequest): Promise<{ limited: boolean; resetTime?: number; remaining?: number }> {
    const key = this.config.keyGenerator ? this.config.keyGenerator(req) : this.getDefaultKey(req);
    const now = Date.now();
    
    // 기존 항목 가져오기 또는 새로 생성
    let entry = rateLimitStore.get(key);
    
    if (!entry || now >= entry.resetTime) {
      // 새 윈도우 시작
      entry = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      rateLimitStore.set(key, entry);
      
      return {
        limited: false,
        remaining: this.config.maxAttempts - 1,
        resetTime: entry.resetTime
      };
    }
    
    // 기존 윈도우 내에서 요청 증가
    entry.count++;
    
    if (entry.count > this.config.maxAttempts) {
      return {
        limited: true,
        resetTime: entry.resetTime,
        remaining: 0
      };
    }
    
    return {
      limited: false,
      remaining: this.config.maxAttempts - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * 기본 키 생성기 (IP 기반)
   */
  private getDefaultKey(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               req.headers.get('x-real-ip') || 
               'unknown';
    return `auth_${ip}`;
  }

  /**
   * 정리 작업 (만료된 항목 제거)
   */
  static cleanup() {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now >= entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

// 미리 정의된 속도 제한기들
export const loginRateLimiter = new AuthRateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15분
  keyGenerator: (req) => {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               req.headers.get('x-real-ip') || 
               'unknown';
    return `login_${ip}`;
  }
});

export const registrationRateLimiter = new AuthRateLimiter({
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1시간
  keyGenerator: (req) => {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               req.headers.get('x-real-ip') || 
               'unknown';
    return `register_${ip}`;
  }
});

export const emailVerificationRateLimiter = new AuthRateLimiter({
  maxAttempts: 5,
  windowMs: 60 * 60 * 1000, // 1시간
  keyGenerator: (req) => {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 
               req.headers.get('x-real-ip') || 
               'unknown';
    return `email_verify_${ip}`;
  }
});

// 1시간마다 정리 작업 실행
setInterval(() => {
  AuthRateLimiter.cleanup();
}, 60 * 60 * 1000);