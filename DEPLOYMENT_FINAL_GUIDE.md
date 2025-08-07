# 🚀 GuideAI 프로덕션 배포 최종 가이드

## ✅ 배포 전 체크리스트

### 🔧 시스템 요구사항
- **Node.js**: 18.0 이상 (권장: 18.17 LTS)
- **메모리**: 최소 2GB RAM (권장: 4GB)
- **디스크**: 최소 10GB 여유공간
- **포트**: 3000 (또는 환경변수 PORT로 설정)

### 📋 필수 환경 변수
```bash
# 🤖 AI 서비스 (필수)
GEMINI_API_KEY=your_actual_gemini_api_key

# 🌍 Google Cloud Services (필수)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# 🗄️ 데이터베이스 (필수)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# 🔐 인증 (필수)
NEXTAUTH_SECRET=your-32-character-secret-key
NEXTAUTH_URL=https://yourdomain.com

# 📊 Google API (권장)
GOOGLE_API_KEY=your_google_api_key

# 🇰🇷 한국관광공사 API (권장)
KOREA_TOURISM_API_KEY=your_korea_tourism_api_key
```

## 🐳 Docker 배포 (권장)

### 1. 이미지 빌드
```bash
# 프로덕션 이미지 빌드
docker build -t guideai:latest .

# 멀티 스테이지 확인
docker images guideai:latest
```

### 2. 컨테이너 실행
```bash
# 환경변수 파일로 실행
docker run -d \
  --name guideai \
  --env-file .env.production \
  -p 3000:3000 \
  --restart unless-stopped \
  guideai:latest

# 헬스체크 확인
docker ps
curl http://localhost:3000/api/health
```

### 3. Docker Compose (선택사항)
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 🛠️ 직접 배포

### 1. 종속성 설치
```bash
npm ci --only=production
```

### 2. 빌드 생성
```bash
NODE_ENV=production npm run build
```

### 3. 프로덕션 실행
```bash
NODE_ENV=production npm start
```

### 4. PM2로 프로세스 관리 (권장)
```bash
# PM2 설치
npm install -g pm2

# 앱 시작
pm2 start npm --name "guideai" -- start

# 저장 및 부팅시 자동시작
pm2 save
pm2 startup
```

## ☁️ 클라우드 배포

### Vercel 배포
1. GitHub 연동
2. 환경변수 설정 (Vercel Dashboard)
3. 자동 배포 활성화

### AWS/GCP 배포
1. Docker 이미지를 컨테이너 레지스트리에 푸시
2. 로드밸런서 및 오토스케일링 설정
3. 데이터베이스 연결 및 보안 그룹 설정

## 📊 모니터링 설정

### 1. 로그 모니터링
```bash
# Docker 로그 확인
docker logs -f guideai

# PM2 로그 확인  
pm2 logs guideai
```

### 2. 성능 모니터링
- **CPU/메모리**: `htop`, `docker stats`
- **애플리케이션**: `/api/monitoring/metrics` 엔드포인트
- **에러 추적**: Sentry (SENTRY_DSN 설정)

### 3. 헬스체크
```bash
# 기본 헬스체크
curl http://localhost:3000/api/health

# 상세 시스템 상태
curl http://localhost:3000/api/admin/stats/system
```

## 🔒 보안 설정

### 1. 방화벽 설정
```bash
# 필요한 포트만 열기
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw deny 3000/tcp     # 직접 접근 차단 (리버스 프록시 사용)
```

### 2. 리버스 프록시 (Nginx)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
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

### 3. SSL/TLS 설정
```bash
# Certbot으로 Let's Encrypt 인증서
certbot --nginx -d yourdomain.com
```

## 🔄 배포 자동화

### GitHub Actions 사용
1. `.github/workflows/ci.yml` 활용
2. Secrets에 환경변수 설정
3. 브랜치 보호 규칙 설정

### 배포 스크립트
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 배포 시작..."

# 백업
pm2 stop guideai || true
cp -r .next .next.backup

# 업데이트
git pull origin main
npm ci --only=production
npm run build

# 재시작
pm2 start guideai || pm2 start npm --name "guideai" -- start
pm2 save

echo "✅ 배포 완료!"
```

## 🆘 트러블슈팅

### 일반적인 문제
1. **빌드 실패**: `npm run type-check` 및 `npm run lint` 확인
2. **메모리 부족**: `NODE_OPTIONS="--max-old-space-size=4096"` 설정
3. **포트 충돌**: `lsof -i :3000`으로 포트 사용 확인

### 롤백 절차
```bash
# 이전 빌드로 롤백
pm2 stop guideai
rm -rf .next
mv .next.backup .next
pm2 start guideai
```

### 로그 위치
- **애플리케이션**: `~/.pm2/logs/`
- **Next.js**: `.next/trace`
- **시스템**: `/var/log/`

## 📞 지원 및 문의

배포 과정에서 문제가 발생하면:
1. 로그 확인: `npm run deploy:check`
2. 환경변수 검증: 모든 필수 값이 설정되었는지 확인
3. 네트워크 접근성: 데이터베이스 및 외부 API 연결 확인

---

**✅ 배포 성공 확인**: `curl http://localhost:3000/api/health` 응답이 200 OK이면 배포 완료!