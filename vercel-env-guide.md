# 🚀 Vercel 배포를 위한 환경변수 설정 가이드

## 📋 Vercel Dashboard에서 설정해야 할 환경변수

### 🔐 필수 환경변수
```bash
# NextAuth 설정 (프로덕션용)
NEXTAUTH_URL=https://tripradio.shop
NEXTAUTH_SECRET=your-production-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://fajiwgztfwoiisgnnams.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI & APIs
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_PLACES_API_KEY=your-places-api-key

# Base URLs (프로덕션)
NEXT_PUBLIC_BASE_URL=https://tripradio.shop
NEXT_PUBLIC_APP_URL=https://tripradio.shop
```

### 🎯 동적 환경변수가 프로덕션에서 **작동하지 않는** 이유

1. **NODE_ENV 체크**: 모든 동적 설정이 `NODE_ENV !== 'production'` 조건부
2. **Vercel 자동 설정**: Vercel이 `NEXTAUTH_URL`을 자동으로 설정
3. **고정 도메인**: 프로덕션은 항상 `tripradio.shop`

### ✅ 배포 전 체크리스트

#### 1. Vercel Dashboard 환경변수 설정
- Project → Settings → Environment Variables
- Production, Preview, Development별로 설정

#### 2. 도메인 설정 확인
```bash
# 프로덕션 환경에서는 이 값들이 사용됨
NEXTAUTH_URL=https://tripradio.shop
NEXT_PUBLIC_BASE_URL=https://tripradio.shop
```

#### 3. Google OAuth 리다이렉트 URL 설정
```
Google Cloud Console → APIs & Services → Credentials
→ 승인된 리디렉션 URI에 추가:
https://tripradio.shop/api/auth/callback/google
```

#### 4. 보안 검사
- `.env.local`이 `.gitignore`에 포함되어 있는지 확인
- 프로덕션 시크릿이 별도로 관리되는지 확인

### 🧪 배포 전 테스트 명령어

```bash
# 프로덕션 빌드 테스트
npm run build

# 프로덕션 모드로 로컬 실행
npm run start

# 환경변수 확인
node -e "console.log('NODE_ENV:', process.env.NODE_ENV)"
```

### 🔄 동적 환경변수 작동 환경

| 환경 | 동적 설정 | NEXTAUTH_URL 소스 |
|------|-----------|-------------------|
| **Development** | ✅ 작동 | 자동 감지된 포트 |
| **Preview (Vercel)** | ❌ 비활성화 | Vercel 자동 설정 |
| **Production** | ❌ 비활성화 | Dashboard 환경변수 |

### 🚨 주의사항

1. **개발 환경변수와 프로덕션 분리**: `.env.local`은 개발용, Vercel Dashboard는 프로덕션용
2. **도메인 일치**: OAuth, 쿠키 설정 등이 도메인과 일치해야 함
3. **시크릿 관리**: 프로덕션 시크릿은 절대 Git에 포함하지 말 것

### ✅ 결론

**Vercel 배포 시 동적 환경변수는 완전히 안전합니다**:
- 개발 환경에서만 작동
- 프로덕션에서는 Vercel Dashboard 설정 사용
- 기존 프로덕션 환경에 영향 없음