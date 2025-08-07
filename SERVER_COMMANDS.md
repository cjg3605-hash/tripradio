# 🚀 GuideAI 서버 운영 명령어 가이드

## 📋 개발 환경 명령어

### 기본 개발 서버
```bash
# 개발 서버 시작 (포트 3010)
npm run dev

# 타입 검사 (실시간)
npm run type-check:watch

# 린트 수정
npm run lint:fix
```

### 빌드 및 배포 준비
```bash
# 클린 빌드
npm run build:clean

# 프로덕션 빌드
npm run build:prod

# 배포 준비 (빌드 + 검증)
npm run deploy:prepare
```

## 🔍 품질 검사 명령어

### 코드 품질
```bash
# 린트 검사
npm run lint

# 타입 검사
npm run type-check

# 보안 감사
npm run security:audit

# 배포 환경 검증
npm run deploy:check
```

### 가이드 품질 검사
```bash
# 전체 가이드 품질 검사
npm run quality:check

# 품질 기준 미달 가이드 자동 삭제 (75점 이하)
npm run quality:delete

# 개별 가이드 상세 검사
npm run quality:inspect <위치명> [언어]

# 품질 검사 도움말
npm run quality:help
```

## 📊 성능 모니터링

### 성능 분석
```bash
# 성능 리포트 생성
npm run perf:report

# 성능 분석 실행
npm run perf:analyze

# 서버 헬스체크
npm run monitor:health
```

### 실시간 모니터링 엔드포인트
```bash
# 시스템 메트릭
curl http://localhost:3000/api/monitoring/metrics

# 시스템 상태
curl http://localhost:3000/api/admin/stats/system

# 헬스체크
curl http://localhost:3000/api/health

# 가이드 통계
curl http://localhost:3000/api/admin/stats/guides

# 사용자 통계  
curl http://localhost:3000/api/admin/stats/users
```

## 🐳 Docker 운영

### 이미지 관리
```bash
# 이미지 빌드
docker build -t guideai:latest .

# 컨테이너 실행
docker run -d --name guideai --env-file .env.production -p 3000:3000 guideai:latest

# 로그 확인
docker logs -f guideai

# 컨테이너 상태 확인
docker ps
docker stats guideai
```

### Docker Compose
```bash
# 서비스 시작
docker-compose up -d

# 서비스 중지
docker-compose down

# 로그 확인
docker-compose logs -f
```

## 🔄 프로덕션 배포

### PM2 프로세스 관리
```bash
# 앱 시작
pm2 start npm --name "guideai" -- start

# 상태 확인
pm2 status
pm2 monit

# 로그 확인
pm2 logs guideai

# 재시작
pm2 restart guideai

# 중지
pm2 stop guideai

# 설정 저장
pm2 save
pm2 startup
```

### 배포 스크립트
```bash
# 배포 스크립트 실행
chmod +x deploy.sh
./deploy.sh

# 수동 배포 단계
git pull origin main
npm ci --only=production  
npm run build
pm2 restart guideai
```

## 🛠️ 데이터베이스 관리

### 마이그레이션
```bash
# 데이터베이스 설정
npm run db:setup

# 마이그레이션 실행
npm run db:migrate

# 데이터베이스 상태 확인
npm run db:status
```

### 백업 및 복원
```bash
# 데이터베이스 백업
pg_dump $DATABASE_URL > backup.sql

# 복원
psql $DATABASE_URL < backup.sql
```

## 🔒 보안 관리

### SSL/TLS 인증서
```bash
# Let's Encrypt 인증서 발급
certbot --nginx -d yourdomain.com

# 인증서 갱신
certbot renew

# 인증서 상태 확인
certbot certificates
```

### 방화벽 설정
```bash
# 방화벽 활성화
ufw enable

# 포트 허용
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP  
ufw allow 443/tcp   # HTTPS

# 상태 확인
ufw status
```

## 📈 모니터링 및 로그

### 시스템 모니터링
```bash
# 시스템 리소스 확인
htop
df -h
free -h

# 포트 사용 확인
lsof -i :3000
netstat -tulpn | grep :3000
```

### 로그 관리
```bash
# 애플리케이션 로그
tail -f ~/.pm2/logs/guideai-out.log
tail -f ~/.pm2/logs/guideai-error.log

# 시스템 로그
journalctl -u nginx -f
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🆘 문제 해결

### 일반적인 문제
```bash
# 포트 충돌 해결
lsof -ti:3000 | xargs kill -9

# 메모리 정리
pm2 reload guideai

# 캐시 정리
npm run clean
rm -rf node_modules
npm ci
```

### 성능 문제
```bash
# 빌드 캐시 정리
rm -rf .next
npm run build

# Node.js 메모리 증가
export NODE_OPTIONS="--max-old-space-size=4096"

# PM2 메모리 모니터링
pm2 monit
```

## 🔧 설정 파일

### 환경 변수 확인
```bash
# 필수 환경 변수 체크
echo $GEMINI_API_KEY
echo $DATABASE_URL
echo $NEXTAUTH_SECRET

# 모든 환경 변수 확인
printenv | grep -E "(GEMINI|DATABASE|NEXTAUTH)"
```

### 설정 파일 위치
```
# 애플리케이션 설정
/home/user/guideai/next.config.js
/home/user/guideai/.env.production

# 시스템 설정
/etc/nginx/sites-available/guideai
/etc/systemd/system/guideai.service

# PM2 설정
~/.pm2/dump.pm2
```

## 📞 지원 및 문서

### 문서 링크
- [배포 가이드](DEPLOYMENT_FINAL_GUIDE.md)
- [API 문서](API_DOCUMENTATION.md)
- [아키텍처 문서](ARCHITECTURE.md)

### 긴급 상황 대응
```bash
# 서비스 즉시 중지
pm2 stop guideai
# 또는
docker stop guideai

# 이전 버전으로 롤백
pm2 stop guideai
mv .next.backup .next
pm2 start guideai
```

---

**📌 참고**: 모든 명령어는 프로젝트 루트 디렉토리에서 실행하세요. 프로덕션 환경에서는 항상 백업을 먼저 수행하세요.