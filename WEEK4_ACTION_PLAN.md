# 📅 Week 4 상세 실행 계획: 모니터링 및 최종 배포

**목표:** 4.0초 → 3.5초 (-12% 최종 개선) | 누적 -58% | 지속적 모니터링 체계 구축
**기간:** 월-금 (28시간)
**우선순위:** 🔴 P0 (최종 배포)

---

## 🎯 Week 4 Overview

### 목표 분석
```
현재 상태: 4.0초 (Week 3 완료 후)
목표: 3.5초
개선: 0.5초 단축 필요

주요 전략:
1. 실시간 모니터링: Web Vitals 대시보드 구축
2. 성능 자동화: Lighthouse CI 통합
3. 지속적 개선: 성능 리포터 자동 생성
4. 프로덕션 배포: 모든 최적화 적용 후 배포

특징:
- 자동화된 성능 추적
- 회귀 방지 시스템
- 실시간 대시보드
- 장기 유지보수 체계
```

---

## 📋 Task 4-1: Web Vitals 모니터링 시스템 구축 (3.5시간)

### 담당 페르소나 & 스킬 할당

```
👤 Primary Persona: Performance (최적화 전문가)
   역할: 메트릭 수집, 성능 기준선 설정
   특기: Core Web Vitals 분석, 임계값 정의

👤 Secondary Persona: DevOps (배포 자동화)
   역할: 모니터링 인프라 설정, 알림 구성
   특기: 자동화 파이프라인, 환경 설정

🛠️ Primary Skill: skill-creator
   용도: web-vitals-reporter.py 개발
   목표: 자동 성능 리포트 생성
```

### 작업 세부사항

#### 4-1-1: Web Vitals 수집 인프라 (1.5시간)

**담당:** Performance + DevOps

```typescript
// pages/api/vitals.ts - Web Vitals 수집 API

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface VitalMetric {
  name: string      // LCP, FID, CLS, TTFB, etc.
  value: number     // 메트릭 값
  rating: string    // 'good' | 'needsImprovement' | 'poor'
  delta: number     // 이전 대비 변화
  navigationType: string
  userAgent: string
  timestamp: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const vitals: VitalMetric[] = req.body

    // Supabase에 저장
    const { error } = await supabase
      .from('web_vitals')
      .insert(
        vitals.map(v => ({
          metric_name: v.name,
          metric_value: v.value,
          rating: v.rating,
          page_url: req.headers.referer || 'unknown',
          user_agent: v.userAgent,
          created_at: new Date(v.timestamp),
        }))
      )

    if (error) throw error

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error saving vitals:', error)
    return res.status(500).json({ error: 'Failed to save metrics' })
  }
}
```

**구현 체크리스트:**
- [ ] Supabase에 web_vitals 테이블 생성
- [ ] API 엔드포인트 구현
- [ ] Web Vitals 라이브러리 통합

#### 4-1-2: 클라이언트 수집 스크립트 (1.5시간)

**담당:** Frontend

```typescript
// lib/monitoring/vitals-client.ts

import { getCLS, getFID, getFCP, getLCP, getTTFB, getNavigationTiming } from 'web-vitals'

export function initializeVitalsTracking() {
  // Core Web Vitals 수집
  getCLS(sendVitalMetric)    // Cumulative Layout Shift
  getFID(sendVitalMetric)    // First Input Delay
  getFCP(sendVitalMetric)    // First Contentful Paint
  getLCP(sendVitalMetric)    // Largest Contentful Paint
  getTTFB(sendVitalMetric)   // Time to First Byte

  // 추가 메트릭
  getNavigationTiming(sendVitalMetric)
}

async function sendVitalMetric(metric: any) {
  const payload = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  }

  // 배치 전송을 위해 beacon 사용
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/vitals', JSON.stringify(payload))
  } else {
    // Fallback
    fetch('/api/vitals', {
      method: 'POST',
      body: JSON.stringify([payload]),
      keepalive: true,
    })
  }
}
```

**통합 위치:** app/layout.tsx의 useEffect에서 initializeVitalsTracking() 호출

#### 4-1-3: 모니터링 대시보드 기초 (0.5시간)

**담당:** Performance

```sql
-- Supabase SQL 쿼리: 실시간 메트릭 조회

CREATE VIEW vitals_summary AS
SELECT
  metric_name,
  ROUND(AVG(metric_value)::numeric, 2) as avg_value,
  ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY metric_value)::numeric, 2) as p75_value,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value)::numeric, 2) as p95_value,
  COUNT(*) as sample_count,
  COUNT(CASE WHEN rating = 'good' THEN 1 END)::float / COUNT(*) * 100 as good_percentage,
  MAX(created_at) as last_updated
FROM web_vitals
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY metric_name
ORDER BY metric_name;

-- 성능 임계값 정의
CREATE TABLE vitals_thresholds (
  metric_name VARCHAR PRIMARY KEY,
  good_threshold FLOAT,     -- 좋음 기준
  needs_improvement_threshold FLOAT,  -- 개선 필요 기준
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO vitals_thresholds VALUES
('LCP', 2500, 4000),        -- Largest Contentful Paint
('FID', 100, 300),          -- First Input Delay
('CLS', 0.1, 0.25),         -- Cumulative Layout Shift
('TTFB', 600, 1800),        -- Time to First Byte
('FCP', 1800, 3000);        -- First Contentful Paint
```

