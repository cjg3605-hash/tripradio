# 🚀 GUIDEAI 배포 가이드

## 개요

GUIDEAI는 **Vercel 플랫폼**을 기본으로 하는 **Next.js 14** 애플리케이션으로, 다양한 환경에서 배포할 수 있도록 설계되었습니다. 이 가이드는 프로덕션 배포부터 개발 환경 구성까지 전체 배포 과정을 다룹니다.

## 📋 목차

1. [환경 요구사항](#환경-요구사항)
2. [환경 변수 설정](#환경-변수-설정)
3. [Vercel 배포](#vercel-배포)
4. [Docker 배포](#docker-배포)
5. [자체 호스팅](#자체-호스팅)
6. [데이터베이스 설정](#데이터베이스-설정)
7. [모니터링 설정](#모니터링-설정)
8. [성능 최적화](#성능-최적화)
9. [보안 설정](#보안-설정)
10. [문제 해결](#문제-해결)

---

## 🔧 환경 요구사항

### **최소 요구사항**
- **Node.js**: 18.17.0 이상
- **npm**: 9.0.0 이상 또는 **yarn**: 1.22.0 이상
- **메모리**: 2GB RAM
- **저장공간**: 1GB 여유 공간

### **권장 요구사항**
- **Node.js**: 20.x LTS
- **npm**: 최신 버전
- **메모리**: 4GB RAM 이상
- **저장공간**: 5GB 여유 공간
- **네트워크**: 안정적인 인터넷 연결

### **외부 서비스**
- **Supabase**: 데이터베이스 및 인증
- **Google Gemini AI**: AI 가이드 생성
- **Google Maps API** (선택사항): 지도 서비스
- **Redis** (선택사항): 캐싱 서비스

---

## 🌍 환경 변수 설정

### **필수 환경 변수**

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google AI (Gemini)
GEMINI_API_KEY=your_gemini_api_key

# NextAuth.js
NEXTAUTH_SECRET=your_nextauth_secret_minimum_32_characters
NEXTAUTH_URL=https://your-domain.com

# 애플리케이션 설정
NODE_ENV=production
```

### **선택적 환경 변수**

```bash
# Google Maps (선택사항)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Redis 캐싱 (선택사항)
REDIS_URL=redis://localhost:6379

# 모니터링 (선택사항)
SENTRY_DSN=your_sentry_dsn
ANALYTICS_ID=your_analytics_id

# 이메일 서비스 (선택사항)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### **환경별 설정 파일**

#### **개발 환경** (`.env.local`)
```bash
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
# ... 개발용 API 키들
```

#### **스테이징 환경** (`.env.staging`)
```bash
NODE_ENV=production
NEXTAUTH_URL=https://staging-guideai.vercel.app
# ... 스테이징용 API 키들
```

#### **프로덕션 환경** (`.env.production`)
```bash
NODE_ENV=production
NEXTAUTH_URL=https://guideai.com
# ... 프로덕션용 API 키들
```

---

## ☁️ Vercel 배포

### **1. GitHub 연결 배포 (권장)**

#### **초기 설정**
```bash
# 1. GitHub에 저장소 생성 및 푸시
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/guideai.git
git push -u origin main

# 2. Vercel CLI 설치 및 로그인
npm i -g vercel
vercel login
```

#### **Vercel 대시보드 설정**
1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. "New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build and Output Settings: (기본값 사용)
   ```
5. 환경 변수 설정 (위 목록 참조)
6. "Deploy" 클릭

#### **자동 배포 설정**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Type check
        run: npm run type-check
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### **2. CLI를 통한 직접 배포**

```bash
# 프로젝트 초기화
vercel

# 프로덕션 배포
vercel --prod

# 환경 변수 설정
vercel env add NEXTAUTH_SECRET production
vercel env add GEMINI_API_KEY production

# 도메인 설정
vercel domains add guideai.com
```

### **3. Vercel 설정 파일**

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

---

## 🐳 Docker 배포

### **1. Dockerfile**

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# 의존성 설치 단계
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# 빌드 단계
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 환경 변수 설정
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN npm run build

# 실행 단계
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### **2. Docker Compose**

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXTAUTH_URL=http://localhost:3000
    env_file:
      - .env.local
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: guideai
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### **3. 빌드 및 실행**

```bash
# 이미지 빌드
docker build -t guideai .

# 컨테이너 실행
docker run -p 3000:3000 --env-file .env.local guideai

# Docker Compose 사용
docker-compose up -d

# 로그 확인
docker-compose logs -f app
```

---

## 🏠 자체 호스팅

### **1. Ubuntu 서버 설정**

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 설치 (NodeSource 저장소 사용)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 설치 (프로세스 관리자)
sudo npm install -g pm2

# Nginx 설치 (리버스 프록시)
sudo apt install nginx
```

### **2. 애플리케이션 배포**

```bash
# 애플리케이션 클론
git clone https://github.com/your-username/guideai.git
cd guideai

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일 편집

# 빌드
npm run build

# PM2로 실행
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### **3. PM2 설정**

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'guideai',
      script: 'npm',
      args: 'start',
      cwd: '/path/to/guideai',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
```

### **4. Nginx 설정**

```nginx
# /etc/nginx/sites-available/guideai
server {
    listen 80;
    listen [::]:80;
    server_name guideai.com www.guideai.com;
    
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name guideai.com www.guideai.com;
    
    # SSL 인증서 (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/guideai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/guideai.com/privkey.pem;
    
    # SSL 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # 보안 헤더
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000";
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **5. SSL 인증서 설정**

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d guideai.com -d www.guideai.com

# 자동 갱신 설정
sudo crontab -e
# 다음 줄 추가: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🗄️ 데이터베이스 설정

### **1. Supabase 설정**

```sql
-- 필요한 확장 프로그램 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 가이드 테이블
CREATE TABLE guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_name TEXT NOT NULL,
    language TEXT NOT NULL,
    content JSONB NOT NULL,
    coordinates GEOGRAPHY(POINT, 4326),
    accuracy_score DECIMAL(3,2) DEFAULT 0.95,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 히스토리 테이블
CREATE TABLE user_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET
);

-- 인덱스 생성
CREATE INDEX idx_guides_location_language ON guides(location_name, language);
CREATE INDEX idx_guides_created_at ON guides(created_at DESC);
CREATE INDEX idx_user_history_user_id ON user_history(user_id);
CREATE INDEX idx_user_history_visited_at ON user_history(visited_at DESC);

-- RLS (Row Level Security) 정책
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_history ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
CREATE POLICY "Public guides are viewable by everyone" 
ON guides FOR SELECT 
USING (true);

-- 사용자 히스토리 정책
CREATE POLICY "Users can view own history" 
ON user_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" 
ON user_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

### **2. 백업 설정**

```bash
# 수동 백업
pg_dump -h localhost -U postgres -d guideai > backup_$(date +%Y%m%d_%H%M%S).sql

# 자동 백업 스크립트
#!/bin/bash
# backup.sh
BACKUP_DIR="/var/backups/guideai"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -h localhost -U postgres -d guideai | gzip > $BACKUP_DIR/guideai_$DATE.sql.gz

# 7일 이전 백업 파일 삭제
find $BACKUP_DIR -name "guideai_*.sql.gz" -mtime +7 -delete

# 크론탭 설정: 매일 02:00에 백업
# 0 2 * * * /path/to/backup.sh
```

---

## 📊 모니터링 설정

### **1. 시스템 모니터링**

```javascript
// lib/monitoring.ts
export class SystemMonitoring {
  static async logError(error: Error, context: any) {
    const errorLog = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: context.req?.headers['user-agent'],
      ip: context.req?.ip
    };
    
    // 로그 저장
    console.error('System Error:', errorLog);
    
    // 외부 모니터링 서비스로 전송 (예: Sentry)
    if (process.env.SENTRY_DSN) {
      // Sentry.captureException(error, { extra: context });
    }
  }
  
  static async recordMetrics(metrics: any) {
    // 메트릭 기록
    console.log('Metrics:', {
      ...metrics,
      timestamp: new Date().toISOString()
    });
  }
}
```

### **2. 성능 모니터링**

```javascript
// middleware.ts에 추가
export function middleware(request: NextRequest) {
  const start = Date.now();
  
  // 요청 처리
  const response = NextResponse.next();
  
  // 성능 메트릭 기록
  const duration = Date.now() - start;
  
  if (duration > 1000) { // 1초 이상 걸린 요청
    console.warn('Slow request:', {
      url: request.url,
      method: request.method,
      duration,
      userAgent: request.headers.get('user-agent')
    });
  }
  
  return response;
}
```

### **3. 헬스체크 설정**

```javascript
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      ai: await checkAI(),
      cache: await checkCache()
    },
    version: process.env.npm_package_version
  };
  
  const isHealthy = Object.values(health.services).every(s => s === 'healthy');
  
  return Response.json(health, {
    status: isHealthy ? 200 : 503
  });
}

async function checkDatabase() {
  try {
    // 데이터베이스 연결 확인
    const { data, error } = await supabase
      .from('guides')
      .select('id')
      .limit(1);
    
    return error ? 'unhealthy' : 'healthy';
  } catch {
    return 'unhealthy';
  }
}
```

---

## ⚡ 성능 최적화

### **1. Next.js 최적화**

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeUniversalDefaults: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      }
    ];
  }
};
```

### **2. 캐싱 전략**

```typescript
// lib/cache-strategy.ts
export const cacheStrategy = {
  // Static assets (1 year)
  static: 'public, max-age=31536000, immutable',
  
  // API responses (5 minutes)
  api: 'public, max-age=300, stale-while-revalidate=60',
  
  // User-specific content (no cache)
  dynamic: 'private, no-cache, no-store, must-revalidate',
  
  // Guides (1 hour)
  guides: 'public, max-age=3600, stale-while-revalidate=300'
};
```

### **3. 번들 분석**

```bash
# 번들 분석기 설치
npm install --save-dev @next/bundle-analyzer

# 분석 실행
ANALYZE=true npm run build
```

---

## 🔒 보안 설정

### **1. 환경 변수 보안**

```bash
# 민감한 정보는 환경 변수로만 관리
# .env.local (절대 커밋하지 않음)
NEXTAUTH_SECRET=super-secret-at-least-32-characters
GEMINI_API_KEY=your-secret-api-key
SUPABASE_SERVICE_ROLE_KEY=your-secret-service-key

# 프로덕션에서는 Vercel 환경 변수 UI 사용
# 또는 CI/CD 파이프라인의 시크릿 사용
```

### **2. 보안 헤더**

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

### **3. Rate Limiting**

```typescript
// lib/rate-limiter.ts
import { NextRequest } from 'next/server';

export class RateLimiter {
  private requests = new Map<string, { count: number; resetAt: number }>();
  
  constructor(
    private max: number = 10,
    private windowMs: number = 10 * 1000
  ) {}
  
  async limit(request: NextRequest) {
    const ip = request.ip || 'anonymous';
    const now = Date.now();
    
    const record = this.requests.get(ip) || { count: 0, resetAt: now + this.windowMs };
    
    if (now > record.resetAt) {
      record.count = 0;
      record.resetAt = now + this.windowMs;
    }
    
    record.count++;
    this.requests.set(ip, record);
    
    return {
      success: record.count <= this.max,
      limit: this.max,
      remaining: Math.max(0, this.max - record.count),
      reset: Math.ceil((record.resetAt - now) / 1000)
    };
  }
}
```

---

## 🔧 문제 해결

### **일반적인 문제들**

#### **1. 빌드 실패**

```bash
# 캐시 정리
npm run clean
rm -rf .next
rm -rf node_modules
npm install

# 타입 에러 확인
npm run type-check

# 린트 에러 확인
npm run lint
```

#### **2. 환경 변수 문제**

```bash
# 환경 변수 확인
printenv | grep NEXT
printenv | grep GEMINI

# Vercel에서 환경 변수 확인
vercel env ls
```

#### **3. 데이터베이스 연결 문제**

```bash
# Supabase 연결 테스트
curl -H "Authorization: Bearer YOUR_ANON_KEY" \
     "https://your-project.supabase.co/rest/v1/guides?select=id&limit=1"
```

#### **4. 성능 문제**

```bash
# 번들 크기 분석
npm run analyze

# 메모리 사용량 확인
node --inspect server.js

# PM2 모니터링
pm2 monit
```

### **로그 확인**

```bash
# Vercel 로그
vercel logs

# PM2 로그
pm2 logs guideai

# Docker 로그
docker logs container-name

# Nginx 로그
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### **디버깅 모드**

```bash
# 개발 모드에서 디버깅
DEBUG=* npm run dev

# 프로덕션 디버깅
NODE_ENV=production DEBUG=* npm start
```

---

## 📞 지원 및 문의

배포 관련 문제가 발생하면 다음 채널을 통해 지원을 받을 수 있습니다:

- **GitHub Issues**: [프로젝트 이슈 페이지](https://github.com/jg5209/navi-guide-ai/issues)
- **Discord**: [커뮤니티 서버](https://discord.gg/guideai)
- **이메일**: support@guideai.com

---

이 배포 가이드는 GUIDEAI 프로젝트의 안정적인 배포를 위한 모든 정보를 포함하고 있으며, 새로운 배포 방법이나 최적화 기법이 도입될 때마다 업데이트됩니다.