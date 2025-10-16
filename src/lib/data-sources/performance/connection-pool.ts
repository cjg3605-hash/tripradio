/**
 * High-Performance Connection Pool Manager
 * 고성능 커넥션 풀 매니저
 */

import { EventEmitter } from 'events';

interface PoolConfig {
  maxConnections: number;
  minConnections: number;
  acquireTimeoutMs: number;
  idleTimeoutMs: number;
  maxRetries: number;
}

interface Connection {
  id: string;
  inUse: boolean;
  createdAt: Date;
  lastUsed: Date;
  source: string;
}

export class ConnectionPool extends EventEmitter {
  private connections: Map<string, Connection[]> = new Map();
  private config: PoolConfig;
  private stats = {
    totalCreated: 0,
    totalDestroyed: 0,
    activeConnections: 0,
    pendingRequests: 0,
    avgResponseTime: 0
  };

  constructor(config: Partial<PoolConfig> = {}) {
    super();
    this.config = {
      maxConnections: 20,
      minConnections: 5,
      acquireTimeoutMs: 5000,
      idleTimeoutMs: 30000,
      maxRetries: 3,
      ...config
    };

    // 정기적으로 idle connection 정리
    setInterval(() => this.cleanupIdleConnections(), 10000);
  }

  /**
   * 🚀 Connection 획득 (Circuit Breaker 패턴)
   */
  async acquire(source: string): Promise<Connection> {
    const startTime = Date.now();
    this.stats.pendingRequests++;

    try {
      let sourceConnections = this.connections.get(source) || [];
      
      // 사용 가능한 connection 찾기
      const availableConnection = sourceConnections.find(conn => !conn.inUse);
      
      if (availableConnection) {
        availableConnection.inUse = true;
        availableConnection.lastUsed = new Date();
        this.stats.pendingRequests--;
        this.updateResponseTime(Date.now() - startTime);
        return availableConnection;
      }

      // 최대 연결 수 확인
      if (sourceConnections.length < this.config.maxConnections) {
        const newConnection = this.createConnection(source);
        sourceConnections.push(newConnection);
        this.connections.set(source, sourceConnections);
        
        this.stats.totalCreated++;
        this.stats.activeConnections++;
        this.stats.pendingRequests--;
        this.updateResponseTime(Date.now() - startTime);
        
        return newConnection;
      }

      // 연결 대기 (Circuit Breaker)
      return await this.waitForConnection(source, startTime);

    } catch (error) {
      this.stats.pendingRequests--;
      throw error;
    }
  }

  /**
   * Connection 반환
   */
  release(connection: Connection): void {
    connection.inUse = false;
    connection.lastUsed = new Date();
    this.emit('connectionReleased', connection);
  }

  /**
   * 새 Connection 생성
   */
  private createConnection(source: string): Connection {
    return {
      id: `${source}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      inUse: true,
      createdAt: new Date(),
      lastUsed: new Date(),
      source
    };
  }

  /**
   * Connection 대기 (Circuit Breaker 패턴)
   */
  private async waitForConnection(source: string, startTime: number): Promise<Connection> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.stats.pendingRequests--;
        reject(new Error(`Connection acquire timeout for ${source}`));
      }, this.config.acquireTimeoutMs);

      const checkConnection = () => {
        const sourceConnections = this.connections.get(source) || [];
        const availableConnection = sourceConnections.find(conn => !conn.inUse);
        
        if (availableConnection) {
          clearTimeout(timeout);
          availableConnection.inUse = true;
          availableConnection.lastUsed = new Date();
          this.stats.pendingRequests--;
          this.updateResponseTime(Date.now() - startTime);
          resolve(availableConnection);
        } else {
          // 100ms 후 재확인
          setTimeout(checkConnection, 100);
        }
      };

      // Connection release 이벤트 리스너
      this.once('connectionReleased', checkConnection);
      checkConnection();
    });
  }

  /**
   * Idle connection 정리
   */
  private cleanupIdleConnections(): void {
    const now = Date.now();
    
    for (const [source, connections] of this.connections.entries()) {
      const activeConnections = connections.filter(conn => {
        const idleTime = now - conn.lastUsed.getTime();
        const isIdle = !conn.inUse && idleTime > this.config.idleTimeoutMs;
        
        if (isIdle && connections.length > this.config.minConnections) {
          this.stats.totalDestroyed++;
          this.stats.activeConnections--;
          return false;
        }
        return true;
      });
      
      this.connections.set(source, activeConnections);
    }
  }

  /**
   * Response time 통계 업데이트
   */
  private updateResponseTime(responseTime: number): void {
    this.stats.avgResponseTime = 
      (this.stats.avgResponseTime * 0.9) + (responseTime * 0.1);
  }

  /**
   * Pool 통계 조회
   */
  getStats() {
    return {
      ...this.stats,
      totalConnections: Array.from(this.connections.values())
        .reduce((sum, conns) => sum + conns.length, 0),
      connectionsBySource: Object.fromEntries(
        Array.from(this.connections.entries()).map(([source, conns]) => [
          source, 
          {
            total: conns.length,
            active: conns.filter(c => c.inUse).length,
            idle: conns.filter(c => !c.inUse).length
          }
        ])
      )
    };
  }

  /**
   * Pool 정리
   */
  async destroy(): Promise<void> {
    this.removeAllListeners();
    this.connections.clear();
    this.stats.activeConnections = 0;
  }
}

// 글로벌 싱글톤 인스턴스
export const globalConnectionPool = new ConnectionPool({
  maxConnections: 15,
  minConnections: 3,
  acquireTimeoutMs: 3000,
  idleTimeoutMs: 20000
});