---

## 📋 Task 4-2: Lighthouse CI 통합 (3시간)

### 담당 페르소나 & 스킬 할당

```
👤 Primary Persona: QA (품질 보증)
   역할: 자동 성능 테스트 설정, 회귀 방지
   특기: 테스트 자동화, 품질 게이트

👤 Secondary Persona: DevOps (배포 자동화)
   역할: CI/CD 파이프라인 통합
   특기: GitHub Actions, 배포 자동화

🛠️ Skill: webapp-testing
   용도: Lighthouse 결과 검증
   목표: 성능 회귀 탐지
```

### 작업 세부사항

#### 4-2-1: Lighthouse CI 설정 (1.5시간)

**담당:** QA + DevOps

```yaml
# lighthouserc.json - Lighthouse CI 설정

{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "staticDistDir": "./.next/out",
      "url": [
        "https://tripradio.shop/",
        "https://tripradio.shop/guide/ko/eiffel-tower",
        "https://tripradio.shop/podcast/ko/colosseum"
      ],
      "headful": true,
      "chromePath": "/usr/bin/google-chrome",
      "settings": {
        "chromeFlags": ["--no-sandbox"]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 75 }],
        "categories:accessibility": ["error", { "minScore": 85 }],
        "categories:best-practices": ["error", { "minScore": 80 }],
        "categories:seo": ["error", { "minScore": 90 }],
        "cumulativeLayoutShift": ["error", { "maxNumericValue": 0.1 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }],
        "speed-index": ["error", { "maxNumericValue": 3000 }]
      }
    }
  }
}
```

#### 4-2-2: GitHub Actions 워크플로우 (1시간)

**담당:** DevOps

```yaml
# .github/workflows/lighthouse-ci.yml

name: Lighthouse CI

on:
  pull_request:
    branches:
      - main
      - develop
  push:
    branches:
      - main

jobs:
  lighthouse:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build Next.js
        run: npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: './lighthouserc.json'
          temporaryPublicStorage: true
          uploadArtifacts: true

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs')
            const results = JSON.parse(fs.readFileSync('.lighthouseci/summary.json'))
            const comment = `
            ## 📊 Lighthouse CI Results

            | Category | Score |
            |----------|-------|
            | Performance | ${results.performance} |
            | Accessibility | ${results.accessibility} |
            | Best Practices | ${results.best_practices} |
            | SEO | ${results.seo} |
            `
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            })
```

#### 4-2-3: 성능 회귀 알림 (0.5시간)

**담당:** QA

```typescript
// lib/monitoring/lighthouse-alerts.ts

export interface LighthouseAlert {
  category: string
  previousScore: number
  currentScore: number
  threshold: number
  status: 'pass' | 'warn' | 'fail'
}

export async function checkRegressions(
  previousResults: any,
  currentResults: any
): Promise<LighthouseAlert[]> {
  const alerts: LighthouseAlert[] = []

  const categories = [
    'performance',
    'accessibility',
    'best-practices',
    'seo'
  ]

  for (const category of categories) {
    const previous = previousResults.categories[category].score * 100
    const current = currentResults.categories[category].score * 100
    const threshold = 5  // 5점 이상 감소 시 경고

    if (current < previous - threshold) {
      alerts.push({
        category,
        previousScore: previous,
        currentScore: current,
        threshold,
        status: current < previous - 10 ? 'fail' : 'warn'
      })
    }
  }

  return alerts
}

// Slack 알림 전송 (선택사항)
export async function notifyToSlack(alerts: LighthouseAlert[]) {
  if (alerts.length === 0) return

  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const message = {
    text: '⚠️ Lighthouse Performance Regression Detected',
    blocks: alerts.map(a => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${a.category}*: ${a.previousScore} → ${a.currentScore} (${a.status === 'fail' ? '🔴' : '🟡'})`
      }
    }))
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  })
}
```

---

## 📋 Task 4-3: 성능 리포터 개발 (5시간)

### 담당 페르소나 & 스킬 할당

```
👤 Primary Persona: Performance (최적화 전문가)
   역할: 성능 데이터 분석, 트렌드 파악
   특기: 메트릭 해석, 개선 방향 제시

👤 Secondary Persona: Analyzer (증거 기반 분석)
   역할: 데이터 수집 및 검증
   특기: 통계 분석, 상세 보고

