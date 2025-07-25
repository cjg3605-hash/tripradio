import { AudioCacheEntry } from '@/types/audio';

class AudioCacheService {
  private dbName = 'NAVI-AudioCache';
  private dbVersion = 1;
  private storeName = 'audioFiles';
  private maxCacheSize = 100 * 1024 * 1024; // 100MB
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        }
      };
    });
  }

  async cacheAudio(id: string, audioUrl: string): Promise<string> {
    try {
      // 먼저 캐시에서 확인
      const cached = await this.getCachedAudio(id);
      if (cached) {
        return cached;
      }

      // 오디오 파일 다운로드
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`);
      }

      const blob = await response.blob();
      const cacheEntry: AudioCacheEntry = {
        id,
        url: audioUrl,
        blob,
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        size: blob.size
      };

      // 캐시 크기 확인 및 정리
      await this.cleanupCache();

      // IndexedDB에 저장
      await this.saveToCache(cacheEntry);

      // Blob URL 생성
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Audio caching failed:', error);
      return audioUrl; // 캐싱 실패 시 원본 URL 반환
    }
  }

  async getCachedAudio(id: string): Promise<string | null> {
    try {
      if (!this.db) await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(id);

        request.onsuccess = () => {
          const entry = request.result as AudioCacheEntry | undefined;
          if (entry) {
            // 마지막 접근 시간 업데이트
            entry.lastAccessed = Date.now();
            store.put(entry);
            
            const url = URL.createObjectURL(entry.blob);
            resolve(url);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get cached audio:', error);
      return null;
    }
  }

  private async saveToCache(entry: AudioCacheEntry): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async cleanupCache(): Promise<void> {
    try {
      const currentSize = await this.getCacheSize();
      
      if (currentSize > this.maxCacheSize) {
        const entries = await this.getAllEntries();
        
        // 마지막 접근 시간 기준으로 정렬 (오래된 것부터)
        entries.sort((a, b) => a.lastAccessed - b.lastAccessed);
        
        let deletedSize = 0;
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        for (const entry of entries) {
          if (currentSize - deletedSize <= this.maxCacheSize * 0.8) break;
          
          store.delete(entry.id);
          deletedSize += entry.size;
        }
      }
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }

  private async getCacheSize(): Promise<number> {
    const entries = await this.getAllEntries();
    return entries.reduce((total, entry) => total + entry.size, 0);
  }

  private async getAllEntries(): Promise<AudioCacheEntry[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearCache(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCacheStats(): Promise<{ totalSize: number; fileCount: number; entries: AudioCacheEntry[] }> {
    const entries = await this.getAllEntries();
    const totalSize = entries.reduce((total, entry) => total + entry.size, 0);
    
    return {
      totalSize,
      fileCount: entries.length,
      entries
    };
  }
}

export const audioCacheService = new AudioCacheService();