// 🚀 Enhanced Cache 성능 모니터링 API

import { NextRequest, NextResponse } from 'next/server';
import { enhancedCache, CacheKeyStrategy } from '@/lib/cache/enhanced-cache-system';

export const runtime = 'nodejs';

/**
 * 📊 캐시 통계 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detail = searchParams.get('detail') === 'true';
    
    const stats = enhancedCache.getStats();
    
    const response = {
      success: true,
      data: {
        summary: {
          hitRate: `${stats.hitRate.toFixed(1)}%`,
          totalRequests: stats.totalRequests,
          avgResponseTime: `${stats.avgResponseTime.toFixed(1)}ms`,
          efficiency: stats.hitRate > 80 ? 'excellent' : 
                     stats.hitRate > 60 ? 'good' : 
                     stats.hitRate > 40 ? 'average' : 'poor'
        },
        levelDistribution: {
          L1_Memory: {
            hits: stats.l1Hits,
            percentage: stats.totalRequests > 0 
              ? `${((stats.l1Hits / stats.totalRequests) * 100).toFixed(1)}%` 
              : '0%',
            avgResponseTime: '<100ms'
          },
          L2_Redis: {
            hits: stats.l2Hits,
            percentage: stats.totalRequests > 0 
              ? `${((stats.l2Hits / stats.totalRequests) * 100).toFixed(1)}%` 
              : '0%',
            avgResponseTime: '<500ms'
          },
          L3_Storage: {
            hits: stats.l3Hits,
            percentage: stats.totalRequests > 0 
              ? `${((stats.l3Hits / stats.totalRequests) * 100).toFixed(1)}%` 
              : '0%',
            avgResponseTime: '<2000ms'
          }
        },
        performance: {
          hits: stats.hits,
          misses: stats.misses,
          hitRatio: stats.hitRate,
          avgResponseTime: stats.avgResponseTime,
          totalRequests: stats.totalRequests
        }
      },
      timestamp: new Date().toISOString()
    };

    if (detail) {
      (response.data as any).strategies = [
        {
          name: 'SEARCH_AUTOCOMPLETE',
          ttl: '30분',
          levels: ['L1_Memory', 'L2_Redis'],
          compression: true,
          priority: 'high'
        },
        {
          name: 'GUIDE_GENERATION', 
          ttl: '6시간',
          levels: ['L1_Memory', 'L2_Redis', 'L3_Storage'],
          compression: true,
          priority: 'high'
        },
        {
          name: 'DATA_INTEGRATION',
          ttl: '2시간',
          levels: ['L1_Memory', 'L2_Redis'],
          compression: true,
          priority: 'medium'
        },
        {
          name: 'COORDINATE_ENHANCEMENT',
          ttl: '12시간',
          levels: ['L1_Memory', 'L2_Redis', 'L3_Storage'],
          compression: false,
          priority: 'medium'
        },
        {
          name: 'CHAPTER_GENERATION',
          ttl: '4시간',
          levels: ['L1_Memory', 'L2_Redis'],
          compression: true,
          priority: 'high'
        }
      ];
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ 캐시 통계 조회 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '캐시 통계 조회에 실패했습니다.',
        details: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : String(error)
          : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * 🧹 캐시 관리 API (DELETE)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const strategy = searchParams.get('strategy') as CacheKeyStrategy;
    const key = searchParams.get('key');
    
    if (strategy && key) {
      // 특정 키 무효화
      await enhancedCache.invalidate(strategy, key);
      
      return NextResponse.json({
        success: true,
        message: `캐시 키 무효화 완료: ${strategy}:${key}`,
        timestamp: new Date().toISOString()
      });
      
    } else if (strategy) {
      // 특정 전략 캐시 정리
      await enhancedCache.cleanup(strategy);
      
      return NextResponse.json({
        success: true,
        message: `${strategy} 캐시 정리 완료`,
        timestamp: new Date().toISOString()
      });
      
    } else {
      // 전체 캐시 정리
      await enhancedCache.cleanup();
      
      return NextResponse.json({
        success: true,
        message: '전체 캐시 정리 완료',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ 캐시 정리 실패:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '캐시 정리에 실패했습니다.',
        details: process.env.NODE_ENV === 'development' 
          ? error instanceof Error ? error.message : String(error)
          : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * 🔧 OPTIONS 메서드 (CORS)
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    }
  });
}