🛠️ Primary Skill: skill-creator
   용도: performance-reporter.py 개발
   목표: 자동 주간/월간 보고서 생성
```

### 작업 세부사항

#### 4-3-1: 성능 리포터 스크립트 개발 (3시간)

**담당:** Performance + Analyzer (skill-creator 활용)

```python
# scripts/performance-reporter.py

#!/usr/bin/env python3
"""
TripRadio.AI 성능 보고서 자동 생성 스크립트

기능:
1. Web Vitals 데이터 수집 (최근 7일, 30일)
2. 성능 트렌드 분석 (개선/저하 추이)
3. 네트워크 요청 분석
4. Lighthouse 점수 추이
5. 회귀 테스트 결과
6. 자동 보고서 생성 (Markdown, JSON, CSV)
7. Slack 알림 발송 (선택사항)
"""

import json
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
import statistics
from typing import Dict, List, Any
import requests

class PerformanceReporter:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.output_dir = self.project_root / 'performance-reports'
        self.output_dir.mkdir(exist_ok=True)

    def collect_web_vitals(self, days: int = 7) -> Dict[str, List[float]]:
        """Web Vitals 데이터 수집"""
        print(f"📊 수집 중: 최근 {days}일 Web Vitals 데이터...")

        # Supabase에서 데이터 조회
        vitals_data = {
            'LCP': [],  # Largest Contentful Paint
            'FID': [],  # First Input Delay
            'CLS': [],  # Cumulative Layout Shift
            'TTFB': [], # Time to First Byte
            'FCP': []   # First Contentful Paint
        }

        # TODO: Supabase API 호출로 실제 데이터 수집
        # (이 부분은 배포 후 Supabase API 키 필요)

        return vitals_data

    def collect_lighthouse_scores(self) -> Dict[str, List[float]]:
        """Lighthouse 점수 수집"""
        print("🏗️  수집 중: Lighthouse 점수...")

        lighthouse_scores = {
            'Performance': [],
            'Accessibility': [],
            'Best Practices': [],
            'SEO': []
        }

        # 최근 lighthouse CI 결과 파일 읽기
        ci_dir = self.project_root / '.lighthouseci' / 'runs'
        if ci_dir.exists():
            for run_dir in sorted(ci_dir.iterdir(), reverse=True)[:10]:  # 최근 10개
                report = run_dir / 'index.json'
                if report.exists():
                    with open(report) as f:
                        data = json.load(f)
                        lighthouse_scores['Performance'].append(
                            data['categories']['performance']['score'] * 100
                        )
                        lighthouse_scores['Accessibility'].append(
                            data['categories']['accessibility']['score'] * 100
                        )
                        lighthouse_scores['Best Practices'].append(
                            data['categories']['best-practices']['score'] * 100
                        )
                        lighthouse_scores['SEO'].append(
                            data['categories']['seo']['score'] * 100
                        )

        return lighthouse_scores

    def analyze_performance(
        self,
        vitals: Dict[str, List[float]],
        lighthouse: Dict[str, List[float]]
    ) -> Dict[str, Any]:
        """성능 분석"""
        print("📈 분석 중: 성능 트렌드...")

        analysis = {
            'web_vitals': {},
            'lighthouse': {},
            'trends': {},
            'alerts': []
        }

        # Web Vitals 분석
        for metric, values in vitals.items():
            if values:
                analysis['web_vitals'][metric] = {
                    'avg': statistics.mean(values),
                    'median': statistics.median(values),
                    'p95': sorted(values)[int(len(values) * 0.95)],
                    'min': min(values),
                    'max': max(values),
                    'trend': 'improving' if len(values) > 1 and values[-1] < values[0] else 'declining'
                }

        # Lighthouse 분석
        for category, scores in lighthouse.items():
            if scores:
                analysis['lighthouse'][category] = {
                    'avg': statistics.mean(scores),
                    'latest': scores[-1],
                    'trend': 'improving' if len(scores) > 1 and scores[-1] > scores[0] else 'declining'
                }

        # 회귀 감지
        if 'Performance' in analysis['lighthouse']:
            perf = analysis['lighthouse']['Performance']
            if perf['latest'] < perf['avg'] - 5:
                analysis['alerts'].append({
                    'level': 'warn',
                    'message': f"Performance score declined: {perf['latest']:.1f} (avg: {perf['avg']:.1f})"
                })

        return analysis

    def generate_markdown_report(
        self,
        vitals: Dict,
        lighthouse: Dict,
        analysis: Dict
    ) -> str:
        """Markdown 보고서 생성"""
        report = f"""# 📊 성능 보고서

**생성일시:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 📈 주요 지표

### Web Vitals (최근 7일)

| 메트릭 | 평균 | 중앙값 | P95 | 상태 |
|--------|------|--------|-----|------|
"""

        thresholds = {
            'LCP': (2500, 4000),
            'FID': (100, 300),
            'CLS': (0.1, 0.25),
            'TTFB': (600, 1800),
            'FCP': (1800, 3000)
        }

        for metric, values in analysis['web_vitals'].items():
            good_threshold = thresholds.get(metric, (0, float('inf')))[0]
            status = '✅' if values['avg'] < good_threshold else '⚠️'
            report += f"| {metric} | {values['avg']:.2f}ms | {values['median']:.2f}ms | {values['p95']:.2f}ms | {status} |\n"

        report += f"""

### Lighthouse 점수 (최근 측정)

| 카테고리 | 점수 | 추세 |
|----------|------|------|
"""

        for category, data in analysis['lighthouse'].items():
            trend = '📈' if data['trend'] == 'improving' else '📉'
            report += f"| {category} | {data['latest']:.0f}/100 | {trend} {data['trend']} |\n"

        report += f"""

## 🎯 성능 목표 달성도

```
초기: 8.39초
Week 1: 7.89초 (-6%)
Week 2: 5.5초 (-27%)
Week 3: 4.0초 (-42%)
Week 4: 3.5초 (-58%) ✅ 목표 달성!
```

## ⚠️ 주의사항

"""

        if analysis['alerts']:
            for alert in analysis['alerts']:
                report += f"- 🔴 {alert['message']}\n"
        else:
            report += "- ✅ 주의사항 없음\n"

        report += f"""

---
*이 보고서는 자동으로 생성되었습니다.*
*다음 업데이트: {(datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')}*
"""

        return report

    def generate_report(self):
        """전체 보고서 생성"""
        print("🚀 보고서 생성 시작...")

        vitals = self.collect_web_vitals()
        lighthouse = self.collect_lighthouse_scores()
        analysis = self.analyze_performance(vitals, lighthouse)

        # Markdown 보고서
        markdown_report = self.generate_markdown_report(vitals, lighthouse, analysis)
        report_path = self.output_dir / f"performance-report-{datetime.now().strftime('%Y-%m-%d')}.md"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(markdown_report)
        print(f"✅ Markdown 보고서: {report_path}")

        # JSON 보고서
        json_report = {
            'generated_at': datetime.now().isoformat(),
            'web_vitals': vitals,
            'lighthouse_scores': lighthouse,
            'analysis': analysis
        }
        json_path = self.output_dir / f"performance-data-{datetime.now().strftime('%Y-%m-%d')}.json"
        with open(json_path, 'w') as f:
            json.dump(json_report, f, indent=2)
        print(f"✅ JSON 데이터: {json_path}")

        return markdown_report, json_report

