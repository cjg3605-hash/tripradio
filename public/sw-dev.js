// 개발 환경용 서비스 워커 - 압축되지 않은 버전
// 디버깅과 유지보수가 용이하도록 작성

const CACHE_NAME = 'navi-guide-dev-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline.html', // 오프라인 페이지 (선택사항)
];

// 서비스 워커 설치 이벤트
self.addEventListener('install', function(event) {
  console.log('[SW] Install event 발생');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] 캐시 오픈:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('[SW] 리소스 캐싱 완료');
        return self.skipWaiting(); // 즉시 활성화
      })
      .catch(function(error) {
        console.error('[SW] 캐시 생성 실패:', error);
      })
  );
});

// 서비스 워커 활성화 이벤트
self.addEventListener('activate', function(event) {
  console.log('[SW] Activate event 발생');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          // 이전 버전의 캐시 삭제
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] 이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('[SW] 클라이언트 제어 시작');
      return self.clients.claim();
    })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', function(event) {
  // API 요청은 항상 네트워크를 통해 처리
  if (event.request.url.includes('/api/')) {
    console.log('[SW] API 요청 - 네트워크 우선:', event.request.url);
    return event.respondWith(fetch(event.request));
  }
  
  // 인증 관련 요청은 네트워크만 사용
  if (event.request.url.includes('/auth/')) {
    console.log('[SW] 인증 요청 - 네트워크만 사용:', event.request.url);
    return event.respondWith(fetch(event.request));
  }
  
  // 기타 요청은 캐시 우선, 네트워크 폴백 전략
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 캐시에 있으면 캐시 응답 반환
        if (response) {
          console.log('[SW] 캐시에서 응답:', event.request.url);
          return response;
        }
        
        // 캐시에 없으면 네트워크 요청
        console.log('[SW] 네트워크 요청:', event.request.url);
        return fetch(event.request)
          .then(function(response) {
            // 응답이 유효하지 않으면 그대로 반환
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 응답을 복제하여 캐시에 저장
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                console.log('[SW] 새로운 리소스 캐싱:', event.request.url);
                cache.put(event.request, responseToCache);
              })
              .catch(function(error) {
                console.error('[SW] 캐싱 실패:', error);
              });
            
            return response;
          })
          .catch(function(error) {
            console.error('[SW] 네트워크 요청 실패:', error);
            
            // 오프라인 상태에서 HTML 요청이면 오프라인 페이지 반환
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
            
            throw error;
          });
      })
      .catch(function(error) {
        console.error('[SW] Fetch 이벤트 오류:', error);
        throw error;
      })
  );
});

// 메시지 이벤트 처리 (클라이언트와의 통신)
self.addEventListener('message', function(event) {
  console.log('[SW] 클라이언트로부터 메시지:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING 요청 처리');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION',
      version: CACHE_NAME
    });
  }
});

// 에러 이벤트 처리
self.addEventListener('error', function(event) {
  console.error('[SW] 전역 에러:', event.error);
});

// 처리되지 않은 Promise 거부 처리
self.addEventListener('unhandledrejection', function(event) {
  console.error('[SW] 처리되지 않은 Promise 거부:', event.reason);
  event.preventDefault();
});

console.log('[SW] 개발용 서비스 워커 로드 완료 - 디버깅 모드'); 