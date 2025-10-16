// 🔧 완전한 로그아웃 유틸리티
// 모든 사용자 관련 데이터를 완전히 제거하는 도구

/**
 * 모든 NextAuth 관련 쿠키를 완전히 삭제
 */
export function clearAllAuthCookies(): void {
  if (typeof window === 'undefined') return;

  // 실제 존재하는 모든 쿠키를 찾아서 삭제
  const allCookies = document.cookie.split(';');
  const authCookieNames = new Set<string>();
  
  // NextAuth 관련 쿠키만 추려내기
  allCookies.forEach(cookie => {
    const cookieName = cookie.trim().split('=')[0];
    if (cookieName.includes('next-auth') || cookieName.includes('__Secure-next-auth') || cookieName.includes('__Host-next-auth')) {
      authCookieNames.add(cookieName);
    }
  });
  
  // 기본 NextAuth 쿠키명들도 추가 (혹시 누락된 것들을 위해)
  const defaultAuthCookies = [
    'next-auth.session-token',
    'next-auth.callback-url', 
    'next-auth.csrf-token',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.csrf-token'
  ];
  
  defaultAuthCookies.forEach(name => authCookieNames.add(name));
  
  // 🔍 발견된 인증 쿠키들: Array.from(authCookieNames)

  // 환경에 따른 도메인 설정
  const isProduction = process.env.NODE_ENV === 'production';
  const domains = isProduction ? [
    'tripradio.shop',
    '.tripradio.shop',
    undefined
  ] : [
    window.location.hostname,
    `.${window.location.hostname}`,
    'localhost',
    '.localhost',
    '127.0.0.1',
    undefined // 개발환경에서는 도메인 지정 안함
  ];

  const paths = ['/', '/auth', '/api', '/api/auth'];

  Array.from(authCookieNames).forEach(cookieName => {
    domains.forEach(domain => {
      paths.forEach(path => {
        // 도메인 지정
        if (domain) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; SameSite=lax`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; SameSite=strict`;
        }
        // 도메인 미지정
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=lax`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=strict`;
      });
    });
  });

  // 🍪 모든 인증 쿠키 삭제 완료
}

/**
 * 모든 사용자 관련 localStorage 데이터 삭제
 */
export function clearAllUserData(): void {
  if (typeof window === 'undefined') return;

  // 사용자 관련 localStorage 키들
  const userDataKeys = [
    'personalityDiagnosis',
    'preferred-language',
    'navi_guide_history', 
    'myGuides',
    'navi-audio-volume',
    'navi-audio-playback-rate',
    'navi-audio-repeat-mode',
    'navi-audio-shuffle',
    'navi-audio-bookmarks'
  ];

  // 정확한 키 삭제
  userDataKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  // 패턴 매칭으로 관련 키들 삭제
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      // 가이드 관련 키들
      if (key.startsWith('ai_guide_') || 
          key.startsWith('guide_') ||
          key.includes('_favorite') ||
          key.includes('_last_accessed') ||
          key.includes('personality') ||
          key.includes('user_')) {
        keysToRemove.push(key);
      }
    }
  }

  // 발견된 키들 삭제
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  // 🗄️ 사용자 데이터 삭제 완료: ${userDataKeys.length + keysToRemove.length}개 항목
}

/**
 * 브라우저 캐시 및 저장소 완전 정리
 */