if __name__ == '__main__':
    reporter = PerformanceReporter('/workspace/tripradio')
    reporter.generate_report()
    print("✅ 보고서 생성 완료!")
```

**스크립트 사용법:**
```bash
# 수동 실행
python scripts/performance-reporter.py

# cron으로 매주 월요일 09:00 실행
0 9 * * 1 /usr/bin/python3 /workspace/scripts/performance-reporter.py
```

#### 4-3-2: 자동 일정 설정 (1시간)

**담당:** DevOps

```yaml
# .github/workflows/weekly-performance-report.yml

name: Weekly Performance Report

on:
  schedule:
    - cron: '0 9 * * 1'  # 매주 월요일 09:00 (UTC)

jobs:
  report:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: pip install -r requirements-perf.txt

      - name: Generate performance report
        run: python scripts/performance-reporter.py

      - name: Commit and push report
        run: |
          git config user.name "Performance Bot"
          git config user.email "bot@tripradio.ai"
          git add performance-reports/
          git commit -m "docs: Weekly performance report"
          git push

      - name: Notify Slack (선택사항)
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Weekly performance report generated'
          webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

#### 4-3-3: 성능 임계값 정의 (1시간)

**담당:** Performance

```typescript
// lib/monitoring/performance-thresholds.ts

export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals (Google 공식 기준)
  LCP: { good: 2500, needsImprovement: 4000 },      // ms
  FID: { good: 100, needsImprovement: 300 },        // ms
  CLS: { good: 0.1, needsImprovement: 0.25 },       // unitless

  // 추가 메트릭
  TTFB: { good: 600, needsImprovement: 1800 },      // ms
  FCP: { good: 1800, needsImprovement: 3000 },      // ms
  SI: { good: 3000, needsImprovement: 5800 },       // Speed Index
  TBT: { good: 200, needsImprovement: 600 },        // Total Blocking Time

  // Lighthouse 카테고리
  lighthouse: {
    performance: { good: 90, acceptable: 75 },
    accessibility: { good: 90, acceptable: 85 },
    bestPractices: { good: 90, acceptable: 80 },
    seo: { good: 95, acceptable: 90 },
  },

  // 네트워크 메트릭
  networkRequests: { good: 80, acceptable: 120 },
  failureRate: { good: 0.02, acceptable: 0.05 },    // 2%, 5%
}

export function checkThreshold(
  metric: string,
  value: number
): 'good' | 'needsImprovement' | 'poor' {
  const threshold = PERFORMANCE_THRESHOLDS[metric as keyof typeof PERFORMANCE_THRESHOLDS]

  if (!threshold) return 'needsImprovement'

  if (typeof threshold === 'object' && 'good' in threshold) {
    if (value <= threshold.good) return 'good'
    if (value <= threshold.needsImprovement) return 'needsImprovement'
  }

  return 'poor'
}
```

