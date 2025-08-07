# 🐳 GuideAI 프로덕션 Dockerfile

# 1단계: 베이스 이미지
FROM node:18-alpine AS base
WORKDIR /app

# 시스템 업데이트 및 보안 패치
RUN apk update && apk upgrade && \
    apk add --no-cache libc6-compat

# 2단계: 의존성 설치
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production --omit=dev && npm cache clean --force

# 3단계: 빌드
FROM base AS builder
COPY package*.json ./
RUN npm ci

COPY . .

# 환경변수 설정 (빌드용)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 빌드 실행
RUN npm run build

# 4단계: 실행 이미지
FROM base AS runner
WORKDIR /app

# 보안을 위한 비root 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Next.js 관련 파일 복사
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 실행 환경 설정
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# 컨테이너 시작
CMD ["node", "server.js"]