export function clearBrowserCache(): void {
  if (typeof window === 'undefined') return;

  try {
    // SessionStorage 완전 정리
    sessionStorage.clear();
    
    // IndexedDB 정리 (가능한 경우)
    if ('indexedDB' in window) {
      // IndexedDB는 비동기이므로 최선의 노력만 함
      indexedDB.databases?.().then(databases => {
        databases.forEach(db => {
          if (db.name?.includes('navi') || db.name?.includes('guide')) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      }).catch(err => {
        console.warn('IndexedDB 정리 중 오류:', err);
      });
    }

    // 🗃️ 브라우저 캐시 정리 완료
  } catch (error) {
    console.error('❌ 브라우저 캐시 정리 실패:', error);
  }
}

/**
 * 완전한 로그아웃 실행 (NextAuth signOut 전에 호출)
 */
export async function performCompleteLogout(): Promise<void> {
  // 🚀 완전한 로그아웃 프로세스 시작...
  
  // 1. 모든 사용자 데이터 삭제
  clearAllUserData();
  
  // 2. 브라우저 캐시 정리
  clearBrowserCache();
  
  // 3. 모든 인증 쿠키 삭제
  clearAllAuthCookies();
  
  // 4. Service Worker 캐시 무효화 (NextAuth signOut 후에 실행)
  // ✅ 클라이언트 사이드 정리 완료 - Service Worker 캐시는 별도 처리
}

/**
 * 간단한 캐시 무효화 (NextAuth 리다이렉트 전에 실행)
 */
export async function simpleCacheInvalidation(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    // 1. 모든 캐시 스토리지 삭제
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      // ✅ 모든 캐시 삭제 완료
    }
    
    // 2. NextAuth 내부 상태 정리
    // @ts-ignore
    if (window.__NEXT_DATA__?.props?.pageProps?.session) {
      window.__NEXT_DATA__.props.pageProps.session = null;
    }
    
  } catch (error) {
    console.warn('캐시 정리 중 오류:', error);
  }
}

/**
 * Service Worker 캐시 강제 무효화
 */
async function clearServiceWorkerCache(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // 🔄 Service Worker 캐시 강제 무효화 시작...
    
    // 1. 모든 캐시 저장소 완전 삭제
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      // 📋 발견된 캐시 저장소: cacheNames
      
      // 모든 캐시를 병렬로 삭제
      await Promise.all(
        cacheNames.map(async cacheName => {
          // 🗑️ 캐시 저장소 삭제 중: ${cacheName}
          return caches.delete(cacheName);
        })
      );
      
      // ✅ 모든 캐시 저장소 삭제 완료
    }
    
    // 2. Service Worker 강제 업데이트 및 재시작
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      // 모든 Service Worker 등록 해제 후 재등록
      await Promise.all(
        registrations.map(async registration => {
          // 🔄 Service Worker 등록 해제 중...
          await registration.unregister();
          // ✅ Service Worker 등록 해제 완룼
        })
      );
      
      // 잠깐 대기 후 페이지 리로드 (Service Worker 재등록됨)
      setTimeout(() => {
        // 🔄 Service Worker 완전 재시작을 위한 페이지 리로드...
        window.location.reload();
      }, 500);
    }
    
    // 3. NextAuth 내부 상태 정리
    // @ts-ignore - NextAuth 내부 상태 접근
    if (window.__NEXT_DATA__?.props?.pageProps?.session) {
      window.__NEXT_DATA__.props.pageProps.session = null;
    }
    
    // 4. 브라우저의 기본 HTTP 캐시도 무효화
    if ('location' in window && 'reload' in window.location) {
      // Hard refresh 강제 실행
      // 💨 브라우저 HTTP 캐시 무효화...
    }
    
  } catch (error) {
    console.error('❌ Service Worker 캐시 정리 실패:', error);
    
    // 실패 시 최후의 수단: 강제 새로고침
    // 🚨 캐시 정리 실패로 강제 새로고침 실행
    window.location.reload();
  }
}

/**
 * 로그아웃 후 상태 확인
 */
export function verifyLogoutComplete(): boolean {
  if (typeof window === 'undefined') return true;

  const issues: string[] = [];

  // 쿠키 확인
  const cookies = document.cookie;
  if (cookies.includes('next-auth')) {
    issues.push('NextAuth 쿠키가 남아있습니다');
  }

  // localStorage 확인
  const userDataKeys = ['personalityDiagnosis', 'preferred-language', 'navi_guide_history'];
  userDataKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      issues.push(`${key} 데이터가 남아있습니다`);
    }
  });

  if (issues.length > 0) {
    // ⚠️ 로그아웃 미완료: issues
    return false;
  }

  // ✅ 로그아웃 상태 검증 완료
  return true;
}