// 서비스 워커 디버깅 유틸리티
// 개발 환경에서 브라우저 콘솔에서 사용할 수 있는 디버깅 도구들

window.SWDebug = {
  // 현재 등록된 서비스 워커 정보 확인
  async getRegistrations() {
    if (!('serviceWorker' in navigator)) {
      console.warn('이 브라우저는 서비스 워커를 지원하지 않습니다.');
      return [];
    }
    
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('등록된 서비스 워커:', registrations);
      return registrations;
    } catch (error) {
      console.error('서비스 워커 등록 정보 조회 실패:', error);
      return [];
    }
  },
  
  // 모든 서비스 워커 등록 해제
  async unregisterAll() {
    try {
      const registrations = await this.getRegistrations();
      const results = await Promise.all(
        registrations.map(registration => registration.unregister())
      );
      console.log('모든 서비스 워커 등록 해제 완료:', results);
      return results;
    } catch (error) {
      console.error('서비스 워커 등록 해제 실패:', error);
      return [];
    }
  },
  
  // 캐시 정보 확인
  async getCaches() {
    try {
      const cacheNames = await caches.keys();
      console.log('현재 캐시 목록:', cacheNames);
      
      const cacheContents = {};
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        cacheContents[cacheName] = requests.map(req => req.url);
      }
      
      console.log('캐시 내용:', cacheContents);
      return cacheContents;
    } catch (error) {
      console.error('캐시 정보 조회 실패:', error);
      return {};
    }
  },
  
  // 모든 캐시 삭제
  async clearAllCaches() {
    try {
      const cacheNames = await caches.keys();
      const results = await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('모든 캐시 삭제 완료:', results);
      return results;
    } catch (error) {
      console.error('캐시 삭제 실패:', error);
      return [];
    }
  },
  
  // 특정 캐시 삭제
  async clearCache(cacheName) {
    try {
      const result = await caches.delete(cacheName);
      console.log(`캐시 '${cacheName}' 삭제 결과:`, result);
      return result;
    } catch (error) {
      console.error(`캐시 '${cacheName}' 삭제 실패:`, error);
      return false;
    }
  },
  
  // 서비스 워커에 메시지 전송
  async sendMessage(message) {
    if (!navigator.serviceWorker.controller) {
      console.warn('활성화된 서비스 워커가 없습니다.');
      return;
    }
    
    try {
      navigator.serviceWorker.controller.postMessage(message);
      console.log('서비스 워커에 메시지 전송:', message);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  },
  
  // 서비스 워커 강제 업데이트
  async forceUpdate() {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      console.log('서비스 워커 강제 업데이트 완료');
    } catch (error) {
      console.error('서비스 워커 업데이트 실패:', error);
    }
  },
  
  // 서비스 워커 상태 모니터링
  monitorSW() {
    if (!('serviceWorker' in navigator)) {
      console.warn('이 브라우저는 서비스 워커를 지원하지 않습니다.');
      return;
    }
    
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW Monitor] 컨트롤러 변경됨');
    });
    
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[SW Monitor] 서비스 워커로부터 메시지:', event.data);
    });
    
    // 등록 상태 확인
    navigator.serviceWorker.ready.then((registration) => {
      console.log('[SW Monitor] 서비스 워커 준비 완료:', registration);
      
      registration.addEventListener('updatefound', () => {
        console.log('[SW Monitor] 서비스 워커 업데이트 발견됨');
        
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          console.log('[SW Monitor] 새 서비스 워커 상태:', newWorker.state);
        });
      });
    });
    
    console.log('[SW Monitor] 서비스 워커 모니터링 시작됨');
  },
  
  // 네트워크 상태 모니터링
  monitorNetwork() {
    const logNetworkStatus = () => {
      console.log('[Network Monitor] 온라인 상태:', navigator.onLine);
    };
    
    window.addEventListener('online', () => {
      console.log('[Network Monitor] 네트워크 연결됨');
      logNetworkStatus();
    });
    
    window.addEventListener('offline', () => {
      console.log('[Network Monitor] 네트워크 연결 끊어짐');
      logNetworkStatus();
    });
    
    logNetworkStatus();
    console.log('[Network Monitor] 네트워크 모니터링 시작됨');
  },
  
  // 종합 디버깅 정보 출력
  async debugInfo() {
    console.group('🛠️ 서비스 워커 디버깅 정보');
    
    console.log('브라우저 지원:', 'serviceWorker' in navigator);
    console.log('현재 온라인 상태:', navigator.onLine);
    console.log('현재 컨트롤러:', navigator.serviceWorker.controller);
    
    await this.getRegistrations();
    await this.getCaches();
    
    console.groupEnd();
  },
  
  // 모든 모니터링 시작
  startMonitoring() {
    this.monitorSW();
    this.monitorNetwork();
    console.log('🔍 모든 모니터링이 시작되었습니다.');
  },
  
  // 완전 초기화 (개발 시 유용)
  async reset() {
    console.log('🔄 서비스 워커 완전 초기화 시작...');
    
    await this.unregisterAll();
    await this.clearAllCaches();
    
    console.log('✅ 초기화 완료. 페이지를 새로고침하세요.');
  }
};

// 콘솔에 사용법 안내
console.log(`
🛠️ 서비스 워커 디버깅 도구가 로드되었습니다!

사용법:
• SWDebug.debugInfo() - 현재 상태 확인
• SWDebug.startMonitoring() - 실시간 모니터링 시작
• SWDebug.getCaches() - 캐시 내용 확인
• SWDebug.clearAllCaches() - 모든 캐시 삭제
• SWDebug.unregisterAll() - 모든 서비스 워커 등록 해제
• SWDebug.reset() - 완전 초기화

더 많은 기능은 SWDebug를 콘솔에 입력하여 확인하세요.
`);

// 개발 환경에서 자동으로 모니터링 시작
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('🔧 개발 환경 감지됨 - 자동 모니터링 시작');
  window.SWDebug.startMonitoring();
} 