// 1인 개발자들이 가장 선호하는 로컬 스토리지 캐싱 시스템

import { GuideData, UserProfile } from '@/types/guide';

interface CachedGuide {
  id: string;
  locationName: string;
  userProfile: any;
  content: any;
  createdAt: string;
  expiresAt: string;
  version: string;
}

interface CacheOptions {
  maxAge?: number; // 밀리초
  maxItems?: number; // 최대 저장 개수
  version?: string;
}

interface CacheEntry {
  data: GuideData;
  timestamp: number;
  userProfile?: UserProfile;
}

interface GuideHistoryEntry {
  id: string;
  locationName: string;
  guideData: GuideData;
  userProfile?: UserProfile;
  createdAt: string;
  viewedPages: string[];
  completed: boolean;
}

// 클라이언트 환경 확인 헬퍼
const isClientSide = (): boolean => {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
};

class LocalGuideCache {
  private static instance: LocalGuideCache;
  private prefix = 'ai_guide_';
  private indexKey = 'ai_guide_index';
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 30 * 60 * 1000; // 30분
  private readonly MAX_ENTRIES = 100;

  static getInstance(): LocalGuideCache {
    if (!LocalGuideCache.instance) {
      LocalGuideCache.instance = new LocalGuideCache();
    }
    return LocalGuideCache.instance;
  }

