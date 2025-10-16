// 범용 속도 제한 라이브러리
export class RateLimiter {
  private requests: Map<string, {count: number, resetAt: number}>;
  private readonly windowMs: number;
  private readonly max: number;

  constructor(max: number, windowMs: number) {
    this.requests = new Map();
    this.max = max;
    this.windowMs = windowMs;
  }

  async limit(identifier: string) {
    if (process.env.NODE_ENV === 'development') {
      return { 
        success: true,
        limit: this.max,
        remaining: this.max,
        reset: 10
      };
    }

    const now = Date.now();
    const record = this.requests.get(identifier) || { count: 0, resetAt: now + this.windowMs };

    if (now > record.resetAt) {
      record.count = 0;
      record.resetAt = now + this.windowMs;
    }

    record.count++;
    this.requests.set(identifier, record);

    const remaining = Math.max(0, this.max - record.count);
    const reset = Math.ceil((record.resetAt - now) / 1000);

    return {
      success: record.count <= this.max,
      limit: this.max,
      remaining,
      reset
    };
  }
}

// 미리 정의된 제한기들
export const aiRateLimiter = new RateLimiter(5, 60 * 1000); // AI: 분당 5회
export const searchRateLimiter = new RateLimiter(20, 60 * 1000); // 검색: 분당 20회
export const ttsRateLimiter = new RateLimiter(10, 60 * 1000); // TTS: 분당 10회