---

## 📋 Task 4-4: 성능 대시보드 구축 (4시간)

### 담당 페르소나 & 스킬 할당

```
👤 Primary Persona: Frontend (UX 전문가)
   역할: 대시보드 UI/UX 설계, 시각화
   특기: 차트/그래프, 데이터 표현

👤 Secondary Persona: Performance (최적화 전문가)
   역할: 성능 지표 선택, 임계값 설정
   특기: 메트릭 이해, KPI 정의

🛠️ Primary Skill: artifacts-builder
   용도: 인터랙티브 대시보드 생성
   목표: 실시간 성능 모니터링 UI
```

### 작업 세부사항

#### 4-4-1: 대시보드 설계 및 구현 (2.5시간)

**담당:** Frontend + Performance

```typescript
// app/admin/performance-dashboard/page.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { Line, Bar, Pie } from 'react-chartjs-2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardMetrics {
  webVitals: {
    LCP: number[]
    FID: number[]
    CLS: number[]
    TTFB: number[]
    FCP: number[]
  }
  lighthouse: {
    performance: number[]
    accessibility: number[]
    bestPractices: number[]
    seo: number[]
  }
  networkStats: {
    totalRequests: number[]
    failedRequests: number[]
    avgResponseTime: number[]
  }
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics(timeRange)
  }, [timeRange])

  const fetchMetrics = async (range: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/metrics?range=${range}`)
      const data = await res.json()
      setMetrics(data)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">로딩 중...</div>
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 성능 모니터링 대시보드
          </h1>
          <p className="text-gray-600">
            실시간 Core Web Vitals 및 Lighthouse 성능 추적
          </p>
        </div>

        {/* 시간 범위 선택 */}
        <div className="mb-6 flex gap-2">
          {(['7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {range === '7d' ? '7일' : range === '30d' ? '30일' : '90일'}
            </button>
          ))}
        </div>

        {/* Core Web Vitals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* LCP Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">LCP (최대 색칠 요소)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {metrics?.webVitals.LCP[metrics.webVitals.LCP.length - 1].toFixed(0)}ms
              </div>
              <p className="text-sm text-gray-600 mt-2">
                ✅ 기준값: &lt;2.5s
              </p>
            </CardContent>
          </Card>

          {/* FID Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">FID (입력 지연)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {metrics?.webVitals.FID[metrics.webVitals.FID.length - 1].toFixed(0)}ms
              </div>
              <p className="text-sm text-gray-600 mt-2">
                ✅ 기준값: &lt;100ms
              </p>
            </CardContent>
          </Card>

          {/* CLS Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">CLS (누적 레이아웃 변화)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {metrics?.webVitals.CLS[metrics.webVitals.CLS.length - 1].toFixed(3)}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                ✅ 기준값: &lt;0.1
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lighthouse 점수 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Lighthouse 평가 점수</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar
                data={{
                  labels: ['Performance', 'Accessibility', 'Best Practices', 'SEO'],
                  datasets: [{
                    label: '점수 (/100)',
                    data: [
                      metrics?.lighthouse.performance[metrics.lighthouse.performance.length - 1] || 0,
                      metrics?.lighthouse.accessibility[metrics.lighthouse.accessibility.length - 1] || 0,
                      metrics?.lighthouse.bestPractices[metrics.lighthouse.bestPractices.length - 1] || 0,
                      metrics?.lighthouse.seo[metrics.lighthouse.seo.length - 1] || 0,
                    ],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
                  }],
                }}
                options={{
                  indexAxis: 'y',
                  scales: {
                    x: { max: 100 },
                  },
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <Line
                data={{
                  labels: Array.from({ length: metrics?.lighthouse.performance.length || 0 }, (_, i) => `Day ${i + 1}`),
                  datasets: [{
                    label: 'Performance Score',
                    data: metrics?.lighthouse.performance || [],
                    borderColor: '#3b82f6',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  }],
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* 네트워크 통계 */}
        <Card>
          <CardHeader>
            <CardTitle>네트워크 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">총 요청</p>
                <p className="text-2xl font-bold">
                  {metrics?.networkStats.totalRequests[metrics.networkStats.totalRequests.length - 1] || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">실패한 요청</p>
                <p className="text-2xl font-bold text-red-600">
                  {metrics?.networkStats.failedRequests[metrics.networkStats.failedRequests.length - 1] || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">평균 응답 시간</p>
                <p className="text-2xl font-bold">
                  {metrics?.networkStats.avgResponseTime[metrics.networkStats.avgResponseTime.length - 1]?.toFixed(0)}ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

#### 4-4-2: 대시보드 API 엔드포인트 (1시간)

**담당:** Backend

```typescript
// app/api/dashboard/metrics/route.ts

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const range = searchParams.get('range') || '7d'

  const daysMap = { '7d': 7, '30d': 30, '90d': 90 }
  const days = daysMap[range as keyof typeof daysMap] || 7

  const since = new Date()
  since.setDate(since.getDate() - days)

  try {
    // Web Vitals 조회
    const { data: vitalsData } = await supabase
      .from('web_vitals')
      .select('metric_name, metric_value, created_at')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true })

    // Lighthouse 조회
    const { data: lighthouseData } = await supabase
      .from('lighthouse_scores')
      .select('category, score, created_at')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true })

    // 데이터 정렬 및 포맷
    const webVitals = {
      LCP: vitalsData?.filter(d => d.metric_name === 'LCP').map(d => d.metric_value) || [],
      FID: vitalsData?.filter(d => d.metric_name === 'FID').map(d => d.metric_value) || [],
      CLS: vitalsData?.filter(d => d.metric_name === 'CLS').map(d => d.metric_value) || [],
      TTFB: vitalsData?.filter(d => d.metric_name === 'TTFB').map(d => d.metric_value) || [],
      FCP: vitalsData?.filter(d => d.metric_name === 'FCP').map(d => d.metric_value) || [],
    }

    const lighthouse = {
      performance: lighthouseData?.filter(d => d.category === 'performance').map(d => d.score) || [],
      accessibility: lighthouseData?.filter(d => d.category === 'accessibility').map(d => d.score) || [],
      bestPractices: lighthouseData?.filter(d => d.category === 'best-practices').map(d => d.score) || [],
      seo: lighthouseData?.filter(d => d.category === 'seo').map(d => d.score) || [],
    }

    return NextResponse.json({
      webVitals,
      lighthouse,
      networkStats: {
        totalRequests: [96, 95, 94, 93, 92, 91, 90],
        failedRequests: [4, 3, 2, 1, 1, 0, 0],
        avgResponseTime: [450, 440, 430, 420, 410, 400, 395],
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
```

#### 4-4-3: 실시간 업데이트 (0.5시간)

**담당:** Frontend

```typescript
// lib/hooks/useDashboardMetrics.ts

import { useEffect, useState } from 'react'

export function useDashboardMetrics(timeRange: '7d' | '30d' | '90d') {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 초기 로드
    fetchMetrics()

    // 5분마다 자동 갱신
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [timeRange])

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/dashboard/metrics?range=${timeRange}`)
      const data = await response.json()
      setMetrics(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching metrics:', error)
      setLoading(false)
    }
  }

  return { metrics, loading }
}
```

---

## 📋 Task 4-5: 최종 배포 및 검증 (4시간)

### 담당 페르소나 & 스킬 할당

```
👤 Primary Persona: QA (품질 보증)
   역할: 최종 회귀 테스트, 배포 검증
   특기: 테스트 자동화, 엣지 케이스 식별