  // 가이드 저장 (1인 개발자들이 가장 많이 사용하는 방식)
  saveGuide(
    locationName: string, 
    guideData: any, 
    options: CacheOptions = {}
  ): boolean {
    if (!isClientSide()) return false;

    try {
      const {
        maxAge = 7 * 24 * 60 * 60 * 1000, // 7일 기본
        maxItems = 10, // 최대 10개 저장
        version = '1.0'
      } = options;

      const cacheItem: CachedGuide = {
        id: `guide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        locationName,
        userProfile: guideData.userProfile || {},
        content: guideData.content || guideData,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + maxAge).toISOString(),
        version
      };

      // 개별 가이드 저장
      const key = `${this.prefix}${locationName}_${cacheItem.id}`;
      localStorage.setItem(key, JSON.stringify(cacheItem));

      // 인덱스 업데이트
      this.updateIndex(locationName, cacheItem.id, maxItems);

      console.log(`✅ 가이드 로컬 저장 완료: ${locationName}`);
      return true;

    } catch (error) {
      console.error('로컬 저장 실패:', error);
      return false;
    }
  }

  // 가이드 불러오기
  getGuide(locationName: string, guideId?: string): CachedGuide | null {
    if (!isClientSide()) return null;

    try {
      if (guideId) {
        // 특정 가이드 불러오기
        const key = `${this.prefix}${locationName}_${guideId}`;
        const cached = localStorage.getItem(key);
        
        if (cached) {
          const guide: CachedGuide = JSON.parse(cached);
          
          // 만료 확인
          if (new Date(guide.expiresAt) < new Date()) {
            this.removeGuide(locationName, guideId);
            return null;
          }
          
          console.log(`📱 로컬 캐시에서 가이드 로드: ${locationName}`);
          return guide;
        }
      } else {
        // 해당 위치의 가장 최근 가이드 불러오기
        const guides = this.getLocationGuides(locationName);
        if (guides.length > 0) {
          return guides[guides.length - 1]; // 가장 최근 것
        }
      }

      return null;

    } catch (error) {
      console.error('로컬 캐시 로드 실패:', error);
      return null;
    }
  }

  // 특정 위치의 모든 가이드 목록
  getLocationGuides(locationName: string): CachedGuide[] {
    if (!isClientSide()) return [];

    try {
      const index = this.getIndex();
      const locationGuides = index[locationName] || [];
      const validGuides: CachedGuide[] = [];

      for (const guideId of locationGuides) {
        const key = `${this.prefix}${locationName}_${guideId}`;
        const cached = localStorage.getItem(key);
        
        if (cached) {
          const guide: CachedGuide = JSON.parse(cached);
          
          // 만료 확인
          if (new Date(guide.expiresAt) >= new Date()) {
            validGuides.push(guide);
          } else {
            // 만료된 것은 제거
            localStorage.removeItem(key);
          }
        }
      }

      // 인덱스도 정리
      if (validGuides.length !== locationGuides.length) {
        this.updateLocationIndex(locationName, validGuides.map(g => g.id));
      }

      return validGuides.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    } catch (error) {
      console.error('위치별 가이드 목록 로드 실패:', error);
      return [];
    }
  }

  // 저장 공간 확인 (1인 개발자들이 자주 확인하는 정보)
  getStorageInfo(): {
    used: number;
    available: number;
    guideCount: number;
    locations: string[];
  } {
    if (!isClientSide()) {
      return { used: 0, available: 0, guideCount: 0, locations: [] };
    }

    try {
      // 대략적인 사용량 계산
      let used = 0;
      let guideCount = 0;
      const locations = new Set<string>();

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.prefix)) {
          const value = localStorage.getItem(key);
          if (value) {
            used += key.length + value.length;
            guideCount++;
            
            // 위치명 추출
            const locationMatch = key.match(new RegExp(`${this.prefix}(.+)_guide_`));
            if (locationMatch) {
              locations.add(locationMatch[1]);
            }
          }
        }
      }

      // 브라우저 제한 (대략 5-10MB)
      const available = 5 * 1024 * 1024 - used; // 5MB 가정

      return {
        used: Math.round(used / 1024), // KB 단위
        available: Math.round(available / 1024), // KB 단위
        guideCount,
        locations: Array.from(locations)
      };

    } catch (error) {
      console.error('저장 공간 정보 확인 실패:', error);
      return { used: 0, available: 0, guideCount: 0, locations: [] };
    }
  }

  // 캐시 정리 (용량 부족시 자동 호출)
  cleanup(keepRecent: number = 5): void {
    if (typeof window === 'undefined') return;

    try {
      const index = this.getIndex();
      
      for (const [locationName, guideIds] of Object.entries(index)) {
        const guides = this.getLocationGuides(locationName);
        
        // 최신 것만 유지
        if (guides.length > keepRecent) {
          const toRemove = guides.slice(0, guides.length - keepRecent);
          
          for (const guide of toRemove) {
            this.removeGuide(locationName, guide.id);
          }
        }
      }

      console.log(`🧹 로컬 캐시 정리 완료 (최신 ${keepRecent}개씩 유지)`);

    } catch (error) {
      console.error('캐시 정리 실패:', error);
    }
  }

  // 개별 가이드 삭제
  private removeGuide(locationName: string, guideId: string): void {
    const key = `${this.prefix}${locationName}_${guideId}`;
    localStorage.removeItem(key);
    
    // 인덱스에서도 제거
    const index = this.getIndex();
    if (index[locationName]) {
      index[locationName] = index[locationName].filter(id => id !== guideId);
      if (index[locationName].length === 0) {
        delete index[locationName];
      }
      localStorage.setItem(this.indexKey, JSON.stringify(index));
    }
  }

  // 인덱스 관리
  private updateIndex(locationName: string, guideId: string, maxItems: number): void {
    const index = this.getIndex();
    
    if (!index[locationName]) {
      index[locationName] = [];
    }
    
    index[locationName].push(guideId);
    
    // 최대 개수 초과시 오래된 것 제거
    if (index[locationName].length > maxItems) {
      const toRemove = index[locationName].shift();
      if (toRemove) {
        const key = `${this.prefix}${locationName}_${toRemove}`;
        localStorage.removeItem(key);
      }
    }
    
    localStorage.setItem(this.indexKey, JSON.stringify(index));
  }

  private updateLocationIndex(locationName: string, guideIds: string[]): void {
    const index = this.getIndex();
    index[locationName] = guideIds;
    localStorage.setItem(this.indexKey, JSON.stringify(index));
  }

  private getIndex(): Record<string, string[]> {
    try {
      const index = localStorage.getItem(this.indexKey);
      return index ? JSON.parse(index) : {};
    } catch {
      return {};
    }
  }
}

// 1인 개발자들이 바로 사용할 수 있는 간단한 인터페이스
export const guideCache = LocalGuideCache.getInstance();

// 편의 함수들
export const saveGuideToLocal = (locationName: string, data: any) => {
  return guideCache.saveGuide(locationName, data);
};

export const getGuideFromLocal = (locationName: string, guideId?: string) => {
  return guideCache.getGuide(locationName, guideId);
};

export const getLocalStorageInfo = () => {
  return guideCache.getStorageInfo();
};

export const cleanupLocalCache = () => {
  guideCache.cleanup();
};

// 자동 정리 (용량 부족시)
export function runLocalCacheAutoCleanupIfNeeded() {
  if (typeof window !== 'undefined') {
    const info = getLocalStorageInfo();
    // 사용량이 80% 이상이면 자동 정리
    if (info.available < info.used * 0.2) {
      console.log('📱 로컬 저장 공간 부족, 자동 정리 실행');
      cleanupLocalCache();
    }
  }
}

// 가이드 히스토리 관리 클래스
class GuideHistoryManager {
  private readonly STORAGE_KEY = 'navi_guide_history';
  private readonly MAX_HISTORY = 50;
  
  saveGuide(locationName: string, guideData: GuideData, userProfile?: UserProfile): void {
    if (!isClientSide()) return;
    
    try {
      const history = this.getHistory();
      
      const newEntry: GuideHistoryEntry = {
      id: this.generateId(),
      locationName,
      guideData,
      userProfile,
      createdAt: new Date().toISOString(),
      viewedPages: ['overview'], // 기본적으로 개요 페이지는 본 것으로 처리
      completed: false
    };
    
      // 중복 제거 (같은 위치의 기존 가이드 제거)
      const filteredHistory = history.filter(entry => entry.locationName !== locationName);
    
      // 새 항목 추가
      filteredHistory.push(newEntry);
      
      // 최대 개수 제한
      if (filteredHistory.length > this.MAX_HISTORY) {
        filteredHistory.splice(0, filteredHistory.length - this.MAX_HISTORY);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredHistory));
      console.log(`✅ 가이드 히스토리 저장 완료: ${locationName}`);

    } catch (error) {
      console.error('가이드 히스토리 저장 실패:', error);
    }
  }
  
  getHistory(): GuideHistoryEntry[] {
    if (!isClientSide()) return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('가이드 히스토리 로드 실패:', error);
      return [];
    }
  }
  
  updatePageView(locationName: string, page: string): void {
    if (!isClientSide()) return;
    
    try {
    const history = this.getHistory();
      const entry = history.find(h => h.locationName === locationName);
    
      if (entry) {
        // 새로운 페이지 추가 (중복 제거)
      if (!entry.viewedPages.includes(page)) {
        entry.viewedPages.push(page);
        }
        
        // 모든 페이지를 본 경우 완료 처리
        const totalPages = ['overview', 'route', 'realtime'];
        entry.completed = totalPages.every(p => entry.viewedPages.includes(p));
        
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
      }
        } catch (error) {
          console.error('페이지 뷰 업데이트 실패:', error);
    }
  }
  
  clearHistory(): void {
    if (!isClientSide()) return;
    
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('가이드 히스토리 초기화 완료');
    } catch (error) {
      console.error('가이드 히스토리 초기화 실패:', error);
    }
  }
  
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const guideHistory = new GuideHistoryManager();

// 30분마다 자동 정리
setInterval(() => guideCache.cleanup(), 30 * 60 * 1000); 