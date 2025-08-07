# 자동 색인 요청 시스템 설정 가이드

## 📋 개요
NaviDocent의 새로운 가이드가 생성될 때마다 Google과 Naver 검색엔진에 자동으로 색인 요청을 보내는 시스템 설정 방법입니다.

---

## 🔧 1단계: Google Indexing API 설정

### Google Cloud Console 설정

1. **Google Cloud Console 접속**
   ```
   https://console.cloud.google.com/
   ```

2. **프로젝트 선택 또는 생성**
   - 기존 프로젝트 선택하거나 새 프로젝트 생성

3. **Indexing API 활성화**
   ```
   API 및 서비스 → 라이브러리 → "Indexing API" 검색 → 사용 설정
   ```

4. **서비스 계정 생성**
   ```
   IAM 및 관리자 → 서비스 계정 → 서비스 계정 만들기
   ```
   - 서비스 계정 이름: `navidocent-indexing`
   - 설명: `NaviDocent 자동 색인 요청용`

5. **서비스 계정 키 생성**
   - 생성한 서비스 계정 클릭
   - "키" 탭 → "키 추가" → "새 키 만들기"
   - JSON 형식 선택 → 다운로드

### Search Console 권한 설정

1. **Google Search Console 접속**
   ```
   https://search.google.com/search-console/
   ```

2. **속성 선택**
   - `navidocent.com` 속성 선택

3. **사용자 추가**
   - 설정 → 사용자 및 권한 → 사용자 추가
   - 서비스 계정 이메일 주소 입력 (예: `navidocent-indexing@project-id.iam.gserviceaccount.com`)
   - 권한: "소유자" 선택

---

## 🛠️ 2단계: 환경 변수 설정

### .env.local 파일 수정

```bash
# Google Indexing API 설정
GOOGLE_SERVICE_ACCOUNT_KEY="ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAieW91ci1wcm9qZWN0LWlkIiwKICAicHJpdmF0ZV9rZXlfaWQiOiAieW91ci1rZXktaWQiLAogICJwcml2YXRlX2tleSI6ICItLS0tLUJFR0lOIFBSSVZBVEUgS0VZLS0tLS1cblsuLi5dXG4tLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tXG4iLAogICJjbGllbnRfZW1haWwiOiAieW91ci1zZXJ2aWNlLWFjY291bnRAeW91ci1wcm9qZWN0LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwKICAiY2xpZW50X2lkIjogInlvdXItY2xpZW50LWlkIiwKICAiYXV0aF91cmkiOiAiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL28vb2F1dGgyL2F1dGgiLAogICJ0b2tlbl91cmkiOiAiaHR0cHM6Ly9vYXV0aDIuZ29vZ2xlYXBpcy5jb20vdG9rZW4iLAogICJhdXRoX3Byb3ZpZGVyX3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwKICAiY2xpZW50X3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vcm9ib3QvdjEvbWV0YWRhdGEveDUwOS95b3VyLXNlcnZpY2UtYWNjb3VudCU0MHlvdXItcHJvamVjdC5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsCiAgInVuaXZlcnNlX2RvbWFpbiI6ICJnb29nbGVhcGlzLmNvbSIKfQ=="

# 사이트 기본 URL
NEXT_PUBLIC_BASE_URL="https://navidocent.com"
```

### Base64 인코딩 방법

1. **다운로드한 JSON 키 파일 내용 복사**

2. **Base64로 인코딩**
   ```bash
   # Linux/Mac
   cat service-account-key.json | base64 -w 0
   
   # Windows (PowerShell)
   [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Content service-account-key.json -Raw)))
   
   # 온라인 도구 사용
   https://www.base64encode.org/
   ```

3. **인코딩된 결과를 `GOOGLE_SERVICE_ACCOUNT_KEY`에 설정**

---

## 🗄️ 3단계: 데이터베이스 테이블 생성

### Supabase SQL Editor에서 실행

```sql
-- 색인 요청 추적 테이블 생성
CREATE TABLE IF NOT EXISTS indexing_requests (
    id SERIAL PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    location_name VARCHAR(200) NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'ko',
    search_engine VARCHAR(20) NOT NULL CHECK (search_engine IN ('google', 'naver', 'bing')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error', 'retry')),
    
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    response_data JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_indexing_requests_url ON indexing_requests(url);
CREATE INDEX IF NOT EXISTS idx_indexing_requests_location_lang ON indexing_requests(location_name, language);
CREATE INDEX IF NOT EXISTS idx_indexing_requests_status ON indexing_requests(status);
```