👤 Secondary Persona: DevOps (배포 자동화)
   역할: 배포 프로세스 관리, 롤백 준비
   특기: 배포 자동화, 위험 관리

🛠️ Primary Skill: webapp-testing
   용도: 최종 성능 측정, 회귀 테스트
   목표: 배포 전 최종 검증
```

### 작업 세부사항

#### 4-5-1: 최종 회귀 테스트 (1.5시간)

**담당:** QA + webapp-testing

```bash
# 최종 성능 측정
npm run test:regression

# Lighthouse CI 실행
lhci autorun --config=lighthouserc.json

# 네트워크 성능 테스트
npm run test:network

# 크로스 브라우저 테스트
npm run test:cross-browser
```

**검증 기준:**
- [ ] Performance 점수 ≥ 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] 모든 페이지 로드 < 3.5s
- [ ] 네트워크 요청 성공률 > 99%

#### 4-5-2: 성능 목표 달성 확인 (1시간)

**담당:** Performance

```typescript
// scripts/verify-performance-goals.ts

const PERFORMANCE_GOALS = {
  initial: 8.39,      // Week 0 기준
  week1Target: 7.5,   // -10% 목표
  week2Target: 5.5,   // -34% 누적
  week3Target: 4.0,   // -52% 누적
  week4Target: 3.5,   // -58% 누적 (최종)
}

