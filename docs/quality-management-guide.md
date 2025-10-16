# 🎯 TripRadio 가이드 품질 관리 시스템

DB에 저장된 가이드들의 품질을 주기적으로 검사하고 관리하는 포괄적인 시스템입니다.

## 📋 목차

1. [시스템 개요](#시스템-개요)
2. [설치 및 설정](#설치-및-설정)
3. [사용법](#사용법)
4. [배치 검사](#배치-검사)
5. [CLI 도구](#cli-도구)
6. [자동화 스케줄링](#자동화-스케줄링)
7. [품질 기준](#품질-기준)
8. [데이터베이스 구조](#데이터베이스-구조)
9. [문제 해결](#문제-해결)

## 시스템 개요

### 🎯 주요 기능

- **배치 품질 검사**: 모든 가이드를 자동으로 검사하여 품질 점수 산출
- **개별 가이드 검사**: 특정 가이드의 상세 품질 분석
- **품질 통계**: 전체 시스템의 품질 현황 및 트렌드 분석
- **자동 개선 큐**: 품질이 낮은 가이드를 자동으로 개선 대기열에 추가
- **알림 시스템**: 품질 문제 발견시 Slack, Discord, 이메일 알림
- **보고서 생성**: HTML/JSON 형태의 상세 품질 보고서

### 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   배치 검사     │    │   CLI 도구      │    │  스케줄러       │
│ (Batch Checker) │    │ (Quality CLI)   │    │ (Scheduler)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │            품질 검증 시스템                      │
         │    (Quality Verification System)                │
         └─────────────────────────────────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │              데이터베이스                        │
         │  • guide_versions                               │
         │  • quality_evolution                            │
         │  • quality_improvement_queue                    │
         │  • realtime_quality_metrics                     │
         │  • quality_alerts                               │
         └─────────────────────────────────────────────────┘
```

## 설치 및 설정

### 1. 환경 변수 설정

`.env.local` 파일에 다음 변수들을 추가하세요:

```bash
# 필수
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key

# 알림 (선택사항)
SLACK_WEBHOOK_URL=your_slack_webhook_url
DISCORD_WEBHOOK_URL=your_discord_webhook_url
```

### 2. 데이터베이스 스키마 설정

```bash
# Supabase SQL 에디터에서 실행
psql -f database/quality-system-schema-fixed.sql
```

### 3. 의존성 확인

필요한 패키지들이 이미 설치되어 있는지 확인하세요:

```bash
npm install @supabase/supabase-js @google/generative-ai
```

## 사용법

### 🚀 빠른 시작

```bash
# 도움말 보기
npm run quality:help

# 전체 가이드 품질 검사 (10개 제한)
npm run quality:check -- --limit 10 --verbose

# 특정 가이드 상세 검사
npm run quality:cli inspect 경복궁 ko

# 품질 통계 조회
npm run quality:cli stats --period 30d --chart
```

## 배치 검사

### 기본 사용법

```bash
# 전체 가이드 검사
npm run quality:check

# 제한된 수량으로 검사
npm run quality:check -- --limit 50

# 특정 언어만 검사
npm run quality:check -- --languages ko,en

# 특정 위치만 검사
npm run quality:check -- --locations "경복궁,덕수궁,창경궁"

# 품질 임계값 설정
npm run quality:check -- --threshold 70

# 문제 발견시 자동으로 개선 큐에 추가
npm run quality:check -- --auto-queue

# 상세 출력
npm run quality:check -- --verbose
```

### 고급 옵션

```bash
# 최근 검사된 것도 포함
npm run quality:check -- --include-recent

# 모든 상태의 가이드 검사 (기본: 프로덕션만)
npm run quality:check -- --all-status

# 강제 재검사
npm run quality:check -- --force

# 결과 저장 안함
npm run quality:check -- --no-export --no-report
```

### 출력 예시

```
🎯 가이드 품질 배치 검사 시작...

📊 총 147개 가이드 발견
📦 배치 1/5 처리 중... (30개 가이드)
✅ 경복궁: 87.3점
❌ 덕수궁: 42.1점
✅ 창경궁: 91.2점
...

============================================================
📊 배치 검사 결과 요약
============================================================
총 검사: 147개
통과: 124개 (84.4%)
실패: 23개 (15.6%)
심각한 문제: 3개

🎯 품질 분포:
  우수 (90+): 45개
  양호 (75-89): 79개
  허용 (60-74): 20개
  불량 (40-59): 20개
  심각 (<40): 3개

🚨 심각한 문제 가이드:
  덕수궁 (ko): 42.1점 - high
  석촌호수 (en): 38.9점 - critical
  한강공원 (ja): 35.2점 - critical

💡 추천사항:
  🚨 심각: 3개 가이드가 즉시 재생성이 필요합니다
  📊 전체의 15.6%가 문제 가이드입니다 - 시스템적 개선이 필요합니다

📄 결과 저장: quality-batch-check-2024-01-15T09-30-00.json
📋 HTML 리포트: quality-report-2024-01-15T09-30-00.html

🎉 배치 검사 완료! (127.3초)
```

## CLI 도구

### 명령어 목록

```bash
# CLI 도움말
npm run quality:cli --help

# 배치 검사
npm run quality:cli check [옵션]

# 개별 가이드 검사
npm run quality:cli inspect <위치명> [언어]

# 품질 통계
npm run quality:cli stats [옵션]

# 개선 큐 관리
npm run quality:cli queue <list|add|process|clear>

# 품질 트렌드 (구현 예정)
npm run quality:cli trends [위치명]

# 알림 관리 (구현 예정)
npm run quality:cli alerts <list|resolve|dismiss>
```

### 개별 가이드 검사 예시

```bash
npm run quality:cli inspect 경복궁 ko --save --verbose
```

```
🔍 가이드 검사: 경복궁 (ko)

📍 위치: 경복궁
🌐 언어: ko
📅 생성일: 2024-01-10 14:23:15
📊 현재 품질 점수: 87.3
📚 챕터 수: 8개

📋 챕터 상세:
  1. 경복궁 입구와 광화문
     내용 길이: 892자
     내러티브: 743자
  2. 근정전 - 조선의 정전
     내용 길이: 1,245자
     내러티브: 1,102자
  ...

📈 최근 품질 검사 결과:
  1. 87.3점 (2024-01-15)
     - 사실 정확성: 89.2
     - 내용 완성도: 92.1
     - 논리적 일관성: 85.7
     - 문화적 민감성: 81.4
  2. 84.1점 (2024-01-10)
  3. 82.6점 (2024-01-05)

💡 개선 제안사항:
  📝 일부 내용 보완을 권장합니다
```

### 품질 통계 예시

```bash
npm run quality:cli stats --period 30d --chart
```

```
📊 가이드 품질 통계 조회 중...

📚 총 프로덕션 가이드: 147개

🎯 품질 분포:
  우수 (90+):   45개 (30.6%)
  양호 (75-89): 79개 (53.7%)
  허용 (60-74): 20개 (13.6%)
  불량 (40-59): 20개 (1.4%)
  심각 (<40):  3개 (0.7%)

📈 품질 분포 차트:
  excellent  │████████████████████████████████████████│ 45
  good       │████████████████████████████████████████│ 79
  acceptable │███████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ 20
  poor       │██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ 2
  critical   │█░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ 3

📊 평균 품질 점수: 84.7점

🌐 언어별 통계:
  ko: 98개, 평균 85.2점
  en: 32개, 평균 83.1점
  ja: 12개, 평균 82.4점
  zh: 5개, 평균 79.8점

🔍 최근 30d 품질 검사: 1,247회
```

### 개선 큐 관리

```bash
# 큐 목록 조회
npm run quality:cli queue list

# 대기 중인 항목만 조회
npm run quality:cli queue list --status pending

# 우선순위 높은 항목만 조회
npm run quality:cli queue list --priority high

# 큐에 가이드 추가
npm run quality:cli queue add 덕수궁 ko high

# 큐 처리 (최대 5개)
npm run quality:cli queue process --limit 5

# 완료된 항목 정리
npm run quality:cli queue clear
```

## 자동화 스케줄링

### 사전 정의된 스케줄

#### 1. 일일 검사 (운영용)
```bash
npm run quality:schedule daily
```
- **실행 시간**: 매일 오전 9시
- **검사 대상**: 프로덕션 가이드만
- **자동 액션**: 심각한 문제 자동 큐잉
- **알림**: 문제 발견시만

#### 2. 주간 종합 검사
```bash
npm run quality:schedule weekly
```
- **실행 시간**: 매주 일요일 새벽 2시
- **검사 대상**: 모든 프로덕션 가이드 (강제 재검사)
- **자동 액션**: 보고서 생성, 메트릭 업데이트
- **알림**: 항상 발송

#### 3. 월간 전체 검사
```bash
npm run quality:schedule monthly
```
- **실행 시간**: 매월 1일 오전 3시
- **검사 대상**: 모든 상태의 가이드
- **자동 액션**: 데이터 아카이브, 종합 보고서
- **알림**: 항상 발송

### GitHub Actions 설정

`.github/workflows/quality-check.yml`:

```yaml
name: 가이드 품질 검사

on:
  schedule:
    # 매일 오전 9시 (UTC 0시)
    - cron: '0 0 * * *'
  
  # 수동 실행 가능
  workflow_dispatch:
    inputs:
      schedule_type:
        description: '스케줄 타입'
        required: true
        default: 'daily'
        type: choice
        options:
          - daily
          - weekly
          - monthly

jobs:
  quality-check:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run quality check
        run: npm run quality:schedule ${{ github.event.inputs.schedule_type || 'daily' }}
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Cron Job 설정

Linux/Mac 서버에서 직접 실행:

```bash
# crontab -e
# 매일 오전 9시 실행
0 9 * * * cd /path/to/guideai && npm run quality:schedule daily

# 매주 일요일 새벽 2시 실행
0 2 * * 0 cd /path/to/guideai && npm run quality:schedule weekly

# 매월 1일 오전 3시 실행
0 3 1 * * cd /path/to/guideai && npm run quality:schedule monthly
```

## 품질 기준

### 품질 점수 구성 요소

1. **사실 정확성 (35% 가중치)**
   - 역사적 사실, 날짜, 인명의 정확성
   - 공식 자료와의 일치도
   - 검증 가능한 정보의 비율

2. **내용 완성도 (25% 가중치)**
   - 필수 필드 존재 여부
   - 챕터 구조의 완성도
   - 메타데이터 완성도

3. **논리적 일관성 (20% 가중치)**
   - 스토리텔링의 흐름
   - 챕터 간 연결성
   - 내러티브의 자연스러움

4. **문화적 민감성 (20% 가중치)**
   - 문화적 존중도
   - 편견이나 고정관념 없음
   - 현지 문화에 대한 이해

### 품질 등급

| 등급 | 점수 범위 | 상태 | 액션 |
|------|-----------|------|------|
| 우수 | 90-100점 | 🌟 | 벤치마크로 활용 |
| 양호 | 75-89점 | ✅ | 현재 상태 유지 |
| 허용 | 60-74점 | ⚠️ | 모니터링 필요 |
| 불량 | 40-59점 | 🔴 | 개선 필요 |
| 심각 | 0-39점 | 🚨 | 즉시 재생성 |

### 위치별 가중치 조정

```typescript
// 역사적 장소 (사실 정확성 강조)
historical: {
  factualAccuracy: 0.45,      // 45%
  contentCompleteness: 0.20,  // 20%
  coherenceScore: 0.20,       // 20%
  culturalSensitivity: 0.15   // 15%
}

// 문화 관광지 (문화적 민감성 강조)
cultural: {
  factualAccuracy: 0.25,      // 25%
  contentCompleteness: 0.20,  // 20%
  coherenceScore: 0.20,       // 20%
  culturalSensitivity: 0.35   // 35%
}

// 자연 관광지 (실용 정보 강조)
natural: {
  factualAccuracy: 0.30,      // 30%
  contentCompleteness: 0.30,  // 30%
  coherenceScore: 0.25,       // 25%
  culturalSensitivity: 0.15   // 15%
}
```

## 데이터베이스 구조

### 주요 테이블

#### guide_versions
- 가이드 버전 관리
- 품질 점수 저장
- 상태 관리 (draft, staging, production, deprecated)

#### quality_evolution
- 품질 점수 변화 추적
- AI 검증 결과 저장
- 개선 추천사항 기록

#### quality_improvement_queue
- 품질 개선 대기열
- 재시도 관리
- 처리 전략 설정

#### realtime_quality_metrics
- 실시간 품질 지표
- 트렌드 분석
- 성능 지표

#### quality_alerts
- 품질 알림 관리
- 심각도별 분류
- 처리 상태 추적

### 유용한 뷰

```sql
-- 현재 프로덕션 가이드와 최신 품질 점수
SELECT * FROM current_production_guides 
WHERE latest_quality < 60;

-- 품질 트렌드 분석
SELECT * FROM quality_trends 
ORDER BY avg_quality DESC;

-- 재생성이 필요한 가이드
SELECT * FROM guides_needing_regeneration 
WHERE regeneration_priority IN ('critical', 'high');
```

## 문제 해결

### 일반적인 문제들

#### 1. 환경 변수 오류
```
❌ GEMINI_API_KEY가 설정되지 않았습니다
```
**해결법**: `.env.local` 파일에서 API 키 확인

#### 2. 데이터베이스 연결 실패
```
❌ 데이터베이스 연결 실패: Invalid API key
```
**해결법**: Supabase URL과 API 키 확인

#### 3. AI 검증 실패
```
❌ AI 응답 파싱 실패
```
**해결법**: Gemini API 상태 확인, 프롬프트 길이 조정

#### 4. 메모리 부족
```
❌ JavaScript heap out of memory
```
**해결법**: `--limit` 옵션으로 배치 크기 조정

### 성능 최적화

#### 1. 배치 크기 조정
```bash
# 큰 데이터셋의 경우 배치 크기 제한
npm run quality:check -- --limit 50
```

#### 2. 동시 처리 수 조정
```bash
# config에서 maxConcurrent 설정
maxConcurrent: 2  // 기본값: 3
```

#### 3. 검사 지연 시간 조정
```bash
# config에서 delayBetweenChecks 설정
delayBetweenChecks: 2000  // 기본값: 1000ms
```

### 로그 분석

#### 품질 검사 로그
```bash
# 로그 파일 위치
tail -f logs/quality-check.log

# 오류만 필터링
grep "❌" logs/quality-check.log
```

#### 성능 모니터링
```sql
-- 평균 처리 시간
SELECT AVG(processing_time_ms) 
FROM quality_evolution 
WHERE created_at > NOW() - INTERVAL '7 days';

-- 실패율 분석
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_checks,
  COUNT(CASE WHEN overall_quality < 60 THEN 1 END) as failed_checks
FROM quality_evolution 
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at);
```

## 💡 권장 사항

### 운영 환경

1. **정기 검사**: 매일 오전 품질 검사 실행
2. **모니터링**: 품질 알림 설정으로 즉시 대응
3. **백업**: 품질 데이터 정기 백업
4. **용량 관리**: 90일 이상 오래된 데이터 아카이브

### 개발 환경

1. **테스트**: 새 기능 배포 전 품질 검사 실행
2. **디버깅**: `--verbose` 옵션으로 상세 로그 확인
3. **성능**: `--limit` 옵션으로 개발 시 빠른 테스트

### 알림 설정

1. **Slack**: 팀 채널에 품질 알림 설정
2. **Discord**: 개발팀 서버에 봇 연동
3. **이메일**: 관리자에게 중요 알림 발송

---

이 가이드를 참고하여 TripRadio 가이드의 품질을 체계적으로 관리하고 지속적으로 개선할 수 있습니다. 추가 질문이나 개선 사항이 있으면 언제든 말씀해 주세요! 🎯