# 🔧 NaviDocent.com 리다이렉트 설정 완료 가이드

## 🚨 현재 상황 분석

### 배포 완료 상태
- ✅ **GUIDEAI 프로젝트**: Vercel 배포 완료 (tripradio.shop)
- ✅ **Middleware 리다이렉트**: 코드 구현 완료
- ⚠️ **navidocent.com**: 아직 리다이렉트 미작동

### 테스트 결과
```bash
$ curl -I https://navidocent.com
HTTP/1.1 200 OK  # ❌ 예상: 301 Moved Permanently
Server: cloudflare
x-vercel-id: sfo1::iad1::gkbtb-1762217038675-9d4316de2b2b
```

**원인**: navidocent.com은 별도의 Vercel 프로젝트이거나 다른 설정으로 운영 중

---

## 🎯 해결 방법 (3가지 옵션)

### Option 1: Vercel 도메인 설정 변경 (권장) ⭐

**가장 쉽고 빠른 방법**: navidocent.com을 현재 tripradio 프로젝트에 연결

#### Step 1: Vercel 대시보드 접속

1. https://vercel.com 로그인
2. **tripradio** 프로젝트 선택
3. **Settings** 탭 클릭
4. **Domains** 메뉴 클릭

#### Step 2: navidocent.com 도메인 추가

```
┌──────────────────────────────────────────┐
│ Add Domain                                │
├──────────────────────────────────────────┤
│ navidocent.com                           │
│                                           │
│ [Add]                                    │
└──────────────────────────────────────────┘
```

1. "Add" 버튼 클릭
2. **navidocent.com** 입력
3. 추가 클릭

#### Step 3: Redirect 설정

**중요**: 도메인 추가 시 "Redirect to tripradio.shop" 옵션 선택

```
┌──────────────────────────────────────────┐
│ Domain: navidocent.com                   │
├──────────────────────────────────────────┤
│ ○ Primary Domain                         │
│ ● Redirect to:                           │
│   └─ tripradio.shop ▼                    │
│                                           │
│ Redirect Type:                           │
│ ● Permanent (301) [Recommended]          │
│ ○ Temporary (302)                        │
└──────────────────────────────────────────┘
```

**설정 값**:
- ✅ Redirect to: `tripradio.shop`
- ✅ Type: **Permanent (301)**
- ✅ Preserve path: ✓ (체크)

#### Step 4: DNS 확인

Vercel이 제공하는 DNS 레코드로 navidocent.com의 DNS 업데이트:

**Cloudflare DNS 설정 (navidocent.com 도메인)**:
```
Type: CNAME
Name: @ (or navidocent.com)
Target: cname.vercel-dns.com
Proxy: DNS only (회색 구름) # 중요!
```

**주의**: Cloudflare proxy는 **비활성화** 해야 Vercel 리다이렉트가 작동

#### 예상 소요 시간
- DNS 변경: 5분
- 전파 완료: 10-60분
- 리다이렉트 작동: 즉시 (DNS 전파 후)

---

### Option 2: Cloudflare Redirect Rule 사용

navidocent.com이 Cloudflare로 관리되는 경우:

#### Step 1: Cloudflare 대시보드 접속

1. https://dash.cloudflare.com 로그인
2. **navidocent.com** 도메인 선택
3. **Rules** → **Page Rules** 메뉴

#### Step 2: Page Rule 생성

**Rule 1: Root 리다이렉트**
```
URL Pattern: navidocent.com/*
Setting: Forwarding URL
  └─ Status Code: 301 - Permanent Redirect
  └─ Destination URL: https://tripradio.shop/$1
```

**Rule 2: www 리다이렉트**
```
URL Pattern: www.navidocent.com/*
Setting: Forwarding URL
  └─ Status Code: 301 - Permanent Redirect
  └─ Destination URL: https://tripradio.shop/$1
```

#### Step 3: 우선순위 설정

- Rule 1 우선순위: **1** (가장 높음)
- Rule 2 우선순위: **2**

#### Step 4: 저장 및 활성화

- 두 Rule 모두 "Save and Deploy" 클릭
- Cloudflare 캐시 제거: **Caching** → **Configuration** → **Purge Everything**

#### 예상 소요 시간
- 설정: 5분
- 전파: 즉시 ~ 5분
- 캐시 제거 후 바로 작동

---

### Option 3: 별도 Vercel 프로젝트에 코드 배포

navidocent.com이 별도 Vercel 프로젝트인 경우:

#### Step 1: navidocent.com 프로젝트 찾기

```bash
# 모든 Vercel 프로젝트 확인
npx vercel list

# 또는 Vercel 대시보드에서 확인
# https://vercel.com/dashboard
```

#### Step 2: 현재 코드 배포

**방법 A: Git 연동**
```bash
# navidocent.com 프로젝트의 Git 저장소에 현재 코드 푸시
cd /path/to/navidocent-repo
git remote add origin <navidocent-github-url>
git push origin master

# Vercel에서 자동 배포됨
```

**방법 B: 직접 배포**
```bash
# navidocent.com Vercel 프로젝트로 배포
cd /c/GUIDEAI
npx vercel --prod --project-name=navidocent
```

#### Step 3: 확인

```bash
curl -I https://navidocent.com
# 예상: HTTP/1.1 301 Moved Permanently
# Location: https://tripradio.shop/
```

---

## 🔍 리다이렉트 작동 확인 방법