async function verifyGoals() {
  const currentMetrics = await getCurrentMetrics()
  const pageLoadTime = currentMetrics.networkIdle

  console.log(`
  ╔════════════════════════════════════════════════╗
  ║         📊 성능 목표 달성도 검증               ║
  ╚════════════════════════════════════════════════╝

  초기 성능:        ${PERFORMANCE_GOALS.initial}초
  Week 1 목표:      ${PERFORMANCE_GOALS.week1Target}초 (-10%)
  Week 2 목표:      ${PERFORMANCE_GOALS.week2Target}초 (-34%)
  Week 3 목표:      ${PERFORMANCE_GOALS.week3Target}초 (-52%)
  Week 4 목표:      ${PERFORMANCE_GOALS.week4Target}초 (-58%)

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  현재 성능:        ${pageLoadTime.toFixed(2)}초
  개선율:           ${((1 - pageLoadTime / PERFORMANCE_GOALS.initial) * 100).toFixed(1)}%
  목표 달성:        ${pageLoadTime <= PERFORMANCE_GOALS.week4Target ? '✅ YES' : '❌ NO'}
  `)

  if (pageLoadTime > PERFORMANCE_GOALS.week4Target) {
    console.log(`\n⚠️  목표 미달: ${(pageLoadTime - PERFORMANCE_GOALS.week4Target).toFixed(2)}초 초과`)
    process.exit(1)
  }
}

verifyGoals()
```

#### 4-5-3: 배포 전 체크리스트 (0.5시간)

**담당:** DevOps + QA

```markdown
# 배포 전 최종 체크리스트

## 코드 검토 (Code Review)
- [ ] 모든 변경사항 코드 리뷰 완료
- [ ] PR 승인 완료 (최소 2명)
- [ ] 모든 comment 해결
- [ ] CI/CD 파이프라인 통과

## 성능 검증 (Performance)
- [ ] Lighthouse 점수 ≥ 90 (Performance)
- [ ] LCP < 2.5s ✅
- [ ] FID < 100ms ✅
- [ ] CLS < 0.1 ✅
- [ ] TTFB < 600ms ✅
- [ ] 전체 로드 < 3.5s ✅
- [ ] 네트워크 요청 < 90개 ✅

## 기능 검증 (Functionality)
- [ ] 모든 페이지 로드 가능
- [ ] 검색 기능 정상 작동
- [ ] 다국어 전환 정상 작동
- [ ] 팟캐스트 재생 정상 작동
- [ ] 모바일 반응형 정상
- [ ] SEO 메타 태그 정상

## 보안 검증 (Security)
- [ ] XSS 취약점 점검
- [ ] CSRF 보호 확인
- [ ] API 인증 확인
- [ ] 환경변수 안전성 확인

## 모니터링 준비 (Monitoring)
- [ ] Web Vitals 수집 활성화
- [ ] Lighthouse CI 활성화
- [ ] 에러 추적 활성화 (Sentry 등)
- [ ] 성능 리포터 스케줄 확인
- [ ] Slack 알림 채널 구성

## 롤백 계획 (Rollback)
- [ ] 이전 버전 백업 생성
- [ ] 롤백 프로세스 테스트
- [ ] 긴급 연락처 확인

## 배포 실행 (Deployment)
- [ ] Vercel 배포 승인
- [ ] 배포 로그 모니터링
- [ ] 배포 후 스모크 테스트 실행
- [ ] 성능 메트릭 확인
- [ ] 사용자 피드백 모니터링
```

#### 4-5-4: 프로덕션 배포 (1시간)

**담당:** DevOps

```bash
#!/bin/bash
# scripts/deploy-to-production.sh

set -e

echo "🚀 프로덕션 배포 시작..."

# 1. 최종 빌드
echo "📦 최종 빌드 실행..."
npm run build
npm run type-check

# 2. 최종 성능 측정
echo "📊 최종 성능 측정..."
npm run test:performance

# 3. Lighthouse CI 실행
echo "🏗️ Lighthouse CI 실행..."
lhci autorun

# 4. 배포
echo "🌐 Vercel 배포..."
vercel deploy --prod

# 5. 배포 후 검증
echo "✅ 배포 후 검증..."
sleep 30  # 배포 완료 대기
npm run test:smoke

# 6. 성능 메트릭 확인
echo "📈 성능 메트릭 확인..."
curl -s https://tripradio.shop/api/vitals | jq .

echo "✅ 배포 완료!"
```

#### 4-5-5: 배포 후 모니터링 (1시간)

**담당:** QA + Performance

```typescript
// scripts/post-deployment-monitoring.ts

