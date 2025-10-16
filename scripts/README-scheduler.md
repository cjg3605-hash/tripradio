# 🚀 Google 색인 자동 스케줄러 사용 가이드

할당량 재설정 후 자동으로 남은 색인 작업을 수행하는 스케줄러입니다.

## 📋 개요

- **대상 도메인**: `https://navidocent.com`
- **목표**: 할당량 초과로 실패한 URL들 자동 재시도
- **체크 간격**: 1시간마다
- **자동 종료**: 모든 작업 완료 후

## 🎯 실행 방법

### 1. 기본 실행
```bash
# 간단한 시작
node scripts/start-scheduler.js

# 또는 직접 실행
node scripts/auto-indexing-scheduler.js
```

### 2. 환경 변수 지정
```bash
# 특정 도메인으로 실행
NEXT_PUBLIC_BASE_URL=https://navidocent.com node scripts/start-scheduler.js
```

### 3. 백그라운드 실행 (선택사항)
```bash
# Windows 백그라운드 실행
start /min node scripts/start-scheduler.js

# 또는 nohup (Linux/Mac)
nohup node scripts/start-scheduler.js > indexing.log 2>&1 &
```

## ⚙️ 스케줄러 동작 방식

### 1. 할당량 상태 체크
- `경복궁` 가이드로 테스트 색인 요청
- `Quota exceeded` 오류 확인
- 할당량이 복구되면 다음 단계 진행

### 2. 자동 색인 실행
```bash
# 남은 가이드들 색인
NEXT_PUBLIC_BASE_URL=https://navidocent.com node scripts/seo-batch-indexing.js run-remaining-only

# 랜딩 페이지들 색인
NEXT_PUBLIC_BASE_URL=https://navidocent.com node scripts/seo-batch-indexing.js run-landing-pages
```

### 3. 자동 종료
- 모든 작업 완료 후 스케줄러 자동 종료
- 성공 메시지와 함께 프로세스 종료

## 🔄 중단 및 재시작

### 중단 방법
```bash
# Ctrl+C로 안전하게 중단
Ctrl+C
```

### 재시작 방법
```bash
# 언제든지 다시 시작 가능
node scripts/start-scheduler.js
```

## 📊 로그 및 모니터링

### 로그 확인
스케줄러 실행 중 다음과 같은 정보가 표시됩니다:

```
📅 Google Indexing API 할당량 자동 체크 스케줄러 시작
🌐 대상 도메인: https://navidocent.com
🎯 목표: 남은 가이드들 + 랜딩페이지 색인 완료
⏰ 할당량 재설정 시간: 매일 자정 (UTC)
📋 실행 모드: run-remaining-only + run-landing-pages

🔄 첫 번째 할당량 체크 시작...
🕐 2025-08-14T20:18:04.993Z - 할당량 상태 확인 중...
🧪 할당량 상태 테스트 중...
⏳ 아직 할당량이 재설정되지 않았습니다. 1시간 후 재시도...
```

### 성공 시 로그
```
✅ 할당량 재설정 확인! 배치 색인 시작...
🚀 전체 가이드 배치 색인 실행 중...
📋 실행 명령: NEXT_PUBLIC_BASE_URL=https://navidocent.com node scripts/seo-batch-indexing.js run-remaining-only
🎉 배치 색인 완료!
🏢 랜딩 페이지 재시도 중...
✅ 랜딩 페이지 색인 완료!
```

## ⚠️ 문제 해결

### 자주 발생하는 문제

1. **네트워크 오류**
   ```
   ❌ 오류 발생: fetch failed
   🔄 네트워크 또는 API 오류. 1시간 후 재시도...
   ```
   → 정상적인 현상, 자동으로 재시도됩니다.

2. **API 응답 오류**
   ```
   ⚠️ API 응답 오류: 500 Internal Server Error
   🔄 1시간 후 재시도...
   ```
   → 서버 문제, 자동으로 재시도됩니다.

3. **환경 변수 누락**
   ```
   ℹ️ NEXT_PUBLIC_BASE_URL 환경 변수가 없음, 기본값 사용
   ```
   → 기본값 사용, 문제없습니다.

### 수동 확인 방법

```bash
# 현재 상태 확인
NEXT_PUBLIC_BASE_URL=https://navidocent.com node scripts/seo-batch-indexing.js status

# 수동 색인 실행
NEXT_PUBLIC_BASE_URL=https://navidocent.com node scripts/seo-batch-indexing.js run-remaining-only
```

## 🕐 할당량 재설정 시간

- **Google Indexing API**: 매일 자정 (UTC)
- **한국 시간**: 오전 9시
- **권장 실행 시간**: 오전 9시 이후

## 📈 예상 결과

### 성공 시나리오
- 할당량 재설정 후 1-2시간 내 모든 작업 완료
- 총 200-400개 URL 색인 요청 성공
- 1-3일 후 Google Search Console에서 색인 상태 확인 가능

### 부분 성공 시나리오
- 일부 URL만 성공, 나머지는 다음날 재시도
- 여러 번 실행하여 점진적으로 완료

## 🎉 완료 후 확인사항

1. **Google Search Console** 접속
2. **색인 생성 → URL 검사** 메뉴
3. 색인 요청한 URL들의 상태 확인
4. 1-3일 후 검색 결과에 반영 확인

---

## 📞 지원

문제 발생 시 다음 명령어로 도움말 확인:

```bash
node scripts/start-scheduler.js --help
node scripts/seo-batch-indexing.js help
```