---

## 🧪 4단계: 테스트 및 검증

### 색인 설정 검증

```javascript
// 브라우저 개발자 도구에서 실행
fetch('/api/seo/validate-config', { method: 'POST' })
  .then(res => res.json())
  .then(data => console.log(data));
```

### 새 가이드 생성 테스트

1. **가이드 생성 API 호출**
   ```bash
   curl -X POST https://navidocent.com/api/node/ai/generate-guide \
     -H "Content-Type: application/json" \
     -d '{"locationName": "테스트장소", "language": "ko"}'
   ```

2. **로그 확인**
   ```
   ✅ Google 색인 요청 성공: https://navidocent.com/guide/테스트장소?lang=ko
   ✅ Google 색인 요청 성공: https://navidocent.com/guide/테스트장소?lang=en
   ...
   ```

3. **Search Console 확인**
   - Google Search Console → 색인 생성 → 페이지
   - 새로 생성된 URL이 "요청됨" 상태로 표시되는지 확인

---

## 📊 5단계: 모니터링 및 관리

### 색인 상태 확인 쿼리

```sql
-- 최근 색인 요청 현황
SELECT 
    location_name,
    language,
    search_engine,
    status,
    requested_at,
    error_message
FROM indexing_requests 
WHERE requested_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY requested_at DESC
LIMIT 20;

-- 색인 성공률 통계
SELECT 
    search_engine,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'success') as success,
    ROUND(COUNT(*) FILTER (WHERE status = 'success')::numeric / COUNT(*) * 100, 2) as success_rate
FROM indexing_requests 
WHERE requested_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY search_engine;
```

### 실패한 색인 재시도

```javascript
// 실패한 URL 재시도 API (향후 구현)
fetch('/api/seo/retry-failed', { method: 'POST' })
  .then(res => res.json())
  .then(data => console.log('재시도 완료:', data));
```

---

## 🚨 문제 해결

### 자주 발생하는 오류

1. **403 Forbidden**
   ```
   원인: Search Console에서 서비스 계정 권한 부족
   해결: Search Console → 설정 → 사용자 및 권한에서 서비스 계정 이메일 추가
   ```

2. **Invalid JSON Key**
   ```
   원인: Base64 인코딩 오류 또는 키 파일 손상
   해결: 새로운 서비스 계정 키 생성 후 재인코딩
   ```

3. **Rate Limit Exceeded**
   ```
   원인: Google API 호출 한도 초과
   해결: 배치 크기 줄이기, 재시도 간격 늘리기
   ```

### 로그 확인 방법

```bash
# Vercel 배포 환경
vercel logs --follow

# 로컬 개발 환경
npm run dev
# 터미널에서 색인 관련 로그 확인
```

---

## 📈 성과 측정

### 예상 효과

| 지표 | 기존 | 자동 색인 적용 후 |
|------|------|-------------------|
| 새 페이지 검색 노출 시간 | 1-4주 | 1-3일 |
| 검색 트래픽 유입 속도 | 100% | 300-400% |
| 수동 작업 시간 | 주 2시간 | 0시간 |

### KPI 모니터링

- **색인 성공률**: 목표 95% 이상
- **평균 색인 완료 시간**: 목표 24시간 이내  
- **검색 노출 증가율**: 목표 월 20% 이상

---

## 🔄 향후 개선 계획

### Phase 2: 고급 기능

1. **Naver Search Advisor API 연동**
2. **Bing Webmaster Tools 연동**
3. **색인 상태 실시간 대시보드**
4. **AI 기반 색인 우선순위 결정**
5. **성과 분석 자동 리포트**

### Phase 3: 확장

1. **다른 검색엔진 지원 (Baidu, Yandex)**
2. **소셜미디어 자동 공유**
3. **백링크 모니터링**
4. **경쟁사 분석 자동화**

---

## 📞 지원

문제가 발생하거나 추가 도움이 필요한 경우:

1. **로그 확인**: 터미널에서 색인 관련 오류 메시지 확인
2. **설정 검증**: `/api/seo/validate-config` API로 설정 상태 확인  
3. **수동 테스트**: Google Search Console에서 개별 URL 색인 요청

---

**마지막 업데이트**: 2025년 8월 5일  
**버전**: v1.0  
**호환성**: Next.js 14+, Supabase, Vercel