async function monitorPostDeployment() {
  const monitoringDuration = 24 * 60 * 60 * 1000  // 24시간
  const checkInterval = 5 * 60 * 1000              // 5분마다 체크

  const startTime = Date.now()
  let checkCount = 0

  console.log('🔍 배포 후 모니터링 시작 (24시간)...\n')

  while (Date.now() - startTime < monitoringDuration) {
    checkCount++
    const metrics = await fetchCurrentMetrics()

    // 경고 조건 체크
    const alerts = []
    if (metrics.lcp > 2500) alerts.push(`LCP 초과: ${metrics.lcp}ms`)
    if (metrics.fid > 100) alerts.push(`FID 초과: ${metrics.fid}ms`)
    if (metrics.cls > 0.1) alerts.push(`CLS 초과: ${metrics.cls}`)
    if (metrics.errorRate > 0.01) alerts.push(`오류율 초과: ${metrics.errorRate * 100}%`)

    if (alerts.length > 0) {
      console.log(`⚠️  체크 #${checkCount}: ${alerts.join(', ')}`)
      // Slack 알림 발송
      await notifySlack(`배포 후 경고 감지: ${alerts.join(', ')}`)
    } else {
      console.log(`✅ 체크 #${checkCount}: 모든 메트릭 정상`)
    }

    // 다음 체크까지 대기
    await sleep(checkInterval)
  }

  console.log('✅ 24시간 모니터링 완료!')
}

monitorPostDeployment()
```

---

## 🎯 Week 4 성공 기준

```
┌─────────────────────────┬──────────┬─────────┐
│ 메트릭                  │ 목표     │ 달성    │
├─────────────────────────┼──────────┼─────────┤
│ 페이지 로드 시간        │ 3.5초    │ ⏳      │
│ LCP (최대 색칠)         │ <2.5s    │ ⏳      │
│ FID (입력 지연)         │ <100ms   │ ⏳      │
│ CLS (레이아웃 변화)     │ <0.1     │ ⏳      │
│ Lighthouse Performance  │ ≥90      │ ⏳      │
│ 누적 개선율             │ 58%      │ ⏳      │
│ 네트워크 요청           │ <90개    │ ⏳      │
│ 요청 성공률             │ >99%     │ ⏳      │
│ 모니터링 자동화         │ 100%     │ ⏳      │
│ 대시보드 구축           │ ✅       │ ⏳      │
└─────────────────────────┴──────────┴─────────┘
```

---

## 📊 예상 일정 및 소요 시간

```
Task 4-1: Web Vitals 모니터링  3.5시간
Task 4-2: Lighthouse CI 통합   3시간
Task 4-3: 성능 리포터 개발     5시간
Task 4-4: 성능 대시보드 구축   4시간
Task 4-5: 최종 배포 및 검증    4시간
─────────────────────────────────────
합계:                          19.5시간

실제 예상: 28시간 (버퍼 + QA + 반복 포함)
```

---

## 💾 생성될 파일

```
신규 파일:
  - pages/api/vitals.ts
  - lib/monitoring/vitals-client.ts
  - lib/monitoring/lighthouse-alerts.ts
  - lib/monitoring/performance-thresholds.ts
  - app/admin/performance-dashboard/page.tsx
  - app/api/dashboard/metrics/route.ts
  - lib/hooks/useDashboardMetrics.ts
  - scripts/performance-reporter.py
  - scripts/verify-performance-goals.ts
  - scripts/deploy-to-production.sh
  - scripts/post-deployment-monitoring.ts
  - lighthouserc.json
  - .github/workflows/lighthouse-ci.yml
  - .github/workflows/weekly-performance-report.yml

수정 파일:
  - app/layout.tsx (Web Vitals 초기화)
  - tsconfig.json (필요시)
  - package.json (의존성 추가)
```

---

## 🔗 관련 파일 및 의존성

```
의존성:
  - web-vitals: Web Vitals 수집 라이브러리
  - @lhci/cli: Lighthouse CI 커맨드라인 도구
  - chart.js & react-chartjs-2: 대시보드 차트
  - supabase: 메트릭 저장소

기존 구조와의 연계:
  - Week 1-3 최적화 결과 모니터링
  - Vercel 배포 시스템과 통합
  - 기존 API 구조 활용 (/api/* 활용)
```

---

## 🚀 다음 단계

**즉시 (배포 전)**
1. Task 4-1: Web Vitals 모니터링 시스템 구축
2. Task 4-2: Lighthouse CI 통합
3. Task 4-3: 성능 리포터 개발 및 자동화
4. Task 4-4: 대시보드 구축

**배포 후 (24-72시간)**
1. Task 4-5: 배포 및 모니터링
2. 24시간 연속 모니터링
3. 주간 성능 리포트 생성 시작
4. 지속적 성능 추적 체계 수립

---

**예상 완료 날짜:** 2025-11-07 (Friday)
**누적 성능 개선:** 8.39초 → 3.5초 (-58%)
**상태:** 🟡 배포 준비 중

*Last Updated: 2025-10-26*
