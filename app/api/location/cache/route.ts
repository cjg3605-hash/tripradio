import { NextRequest, NextResponse } from 'next/server';
import { LocationCacheManager } from '@/lib/location/cache-management';

/**
 * 위치 분류 캐시 관리 API
 */

// GET: 캐시 상태 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'stats':
        return NextResponse.json({
          success: true,
          data: LocationCacheManager.getStats()
        });
        
      case 'report':
        return NextResponse.json({
          success: true,
          data: LocationCacheManager.generateReport()
        });
        
      default:
        return NextResponse.json({
          success: true,
          data: LocationCacheManager.generateReport()
        });
    }
  } catch (error) {
    console.error('캐시 상태 조회 실패:', error);
    return NextResponse.json({
      success: false,
      error: '캐시 상태 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// DELETE: 캐시 정리
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'expired';
    
    let result;
    
    switch (action) {
      case 'all':
        result = LocationCacheManager.clearAll();
        return NextResponse.json({
          success: true,
          message: `모든 캐시가 삭제되었습니다. (${result.cleared}개 항목)`,
          data: result
        });
        
      case 'expired':
      default:
        result = LocationCacheManager.cleanupExpiredEntries();
        return NextResponse.json({
          success: true,
          message: `만료된 캐시가 정리되었습니다. (${result.cleaned}개 항목)`,
          data: result
        });
    }
  } catch (error) {
    console.error('캐시 정리 실패:', error);
    return NextResponse.json({
      success: false,
      error: '캐시 정리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}