### 1. HTTP 헤더 테스트

```bash
# Bash/Terminal
curl -I https://navidocent.com

# 예상 결과:
# HTTP/1.1 301 Moved Permanently
# Location: https://tripradio.shop/
# Cache-Control: public, max-age=31536000, immutable
```

### 2. 브라우저 테스트

**크롬/Edge/Firefox**:
1. https://navidocent.com 접속
2. F12 → Network 탭 열기
3. 첫 번째 요청 클릭
4. Status: **301** 확인
5. Headers → Location: **https://tripradio.shop/** 확인

### 3. 온라인 리다이렉트 체커

- https://httpstatus.io/
- https://www.redirect-checker.org/

**입력**: https://navidocent.com
**예상 결과**:
```
Step 1: https://navidocent.com
Status: 301 Moved Permanently
Location: https://tripradio.shop/
```

### 4. 경로 보존 테스트

```bash
# 다양한 경로 테스트
curl -I https://navidocent.com/guide
curl -I https://navidocent.com/podcast
curl -I https://navidocent.com/guide/ko/eiffel-tower

# 모두 tripradio.shop으로 리다이렉트되고 경로가 보존되어야 함
```

---

## 🚨 문제 해결

### 문제 1: 리다이렉트가 여전히 200 OK 반환

**증상**:
```bash
$ curl -I https://navidocent.com
HTTP/1.1 200 OK
```

**원인**:
- Cloudflare 캐시
- DNS 전파 지연
- Vercel 배포 미완료

**해결책**:
```bash
# 1. Cloudflare 캐시 제거
Cloudflare 대시보드 → Caching → Purge Everything

# 2. DNS 캐시 제거 (로컬)
# Windows:
ipconfig /flushdns

# Mac/Linux:
sudo dscacheutil -flushcache

# 3. 브라우저 캐시 제거
Ctrl+Shift+Del → 캐시 지우기

# 4. 시크릿 모드에서 테스트
```

---

### 문제 2: Cloudflare 프록시 간섭

**증상**:
- Vercel 설정이 적용되지 않음
- 여전히 구 버전 표시

**해결책**:
```
Cloudflare DNS 설정에서:
- Proxy status를 "DNS only"로 변경 (회색 구름 아이콘)
- 또는 Cloudflare Page Rules 사용 (Option 2)
```

---

### 문제 3: 리다이렉트 루프

**증상**:
- "Too many redirects" 에러
- 무한 로딩

**원인**:
- tripradio.shop도 navidocent.com으로 리다이렉트 설정됨
- 양방향 리다이렉트 발생

**해결책**:
```bash
# tripradio.shop의 Vercel 설정 확인
# tripradio.shop은 "Primary Domain"이어야 함
# navidocent.com만 "Redirect to tripradio.shop"
```

---

## 📊 성공 기준

### ✅ 리다이렉트 작동 확인

- [ ] `curl -I https://navidocent.com` → 301 반환
- [ ] Location 헤더: `https://tripradio.shop/`
- [ ] 경로 보존: `/guide` → `https://tripradio.shop/guide`
- [ ] 쿼리 보존: `?lang=ko` → `https://tripradio.shop/?lang=ko`
- [ ] www 리다이렉트: `www.navidocent.com` → `tripradio.shop`
- [ ] 브라우저에서 자동 리다이렉트 확인

### ✅ SEO 전환 확인 (1-2주 후)

- [ ] Google Search Console에서 301 감지
- [ ] navidocent.com 트래픽 감소
- [ ] tripradio.shop 트래픽 증가
- [ ] 검색 순위 유지

---

## 📝 추천 순서

### 즉시 실행: Option 1 (Vercel 설정)

**이유**:
- ✅ 가장 간단하고 빠름 (5-10분)
- ✅ Vercel 네이티브 기능 사용
- ✅ 안정적이고 신뢰성 높음
- ✅ 무료

**단계**:
1. Vercel 대시보드 → tripradio 프로젝트
2. Settings → Domains
3. navidocent.com 추가
4. "Redirect to tripradio.shop" 선택
5. Permanent (301) 선택
6. 저장

### 대체 방안: Option 2 (Cloudflare)

navidocent.com이 Cloudflare로만 관리되는 경우

### 최후의 수단: Option 3 (코드 배포)

별도 프로젝트이고 Vercel 설정 변경이 불가능한 경우

---

## 🎉 다음 단계

리다이렉트 작동 확인 후:

1. **24시간 후**: 리다이렉트 안정화 확인
2. **1주일 후**: Google Search Console 업데이트
3. **2주일 후**: AdSense 도메인 변경 신청

자세한 가이드: [BRAND_MIGRATION_NAVIDOCENT_TO_TRIPRADIO.md](./BRAND_MIGRATION_NAVIDOCENT_TO_TRIPRADIO.md)

---

## 📞 지원

### Vercel 문서
- https://vercel.com/docs/concepts/projects/domains/redirects
- https://vercel.com/docs/concepts/projects/domains/add-a-domain

### Cloudflare 문서
- https://developers.cloudflare.com/rules/page-rules/
- https://developers.cloudflare.com/dns/manage-dns-records/

---

**작성 일시**: 2025-11-04
**현재 상태**: 리다이렉트 코드 배포 완료, 도메인 설정 대기 중
**우선순위**: 🚨 HIGH - AdSense 승인에 필수

