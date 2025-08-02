// 🔧 완전한 로그아웃 유틸리티
// 모든 사용자 관련 데이터를 완전히 제거하는 도구

/**
 * 모든 NextAuth 관련 쿠키를 완전히 삭제
 */
export function clearAllAuthCookies(): void {
  if (typeof window === 'undefined') return;

  // NextAuth가 실제로 사용하는 쿠키명들
  const authCookieNames = [
    'next-auth.session-token',
    'next-auth.callback-url', 
    'next-auth.csrf-token',
    '__Secure-next-auth.session-token', // HTTPS에서 사용
    '__Host-next-auth.csrf-token', // HTTPS에서 사용
    // 개발환경용
    'next-auth.session-token.localhost',
    'next-auth.callback-url.localhost',
    'next-auth.csrf-token.localhost'
  ];

  // 가능한 모든 도메인과 경로에서 삭제
  const domains = [
    window.location.hostname,
    `.${window.location.hostname}`,
    'localhost',
    '.localhost',
    '127.0.0.1',
    'navidocent.com',
    '.navidocent.com',
    undefined // 현재 도메인
  ];

  const paths = ['/', '/auth', '/api', '/api/auth'];

  authCookieNames.forEach(cookieName => {
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

  console.log('🍪 모든 인증 쿠키 삭제 완료');
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

  console.log(`🗄️ 사용자 데이터 삭제 완료: ${userDataKeys.length + keysToRemove.length}개 항목`);
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

    console.log('🗃️ 브라우저 캐시 정리 완료');
  } catch (error) {
    console.error('❌ 브라우저 캐시 정리 실패:', error);
  }
}

/**
 * 완전한 로그아웃 실행 (NextAuth signOut 전에 호출)
 */
export function performCompleteLogout(): void {
  console.log('🚀 완전한 로그아웃 프로세스 시작...');
  
  // 1. 모든 사용자 데이터 삭제
  clearAllUserData();
  
  // 2. 브라우저 캐시 정리
  clearBrowserCache();
  
  // 3. 모든 인증 쿠키 삭제
  clearAllAuthCookies();
  
  // 4. NextAuth 및 Service Worker 캐시 정리
  if (typeof window !== 'undefined') {
    // NextAuth 내부 상태 강제 정리
    try {
      // @ts-ignore - NextAuth 내부 상태 접근
      if (window.__NEXT_DATA__?.props?.pageProps?.session) {
        window.__NEXT_DATA__.props.pageProps.session = null;
      }
      
      // Service Worker 캐시 강제 정리 (가장 중요!)
      if ('caches' in window) {
        caches.keys().then(names => {
          console.log('🧹 발견된 캐시:', names);
          names.forEach(name => {
            // NextAuth 관련 캐시 삭제
            if (name.includes('next-auth') || name.includes('session') || name.includes('apis')) {
              console.log('🗑️ 캐시 삭제:', name);
              caches.delete(name);
            }
          });
        });
        
        // 특정 API 캐시 강제 삭제
        caches.open('apis').then(cache => {
          cache.keys().then(requests => {
            requests.forEach(request => {
              if (request.url.includes('/api/auth/') || request.url.includes('session')) {
                console.log('🔥 인증 API 캐시 삭제:', request.url);
                cache.delete(request);
              }
            });
          });
        }).catch(() => {
          // 캐시가 없으면 무시
        });
        
        // Next.js 빌드 관련 캐시도 정리
        caches.open('next-data').then(cache => {
          cache.keys().then(requests => {
            requests.forEach(request => {
              if (request.url.includes('_next/data') || request.url.includes('navi-guide')) {
                console.log('🗑️ Next.js 데이터 캐시 삭제:', request.url);
                cache.delete(request);
              }
            });
          });
        }).catch(() => {
          // 캐시가 없으면 무시
        });
      }
      
      // Service Worker 자체에 메시지 전송
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_AUTH_CACHE'
        });
        console.log('📨 Service Worker에 캐시 정리 메시지 전송');
      }
    } catch (error) {
      console.warn('캐시 정리 중 오류:', error);
    }
  }
  
  console.log('✅ 완전한 로그아웃 프로세스 완료');
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
    console.warn('⚠️ 로그아웃 미완료:', issues);
    return false;
  }

  console.log('✅ 로그아웃 상태 검증 완료');
  return true;
}